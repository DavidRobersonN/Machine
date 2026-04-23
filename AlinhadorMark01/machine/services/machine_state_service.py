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
        """
        Converte o model para o formato esperado pelo frontend.
        """

        return {
            'led': state.led,
            'arduino_connected': state.arduino_connected,
        }