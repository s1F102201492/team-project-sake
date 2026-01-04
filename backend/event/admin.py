from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'start_date', 'location', 'fee')
    search_fields = ('name', 'description')
    list_filter = ('start_date',)
