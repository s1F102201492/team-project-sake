"""
AIレコメンド機能のビュー
"""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import RecommendedItem, UserPreference
from .services import AIRecommendationService


@csrf_exempt
@require_http_methods(["POST"])
def create_recommendation(request):
    """
    POST /ai_recommend/recommend/
    ユーザーの嗜好情報を受け取り、GPTを使ってレコメンドを生成する
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "無効なJSON形式です"}, status=400)

    user_supa_id = data.get("user_supa_id")
    if not user_supa_id:
        return JsonResponse({"error": "user_supa_id は必須です"}, status=400)

    # 嗜好情報
    preferences_data = {
        "preferred_sweetness": data.get("preferred_sweetness"),
        "preferred_aroma": data.get("preferred_aroma"),
        "preferred_region": data.get("preferred_region", ""),
        "budget_min": data.get("budget_min"),
        "budget_max": data.get("budget_max"),
        "additional_preferences": data.get("additional_preferences", ""),
    }

    try:
        # UserPreference 保存 or 更新
        user_preference, created = UserPreference.objects.update_or_create(
            user_supa_id=user_supa_id,
            defaults=preferences_data,
        )

        # レコメンド生成
        service = AIRecommendationService()
        gpt_recommendations = service.get_recommendations(preferences_data)

        saved_items = []

        for rec in gpt_recommendations:
            sake_obj = rec.get("sake")
            sake_id = rec.get("sake_id") or (sake_obj.id if sake_obj else None)

            # 重複レコメンド削除（同ユーザー・同Sake）
            if sake_id is not None:
                RecommendedItem.objects.filter(
                    user_supa_id=user_supa_id,
                    sake_id=sake_id,
                ).delete()

            category = getattr(sake_obj, "category", "") if sake_obj else ""

            recommended_item = RecommendedItem.objects.create(
                sake=sake_obj,
                user_supa_id=user_supa_id,
                user_preference=user_preference,
                title=rec.get("sake_name", ""),
                description=rec.get("reason", ""),
                score=rec.get("score", 0.0),
                gpt_reason=rec.get("gpt_reason", ""),
                category=category,
            )

            saved_items.append(recommended_item)

        # 古いレコメンドを削除（最新10件だけ残す）
        user_items = RecommendedItem.objects.filter(user_supa_id=user_supa_id).order_by(
            "-created_at"
        )
        if user_items.count() > 10:
            for old_item in user_items[10:]:
                old_item.delete()

        # レスポンス作成
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
                    "sake_details": (
                        {
                            "name": item.sake.name if item.sake else item.title,
                            "region": item.sake.region if item.sake else None,
                            "sweetness_level": (
                                item.sake.sweetness_level if item.sake else None
                            ),
                            "aroma_level": item.sake.aroma_level if item.sake else None,
                            "brewery": (
                                item.sake.brewery.name
                                if item.sake and item.sake.brewery
                                else None
                            ),
                        }
                        if item.sake
                        else None
                    ),
                }
                for item in saved_items
            ],
        }

    except Exception as e:
        return JsonResponse(
            {"error": f"レコメンド生成中にエラーが発生しました: {str(e)}"},
            status=500,
        )

    return JsonResponse(response_data, status=201)


@require_http_methods(["GET"])
def get_recommendations(request):
    """
    GET /ai_recommend/recommendations/

    クエリパラメータ:
    - user_supa_id: ユーザーID
    - limit: 取得件数（1〜50）
    - offset: 取得開始位置
    - category: カテゴリで絞り込み
    - region: 地域で絞り込み
    - order_by: ソート方式（score / created_at）
    """
    try:
        user_supa_id = request.GET.get("user_supa_id")
        category = request.GET.get("category")
        region = request.GET.get("region")
        order_by = request.GET.get("order_by", "score")

        try:
            limit = int(request.GET.get("limit", 10))
        except ValueError:
            limit = 10
        try:
            offset = int(request.GET.get("offset", 0))
        except ValueError:
            offset = 0

        if limit <= 0 or limit > 50:
            limit = 10
        if offset < 0:
            offset = 0

        queryset = RecommendedItem.objects.all()

        if user_supa_id:
            queryset = queryset.filter(user_supa_id=user_supa_id)

        if category:
            queryset = queryset.filter(category__icontains=category)

        if region:
            queryset = queryset.filter(sake__region__icontains=region)

        if order_by == "created_at":
            queryset = queryset.order_by("-created_at", "-score")
        else:
            queryset = queryset.order_by("-score", "-created_at")

        total = queryset.count()
        items = queryset[offset : offset + limit]

        results = [
            {
                "id": item.id,
                "sake_id": item.sake.id if item.sake else None,
                "sake_name": item.title,
                "description": item.description,
                "category": item.category,
                "score": item.score,
                "gpt_reason": item.gpt_reason,
                "sake_details": (
                    {
                        "name": item.sake.name if item.sake else item.title,
                        "region": item.sake.region if item.sake else None,
                        "sweetness_level": (
                            item.sake.sweetness_level if item.sake else None
                        ),
                        "aroma_level": item.sake.aroma_level if item.sake else None,
                        "brewery": (
                            item.sake.brewery.name
                            if item.sake and item.sake.brewery
                            else None
                        ),
                        "description": item.sake.description if item.sake else None,
                    }
                    if item.sake
                    else None
                ),
                "created_at": item.created_at.isoformat(),
            }
            for item in items
        ]

        return JsonResponse(
            {
                "total": total,
                "count": len(results),
                "offset": offset,
                "limit": limit,
                "results": results,
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse(
            {"error": f"レコメンド取得中にエラーが発生しました: {str(e)}"},
            status=500,
        )
