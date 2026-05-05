import time

from machine.models import MachineState
from machine.services.broadcast_service import BroadcastService
from machine.services.serial_service import SerialService


class MachineStateService:
    """
    Responsável por salvar o estado atual da máquina no banco
    e depois avisar o frontend em tempo real.
    """

    SPEED_STEP = 5
    MIN_SPEED = 0
    MAX_SPEED = 100

    # Define a velocidade máxima visual da simulação da roda.
    # 0.25 significa:
    # - em 100%, a roda dá 0.25 volta por segundo
    # - ou seja, 1 volta completa a cada 4 segundos
    MAX_WHEEL_TURNS_PER_SECOND = 0.5

    def __init__(self, serial_service: SerialService):
        self.broadcast_service = BroadcastService()
        self.serial_service = serial_service
        self.last_lateral_broadcast_time = 0.0
        self.lateral_broadcast_interval = 0.05

    def broadcast_lateral_sensor_state(self, value: float) -> None:
        """
        Envia o valor do sensor lateral para o frontend em tempo real,
        sem salvar no banco de dados.

        O envio é limitado a aproximadamente 20 atualizações por segundo.
        """

        now = time.monotonic()

        if now - self.last_lateral_broadcast_time < self.lateral_broadcast_interval:
            return

        self.last_lateral_broadcast_time = now

        self.broadcast_service.broadcast_machine_state(
            payload={
                'lateral_misalignment_current': value,
            }
        )

    def update_wheel_position_realtime(self, interval_seconds: float) -> None:
        """
        Atualiza a posição da roda em tempo real.

        Esta é uma simulação temporária no backend.

        Regra usada:
        - speed_motor_roda vai de 0 a 100.
        - 100 significa 0.25 volta por segundo.
        - 50 significa 0.125 volta por segundo.
        - 25 significa 0.0625 volta por segundo.

        Depois, quando o Arduino enviar a posição real da roda,
        essa simulação poderá ser removida.
        """

        state, _ = MachineState.objects.get_or_create(id=1)

        if not state.wheel_is_running:
            return

        if state.wheel_direction == 'stopped':
            return

        if state.speed_motor_roda <= 0:
            return

        speed_percent = max(0, min(state.speed_motor_roda, self.MAX_SPEED))

        turns_per_second = (
            speed_percent / self.MAX_SPEED
        ) * self.MAX_WHEEL_TURNS_PER_SECOND

        delta_turns = turns_per_second * interval_seconds

        if state.wheel_direction == 'counter_clockwise':
            delta_turns *= -1

        state.wheel_total_turns += delta_turns

        state.wheel_position_degrees = (
            state.wheel_position_degrees + (delta_turns * 360)
        ) % 360

        state.arduino_connected = self.serial_service.is_connected()

        state.save()

        print(
            '[Wheel Position]',
            {
                'speed': state.speed_motor_roda,
                'direction': state.wheel_direction,
                'is_running': state.wheel_is_running,
                'position': state.wheel_position_degrees,
                'turns': state.wheel_total_turns,
            },
        )

        self.broadcast_service.broadcast_machine_state(
            payload={
                'speed_motor_roda': state.speed_motor_roda,
                'wheel_position_degrees': state.wheel_position_degrees,
                'wheel_total_turns': state.wheel_total_turns,
                'wheel_direction': state.wheel_direction,
                'wheel_is_running': state.wheel_is_running,
                'motor_turns_per_wheel_turn': state.motor_turns_per_wheel_turn,
            }
        )

    def update_state(self, data: dict) -> MachineState:
        state, _ = MachineState.objects.get_or_create(id=1)

        if 'lateral_misalignment_current' in data:
            state.lateral_misalignment_current = data['lateral_misalignment_current']

        if 'led' in data:
            state.led = data['led']

        if 'speed_motor_roda' in data:
            state.speed_motor_roda = data['speed_motor_roda']

        # =========================
        # RODA
        # =========================

        if 'wheel_position_degrees' in data:
            state.wheel_position_degrees = data['wheel_position_degrees']

        if 'wheel_total_turns' in data:
            state.wheel_total_turns = data['wheel_total_turns']

        if 'wheel_direction' in data:
            state.wheel_direction = data['wheel_direction']

        if 'wheel_is_running' in data:
            state.wheel_is_running = data['wheel_is_running']

        if 'motor_turns_per_wheel_turn' in data:
            state.motor_turns_per_wheel_turn = data['motor_turns_per_wheel_turn']

        state.arduino_connected = self.serial_service.is_connected()

        state.save()

        self.broadcast_service.broadcast_machine_state(
            payload=self.serialize_state(state)
        )

        return state

    def get_current_state(self) -> dict:
        state, _ = MachineState.objects.get_or_create(id=1)

        state.arduino_connected = self.serial_service.is_connected()

        if not state.arduino_connected:
            state.led = 'OFF'
            state.wheel_is_running = False
            state.wheel_direction = 'stopped'

        state.save()

        return self.serialize_state(state)

    def serialize_state(self, state: MachineState) -> dict:
        return {
            'led': state.led,
            'arduino_connected': state.arduino_connected,
            'selected_port': self.serial_service.port,
            'speed_motor_roda': state.speed_motor_roda,

            'wheel_position_degrees': state.wheel_position_degrees,
            'wheel_total_turns': state.wheel_total_turns,
            'wheel_direction': state.wheel_direction,
            'wheel_is_running': state.wheel_is_running,
            'motor_turns_per_wheel_turn': state.motor_turns_per_wheel_turn,

            'lateral_misalignment_current': state.lateral_misalignment_current,
        }

    def motor_roda_start(self):
        serial = self.serial_service.send_command('MOTOR_RODA_START')

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Motor da roda iniciado',
            'serial': serial,
        }

    def motor_roda_stop(self):
        serial = self.serial_service.send_command('MOTOR_RODA_STOP')

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Motor da roda parado',
            'serial': serial,
        }

    def motor_roda_set_clockwise(self):
        serial = self.serial_service.send_command('MOTOR_RODA_SET_CLOCKWISE')

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Motor da roda definido para sentido horário',
            'serial': serial,
        }

    def motor_roda_set_counter_clockwise(self):
        serial = self.serial_service.send_command(
            'MOTOR_RODA_SET_COUNTER_CLOCKWISE'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Motor da roda definido para sentido anti-horário',
            'serial': serial,
        }

    def motor_roda_increase_speed(self):
        state, _ = MachineState.objects.get_or_create(id=1)

        new_speed = state.speed_motor_roda + self.SPEED_STEP
        state.speed_motor_roda = min(new_speed, self.MAX_SPEED)

        state.arduino_connected = self.serial_service.is_connected()
        state.save()

        serial = self.serial_service.send_command('MOTOR_RODA_INCREASE_SPEED')

        self.broadcast_service.broadcast_machine_state(
            payload=self.serialize_state(state)
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': f'Velocidade do motor da roda aumentada para {state.speed_motor_roda}',
            'serial': serial,
        }

    def motor_roda_decrease_speed(self):
        state, _ = MachineState.objects.get_or_create(id=1)

        new_speed = state.speed_motor_roda - self.SPEED_STEP
        state.speed_motor_roda = max(new_speed, self.MIN_SPEED)

        state.arduino_connected = self.serial_service.is_connected()
        state.save()

        serial = self.serial_service.send_command('MOTOR_RODA_DECREASE_SPEED')

        self.broadcast_service.broadcast_machine_state(
            payload=self.serialize_state(state)
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': f'Velocidade do motor da roda diminuída para {state.speed_motor_roda}',
            'serial': serial,
        }