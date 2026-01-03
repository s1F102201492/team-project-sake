from rest_framework import viewsets
from .models import Sake, Brewery
from .serializers import SakeSerializer, BrewerySerializer

class SakeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sake.objects.all()
    serializer_class = SakeSerializer

class BreweryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brewery.objects.all()
    serializer_class = BrewerySerializer
