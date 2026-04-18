import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
from machine.services.machine_service import MachineService


class MachineConsumer(WebsocketConsumer):
    GROUP_NAME = 'machine_updates'

    def connect(self):
        self.machine_service = MachineService()
        self.machine_state_service = self.machine_service.machine_state_service

        async_to_sync(self.channel_layer.group_add)(
            self.GROUP_NAME,
            self.channel_name,
        )

        self.accept()

        current_state = self.machine_state_service.get_current_state()

        self.send(text_data=json.dumps({
            'type': 'machine_update',
            'payload': current_state,
        }))

    def receive(self, text_data):
        try:
            data = json.loads(text_data)
            response = self.machine_service.handle_command(data)

            self.send(text_data=json.dumps(response))

        except json.JSONDecodeError:
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'JSON inválido enviado pelo frontend',
            }))

        except Exception as error:
            self.send(text_data=json.dumps({
                'type': 'error',
                'message': str(error),
            }))

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.GROUP_NAME,
            self.channel_name,
        )

        try:
            if hasattr(self, 'machine_service'):
                self.machine_service.serial_service.disconnect()
        except Exception:
            pass

    def machine_update(self, event):
        self.send(text_data=json.dumps({
            'type': 'machine_update',
            'payload': event['payload'],
        }))