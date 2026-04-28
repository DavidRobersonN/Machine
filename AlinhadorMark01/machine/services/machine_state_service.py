from machine.models import MachineState
from machine.services.broadcast_service import BroadcastService
from machine.services.serial_service import SerialService


class MachineStateService:
    """
    Responsável por salvar o estado atual da máquina no banco
    e depois avisar o frontend em tempo real.
    """

    SPEED_STEP = 10
    MIN_SPEED = 0
    MAX_SPEED = 1000

    def __init__(self, serial_service: SerialService):
        self.broadcast_service = BroadcastService()
        self.serial_service = serial_service

    def update_state(self, data: dict) -> MachineState:
        state, _ = MachineState.objects.get_or_create(id=1)

        if 'lateral_misalignment_current' in data:
            state.lateral_misalignment_current = data['lateral_misalignment_current']

        if 'led' in data:
            state.led = data['led']

        if 'speed_motor_roda' in data:
            state.speed_motor_roda = data['speed_motor_roda']

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

        state.save()

        return self.serialize_state(state)

    def serialize_state(self, state: MachineState) -> dict:
        return {
            'led': state.led,
            'arduino_connected': state.arduino_connected,
            'selected_port': self.serial_service.port,
            'speed_motor_roda': state.speed_motor_roda,
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