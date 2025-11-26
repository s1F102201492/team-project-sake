"""
AIレコメンド機能のビュー
"""
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from .models import RecommendedItem, UserPreference
from .services import AIRecommendationService
from api.models import Sake


@csrf_exempt
@require_http_methods(["POST"])
def create_recommendation(request):
    """
    POST /ai_recommend/recommend/
    ユーザーの嗜好情報を受け取り、GPTを使ってレコメンドを生成する

    リクエストボディ例:
    {
        "user_supa_id": "uuid-string",
        "preferred_sweetness": 3,
        "preferred_aroma": 4,
        "preferred_region": "新潟県",
        "budget_min": 1000,
        "budget_max": 5000,
        "additional_preferences": "フルーティーな香りが好き"
    }
    """
    try:
        # リクエストボディをパース
        data = json.loads(request.body)
        user_supa_id = data.get("user_supa_id")

        if not user_supa_id:
            return JsonResponse(
                {"error": "user_supa_id は必須です"},
                status=400
            )

        # 嗜好情報を取得
        preferences_data = {
            "preferred_sweetness": data.get("preferred_sweetness"),
            "preferred_aroma": data.get("preferred_aroma"),
            "preferred_region": data.get("preferred_region", ""),
            "budget_min": data.get("budget_min"),
            "budget_max": data.get("budget_max"),
            "additional_preferences": data.get("additional_preferences", "")
        }

        # UserPreferenceを保存または更新
        user_preference, created = UserPreference.objects.update_or_create(
            user_supa_id=user_supa_id,
            defaults=preferences_data
        )

        # GPTサービスを使ってレコメンドを生成
        service = AIRecommendationService()
        gpt_recommendations = service.get_recommendations(preferences_data)

        # RecommendedItemとして保存
        saved_items = []
        for rec in gpt_recommendations:
            # 既存のレコメンドを削除（同じユーザー・同じお酒の場合）
            RecommendedItem.objects.filter(
                user_supa_id=user_supa_id,
                sake=rec.get("sake")
            ).delete()

            # 新しいレコメンドを作成
            recommended_item = RecommendedItem.objects.create(
                sake=rec.get("sake"),
                user_supa_id=user_supa_id,
                user_preference=user_preference,
                title=rec.get("sake_name", ""),
                description=rec.get("reason", ""),
                score=rec.get("score", 0.0),
                gpt_reason=rec.get("gpt_reason", ""),
                category=rec.get("sake").category if rec.get("sake") else ""
            )
            saved_items.append(recommended_item)

        # レスポンスを生成
        response_data = {
            "user_supa_id": user_supa_id,
            "recommendations": [
                {
                    "id": item.id,
                    "sake_id": item.sake.id if item.sake else None,
                    "sake_name": item.title,
                    "description": item.description,
                    "category": item.category,
                    "score": item.score,
                    "gpt_reason": item.gpt_reason,
                    "sake_details": {
                        "name": item.sake.name if item.sake else item.title,
                        "region": item.sake.region if item.sake else None,
                        "sweetness_level": item.sake.sweetness_level if item.sake else None,
                        "aroma_level": item.sake.aroma_level if item.sake else None,
                        "brewery": item.sake.brewery.name if item.sake and item.sake.brewery else None,
                    } if item.sake else None
                }
                for item in saved_items
            ]
        }

        return JsonResponse(response_data, status=201)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "無効なJSON形式です"},
            status=400
        )
    except ValueError as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )
    except Exception as e:
        return JsonResponse(
            {"error": f"レコメンド生成中にエラーが発生しました: {str(e)}"},
            status=500
        )


@require_http_methods(["GET"])
def get_recommendations(request):
    """
    GET /ai_recommend/recommendations/
    レコメンド一覧を取得する

    クエリパラメータ:
    - user_supa_id: ユーザーID（指定した場合はそのユーザーのレコメンドのみ）
    - limit: 取得件数（デフォルト: 10）
    """
    try:
        user_supa_id = request.GET.get("user_supa_id")
        limit = int(request.GET.get("limit", 10))

        # クエリセットを構築
        queryset = RecommendedItem.objects.all()

        if user_supa_id:
            queryset = queryset.filter(user_supa_id=user_supa_id)

        # スコア順でソートして取得
        items = queryset.order_by("-score", "-created_at")[:limit]

        data = [
            {
                "id": item.id,
                "sake_id": item.sake.id if item.sake else None,
                "sake_name": item.title,
                "description": item.description,
                "category": item.category,
                "score": item.score,
                "gpt_reason": item.gpt_reason,
                "sake_details": {
                    "name": item.sake.name if item.sake else item.title,
                    "region": item.sake.region if item.sake else None,
                    "sweetness_level": item.sake.sweetness_level if item.sake else None,
                    "aroma_level": item.sake.aroma_level if item.sake else None,
                    "brewery": item.sake.brewery.name if item.sake and item.sake.brewery else None,
                    "description": item.sake.description if item.sake else None,
                } if item.sake else None,
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ]

        return JsonResponse({"recommendations": data}, status=200)

    except ValueError:
        return JsonResponse(
            {"error": "limit は数値である必要があります"},
            status=400
        )
    except Exception as e:
        return JsonResponse(
            {"error": f"レコメンド取得中にエラーが発生しました: {str(e)}"},
            status=500
        )
