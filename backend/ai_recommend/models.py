from django.db import models

from django.db import models


class RecommendedItem(models.Model):
    # 例：おすすめするスポットやコンテンツ
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    score = models.FloatField(default=0.0)  # レコメンドスコア
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.score})"
