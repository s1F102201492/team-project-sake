from rest_framework import serializers
from event.models import Event
from stamprally.models import Checkpoint, Stamp

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class StampSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stamp
        fields = '__all__'