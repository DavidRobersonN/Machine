import json
import threading
import time

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from machine.services.machine_service import MachineService


class MachineConsumer(WebsocketConsumer):
    GROUP_NAME = 'machine_updates'

    def handle_wheel_position_line(self, line: str) -> bool:
        if not line.startswith('WHEEL_POS:'):
            return False

        values = line.replace('WHEEL_POS:', '', 1).split(',')

        if len(values) != 5:
            return False

        try:
            current_angle = float(values[0])
            total_turns = float(values[1])
            current_spoke = int(values[2])
            is_running = values[3] == '1'
            is_positioning = values[4] == '1'
        except ValueError:
            return False

        payload = {
            'wheel_position_degrees': current_angle,
            'wheel_total_turns': total_turns,
            'wheel_current_angle': current_angle,
            'wheel_current_spoke': current_spoke,
            'wheel_is_running': is_running,
            'wheel_is_positioning': is_positioning,
        }

        self.machine_state_service.update_wheel_position_from_serial({
            'wheel_position_degrees': current_angle,
            'wheel_total_turns': total_turns,
            'wheel_is_running': is_running,
            'wheel_current_angle': current_angle,
            'wheel_current_spoke': current_spoke,
            'wheel_is_positioning': is_positioning,
        })

        self.machine_state_service.broadcast_service.broadcast_machine_state(
            payload=payload,
        )

        return True

    def handle_spoke_tension_line(self, line: str) -> bool:
        if not line.startswith('SPOKE_TENSION:'):
            return False

        values = line.replace('SPOKE_TENSION:', '', 1).split(',')

        if len(values) != 2:
            return False

        try:
            left_kg = float(values[0])
            right_kg = float(values[1])
        except ValueError:
            return False

        self.machine_state_service.update_state({
            'spoke_tension_left_kg': left_kg,
            'spoke_tension_right_kg': right_kg,
        })

        return True

    def handle_serial_json_message(self, data: dict) -> bool:
        """
        Trata mensagens JSON recebidas diretamente do Arduino pela serial.

        Retorna True quando a mensagem foi reconhecida e tratada.
        Retorna False quando a mensagem não pertence a nenhum fluxo especial.
        """

        message_type = data.get('type')

        if message_type == 'motor_roda_position_status':
            payload = {
                'wheel_position_degrees': data.get('current_angle'),
                'wheel_total_turns': data.get('wheel_total_turns'),
                'wheel_current_angle': data.get('current_angle'),
                'wheel_target_angle': data.get('target_angle'),
                'wheel_current_spoke': data.get('current_spoke'),
                'wheel_target_spoke': data.get('target_spoke'),
                'wheel_total_spokes': data.get('total_spokes'),
                'wheel_is_running': data.get('is_running'),
                'wheel_is_positioning': data.get('is_positioning'),
            }

            clean_payload = {
                key: value
                for key, value in payload.items()
                if value is not None
            }

            state_payload = {
                key: value
                for key, value in clean_payload.items()
                if key in {
                    'wheel_position_degrees',
                    'wheel_total_turns',
                    'wheel_is_running',
                    'wheel_current_angle',
                    'wheel_target_angle',
                    'wheel_current_spoke',
                    'wheel_target_spoke',
                    'wheel_total_spokes',
                    'wheel_is_positioning',
                }
            }

            if state_payload:
                self.machine_state_service.update_wheel_position_from_serial(
                    state_payload,
                )

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

        if message_type == 'spoke_tension_status':
            payload = {
                'spoke_tension_left_kg': data.get('left_kg'),
                'spoke_tension_right_kg': data.get('right_kg'),
                'is_spoke_tension_collecting': data.get('collecting'),
            }

            clean_payload = {
                key: value
                for key, value in payload.items()
                if value is not None
            }

            if clean_payload:
                self.machine_state_service.update_state(clean_payload)

            self.send(text_data=json.dumps({
                'type': 'serial_message',
                'direction': 'received',
                'message': data.get(
                    'message',
                    'Status da tensão dos raios atualizado',
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

                if line.startswith('POS:'):
                    value = float(line.replace('POS:', '').strip())

                    self.machine_state_service.broadcast_lateral_sensor_state(value)

                    continue

                if self.handle_wheel_position_line(line):
                    continue

                if self.handle_spoke_tension_line(line):
                    continue

                print(f'[Serial Listener] Recebido: {line}')

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
