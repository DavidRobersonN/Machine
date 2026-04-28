from serial.tools import list_ports

from machine.services.machine_state_service import MachineStateService
from machine.services.serial_service import SerialService


class MachineService:
    """
    Orquestrador principal da máquina.

    Ele:
    - recebe comandos do frontend
    - envia comandos para o Arduino via SerialService
    - atualiza o estado da máquina
    - devolve mensagens para o frontend
    """

    SPEED_STEP = 10
    MIN_SPEED = 0
    MAX_SPEED = 1000

    def __init__(self):
        self.serial_service = SerialService(
            port='COM9',
            baudrate=9600,
            timeout=1.0,
        )
        self.machine_state_service = MachineStateService(self.serial_service)

    def handle_command(self, data: dict) -> dict:
        action = data.get('action')

        # =========================
        # MOTOR DA RODA
        # =========================

        if action == 'motor_roda_start':
            return self.motor_roda_start()

        if action == 'motor_roda_stop':
            return self.motor_roda_stop()

        if action == 'motor_roda_set_clockwise':
            return self.motor_roda_set_clockwise()

        if action == 'motor_roda_set_counter_clockwise':
            return self.motor_roda_set_counter_clockwise()

        if action == 'motor_roda_increase_speed':
            return self.motor_roda_increase_speed()

        if action == 'motor_roda_decrease_speed':
            return self.motor_roda_decrease_speed()

        # =========================
        # PORTA SERIAL
        # =========================

        if action == 'list_serial_ports':
            return self.list_serial_ports()

        if action == 'select_serial_port':
            return self.select_serial_port(data)

        if action == 'disconnect_serial_port':
            return self.disconnect_serial_port()

        # =========================
        # TESTE DE CONEXÃO
        # =========================

        if action == 'ping':
            return {
                'type': 'pong',
                'message': 'Backend ativo',
            }

        # =========================
        # LED
        # =========================

        if action == 'led_on':
            return self.turn_led_on()

        if action == 'led_off':
            return self.turn_led_off()

        # =========================
        # ESTADO DA MÁQUINA
        # =========================

        if action == 'read_machine_state':
            return self.read_machine_state()

        return {
            'type': 'error',
            'message': f'Ação inválida: {action}',
        }

    # =========================
    # PORTA SERIAL
    # =========================

    def list_serial_ports(self) -> dict:
        ports = []

        for port in list_ports.comports():
            ports.append({
                'device': port.device,
                'description': port.description,
                'hwid': port.hwid,
            })

        return {
            'type': 'available_ports',
            'ports': ports,
            'selected_port': (
                self.serial_service.port
                if self.serial_service.is_connected()
                else None
            ),
        }
    
    def select_serial_port(self, data: dict) -> dict:
        port = data.get('port')

        if not port:
            return {
                'type': 'error',
                'message': 'Nenhuma porta serial foi informada',
            }

        self.serial_service.set_port(port)
        connected = self.serial_service.connect()

        self.machine_state_service.update_state({})

        return {
            'type': 'serial_port_selected',
            'port': port,
            'message': (
                f'Porta {port} selecionada com sucesso'
                if connected
                else f'Porta {port} selecionada, mas não foi possível conectar ao Arduino'
            ),
        }

    def disconnect_serial_port(self) -> dict:
        current_port = self.serial_service.port

        self.serial_service.disconnect()

        # Limpa a porta selecionada no serviço serial
        self.serial_service.set_port(None)

        self.machine_state_service.update_state({
            'led': 'OFF',
            'selected_port': None,
        })

        return {
            'type': 'serial_port_disconnected',
            'selected_port': None,
            'message': (
                f'Arduino desconectado da porta {current_port}'
                if current_port
                else 'Arduino desconectado'
            ),
        }

    # =========================
    # LED
    # =========================

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

    # =========================
    # ESTADO DA MÁQUINA
    # =========================

    def read_machine_state(self) -> dict:
        serial_result = self.serial_service.send_command('READ_STATE')

        self.machine_state_service.update_state({})

        return {
            'type': 'machine_read',
            'serial': serial_result,
        }

    # =========================
    # MOTOR DA RODA
    # =========================

    def motor_roda_start(self) -> dict:
        serial_result = self.serial_service.send_command('MOTOR_RODA_START')

        self.machine_state_service.update_state({})

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: iniciar motor da roda',
            ),
        }

    def motor_roda_stop(self) -> dict:
        serial_result = self.serial_service.send_command('MOTOR_RODA_STOP')

        self.machine_state_service.update_state({})

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: parar motor da roda',
            ),
        }

    def motor_roda_set_clockwise(self) -> dict:
        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_SET_CLOCKWISE'
        )

        self.machine_state_service.update_state({})

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: motor da roda sentido horário',
            ),
        }

    def motor_roda_set_counter_clockwise(self) -> dict:
        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_SET_COUNTER_CLOCKWISE'
        )

        self.machine_state_service.update_state({})

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: motor da roda sentido anti-horário',
            ),
        }

    def motor_roda_increase_speed(self) -> dict:
        current_state = self.machine_state_service.get_current_state()

        current_speed = current_state.get('speed_motor_roda', 0)
        new_speed = min(current_speed + self.SPEED_STEP, self.MAX_SPEED)

        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_INCREASE_SPEED'
        )

        self.machine_state_service.update_state({
            'speed_motor_roda': new_speed,
        })

        print(
            'Aumentar velocidade do motor da roda:',
            {
                'current_speed': current_speed,
                'new_speed': new_speed,
                'serial_result': serial_result,
            },
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                f'Velocidade do motor da roda aumentada para {new_speed}',
            ),
        }

    def motor_roda_decrease_speed(self) -> dict:
        current_state = self.machine_state_service.get_current_state()

        current_speed = current_state.get('speed_motor_roda', 0)
        new_speed = max(current_speed - self.SPEED_STEP, self.MIN_SPEED)

        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_DECREASE_SPEED'
        )

        self.machine_state_service.update_state({
            'speed_motor_roda': new_speed,
        })

        print(
            'Diminuir velocidade do motor da roda:',
            {
                'current_speed': current_speed,
                'new_speed': new_speed,
                'serial_result': serial_result,
            },
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                f'Velocidade do motor da roda diminuída para {new_speed}',
            ),
        }

    # =========================
    # AUXILIAR
    # =========================

    def get_serial_message(self, serial_result: dict, fallback: str) -> str:
        return serial_result.get('message') or fallback