import json
import threading
import time

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from machine.services.machine_service import MachineService


class MachineConsumer(WebsocketConsumer):
    GROUP_NAME = 'machine_updates'

    def start_serial_listener(self):
        print('[Serial Listener] Iniciado')

        while getattr(self, 'serial_listener_running', False):
            try:
                if not self.machine_service.serial_service.is_connected():
                    time.sleep(0.001)
                    continue

                line = self.machine_service.serial_service.read_line()

                if not line:
                    continue

                # Remove espaços, \n e \r da linha recebida
                line = line.strip()

                # O Arduino precisa enviar assim:
                # POS:-8.50
                if line.startswith('POS:'):
                    value = float(line.replace('POS:', '').strip())

                    # Agora envia para a tela sem salvar no banco
                    self.machine_state_service.broadcast_lateral_sensor_state(value)

            except Exception as error:
                print('[Serial Listener] Erro:', error)

    def connect(self):
        self.machine_service = MachineService()
        self.machine_state_service = self.machine_service.machine_state_service

        async_to_sync(self.channel_layer.group_add)(
            self.GROUP_NAME,
            self.channel_name,
        )

        self.accept()

        self.serial_listener_running = True

        threading.Thread(
            target=self.start_serial_listener,
            daemon=True,
        ).start()

        current_state = self.machine_state_service.get_current_state()

        print('[MachineConsumer][connect] Estado inicial enviado ao frontend:')
        print(current_state)

        self.send(text_data=json.dumps({
            'type': 'machine_update',
            'payload': current_state,
        }))

    def receive(self, text_data):
        try:
            data = json.loads(text_data)

            # LOG 1:
            # registra que o backend recebeu uma mensagem do frontend
            self.send(text_data=json.dumps({
                'type': 'log',
                'direction': 'received',
                'message': f'Mensagem recebida do frontend: {data}',
            }))

            response = self.machine_service.handle_command(data)

            # LOG 2:
            # registra que o backend vai enviar uma resposta ao frontend
            self.send(text_data=json.dumps({
                'type': 'log',
                'direction': 'sent',
                'message': f'Resposta enviada pelo backend: {response}',
            }))

            # resposta principal da aplicação
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
        # Para a thread do listener serial
        self.serial_listener_running = False

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