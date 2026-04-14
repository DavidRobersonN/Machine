from machine.models import MachineState
from machine.services.broadcast_service import BroadcastService


class MachineStateService:
    """
    Responsável por salvar o estado atual da máquina no banco
    e depois avisar o frontend em tempo real.
    """

    def __init__(self):
        self.broadcast_service = BroadcastService()

    def update_state(self, data: dict) -> MachineState:
        """
        Atualiza o estado da máquina com base no dicionário recebido.
        Se o registro principal ainda não existir, ele será criado.
        """

        state, _ = MachineState.objects.get_or_create(id=1)

        if 'led' in data:
            state.led = data['led']

        state.save()

        self.broadcast_service.broadcast_machine_state(
            payload=self.serialize_state(state)
        )

        return state

    def get_current_state(self) -> dict:
        """
        Retorna o estado atual em formato de dicionário.
        """
        state, _ = MachineState.objects.get_or_create(id=1)
        return self.serialize_state(state)

    def serialize_state(self, state: MachineState) -> dict:
        """
        Converte o model para o formato esperado pelo frontend.
        """
        return {
            'led': state.led,
        }