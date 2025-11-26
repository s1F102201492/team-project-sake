from rest_framework import serializers
from event.models import Event, Sake
from stamprally.models import Checkpoint, Stamp

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class StampRallySerializer(serializers.ModelSerializer):
    class Meta:
        model = StampRally
        fields = '__all__'