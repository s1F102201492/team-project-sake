from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'start_time', 'address', 'fee')
    search_fields = ('title', 'description')
    list_filter = ('start_time',)
