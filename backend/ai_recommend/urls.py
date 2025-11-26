from django.urls import path
from . import views

urlpatterns = [
    path("recommend/", views.create_recommendation,
         name="create_recommendation"),  # POST: レコメンド生成
    path("recommendations/", views.get_recommendations,
         name="get_recommendations"),  # GET: レコメンド一覧取得
]
