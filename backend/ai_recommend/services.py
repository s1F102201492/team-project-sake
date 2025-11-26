"""
AIレコメンド機能のサービス層
GPTを活用してユーザーの好みに合った日本酒をレコメンドする
"""
import os
import json
from typing import List, Dict, Optional
from openai import OpenAI
from django.conf import settings
from api.models import Sake


class AIRecommendationService:
    """GPTを活用したレコメンドサービス"""

    def __init__(self):
        # 環境変数からAPIキーを取得
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY が環境変数に設定されていません")

        # カスタムエンドポイントを設定（学校配布のAPIを使用）
        base_url = "https://api.openai.iniad.org/api/v1"

        self.client = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        self.model = "gpt-4o-mini"  # コスト効率を考慮してminiモデルを使用

    def _build_prompt(self, preferences: Dict, available_sakes: List[Sake]) -> str:
        """
        ユーザーの嗜好情報と利用可能な日本酒リストからプロンプトを生成

        Args:
            preferences: ユーザーの嗜好情報（甘さ、香り、地域など）
            available_sakes: データベースから取得した日本酒のリスト

        Returns:
            GPTに送信するプロンプト文字列
        """
        # 日本酒リストをテキスト形式に変換
        sake_list_text = "\n".join([
            f"- {sake.name} ({sake.category}): {sake.description[:100]}..."
            f" [地域: {sake.region or '未指定'}, "
            f"甘さ: {sake.sweetness_level or '未指定'}, "
            f"香り: {sake.aroma_level or '未指定'}]"
            for sake in available_sakes[:50]  # 最大50件に制限
        ])

        # 嗜好情報のテキスト生成
        preference_text = f"""
ユーザーの嗜好情報:
- 好みの甘さ: {preferences.get('preferred_sweetness', '指定なし')} (1:辛口 〜 5:甘口)
- 好みの香り: {preferences.get('preferred_aroma', '指定なし')} (1:控えめ 〜 5:芳醇)
- 好みの地域: {preferences.get('preferred_region', '指定なし')}
- 予算: {preferences.get('budget_min', '')}円 〜 {preferences.get('budget_max', '')}円
- その他の希望: {preferences.get('additional_preferences', 'なし')}
"""

        prompt = f"""あなたは日本酒の専門家です。ユーザーの好みに基づいて、最適な日本酒を3〜5本レコメンドしてください。

{preference_text}

以下の日本酒リストから、ユーザーの好みに最も合うお酒を選んでください:

{sake_list_text}

回答は以下のJSON形式で返してください:
{{
    "recommendations": [
        {{
            "sake_name": "お酒の名前",
            "reason": "このお酒を選んだ理由（ユーザーの好みとの関連を含めて）",
            "score": 0.0-1.0のスコア（1.0が最適）,
            "match_points": ["マッチポイント1", "マッチポイント2", ...]
        }}
    ]
}}

地域性や地酒の特徴も考慮して、ユーザーが地方創生の文脈で楽しめるような説明も含めてください。
"""
        return prompt

    def get_recommendations(
        self,
        preferences: Dict,
        available_sakes: Optional[List[Sake]] = None,
        max_recommendations: int = 5
    ) -> List[Dict]:
        """
        GPTを使ってレコメンドを生成

        Args:
            preferences: ユーザーの嗜好情報
            available_sakes: 利用可能な日本酒のリスト（Noneの場合は全件取得）
            max_recommendations: 最大レコメンド数

        Returns:
            レコメンド結果のリスト
        """
        # 日本酒リストを取得
        if available_sakes is None:
            available_sakes = list(Sake.objects.all())

        if not available_sakes:
            return []

        # プロンプトを生成
        prompt = self._build_prompt(preferences, available_sakes)

        try:
            # GPT APIを呼び出し
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "あなたは日本酒の専門家です。ユーザーの好みに基づいて、最適な日本酒をレコメンドしてください。回答は必ずJSON形式で返してください。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                response_format={"type": "json_object"}  # JSON形式で返すことを強制
            )

            # レスポンスをパース
            content = response.choices[0].message.content
            result = json.loads(content)

            recommendations = result.get("recommendations", [])

            # 日本酒名からSakeオブジェクトをマッチング
            enhanced_recommendations = []
            for rec in recommendations[:max_recommendations]:
                sake_name = rec.get("sake_name", "")
                # 名前で部分一致検索
                matching_sake = None
                for sake in available_sakes:
                    if sake.name in sake_name or sake_name in sake.name:
                        matching_sake = sake
                        break

                enhanced_rec = {
                    "sake": matching_sake,
                    "sake_name": sake_name,
                    "reason": rec.get("reason", ""),
                    "score": float(rec.get("score", 0.5)),
                    "match_points": rec.get("match_points", []),
                    "gpt_reason": rec.get("reason", "")
                }
                enhanced_recommendations.append(enhanced_rec)

            return enhanced_recommendations

        except json.JSONDecodeError as e:
            print(f"JSON解析エラー: {e}")
            print(f"レスポンス内容: {content}")
            return []
        except Exception as e:
            print(f"GPT API呼び出しエラー: {e}")
            return []
