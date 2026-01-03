# api/models.py

from django.db import models
from django.conf import settings
from pgvector.django import VectorField  # pgvectorを利用

class Brewery(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Sake(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    description = models.TextField()
    
    # 0002_add_ai_recommend_fields で追加されたフィールド
    region = models.CharField(max_length=100, blank=True)
    brewery = models.ForeignKey(
        Brewery, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='sakes'
    )
    sweetness_level = models.IntegerField(
        null=True, blank=True, help_text='甘さの度合い（1:辛口 〜 5:甘口）'
    )
    aroma_level = models.IntegerField(
        null=True, blank=True, help_text='香りの強さ（1:控えめ 〜 5:芳醇）'
    )
    alcohol_content = models.FloatField(
        null=True, blank=True, help_text='アルコール度数'
    )
    price_range = models.CharField(
        max_length=50, blank=True, help_text='価格帯（例: 1000-2000円）'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # 0003_sake_embedding で追加されたフィールド
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    def __str__(self):
        return self.name
