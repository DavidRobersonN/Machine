from machine.models import MachineState
from machine.services.broadcast_service import BroadcastService
from machine.services.serial_service import SerialService


class MachineStateService:
    """
    Responsável por salvar o estado atual da máquina no banco
    e depois avisar o frontend em tempo real.
    """

    def __init__(self, serial_service: SerialService):
        self.broadcast_service = BroadcastService()
        self.serial_service = serial_service

    def update_state(self, data: dict) -> MachineState:
        """
        Atualiza o estado principal da máquina no banco.
        """

        state, _ = MachineState.objects.get_or_create(id=1)

        if 'led' in data:
            state.led = data['led']

        state.arduino_connected = self.serial_service.is_connected()

        state.save()

        self.broadcast_service.broadcast_machine_state(
            payload=self.serialize_state(state)
        )

        return state

    def get_current_state(self) -> dict:
        """
        Retorna o estado atual da máquina em formato de dicionário.
        """
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
        serial = self.serial_service.send_command('MOTOR_RODA_SET_COUNTER_CLOCKWISE')

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Motor da roda definido para sentido anti-horário',
            'serial': serial,
        }