from serial.tools import list_ports
import time
from machine.models import MachineConfig
from machine.services.machine_state_service import MachineStateService
from machine.services.serial_service import SerialService
from machine.services.simulated_serial_service import SimulatedSerialService


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
        # CONFIGURAÇÃO DA MÁQUINA
        # =========================

        if action == 'sync_machine_config':
            return self.sync_machine_config()

        # =========================
        # SENSOR LATERAL
        # =========================

        if action == 'lateral_sensor_start_reading':
            return self.serial_service.send_command('LATERAL_SENSOR_START_READING')

        if action == 'lateral_sensor_stop_reading':
            return self.serial_service.send_command('LATERAL_SENSOR_STOP_READING')

        # =========================
        # TENSÃO DOS RAIOS - HX711
        # =========================

        if action == 'spoke_tension_start_collection':
            return self.spoke_tension_start_collection()

        if action == 'spoke_tension_stop_collection':
            return self.spoke_tension_stop_collection()

        if action == 'spoke_tension_tare':
            return self.spoke_tension_tare(data)

        if action == 'spoke_tension_set_calibration':
            return self.spoke_tension_set_calibration(data)

        if action == 'spoke_tension_status':
            return self.serial_service.send_command('SPOKE_TENSION_STATUS')

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
    # CONFIGURAÇÃO DA MÁQUINA
    # =========================

    def get_active_machine_config(self) -> MachineConfig:
        """
        Busca a configuração ativa da máquina.

        Se nenhuma configuração ativa existir ainda, cria uma configuração padrão.
        Isso evita erro no sistema quando o banco ainda não tem configuração cadastrada.
        """

        active_config = (
            MachineConfig.objects
            .filter(is_active=True)
            .order_by('-updated_at')
            .first()
        )

        if active_config:
            return active_config

        return MachineConfig.objects.create(
            name='Configuração principal',
            is_active=True,
        )

    def sync_machine_config(self) -> dict:
        """
        Envia para o Arduino a configuração ativa salva no banco.

        Essa configuração vem do Django Admin.

        Exemplo de comandos enviados:
        CONFIG_WHEEL_TOTAL_SPOKES:36
        CONFIG_MOTOR_STEPS_PER_WHEEL_TURN:6400
        CONFIG_MOTOR_MAX_SPEED:1000
        CONFIG_MOTOR_ACCELERATION:500
        """

        config = self.get_active_machine_config()

        commands = [
            (
                'CONFIG_WHEEL_TOTAL_SPOKES',
                config.wheel_total_spokes,
            ),
            (
                'CONFIG_MOTOR_STEPS_PER_WHEEL_TURN',
                config.motor_steps_per_wheel_turn,
            ),
            (
                'CONFIG_MOTOR_MAX_SPEED',
                config.motor_max_speed,
            ),
            (
                'CONFIG_MOTOR_ACCELERATION',
                config.motor_acceleration,
            ),
            (
                'CONFIG_MOTOR_STATUS',
                None,
            ),
            (
                'SPOKE_TENSION_SET_CALIBRATION:LEFT',
                config.spoke_tension_left_calibration_factor,
            ),
            (
                'SPOKE_TENSION_SET_CALIBRATION:RIGHT',
                config.spoke_tension_right_calibration_factor,
            ),
        ]

        results = []

        for command_name, command_value in commands:
            if command_value is None:
                command = command_name
            else:
                if isinstance(command_value, float) and command_value.is_integer():
                    formatted_value = int(command_value)
                else:
                    formatted_value = command_value

                command = f'{command_name}:{formatted_value}'

            serial_result = self.serial_service.send_command(command)

            results.append({
                'command': command,
                'serial_result': serial_result,
            })

            time.sleep(0.15)

        self.machine_state_service.update_state({
            'motor_turns_per_wheel_turn': config.motor_turns_per_wheel_turn,
            'wheel_total_spokes': config.wheel_total_spokes,
        })

        return {
            'type': 'log',
            'direction': 'received',
            'message': self.format_config_sync_message(config, results),
        }

    def format_config_sync_message(
        self,
        config: MachineConfig,
        results: list[dict],
    ) -> str:
        """
        Formata o resultado do envio da configuração para aparecer nos logs.
        """

        lines = [
            f'Configuração enviada para o Arduino: {config.name}',
            f'Raios da roda: {config.wheel_total_spokes}',
            f'Passos por volta da roda: {config.motor_steps_per_wheel_turn}',
            f'Voltas do motor por volta da roda: {config.motor_turns_per_wheel_turn}',
            '',
            'Comandos enviados:',
        ]

        for item in results:
            command = item.get('command')
            serial_result = item.get('serial_result', {})

            success = serial_result.get('success', False)
            message = serial_result.get('message', '')

            status = 'OK' if success else 'ERRO'

            lines.append(f'- {command}: {status} - {message}')

        return '\n'.join(lines)

    # =========================
    # TENSÃO DOS RAIOS - HX711
    # =========================

    def spoke_tension_start_collection(self) -> dict:
        serial_result = self.serial_service.send_command(
            'SPOKE_TENSION_START_COLLECTION'
        )

        self.machine_state_service.update_state({
            'is_spoke_tension_collecting': True,
        })

        return serial_result

    def spoke_tension_stop_collection(self) -> dict:
        serial_result = self.serial_service.send_command(
            'SPOKE_TENSION_STOP_COLLECTION'
        )

        self.machine_state_service.update_state({
            'is_spoke_tension_collecting': False,
        })

        return serial_result

    def spoke_tension_tare(self, data: dict) -> dict:
        side = data.get('side', 'both')

        if side not in {'left', 'right', 'both'}:
            return {
                'type': 'error',
                'message': f'Lado inválido para tara: {side}',
            }

        command = f'SPOKE_TENSION_TARE:{side.upper()}'

        return self.serial_service.send_command(command)

    def spoke_tension_set_calibration(self, data: dict) -> dict:
        side = data.get('side')
        factor = data.get('factor')

        if side not in {'left', 'right'}:
            return {
                'type': 'error',
                'message': f'Lado inválido para calibração: {side}',
            }

        try:
            factor_value = float(factor)
        except (TypeError, ValueError):
            return {
                'type': 'error',
                'message': f'Fator de calibração inválido: {factor}',
            }

        config = self.get_active_machine_config()

        if side == 'left':
            config.spoke_tension_left_calibration_factor = factor_value
        else:
            config.spoke_tension_right_calibration_factor = factor_value

        config.save()

        command = (
            f'SPOKE_TENSION_SET_CALIBRATION:{side.upper()}:{factor_value:g}'
        )

        return self.serial_service.send_command(command)

    def sync_wheel_positioning_config(self) -> None:
        """
        Reenvia a calibracao usada nos comandos de posicionamento da roda.

        O Arduino volta para os valores padrao do firmware quando reinicia.
        Por isso, antes de mover por raio/angulo, garantimos que ele recebeu
        os valores atuais do Django Admin.
        """

        config = self.get_active_machine_config()

        commands = [
            (
                'CONFIG_WHEEL_TOTAL_SPOKES',
                config.wheel_total_spokes,
            ),
            (
                'CONFIG_MOTOR_STEPS_PER_WHEEL_TURN',
                config.motor_steps_per_wheel_turn,
            ),
            (
                'CONFIG_MOTOR_MAX_SPEED',
                config.motor_max_speed,
            ),
            (
                'CONFIG_MOTOR_ACCELERATION',
                config.motor_acceleration,
            ),
        ]

        for command_name, command_value in commands:
            self.serial_service.send_command(f'{command_name}:{command_value}')
            time.sleep(0.15)

        self.machine_state_service.update_state({
            'motor_turns_per_wheel_turn': config.motor_turns_per_wheel_turn,
            'wheel_total_spokes': config.wheel_total_spokes,
        })

    # =========================
    # PORTA SERIAL
    # =========================

    def use_serial_service_for_port(self, port: str) -> None:
        if port == SimulatedSerialService.PORT:
            if not isinstance(self.serial_service, SimulatedSerialService):
                self.serial_service.disconnect()
                self.serial_service = SimulatedSerialService(
                    baudrate=self.serial_service.baudrate,
                    timeout=self.serial_service.timeout,
                )
                self.machine_state_service.serial_service = self.serial_service
            return

        if isinstance(self.serial_service, SimulatedSerialService):
            self.serial_service.disconnect()
            self.serial_service = SerialService(
                port=port,
                baudrate=self.serial_service.baudrate,
                timeout=self.serial_service.timeout,
            )
            self.machine_state_service.serial_service = self.serial_service

    def list_serial_ports(self) -> dict:
        ports = [{
            'device': SimulatedSerialService.PORT,
            'description': SimulatedSerialService.DESCRIPTION,
            'hwid': SimulatedSerialService.HWID,
        }]

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

        self.use_serial_service_for_port(port)
        self.serial_service.set_port(port)
        connected = self.serial_service.connect()

        self.machine_state_service.update_state({})

        if connected:
            self.sync_machine_config()

        return {
            'type': 'serial_port_selected',
            'port': port,
            'message': (
                f'Porta {port} selecionada com sucesso e configuração enviada para o Arduino'
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

        self.sync_wheel_positioning_config()

        serial_result = self.serial_service.send_command('MOTOR_RODA_START')

        self.machine_state_service.update_state({
            'wheel_is_running': True,
            'wheel_direction': current_direction,
            'wheel_target_angle': None,
            'wheel_target_spoke': None,
            'wheel_is_positioning': False,
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
            'wheel_current_angle': 0,
            'wheel_target_angle': 0,
            'wheel_current_spoke': 1,
            'wheel_target_spoke': 1,
            'wheel_is_positioning': False,
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
            'wheel_current_angle': 0,
            'wheel_target_angle': 0,
            'wheel_current_spoke': 1,
            'wheel_target_spoke': 1,
            'wheel_is_positioning': False,
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
