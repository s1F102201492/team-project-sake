from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='stamprally_index'),
    path('api/checkpoints/', views.checkpoints_list, name='stamprally_checkpoints_list'),
    path('api/stamps/', views.stamps_list, name='stamprally_stamps_list'),
    path('api/stamps/create/', views.stamps_create, name='stamprally_stamps_create'),
]