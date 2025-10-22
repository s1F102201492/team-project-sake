from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name = 'stamprally_index'),
]