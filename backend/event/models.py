from django.db import models
from django.conf import settings 

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