from machine.services.serial_service import SerialService
from machine.services.machine_state_service import MachineStateService


class MachineService:
    """
    Orquestrador principal da máquina.

    Ele:
    - recebe comandos
    - envia para o Arduino via SerialService
    - atualiza o estado no banco
    - dispara atualização para o frontend
    """

    def __init__(self):
        self.serial_service = SerialService(
            port='COM9',
            baudrate=9600,
            timeout=1.0,
        )
        self.machine_state_service = MachineStateService(self.serial_service)

    def handle_command(self, data: dict) -> dict:
        action = data.get('action')

        if action == 'ping':
            return {
                'type': 'pong',
                'message': 'Backend ativo',
            }

        if action == 'led_on':
            return self.turn_led_on()

        if action == 'led_off':
            return self.turn_led_off()

        if action == 'read_machine_state':
            return self.read_machine_state()

        return {
            'type': 'error',
            'message': f'Ação inválida: {action}',
        }

    def turn_led_on(self) -> dict:
        serial_result = self.serial_service.send_command('LED_ON')

        if serial_result['success']:
            self.machine_state_service.update_state({
                'led': 'ON',
            })
        else:
            self.machine_state_service.update_state({})

        return {
            'type': 'led_status',
            'state': 'ON' if serial_result['success'] else 'OFF',
            'serial': serial_result,
        }

    def turn_led_off(self) -> dict:
        serial_result = self.serial_service.send_command('LED_OFF')

        if serial_result['success']:
            self.machine_state_service.update_state({
                'led': 'OFF',
            })
        else:
            self.machine_state_service.update_state({})

        return {
            'type': 'led_status',
            'state': 'OFF',
            'serial': serial_result,
        }

    def read_machine_state(self) -> dict:
        """
        Pede ao Arduino que envie o estado atual da máquina.
        Aqui você pode evoluir depois para sensores, motor, etc.
        """
        serial_result = self.serial_service.send_command('READ_STATE')

        self.machine_state_service.update_state({})

        return {
            'type': 'machine_read',
            'serial': serial_result,
        }