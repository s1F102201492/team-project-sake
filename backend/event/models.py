from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=255, verbose_name="イベント名")  # title -> name
    description = models.TextField(verbose_name="概要")  # decription -> description (Typo fix)
    start_date = models.DateTimeField(verbose_name="開始日時")  # start_time -> start_date
    end_date = models.DateTimeField(verbose_name="終了日時")  # end_time -> end_date
    
    # JSONリスト（例：['ワイン', 'ビール']）を格納
    alcoholTypes = models.JSONField(default=list, verbose_name="アルコールのタイプ")
    location = models.CharField(max_length=255, verbose_name="開催場所（住所）")  # address -> location
    
    latitude = models.FloatField(blank=True, null=True, verbose_name="緯度")
    longitude = models.FloatField(blank=True, null=True, verbose_name="経度")
    
    fee = models.CharField(max_length=100, blank=True, null=True, verbose_name="料金")
    image = models.URLField(blank=True, null=True, verbose_name="画像URL") # 新規追加
    url = models.URLField(blank=True, null=True, verbose_name="イベントのリンク")
    
    # JSONリスト（例：["一人飲み", "初心者歓迎"]）を格納
    keywords = models.JSONField(default=list, blank=True, verbose_name="ハッシュタグキーワード")
    
    organizer_supa_id = models.CharField(
        max_length=255, db_index=True, help_text="Supabase User ID", blank=True, null=True
    )
    sakes_featured = models.ManyToManyField(
        "api.Sake", blank=True, verbose_name="提供されるお酒", null=True
    )

    # 予約したユーザーのIDリスト（Supabase User ID等）
    reserved_user_ids = models.JSONField(
        default=list, blank=True, verbose_name="予約済みユーザーID", 
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="作成日時")
    update_at = models.DateTimeField(auto_now=True, verbose_name="更新日時")  # updated_at -> update_at

    def __str__(self):
        return self.name  # title -> name

    class Meta:
        verbose_name = "イベント"
        verbose_name_plural = "イベント一覧"


class Review(models.Model):
    user_supa_id = models.CharField(max_length=255, db_index=True, help_text="Supabase User ID")
    sake = models.ForeignKey("api.Sake", on_delete=models.CASCADE, null=True, blank=True)
    event = models.ForeignKey("Event", on_delete=models.CASCADE, null=True, blank=True)
    rating = models.IntegerField()  # 例: 1〜5の5段階評価
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
