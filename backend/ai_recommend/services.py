import os
import json
from typing import List, Dict, Optional
import re
import math

from openai import OpenAI
from django.conf import settings
from api.models import Sake


# ========= 数値マッチングロジック ========= #


def _parse_price_range(price_range: str):
    """'3000-5000円' → (3000, 5000) に変換する"""
    if not price_range:
        return (None, None)

    m = re.search(r"(\d+)\D+(\d+)", price_range)
    if not m:
        return (None, None)
    return (int(m.group(1)), int(m.group(2)))


def calculate_match_score(preferences: dict, sake: Sake) -> float:
    """
    ユーザー嗜好と Sake のマッチ度を 0.0〜1.0 で返す（数値ベース）
    """
    score = 0.0
    weights = 0.0

    # 甘さ
    ps = preferences.get("preferred_sweetness")
    if ps and sake.sweetness_level:
        diff = abs(int(ps) - int(sake.sweetness_level))
        s = max(0.0, 1 - diff / 4)
        score += s * 0.4
        weights += 0.4

    # 香り
    pa = preferences.get("preferred_aroma")
    if pa and sake.aroma_level:
        diff = abs(int(pa) - int(sake.aroma_level))
        s = max(0.0, 1 - diff / 4)
        score += s * 0.3
        weights += 0.3

    # 地域一致ボーナス
    pr = preferences.get("preferred_region", "")
    if pr and sake.region and (pr in sake.region or sake.region in pr):
        score += 0.2
        weights += 0.2

    # 予算一致
    bmin = preferences.get("budget_min")
    bmax = preferences.get("budget_max")
    pmin, pmax = _parse_price_range(sake.price_range)

    if (bmin or bmax) and (pmin or pmax):
        ok = True
        if bmin and pmax and pmax < int(bmin):
            ok = False
        if bmax and pmin and pmin > int(bmax):
            ok = False
        if ok:
            score += 0.1
            weights += 0.1

    return score / weights if weights else 0.0


# ========= Embedding / 類似度ロジック ========= #


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """コサイン類似度を計算（-1〜1）。どちらか欠損なら 0."""
    if not vec1 or not vec2:
        return 0.0
    if len(vec1) != len(vec2):
        return 0.0

    dot = sum(a * b for a, b in zip(vec1, vec2))
    norm1 = math.sqrt(sum(a * a for a in vec1))
    norm2 = math.sqrt(sum(b * b for b in vec2))
    if norm1 == 0 or norm2 == 0:
        return 0.0

    return dot / (norm1 * norm2)


def build_user_embedding_input(preferences: Dict) -> str:
    """
    ユーザー嗜好を1つの文章にまとめて、Embedding入力用テキストにする
    """
    return (
        f"ユーザーの好み: 甘さ={preferences.get('preferred_sweetness')}, "
        f"香り={preferences.get('preferred_aroma')}, "
        f"地域={preferences.get('preferred_region')}, "
        f"予算={preferences.get('budget_min')}〜{preferences.get('budget_max')}円, "
        f"その他の希望: {preferences.get('additional_preferences', '')}"
    )


class AIRecommendationService:
    """GPT + 数値スコア + Embedding を使ったレコメンドサービス"""

    def __init__(self):
        # 環境変数 or settings からAPIキー取得
        api_key = os.getenv("OPENAI_API_KEY") or getattr(
            settings, "OPENAI_API_KEY", None
        )
        if not api_key:
            raise ValueError("OPENAI_API_KEY が設定されていません")

        base_url = getattr(
            settings, "OPENAI_BASE_URL", "https://api.openai.iniad.org/api/v1"
        )
        self.client = OpenAI(api_key=api_key, base_url=base_url)

        self.chat_model = "gpt-4o-mini"
        self.embedding_model = "text-embedding-3-small"

    def _build_prompt(self, preferences: Dict, sake_list_text: str) -> str:
        """
        ユーザーの嗜好情報と日本酒リストテキストからプロンプトを生成
        """
        preference_text = f"""
ユーザーの嗜好情報:
- 甘さ: {preferences.get('preferred_sweetness', '指定なし')}
- 香り: {preferences.get('preferred_aroma', '指定なし')}
- 地域: {preferences.get('preferred_region', '指定なし')}
- 予算: {preferences.get('budget_min', '未指定')}円〜{preferences.get('budget_max', '未指定')}円
- その他: {preferences.get('additional_preferences', 'なし')}
"""

        prompt = f"""
あなたは日本酒専門家です。
以下の日本酒リストの中から、ユーザーの嗜好に最適な3〜5本を推薦してください。

{preference_text}

【日本酒候補リスト（ハイブリッドスコア順）】
{sake_list_text}

出力は必ず次の JSON のみを返してください（Markdown不可）:

{{
  "recommendations": [
    {{
      "sake_id": 整数ID（リストの id と完全一致）,
      "sake_name": リストと同一の name,
      "reason": "選定理由（ユーザー嗜好との関係も含める）",
      "score": 0.0〜1.0 の数値（1.0 が最適）,
      "match_points": ["マッチポイント1", "マッチポイント2"]
    }}
  ]
}}
"""
        return prompt

    def _get_user_embedding(self, preferences: Dict) -> Optional[List[float]]:
        """
        ユーザー嗜好テキストから Embedding を生成
        """
        text = build_user_embedding_input(preferences)
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"[Embedding Error] user embedding 生成失敗: {e}")
            return None

    def get_recommendations(
        self,
        preferences: Dict,
        available_sakes: Optional[List[Sake]] = None,
        max_recommendations: int = 5,
        gpt_candidate_size: int = 20,
    ) -> List[Dict]:
        """
        1. 数値スコア + Embedding 類似度 でハイブリッドスコアを計算
        2. 上位候補を GPT でリランク & 理由付け
        """
        if available_sakes is None:
            available_sakes = list(Sake.objects.all())

        # ---- 1. ユーザー embedding を取得 ----
        user_emb = self._get_user_embedding(preferences)

        # ---- 2. 各 Sake に対してハイブリッドスコア計算 ----
        scored: List[tuple[Sake, float, float, float]] = []
        for sake in available_sakes:
            numeric_score = calculate_match_score(preferences, sake)

            # Embedding 類似度（-1〜1 → 0〜1 に正規化）
            semantic_score = 0.0
            if user_emb and sake.embedding:
                cos = cosine_similarity(user_emb, sake.embedding)
                semantic_score = (cos + 1.0) / 2.0  # -1〜1 → 0〜1

            # ハイブリッドスコア
            # 重みは好みで調整可能（例: 数値0.4, semantic0.6）
            final_score = 0.4 * numeric_score + 0.6 * semantic_score

            scored.append((sake, final_score, numeric_score, semantic_score))

        # スコア順に並べて上位候補を抽出
        scored.sort(key=lambda x: x[1], reverse=True)
        top_candidates = scored[:gpt_candidate_size]

        if not top_candidates:
            return []

        # ---- 3. GPT に渡す用のテキスト整形 ----
        sake_list_text = "\n".join(
            [
                f"- id: {sake.id}\n"
                f"  name: {sake.name}\n"
                f"  region: {sake.region}\n"
                f"  category: {sake.category}\n"
                f"  sweetness_level: {sake.sweetness_level}\n"
                f"  aroma_level: {sake.aroma_level}\n"
                f"  price_range: {sake.price_range}\n"
                f"  numeric_score: {numeric_score:.3f}\n"
                f"  semantic_score: {semantic_score:.3f}\n"
                f"  final_score: {final_score:.3f}\n"
                for sake, final_score, numeric_score, semantic_score in top_candidates
            ]
        )

        prompt = self._build_prompt(preferences, sake_list_text)

        # ---- 4. GPT 呼び出し ----
        recommendations: List[Dict] = []

        try:
            response = self.client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a sake recommendation engine.",
                    },
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
            )

            content = response.choices[0].message.content

            try:
                data = json.loads(content)
            except json.JSONDecodeError:
                # JSON修復
                fixed = content.strip()
                fixed = re.sub(r",\s*}", "}", fixed)
                fixed = re.sub(r",\s*]", "]", fixed)
                fixed = fixed.replace("“", '"').replace("”", '"')
                fixed = fixed.replace("’", "'")
                data = json.loads(fixed)

            recommendations = data.get("recommendations", [])

        except Exception as e:
            print(f"[GPT Error] {e}")
            recommendations = []

        # ---- 5. 不足分はハイブリッドスコア順で自動補完 ----
        if len(recommendations) < 3:
            for sake, final_score, numeric_score, semantic_score in top_candidates:
                if len(recommendations) >= 3:
                    break
                recommendations.append(
                    {
                        "sake_id": sake.id,
                        "sake_name": sake.name,
                        "reason": "自動補完（ハイブリッドスコア）",
                        "score": float(final_score),
                        "match_points": [],
                    }
                )

        # ---- 6. Sake モデルを紐付けて返却 ----
        final: List[Dict] = []

        for rec in recommendations[:max_recommendations]:
            sake_id = rec.get("sake_id")
            matched_sake_tuple = next(
                (t for t in top_candidates if t[0].id == sake_id),
                None,
            )
            if not matched_sake_tuple:
                continue

            matched_sake, final_score, numeric_score, semantic_score = (
                matched_sake_tuple
            )

            final.append(
                {
                    "sake": matched_sake,
                    "sake_id": matched_sake.id,
                    "sake_name": matched_sake.name,
                    "reason": rec.get("reason", ""),
                    "score": float(rec.get("score", final_score)),
                    "match_points": rec.get("match_points", []),
                    "gpt_reason": rec.get("reason", ""),
                    "numeric_score": numeric_score,
                    "semantic_score": semantic_score,
                    "final_score": final_score,
                }
            )

        return final
