from django.http import JsonResponse
from .models import RecommendedItem


def recommend_list(request):
    # 仮：score が高い順に上位5件返す
    items = RecommendedItem.objects.order_by("-score")[:5]
    data = [
        {
            "id": item.id,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "score": item.score,
        }
        for item in items
    ]
    return JsonResponse({"recommendations": data})
