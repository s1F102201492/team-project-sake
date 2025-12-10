from django.urls import path
from . import views

urlpatterns = [
    path("recommend/", views.create_recommendation, name="create_recommendation"),
    path("recommendations/", views.get_recommendations, name="get_recommendations"),
]
