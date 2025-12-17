from django.db import models

class Event(models.Model):
    title = models.CharField(max_length=255, verbose_name="イベントのタイトル")
    description = models.TextField(verbose_name="概要")
    start_time = models.DateTimeField(verbose_name="開始時刻")
    end_time = models.DateTimeField(verbose_name="終了時刻")
    
    # JSONリスト（例：['ワイン', 'ビール']）を格納
    alcohol_types = models.JSONField(default=list, verbose_name="アルコールのタイプ")
    
    address = models.CharField(max_length=255, verbose_name="イベントの住所")
    latitude = models.FloatField(blank=True, null=True, verbose_name="緯度")
    longitude = models.FloatField(blank=True, null=True, verbose_name="経度")
    
    fee = models.CharField(max_length=100, blank=True, null=True, verbose_name="料金")
    url = models.URLField(blank=True, null=True, verbose_name="イベントのリンク")
    
    # JSONリスト（例：["一人飲み", "初心者歓迎"]）を格納
    keywords = models.JSONField(default=list, blank=True, verbose_name="ハッシュタグキーワード")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "イベント"
        verbose_name_plural = "イベント一覧"
