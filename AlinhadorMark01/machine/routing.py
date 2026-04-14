from django.urls import path
from machine.consumers import MachineConsumer

websocket_urlpatterns = [
    path('ws/machine/', MachineConsumer.as_asgi()),
]