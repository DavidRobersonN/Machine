from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class BroadcastService:
    """
    Responsável por enviar atualizações em tempo real
    para todos os clientes conectados via WebSocket.
    """

    GROUP_NAME = 'machine_updates'

    def broadcast_machine_state(self, payload: dict) -> None:
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            self.GROUP_NAME,
            {
                'type': 'machine_update',
                'payload': payload,
            }
        )