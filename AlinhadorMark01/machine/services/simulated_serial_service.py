import json
import math
import random
import time
from collections import deque


class SimulatedSerialService:  # pragma: no cover
    """
    Simula a mesma interface do SerialService real.

    A ideia e permitir testar o backend e a interface sem Arduino conectado.
    """

    PORT = 'SIMULATED_ARDUINO'
    DESCRIPTION = 'Arduino simulado'
    HWID = 'SIMULATED'

    def __init__(
        self,
        port: str | None = PORT,
        baudrate: int = 9600,
        timeout: float = 0.05,
    ):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.connection = None

        self._is_connected = False
        self._lines = deque()
        self._last_update = time.monotonic()
        self._last_lateral_emit = 0.0
        self._last_wheel_emit = 0.0
        self._last_spoke_emit = 0.0

        self.led = 'OFF'
        self.lateral_reading_enabled = False
        self.spoke_tension_collecting = False
        self.spoke_tension_left_kg = 0.0
        self.spoke_tension_right_kg = 0.0

        self.wheel_total_spokes = 36
        self.motor_steps_per_wheel_turn = 6400
        self.motor_max_speed = 1000.0
        self.motor_acceleration = 500.0
        self.wheel_current_angle = 0.0
        self.wheel_total_turns = 0.0
        self.wheel_current_spoke = 1
        self.wheel_target_angle = None
        self.wheel_target_spoke = None
        self.wheel_direction = 'clockwise'
        self.wheel_is_running = False
        self.wheel_is_positioning = False
        self.speed_percent = 0

    def set_port(self, port: str | None) -> None:
        if port is None:
            self.disconnect()
            self.port = None
            return

        if port == '':
            return

        if port != self.port:
            self.disconnect()

        self.port = port

    def connect(self) -> bool:
        if not self.port:
            self._is_connected = False
            return False

        self._is_connected = True
        self._last_update = time.monotonic()
        self._queue_json({
            'type': 'simulator_status',
            'message': 'Arduino simulado conectado',
        })
        return True

    def disconnect(self) -> None:
        self._is_connected = False
        self.connection = None
        self._lines.clear()

    def is_connected(self) -> bool:
        return self._is_connected

    def ensure_connection(self) -> bool:
        if self.is_connected():
            return True

        return self.connect()

    def send_command(self, command: str) -> dict:
        if not self.ensure_connection():
            return {
                'success': False,
                'message': 'Nao foi possivel conectar ao Arduino simulado',
                'command': command,
                'response': None,
                'arduino_connected': False,
            }

        command = str(command).strip()
        self._handle_command(command)

        return {
            'success': True,
            'message': 'Comando enviado ao Arduino simulado',
            'command': command,
            'response': None,
            'arduino_connected': True,
        }

    def read_line(self) -> str | None:
        if not self.is_connected():
            return None

        self._update_wheel()
        self._emit_realtime_lines()

        if self._lines:
            return self._lines.popleft()

        time.sleep(self.timeout)
        return None

    def read_json(self) -> dict | None:
        line = self.read_line()

        if not line:
            return None

        try:
            return json.loads(line)
        except json.JSONDecodeError:
            return None

    def _handle_command(self, command: str) -> None:
        if command == 'LED_ON':
            self.led = 'ON'
            self._queue_line('LED:ON')
            return

        if command == 'LED_OFF':
            self.led = 'OFF'
            self._queue_line('LED:OFF')
            return

        if command == 'READ_STATE':
            self._queue_json({
                'type': 'simulator_status',
                'message': 'Estado do Arduino simulado atualizado',
                'led': self.led,
            })
            return

        if command == 'LATERAL_SENSOR_START_READING':
            self.lateral_reading_enabled = True
            self._queue_lateral_status()
            return

        if command == 'LATERAL_SENSOR_STOP_READING':
            self.lateral_reading_enabled = False
            self._queue_lateral_status()
            return

        if command == 'SPOKE_TENSION_START_COLLECTION':
            self.spoke_tension_collecting = True
            self._queue_spoke_tension_status()
            return

        if command == 'SPOKE_TENSION_STOP_COLLECTION':
            self.spoke_tension_collecting = False
            self._queue_spoke_tension_status()
            return

        if command.startswith('SPOKE_TENSION_TARE'):
            self.spoke_tension_left_kg = 0.0
            self.spoke_tension_right_kg = 0.0
            self._queue_spoke_tension_status('Tara aplicada no simulador')
            return

        if command == 'SPOKE_TENSION_STATUS':
            self._queue_spoke_tension_status()
            return

        if command.startswith('CONFIG_WHEEL_TOTAL_SPOKES:'):
            self.wheel_total_spokes = max(1, self._int_value(command, 36))
            self._queue_motor_config_status('Total de raios atualizado')
            return

        if command.startswith('CONFIG_MOTOR_STEPS_PER_WHEEL_TURN:'):
            self.motor_steps_per_wheel_turn = max(1, self._int_value(command, 6400))
            self._queue_motor_config_status('Passos por volta atualizados')
            return

        if command.startswith('CONFIG_MOTOR_MAX_SPEED:'):
            self.motor_max_speed = self._float_value(command, 1000.0)
            self._queue_motor_config_status('Velocidade maxima atualizada')
            return

        if command.startswith('CONFIG_MOTOR_ACCELERATION:'):
            self.motor_acceleration = self._float_value(command, 500.0)
            self._queue_motor_config_status('Aceleracao atualizada')
            return

        if command.startswith('SPOKE_TENSION_SET_CALIBRATION:'):
            self._queue_spoke_tension_status('Calibracao simulada atualizada')
            return

        if command == 'CONFIG_MOTOR_STATUS':
            self._queue_motor_config_status('Configuracao simulada ativa')
            return

        if command == 'MOTOR_RODA_START':
            self.wheel_is_running = True
            self.wheel_is_positioning = False
            self.wheel_target_angle = None
            self.wheel_target_spoke = None
            self._queue_wheel_status('running')
            return

        if command == 'MOTOR_RODA_STOP':
            self.wheel_is_running = False
            self.wheel_is_positioning = False
            self._queue_wheel_status('stopped')
            return

        if command == 'MOTOR_RODA_SET_CLOCKWISE':
            self.wheel_direction = 'clockwise'
            self._queue_wheel_status('clockwise')
            return

        if command == 'MOTOR_RODA_SET_COUNTER_CLOCKWISE':
            self.wheel_direction = 'counter_clockwise'
            self._queue_wheel_status('counter_clockwise')
            return

        if command == 'MOTOR_RODA_INCREASE_SPEED':
            self.speed_percent = min(self.speed_percent + 5, 100)
            self._queue_wheel_status('speed_changed')
            return

        if command == 'MOTOR_RODA_DECREASE_SPEED':
            self.speed_percent = max(self.speed_percent - 5, 0)
            if self.speed_percent == 0:
                self.wheel_is_running = False
            self._queue_wheel_status('speed_changed')
            return

        if command == 'MOTOR_RODA_SET_ZERO':
            self.wheel_current_angle = 0.0
            self.wheel_total_turns = 0.0
            self.wheel_current_spoke = 1
            self.wheel_target_angle = 0
            self.wheel_target_spoke = 1
            self.wheel_is_positioning = False
            self._queue_wheel_status('zero_set')
            return

        if command.startswith('MOTOR_RODA_GO_TO_ANGLE:'):
            self.wheel_target_angle = self._float_value(command, self.wheel_current_angle) % 360
            self.wheel_target_spoke = self._angle_to_spoke(self.wheel_target_angle)
            self.wheel_is_running = True
            self.wheel_is_positioning = True
            self._queue_wheel_status('positioning')
            return

        if command.startswith('MOTOR_RODA_GO_TO_SPOKE:'):
            target_spoke = max(1, min(self._int_value(command, 1), self.wheel_total_spokes))
            self.wheel_target_spoke = target_spoke
            self.wheel_target_angle = self._spoke_to_angle(target_spoke)
            self.wheel_is_running = True
            self.wheel_is_positioning = True
            self._queue_wheel_status('positioning')
            return

        if command == 'MOTOR_RODA_NEXT_SPOKE':
            next_spoke = self.wheel_current_spoke + 1
            if next_spoke > self.wheel_total_spokes:
                next_spoke = 1
            self._handle_command(f'MOTOR_RODA_GO_TO_SPOKE:{next_spoke}')
            return

        if command == 'MOTOR_RODA_PREVIOUS_SPOKE':
            previous_spoke = self.wheel_current_spoke - 1
            if previous_spoke < 1:
                previous_spoke = self.wheel_total_spokes
            self._handle_command(f'MOTOR_RODA_GO_TO_SPOKE:{previous_spoke}')
            return

        if command == 'MOTOR_RODA_POSITION_STATUS':
            self._queue_wheel_status('status')
            return

        self._queue_line(f'SIM_OK:{command}')

    def _update_wheel(self) -> None:
        now = time.monotonic()
        elapsed = now - self._last_update
        self._last_update = now

        if elapsed <= 0:
            return

        if self.wheel_is_positioning and self.wheel_target_angle is not None:
            self._move_towards_target(elapsed)
            return

        if not self.wheel_is_running or self.speed_percent <= 0:
            return

        turns_per_second = (self.motor_max_speed / self.motor_steps_per_wheel_turn)
        turns_per_second *= self.speed_percent / 100
        delta_turns = turns_per_second * elapsed

        if self.wheel_direction == 'counter_clockwise':
            delta_turns *= -1

        self._apply_delta_turns(delta_turns)

    def _move_towards_target(self, elapsed: float) -> None:
        target = self.wheel_target_angle or 0.0
        current = self.wheel_current_angle
        diff = (target - current + 540) % 360 - 180
        max_delta = max(90.0, self.motor_max_speed / 8) * elapsed

        if abs(diff) <= max_delta:
            self.wheel_current_angle = target % 360
            self.wheel_current_spoke = self._angle_to_spoke(self.wheel_current_angle)
            self.wheel_is_running = False
            self.wheel_is_positioning = False
            self._queue_wheel_status('target_reached')
            return

        angle_delta = max_delta if diff > 0 else -max_delta
        self._apply_delta_turns(angle_delta / 360)

    def _apply_delta_turns(self, delta_turns: float) -> None:
        self.wheel_total_turns += delta_turns
        self.wheel_current_angle = (self.wheel_current_angle + delta_turns * 360) % 360
        self.wheel_current_spoke = self._angle_to_spoke(self.wheel_current_angle)

    def _emit_realtime_lines(self) -> None:
        now = time.monotonic()

        if self.lateral_reading_enabled and now - self._last_lateral_emit >= 0.05:
            self._last_lateral_emit = now
            phase = now * 1.8
            value = math.sin(phase) * 2.8 + random.uniform(-0.12, 0.12)
            self._queue_line(f'POS:{value:.2f}')

        if (
            (self.wheel_is_running or self.wheel_is_positioning)
            and now - self._last_wheel_emit >= 0.08
        ):
            self._last_wheel_emit = now
            self._queue_line(
                'WHEEL_POS:'
                f'{self.wheel_current_angle:.2f},'
                f'{self.wheel_total_turns:.4f},'
                f'{self.wheel_current_spoke},'
                f'{1 if self.wheel_is_running else 0},'
                f'{1 if self.wheel_is_positioning else 0}'
            )

        if self.spoke_tension_collecting and now - self._last_spoke_emit >= 0.1:
            self._last_spoke_emit = now
            phase = now * 1.2
            self.spoke_tension_left_kg = 72 + math.sin(phase) * 4 + random.uniform(-0.4, 0.4)
            self.spoke_tension_right_kg = 74 + math.cos(phase) * 4 + random.uniform(-0.4, 0.4)
            self._queue_line(
                f'SPOKE_TENSION:{self.spoke_tension_left_kg:.2f},'
                f'{self.spoke_tension_right_kg:.2f}'
            )

    def _queue_line(self, line: str) -> None:
        self._lines.append(line)

    def _queue_json(self, payload: dict) -> None:
        self._queue_line(json.dumps(payload))

    def _queue_lateral_status(self) -> None:
        self._queue_json({
            'type': 'lateral_sensor_status',
            'reading_enabled': self.lateral_reading_enabled,
            'message': (
                'Leitura lateral simulada iniciada'
                if self.lateral_reading_enabled
                else 'Leitura lateral simulada parada'
            ),
        })

    def _queue_spoke_tension_status(
        self,
        message: str = 'Status da tensao simulada atualizado',
    ) -> None:
        self._queue_json({
            'type': 'spoke_tension_status',
            'left_kg': round(self.spoke_tension_left_kg, 2),
            'right_kg': round(self.spoke_tension_right_kg, 2),
            'collecting': self.spoke_tension_collecting,
            'message': message,
        })

    def _queue_motor_config_status(self, message: str) -> None:
        degrees_per_spoke = 360 / max(self.wheel_total_spokes, 1)
        steps_per_degree = self.motor_steps_per_wheel_turn / 360

        self._queue_json({
            'type': 'motor_roda_config_status',
            'message': message,
            'total_spokes': self.wheel_total_spokes,
            'steps_per_wheel_revolution': self.motor_steps_per_wheel_turn,
            'degrees_per_spoke': round(degrees_per_spoke, 4),
            'steps_per_degree': round(steps_per_degree, 4),
            'max_speed': self.motor_max_speed,
            'acceleration': self.motor_acceleration,
        })

    def _queue_wheel_status(self, status: str) -> None:
        self._queue_json({
            'type': 'motor_roda_position_status',
            'status': status,
            'current_angle': round(self.wheel_current_angle, 2),
            'target_angle': self.wheel_target_angle,
            'current_spoke': self.wheel_current_spoke,
            'target_spoke': self.wheel_target_spoke,
            'total_spokes': self.wheel_total_spokes,
            'wheel_total_turns': round(self.wheel_total_turns, 4),
            'is_running': self.wheel_is_running,
            'is_positioning': self.wheel_is_positioning,
        })

    def _angle_to_spoke(self, angle: float) -> int:
        degrees_per_spoke = 360 / max(self.wheel_total_spokes, 1)
        return int(round((angle % 360) / degrees_per_spoke)) % self.wheel_total_spokes + 1

    def _spoke_to_angle(self, spoke: int) -> float:
        degrees_per_spoke = 360 / max(self.wheel_total_spokes, 1)
        return ((spoke - 1) * degrees_per_spoke) % 360

    def _int_value(self, command: str, fallback: int) -> int:
        try:
            return int(float(command.split(':')[-1]))
        except (TypeError, ValueError):
            return fallback

    def _float_value(self, command: str, fallback: float) -> float:
        try:
            return float(command.split(':')[-1])
        except (TypeError, ValueError):
            return fallback
