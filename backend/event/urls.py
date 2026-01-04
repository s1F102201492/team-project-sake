from django.urls import path

from . import views

urlpatterns = [
    path("api/events/", views.events_list, name="event_list"),
    path("api/events/<int:pk>/reserve/", views.reserve_event, name="event_reserve"),
]

