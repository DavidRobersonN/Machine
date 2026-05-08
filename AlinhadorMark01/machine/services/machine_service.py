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

    SPEED_STEP = 5
    MIN_SPEED = 0
    MAX_SPEED = 100

    def __init__(self):
        self.serial_service = SerialService(
            port='COM9',
            baudrate=9600,
            timeout=0.05,
        )
        self.machine_state_service = MachineStateService(self.serial_service)

    def handle_command(self, data: dict) -> dict:
        action = data.get('action')

        # =========================
        # SENSOR LATERAL
        # =========================

        if action == 'lateral_sensor_start_reading':
            return self.serial_service.send_command('LATERAL_SENSOR_START_READING')

        if action == 'lateral_sensor_stop_reading':
            return self.serial_service.send_command('LATERAL_SENSOR_STOP_READING')

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

        if action == 'wheel_reset_position':
            return self.wheel_reset_position()
        
        if action == 'motor_roda_set_zero':
            return self.motor_roda_set_zero()

        if action == 'motor_roda_go_to_angle':
            return self.motor_roda_go_to_angle(data)

        if action == 'motor_roda_go_to_spoke':
            return self.motor_roda_go_to_spoke(data)

        if action == 'motor_roda_next_spoke':
            return self.motor_roda_next_spoke()

        if action == 'motor_roda_previous_spoke':
            return self.motor_roda_previous_spoke()

        if action == 'motor_roda_position_status':
            return self.motor_roda_position_status()

        # =========================
        # PORTA SERIAL
        # =========================

        if action == 'list_serial_ports':
            return self.list_serial_ports()

        if action == 'select_serial_port':
            return self.select_serial_port(data)

        if action == 'disconnect_serial_port':
            return self.disconnect_serial_port()

        if action == 'serial_send_command':
            return self.serial_send_command(data)

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
            'wheel_is_running': False,
            'wheel_direction': 'stopped',
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

    def serial_send_command(self, data: dict) -> dict:
        """
        Envia um comando manual para o Arduino pela porta serial.

        Esse método é usado pelo Monitor Serial do React.

        Exemplo recebido do frontend:
        {
            "action": "serial_send_command",
            "command": "LED_ON"
        }
        """

        command = data.get('command')

        if not command:
            return {
                'type': 'error',
                'message': 'Nenhum comando serial foi informado',
            }

        command = str(command).strip()

        if not command:
            return {
                'type': 'error',
                'message': 'O comando serial não pode estar vazio',
            }

        serial_result = self.serial_service.send_command(command)

        return {
            'type': 'serial_message',
            'direction': 'received',
            'message': self.format_serial_monitor_message(command, serial_result),
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
        current_state = self.machine_state_service.get_current_state()

        current_direction = current_state.get('wheel_direction', 'stopped')

        if current_direction == 'stopped':
            current_direction = 'clockwise'

        serial_result = self.serial_service.send_command('MOTOR_RODA_START')

        self.machine_state_service.update_state({
            'wheel_is_running': True,
            'wheel_direction': current_direction,
        })

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

        self.machine_state_service.update_state({
            'wheel_is_running': False,
            'wheel_direction': 'stopped',
        })

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

        self.machine_state_service.update_state({
            'wheel_direction': 'clockwise',
        })

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

        self.machine_state_service.update_state({
            'wheel_direction': 'counter_clockwise',
        })

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
        current_direction = current_state.get('wheel_direction', 'stopped')
        current_is_running = current_state.get('wheel_is_running', False)

        if current_speed >= self.MAX_SPEED:
            self.machine_state_service.update_state({
                'speed_motor_roda': self.MAX_SPEED,
            })

            print(
                'Aumentar velocidade do motor da roda:',
                {
                    'current_speed': current_speed,
                    'new_speed': self.MAX_SPEED,
                    'blocked': True,
                    'reason': 'Velocidade máxima atingida',
                },
            )

            return {
                'type': 'log',
                'direction': 'received',
                'message': f'Velocidade do motor da roda já está no máximo: {self.MAX_SPEED}',
            }

        new_speed = min(current_speed + self.SPEED_STEP, self.MAX_SPEED)

        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_INCREASE_SPEED'
        )

        state_update = {
            'speed_motor_roda': new_speed,
        }

        if new_speed > 0 and not current_is_running and current_direction != 'stopped':
            self.serial_service.send_command('MOTOR_RODA_START')
            state_update['wheel_is_running'] = True

        self.machine_state_service.update_state(state_update)

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

        if current_speed <= self.MIN_SPEED:
            self.machine_state_service.update_state({
                'speed_motor_roda': self.MIN_SPEED,
                'wheel_is_running': False,
            })

            print(
                'Diminuir velocidade do motor da roda:',
                {
                    'current_speed': current_speed,
                    'new_speed': self.MIN_SPEED,
                    'blocked': True,
                    'reason': 'Velocidade mínima atingida',
                },
            )

            return {
                'type': 'log',
                'direction': 'received',
                'message': f'Velocidade do motor da roda já está no mínimo: {self.MIN_SPEED}',
            }

        new_speed = max(current_speed - self.SPEED_STEP, self.MIN_SPEED)

        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_DECREASE_SPEED'
        )

        state_update = {
            'speed_motor_roda': new_speed,
        }

        if new_speed == 0:
            self.serial_service.send_command('MOTOR_RODA_STOP')
            state_update['wheel_is_running'] = False

        self.machine_state_service.update_state(state_update)

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

    def wheel_reset_position(self) -> dict:
        self.machine_state_service.update_state({
            'wheel_position_degrees': 0,
            'wheel_total_turns': 0,
        })

        return {
            'type': 'log',
            'direction': 'received',
            'message': 'Posição da roda zerada',
        }
    
    # =========================
    # MOTOR DA RODA - POSIÇÃO
    # =========================

    def motor_roda_set_zero(self) -> dict:
        serial_result = self.serial_service.send_command('MOTOR_RODA_SET_ZERO')

        self.machine_state_service.update_state({
            'wheel_position_degrees': 0,
            'wheel_total_turns': 0,
        })

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: definir posição atual como zero',
            ),
        }

    def motor_roda_go_to_angle(self, data: dict) -> dict:
        angle = data.get('angle')

        if angle is None:
            return {
                'type': 'error',
                'message': 'Nenhum ângulo foi informado',
            }

        try:
            angle = float(angle)
        except (TypeError, ValueError):
            return {
                'type': 'error',
                'message': 'Ângulo inválido',
            }

        serial_result = self.serial_service.send_command(
            f'MOTOR_RODA_GO_TO_ANGLE:{angle:g}'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                f'Comando enviado: mover roda para {angle:g} graus',
            ),
        }

    def motor_roda_go_to_spoke(self, data: dict) -> dict:
        spoke = data.get('spoke')

        if spoke is None:
            return {
                'type': 'error',
                'message': 'Nenhum raio foi informado',
            }

        try:
            spoke = int(spoke)
        except (TypeError, ValueError):
            return {
                'type': 'error',
                'message': 'Raio inválido',
            }

        if spoke < 1:
            return {
                'type': 'error',
                'message': 'O raio deve ser maior ou igual a 1',
            }

        serial_result = self.serial_service.send_command(
            f'MOTOR_RODA_GO_TO_SPOKE:{spoke}'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                f'Comando enviado: mover roda para o raio {spoke}',
            ),
        }

    def motor_roda_next_spoke(self) -> dict:
        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_NEXT_SPOKE'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: mover para o próximo raio',
            ),
        }

    def motor_roda_previous_spoke(self) -> dict:
        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_PREVIOUS_SPOKE'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: mover para o raio anterior',
            ),
        }

    def motor_roda_position_status(self) -> dict:
        serial_result = self.serial_service.send_command(
            'MOTOR_RODA_POSITION_STATUS'
        )

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.get_serial_message(
                serial_result,
                'Comando enviado: solicitar status da posição da roda',
            ),
        }

    # =========================
    # AUXILIAR
    # =========================

    def get_serial_message(self, serial_result: dict, fallback: str) -> str:
        return serial_result.get('message') or fallback

    def format_serial_monitor_message(self, command: str, serial_result: dict) -> str:
        success = serial_result.get('success', False)
        message = serial_result.get('message', '')
        response = serial_result.get('response')

        status = 'sucesso' if success else 'erro'

        if response:
            return (
                f'Comando serial: {command}\n'
                f'Status: {status}\n'
                f'Mensagem: {message}\n'
                f'Resposta Arduino: {response}'
            )

        return (
            f'Comando serial: {command}\n'
            f'Status: {status}\n'
            f'Mensagem: {message}'
        )