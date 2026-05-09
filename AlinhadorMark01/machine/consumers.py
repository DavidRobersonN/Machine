import json
import threading
import time

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from machine.services.machine_service import MachineService


class MachineConsumer(WebsocketConsumer):
    GROUP_NAME = 'machine_updates'

    WHEEL_UPDATE_INTERVAL_SECONDS = 0.1

    def handle_serial_json_message(self, data: dict) -> bool:
        """
        Trata mensagens JSON recebidas diretamente do Arduino pela serial.

        Retorna True quando a mensagem foi reconhecida e tratada.
        Retorna False quando a mensagem não pertence a nenhum fluxo especial.
        """

        message_type = data.get('type')

        if message_type == 'motor_roda_position_status':
            payload = {
                'wheel_current_angle': data.get('current_angle'),
                'wheel_target_angle': data.get('target_angle'),
                'wheel_current_spoke': data.get('current_spoke'),
                'wheel_target_spoke': data.get('target_spoke'),
                'wheel_total_spokes': data.get('total_spokes'),
                'wheel_is_positioning': data.get('is_positioning'),
            }

            clean_payload = {
                key: value
                for key, value in payload.items()
                if value is not None
            }

            self.machine_state_service.broadcast_service.broadcast_machine_state(
                payload=clean_payload,
            )

            self.send(text_data=json.dumps({
                'type': 'serial_message',
                'direction': 'received',
                'message': (
                    f"Status da posição da roda: "
                    f"ângulo atual {data.get('current_angle')}°, "
                    f"raio atual {data.get('current_spoke')}, "
                    f"status {data.get('status')}"
                ),
            }))

            return True

        if message_type == 'motor_roda_config_status':
            payload = {
                'wheel_total_spokes': data.get('total_spokes'),
            }

            clean_payload = {
                key: value
                for key, value in payload.items()
                if value is not None
            }

            if clean_payload:
                self.machine_state_service.broadcast_service.broadcast_machine_state(
                    payload=clean_payload,
                )

            self.send(text_data=json.dumps({
                'type': 'serial_message',
                'direction': 'received',
                'message': (
                    f"Configuração do motor atualizada: "
                    f"{data.get('message')}. "
                    f"Raios: {data.get('total_spokes')}, "
                    f"passos por volta da roda: {data.get('steps_per_wheel_revolution')}, "
                    f"graus por raio: {data.get('degrees_per_spoke')}, "
                    f"passos por grau: {data.get('steps_per_degree')}, "
                    f"velocidade máxima: {data.get('max_speed')}, "
                    f"aceleração: {data.get('acceleration')}"
                ),
            }))

            return True

        if message_type == 'lateral_sensor_status':
            self.machine_state_service.broadcast_service.broadcast_machine_state(
                payload={
                    'is_lateral_reading_enabled': data.get('reading_enabled'),
                },
            )

            self.send(text_data=json.dumps({
                'type': 'serial_message',
                'direction': 'received',
                'message': data.get(
                    'message',
                    'Status da leitura lateral atualizado',
                ),
            }))

            return True

        return False

        if message_type == 'lateral_sensor_status':
            self.machine_state_service.broadcast_service.broadcast_machine_state(
                payload={
                    'is_lateral_reading_enabled': data.get('reading_enabled'),
                },
            )

            self.send(text_data=json.dumps({
                'type': 'serial_message',
                'direction': 'received',
                'message': data.get(
                    'message',
                    'Status da leitura lateral atualizado',
                ),
            }))

            return True

        return False

    def start_serial_listener(self):
        """
        Listener contínuo da porta serial.

        Ele fica lendo tudo que chega do Arduino.

        Regras:
        - Se a linha começar com POS:, atualiza o sensor lateral em tempo real.
        - Se a linha for JSON de posição da roda, atualiza o estado da roda.
        - Se a linha for JSON de status do sensor lateral, atualiza o status da leitura lateral.
        - Qualquer outra linha recebida é enviada para o frontend como serial_message.
        """

        print('[Serial Listener] Iniciado')

        while getattr(self, 'serial_listener_running', False):
            try:
                if not self.machine_service.serial_service.is_connected():
                    time.sleep(0.001)
                    continue

                line = self.machine_service.serial_service.read_line()

                if not line:
                    continue

                line = line.strip()

                print(f'[Serial Listener] Recebido: {line}')

                if line.startswith('POS:'):
                    value = float(line.replace('POS:', '').strip())

                    self.machine_state_service.broadcast_lateral_sensor_state(value)

                    continue

                if line.startswith('{') and line.endswith('}'):
                    try:
                        serial_data = json.loads(line)

                        was_handled = self.handle_serial_json_message(
                            serial_data,
                        )

                        if was_handled:
                            continue

                    except json.JSONDecodeError:
                        pass

                self.send(text_data=json.dumps({
                    'type': 'serial_message',
                    'direction': 'received',
                    'message': line,
                }))

            except Exception as error:
                print('[Serial Listener] Erro:', error)

                try:
                    self.send(text_data=json.dumps({
                        'type': 'error',
                        'message': f'Erro no listener serial: {error}',
                    }))
                except Exception:
                    pass

    def start_wheel_position_listener(self):
        print('[Wheel Position Listener] Iniciado')

        while getattr(self, 'wheel_position_listener_running', False):
            try:
                self.machine_state_service.update_wheel_position_realtime(
                    interval_seconds=self.WHEEL_UPDATE_INTERVAL_SECONDS,
                )

                time.sleep(self.WHEEL_UPDATE_INTERVAL_SECONDS)

            except Exception as error:
                print('[Wheel Position Listener] Erro:', error)
                time.sleep(self.WHEEL_UPDATE_INTERVAL_SECONDS)

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

        self.wheel_position_listener_running = True

        threading.Thread(
            target=self.start_wheel_position_listener,
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

            self.send(text_data=json.dumps({
                'type': 'log',
                'direction': 'received',
                'message': f'Mensagem recebida do frontend: {data}',
            }))

            response = self.machine_service.handle_command(data)

            self.send(text_data=json.dumps({
                'type': 'log',
                'direction': 'sent',
                'message': f'Resposta enviada pelo backend: {response}',
            }))

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
        self.serial_listener_running = False
        self.wheel_position_listener_running = False

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