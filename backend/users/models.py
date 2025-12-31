from django.db import models


class Users(models.Model):
    """Supabase の public.user に対応するユーザープロフィール。"""

    id = models.UUIDField(primary_key=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=128)
    prefecture = models.CharField(max_length=64, blank=True)
    avatar_url = models.URLField(blank=True)

    class Meta:
        db_table = "Users"
        verbose_name = "Users"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

