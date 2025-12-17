from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SakeViewSet, BreweryViewSet

router = DefaultRouter()
router.register(r'sakes', SakeViewSet)
router.register(r'breweries', BreweryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
