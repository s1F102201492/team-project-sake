from django.db import models
from django.conf import settings


class UserPreference(models.Model):
    """ユーザーの嗜好情報を保存するモデル"""
    # UUIDでユーザーを識別（他のアプリと統一）
    user_supa_id = models.UUIDField(
        db_index=True, help_text="SupabaseのUser ID")

    # 嗜好情報
    preferred_sweetness = models.IntegerField(
        null=True, blank=True, help_text="好みの甘さ（1:辛口 〜 5:甘口）")
    preferred_aroma = models.IntegerField(
        null=True, blank=True, help_text="好みの香り（1:控えめ 〜 5:芳醇）")
    preferred_region = models.CharField(
        max_length=100, blank=True, help_text="好みの地域")
    budget_min = models.IntegerField(
        null=True, blank=True, help_text="予算の下限（円）")
    budget_max = models.IntegerField(
        null=True, blank=True, help_text="予算の上限（円）")
    additional_preferences = models.TextField(
        blank=True, help_text="その他の希望やコメント")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # 1ユーザーにつき1つの嗜好情報（最新のものを取得）
        ordering = ['-updated_at']

    def __str__(self):
        return f"UserPreference: {self.user_supa_id}"


class RecommendedItem(models.Model):
    """AIが生成したレコメンド結果を保存するモデル"""
    # Sakeモデルとの関連付け（apiアプリのSakeモデルを参照）
    sake = models.ForeignKey("api.Sake", on_delete=models.CASCADE,
                             null=True, blank=True, related_name="recommendations")

    # ユーザーとの関連付け
    user_supa_id = models.UUIDField(
        db_index=True, help_text="このレコメンドを受け取ったユーザー")
    user_preference = models.ForeignKey(
        UserPreference, on_delete=models.SET_NULL, null=True, blank=True, related_name="recommendations")

    # レコメンド情報
    title = models.CharField(
        max_length=200, help_text="酒の名前（sakeから取得可能だが、GPT生成時にも保持）")
    description = models.TextField(blank=True, help_text="GPTが生成したレコメンド理由・説明")
    category = models.CharField(max_length=100, blank=True)
    score = models.FloatField(default=0.0, help_text="レコメンドスコア（GPTからの評価スコア）")

    # GPT生成時の情報を保持（デバッグ・分析用）
    gpt_reason = models.TextField(blank=True, help_text="GPTがこのお酒を選んだ理由")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', '-created_at']

    def __str__(self):
        sake_name = self.sake.name if self.sake else self.title
        return f"{sake_name} (Score: {self.score})"

class Sake(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)  # 例: 純米酒, 吟醸酒
    description = models.TextField()
    # AIレコメンド用の追加フィールド
    region = models.CharField(max_length=100, blank=True)  # 産地・地域
    brewery = models.ForeignKey(
        "Brewery", on_delete=models.SET_NULL, null=True, blank=True, related_name="sakes")  # 酒蔵
    sweetness_level = models.IntegerField(
        null=True, blank=True, help_text="甘さの度合い（1:辛口 〜 5:甘口）")
    aroma_level = models.IntegerField(
        null=True, blank=True, help_text="香りの強さ（1:控えめ 〜 5:芳醇）")
    alcohol_content = models.FloatField(
        null=True, blank=True, help_text="アルコール度数")
    price_range = models.CharField(
        max_length=50, blank=True, help_text="価格帯（例: 1000-2000円）")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
