from rest_framework import serializers
from .models import UserPreference, RecommendedItem


class UserPreferenceSerializer(serializers.ModelSerializer):
    """ユーザー嗜好情報のシリアライザー"""

    class Meta:
        model = UserPreference
        fields = [
            "user_supa_id",
            "preferred_sweetness",
            "preferred_aroma",
            "preferred_region",
            "budget_min",
            "budget_max",
            "additional_preferences",
        ]


class RecommendedItemSerializer(serializers.ModelSerializer):
    """レコメンド結果のシリアライザー"""

    sake_details = SakeProfileSerializer(source="sake", read_only=True)

    class Meta:
        model = RecommendedItem
        fields = [
            "id",
            "sake_id",
            "sake_details",
            "title",
            "description",
            "category",
            "score",
            "gpt_reason",
            "created_at",
        ]


class RecommendationRequestSerializer(serializers.Serializer):
    """レコメンドリクエストの検証用シリアライザー"""

    user_supa_id = serializers.UUIDField(required=True)
    preferred_sweetness = serializers.IntegerField(
        min_value=1, max_value=5, required=False, allow_null=True
    )
    preferred_aroma = serializers.IntegerField(
        min_value=1, max_value=5, required=False, allow_null=True
    )
    preferred_region = serializers.CharField(
        max_length=100, required=False, allow_blank=True
    )
    budget_min = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    budget_max = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    additional_preferences = serializers.CharField(required=False, allow_blank=True)
