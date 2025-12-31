from django.db import models
from django.contrib.auth.models import User

class Checkpoint(models.Model):
    name = models.CharField(max_length=100)
    lat = models.FloatField()
    lng = models.FloatField()
    img = models.CharField(max_length=200)  # スタンプ画像のパスやURL

    def __str__(self):
        return self.name

class Stamp(models.Model):
    user_supa_id = models.CharField(max_length=255, db_index=True, help_text="Supabase User ID", null=True, blank=True)
    checkpoint = models.ForeignKey(Checkpoint, on_delete=models.CASCADE)
    obtained_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user_supa_id", "checkpoint")
