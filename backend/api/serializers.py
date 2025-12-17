from rest_framework import serializers
from .models import Sake, Brewery

class BrewerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Brewery
        fields = '__all__'

class SakeSerializer(serializers.ModelSerializer):
    brewery = BrewerySerializer(read_only=True)
    
    class Meta:
        model = Sake
        fields = '__all__'