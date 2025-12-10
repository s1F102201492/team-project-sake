# api/models.py
from django.db import models
from django.conf import settings  # Django標準のUserモデルを利用
from pgvector.django import VectorField


class Sake(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)  # 例: 純米酒, 吟醸酒
    description = models.TextField()
    # AIレコメンド用の追加フィールド
    region = models.CharField(max_length=100, blank=True)  # 産地・地域
    brewery = models.ForeignKey(
        "Brewery",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sakes",
    )  # 酒蔵
    sweetness_level = models.IntegerField(
        null=True, blank=True, help_text="甘さの度合い（1:辛口 〜 5:甘口）"
    )
    aroma_level = models.IntegerField(
        null=True, blank=True, help_text="香りの強さ（1:控えめ 〜 5:芳醇）"
    )
    alcohol_content = models.FloatField(
        null=True, blank=True, help_text="アルコール度数"
    )
    price_range = models.CharField(
        max_length=50, blank=True, help_text="価格帯（例: 1000-2000円）"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    def __str__(self):
        return self.name


class Brewery(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    start_at = models.DateTimeField()
    venue = models.CharField(max_length=200)  # 開催場所
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )  # 主催者
    sakes_featured = models.ManyToManyField(
        "Sake", blank=True
    )  # イベントで提供されるお酒

    def __str__(self):
        return self.title


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sake = models.ForeignKey("Sake", on_delete=models.CASCADE, null=True, blank=True)
    event = models.ForeignKey("Event", on_delete=models.CASCADE, null=True, blank=True)
    rating = models.IntegerField()  # 例: 1〜5の5段階評価
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


class StampRally(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class UserStamp(models.Model):
    # SupabaseのUser ID (UUID) を保存するためのフィールド
    # user_idというフィールド名が自動で作られるのを避け、あえて user_supa_id としています
    # もしくはシンプルに user_id = models.UUIDField() でもOK
    user_supa_id = models.UUIDField(
        db_index=True
    )  # どのSupabaseユーザーがスタンプしたかをUUIDで記録

    rally = models.ForeignKey("StampRally", on_delete=models.CASCADE)
    brewery = models.ForeignKey("Brewery", on_delete=models.CASCADE)
    stamped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 固有制約も user_supa_id を使うように変更
        unique_together = ("user_supa_id", "rally", "brewery")

    def __str__(self):
        # user.username は使えないため、IDで表示
        return f"{self.user_supa_id} - {self.brewery.name}"
