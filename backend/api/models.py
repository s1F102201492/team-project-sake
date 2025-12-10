# api/models.py
from django.db import models
from django.conf import settings  # Django標準のUserモデルを利用


class Sake(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)  # 例: 純米酒, 吟醸酒
    description = models.TextField()
    # その他、産地、アルコール度数などのカラムを追加

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


