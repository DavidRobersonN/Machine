from unittest.mock import Mock, patch

from machine.services.machine_service import MachineService


def make_serial_success(command: str) -> dict:
    return {
        'success': True,
        'message': 'Comando enviado com sucesso',
        'command': command,
        'response': None,
        'arduino_connected': True,
    }


# =========================
# SENSOR LATERAL
# =========================

def test_handle_command_lateral_sensor_start_reading():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('LATERAL_SENSOR_START_READING')
    )

    response = service.handle_command({
        'action': 'lateral_sensor_start_reading',
    })

    service.serial_service.send_command.assert_called_once_with(
        'LATERAL_SENSOR_START_READING'
    )

    assert response['success'] is True
    assert response['command'] == 'LATERAL_SENSOR_START_READING'


def test_handle_command_lateral_sensor_stop_reading():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('LATERAL_SENSOR_STOP_READING')
    )

    response = service.handle_command({
        'action': 'lateral_sensor_stop_reading',
    })

    service.serial_service.send_command.assert_called_once_with(
        'LATERAL_SENSOR_STOP_READING'
    )

    assert response['success'] is True
    assert response['command'] == 'LATERAL_SENSOR_STOP_READING'


# =========================
# COMANDOS GERAIS
# =========================

def test_handle_command_ping():
    service = MachineService()

    response = service.handle_command({
        'action': 'ping',
    })

    assert response == {
        'type': 'pong',
        'message': 'Backend ativo',
    }


def test_handle_command_invalid_action():
    service = MachineService()

    response = service.handle_command({
        'action': 'acao_inexistente',
    })

    assert response == {
        'type': 'error',
        'message': 'Ação inválida: acao_inexistente',
    }


def test_handle_command_without_action():
    service = MachineService()

    response = service.handle_command({})

    assert response == {
        'type': 'error',
        'message': 'Ação inválida: None',
    }


# =========================
# PORTA SERIAL
# =========================

def test_list_serial_ports_without_connected_port():
    service = MachineService()

    service.serial_service.is_connected = Mock(return_value=False)

    fake_port = Mock()
    fake_port.device = 'COM9'
    fake_port.description = 'Arduino Uno'
    fake_port.hwid = 'USB123'

    with patch('machine.services.machine_service.list_ports.comports') as mock_comports:
        mock_comports.return_value = [fake_port]

        response = service.list_serial_ports()

    assert response['type'] == 'available_ports'
    assert response['selected_port'] is None
    assert response['ports'] == [
        {
            'device': 'COM9',
            'description': 'Arduino Uno',
            'hwid': 'USB123',
        }
    ]


def test_list_serial_ports_with_connected_port():
    service = MachineService()

    service.serial_service.port = 'COM9'
    service.serial_service.is_connected = Mock(return_value=True)

    with patch('machine.services.machine_service.list_ports.comports') as mock_comports:
        mock_comports.return_value = []

        response = service.list_serial_ports()

    assert response['type'] == 'available_ports'
    assert response['ports'] == []
    assert response['selected_port'] == 'COM9'


def test_select_serial_port_without_port():
    service = MachineService()

    response = service.select_serial_port({})

    assert response == {
        'type': 'error',
        'message': 'Nenhuma porta serial foi informada',
    }


def test_select_serial_port_success():
    service = MachineService()

    service.serial_service.set_port = Mock()
    service.serial_service.connect = Mock(return_value=True)
    service.machine_state_service.update_state = Mock()

    response = service.select_serial_port({
        'port': 'COM9',
    })

    service.serial_service.set_port.assert_called_once_with('COM9')
    service.serial_service.connect.assert_called_once()
    service.machine_state_service.update_state.assert_called_once_with({})

    assert response == {
        'type': 'serial_port_selected',
        'port': 'COM9',
        'message': 'Porta COM9 selecionada com sucesso',
    }


def test_select_serial_port_connection_failed():
    service = MachineService()

    service.serial_service.set_port = Mock()
    service.serial_service.connect = Mock(return_value=False)
    service.machine_state_service.update_state = Mock()

    response = service.select_serial_port({
        'port': 'COM9',
    })

    assert response == {
        'type': 'serial_port_selected',
        'port': 'COM9',
        'message': 'Porta COM9 selecionada, mas não foi possível conectar ao Arduino',
    }


def test_disconnect_serial_port_with_current_port():
    service = MachineService()

    service.serial_service.port = 'COM9'
    service.serial_service.disconnect = Mock()
    service.serial_service.set_port = Mock()
    service.machine_state_service.update_state = Mock()

    response = service.disconnect_serial_port()

    service.serial_service.disconnect.assert_called_once()
    service.serial_service.set_port.assert_called_once_with(None)
    service.machine_state_service.update_state.assert_called_once_with({
        'led': 'OFF',
        'selected_port': None,
        'wheel_is_running': False,
        'wheel_direction': 'stopped',
    })

    assert response == {
        'type': 'serial_port_disconnected',
        'selected_port': None,
        'message': 'Arduino desconectado da porta COM9',
    }


def test_disconnect_serial_port_without_current_port():
    service = MachineService()

    service.serial_service.port = None
    service.serial_service.disconnect = Mock()
    service.serial_service.set_port = Mock()
    service.machine_state_service.update_state = Mock()

    response = service.disconnect_serial_port()

    service.serial_service.disconnect.assert_called_once()
    service.serial_service.set_port.assert_called_once_with(None)
    service.machine_state_service.update_state.assert_called_once_with({
        'led': 'OFF',
        'selected_port': None,
        'wheel_is_running': False,
        'wheel_direction': 'stopped',
    })

    assert response == {
        'type': 'serial_port_disconnected',
        'selected_port': None,
        'message': 'Arduino desconectado',
    }


def test_serial_send_command_without_command():
    service = MachineService()

    response = service.serial_send_command({})

    assert response == {
        'type': 'error',
        'message': 'Nenhum comando serial foi informado',
    }


def test_serial_send_command_with_empty_command():
    service = MachineService()

    response = service.serial_send_command({
        'command': '   ',
    })

    assert response == {
        'type': 'error',
        'message': 'O comando serial não pode estar vazio',
    }


def test_serial_send_command_success():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('LED_ON')
    )

    response = service.serial_send_command({
        'command': 'LED_ON',
    })

    service.serial_service.send_command.assert_called_once_with('LED_ON')

    assert response['type'] == 'serial_message'
    assert response['direction'] == 'received'
    assert 'Comando serial: LED_ON' in response['message']
    assert 'Status: sucesso' in response['message']
    assert 'Mensagem: Comando enviado com sucesso' in response['message']


# =========================
# LED
# =========================

def test_turn_led_on_success():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('LED_ON')
    )
    service.machine_state_service.update_state = Mock()

    response = service.turn_led_on()

    service.serial_service.send_command.assert_called_once_with('LED_ON')
    service.machine_state_service.update_state.assert_called_once_with({
        'led': 'ON',
    })

    assert response['type'] == 'led_status'
    assert response['state'] == 'ON'
    assert response['serial']['success'] is True


def test_turn_led_on_failure():
    service = MachineService()

    service.serial_service.send_command = Mock(return_value={
        'success': False,
        'message': 'Erro ao enviar comando',
        'command': 'LED_ON',
        'response': None,
        'arduino_connected': False,
    })
    service.machine_state_service.update_state = Mock()

    response = service.turn_led_on()

    service.machine_state_service.update_state.assert_called_once_with({})

    assert response['type'] == 'led_status'
    assert response['state'] == 'OFF'
    assert response['serial']['success'] is False


def test_turn_led_off_success():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('LED_OFF')
    )
    service.machine_state_service.update_state = Mock()

    response = service.turn_led_off()

    service.serial_service.send_command.assert_called_once_with('LED_OFF')
    service.machine_state_service.update_state.assert_called_once_with({
        'led': 'OFF',
    })

    assert response['type'] == 'led_status'
    assert response['state'] == 'OFF'
    assert response['serial']['success'] is True


# =========================
# ESTADO DA MÁQUINA
# =========================

def test_read_machine_state():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('READ_STATE')
    )
    service.machine_state_service.update_state = Mock()

    response = service.read_machine_state()

    service.serial_service.send_command.assert_called_once_with('READ_STATE')
    service.machine_state_service.update_state.assert_called_once_with({})

    assert response['type'] == 'machine_read'
    assert response['serial']['command'] == 'READ_STATE'


# =========================
# MOTOR DA RODA - GIRO CONTÍNUO
# =========================

def test_motor_roda_start_when_direction_is_stopped():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'wheel_direction': 'stopped',
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_START')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_start()

    service.machine_state_service.get_current_state.assert_called_once()
    service.serial_service.send_command.assert_called_once_with('MOTOR_RODA_START')
    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_is_running': True,
        'wheel_direction': 'clockwise',
    })

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Comando enviado com sucesso',
    }


def test_motor_roda_start_keeps_current_direction_when_not_stopped():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'wheel_direction': 'counter_clockwise',
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_START')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_start()

    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_is_running': True,
        'wheel_direction': 'counter_clockwise',
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_stop():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_STOP')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_stop()

    service.serial_service.send_command.assert_called_once_with('MOTOR_RODA_STOP')
    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_is_running': False,
        'wheel_direction': 'stopped',
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_motor_roda_set_clockwise():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_SET_CLOCKWISE')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_set_clockwise()

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_SET_CLOCKWISE'
    )
    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_direction': 'clockwise',
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_set_counter_clockwise():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_SET_COUNTER_CLOCKWISE')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_set_counter_clockwise()

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_SET_COUNTER_CLOCKWISE'
    )
    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_direction': 'counter_clockwise',
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_increase_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 50,
        'wheel_direction': 'stopped',
        'wheel_is_running': False,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_INCREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_increase_speed()

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_INCREASE_SPEED'
    )
    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 55,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_motor_roda_increase_speed_starts_motor_when_direction_exists_and_not_running():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 0,
        'wheel_direction': 'clockwise',
        'wheel_is_running': False,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_INCREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_increase_speed()

    assert service.serial_service.send_command.call_args_list[0].args == (
        'MOTOR_RODA_INCREASE_SPEED',
    )
    assert service.serial_service.send_command.call_args_list[1].args == (
        'MOTOR_RODA_START',
    )

    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 5,
        'wheel_is_running': True,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_increase_speed_respects_max_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 100,
        'wheel_direction': 'clockwise',
        'wheel_is_running': True,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_INCREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_increase_speed()

    service.serial_service.send_command.assert_not_called()
    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 100,
    })

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Velocidade do motor da roda já está no máximo: 100',
    }


def test_motor_roda_decrease_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 50,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_DECREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_decrease_speed()

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_DECREASE_SPEED'
    )
    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 45,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_motor_roda_decrease_speed_stops_motor_when_speed_reaches_zero():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 5,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_DECREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_decrease_speed()

    assert service.serial_service.send_command.call_args_list[0].args == (
        'MOTOR_RODA_DECREASE_SPEED',
    )
    assert service.serial_service.send_command.call_args_list[1].args == (
        'MOTOR_RODA_STOP',
    )

    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 0,
        'wheel_is_running': False,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_decrease_speed_respects_min_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 0,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_DECREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_decrease_speed()

    service.serial_service.send_command.assert_not_called()
    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 0,
        'wheel_is_running': False,
    })

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Velocidade do motor da roda já está no mínimo: 0',
    }


# =========================
# MOTOR DA RODA - POSIÇÃO
# =========================

def test_wheel_reset_position():
    service = MachineService()

    service.machine_state_service.update_state = Mock()

    response = service.wheel_reset_position()

    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_position_degrees': 0,
        'wheel_total_turns': 0,
    })

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Posição da roda zerada',
    }


def test_handle_command_motor_roda_set_zero():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_SET_ZERO')
    )
    service.machine_state_service.update_state = Mock()

    response = service.handle_command({
        'action': 'motor_roda_set_zero',
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_SET_ZERO'
    )
    service.machine_state_service.update_state.assert_called_once_with({
        'wheel_position_degrees': 0,
        'wheel_total_turns': 0,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_handle_command_motor_roda_go_to_angle():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_GO_TO_ANGLE:90')
    )

    response = service.handle_command({
        'action': 'motor_roda_go_to_angle',
        'angle': 90,
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_GO_TO_ANGLE:90'
    )

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_handle_command_motor_roda_go_to_angle_accepts_string_number():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_GO_TO_ANGLE:180.5')
    )

    response = service.handle_command({
        'action': 'motor_roda_go_to_angle',
        'angle': '180.5',
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_GO_TO_ANGLE:180.5'
    )

    assert response['type'] == 'log'


def test_handle_command_motor_roda_go_to_angle_without_angle():
    service = MachineService()

    response = service.handle_command({
        'action': 'motor_roda_go_to_angle',
    })

    assert response == {
        'type': 'error',
        'message': 'Nenhum ângulo foi informado',
    }


def test_handle_command_motor_roda_go_to_angle_invalid_angle():
    service = MachineService()

    response = service.handle_command({
        'action': 'motor_roda_go_to_angle',
        'angle': 'abc',
    })

    assert response == {
        'type': 'error',
        'message': 'Ângulo inválido',
    }


def test_handle_command_motor_roda_go_to_spoke():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_GO_TO_SPOKE:12')
    )

    response = service.handle_command({
        'action': 'motor_roda_go_to_spoke',
        'spoke': 12,
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_GO_TO_SPOKE:12'
    )

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_handle_command_motor_roda_go_to_spoke_without_spoke():
    service = MachineService()

    response = service.handle_command({
        'action': 'motor_roda_go_to_spoke',
    })

    assert response == {
        'type': 'error',
        'message': 'Nenhum raio foi informado',
    }


def test_handle_command_motor_roda_go_to_spoke_invalid_spoke():
    service = MachineService()

    response = service.handle_command({
        'action': 'motor_roda_go_to_spoke',
        'spoke': 'abc',
    })

    assert response == {
        'type': 'error',
        'message': 'Raio inválido',
    }


def test_handle_command_motor_roda_go_to_spoke_less_than_one():
    service = MachineService()

    response = service.handle_command({
        'action': 'motor_roda_go_to_spoke',
        'spoke': 0,
    })

    assert response == {
        'type': 'error',
        'message': 'O raio deve ser maior ou igual a 1',
    }


def test_handle_command_motor_roda_next_spoke():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_NEXT_SPOKE')
    )

    response = service.handle_command({
        'action': 'motor_roda_next_spoke',
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_NEXT_SPOKE'
    )

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_handle_command_motor_roda_previous_spoke():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_PREVIOUS_SPOKE')
    )

    response = service.handle_command({
        'action': 'motor_roda_previous_spoke',
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_PREVIOUS_SPOKE'
    )

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_handle_command_motor_roda_position_status():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_POSITION_STATUS')
    )

    response = service.handle_command({
        'action': 'motor_roda_position_status',
    })

    service.serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_POSITION_STATUS'
    )

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


# =========================
# AUXILIARES
# =========================

def test_get_serial_message_uses_serial_message_when_available():
    service = MachineService()

    message = service.get_serial_message(
        {
            'message': 'Mensagem da serial',
        },
        'Mensagem fallback',
    )

    assert message == 'Mensagem da serial'


def test_get_serial_message_uses_fallback_when_message_is_empty():
    service = MachineService()

    message = service.get_serial_message(
        {
            'message': '',
        },
        'Mensagem fallback',
    )

    assert message == 'Mensagem fallback'


def test_format_serial_monitor_message_without_response():
    service = MachineService()

    message = service.format_serial_monitor_message(
        'LED_ON',
        {
            'success': True,
            'message': 'Comando enviado com sucesso',
            'response': None,
        },
    )

    assert message == (
        'Comando serial: LED_ON\n'
        'Status: sucesso\n'
        'Mensagem: Comando enviado com sucesso'
    )


def test_format_serial_monitor_message_with_response():
    service = MachineService()

    message = service.format_serial_monitor_message(
        'LED_ON',
        {
            'success': True,
            'message': 'Comando enviado com sucesso',
            'response': '{"type":"led_status"}',
        },
    )

    assert message == (
        'Comando serial: LED_ON\n'
        'Status: sucesso\n'
        'Mensagem: Comando enviado com sucesso\n'
        'Resposta Arduino: {"type":"led_status"}'
    )


def test_format_serial_monitor_message_with_error_status():
    service = MachineService()

    message = service.format_serial_monitor_message(
        'LED_ON',
        {
            'success': False,
            'message': 'Erro serial',
            'response': None,
        },
    )

    assert message == (
        'Comando serial: LED_ON\n'
        'Status: erro\n'
        'Mensagem: Erro serial'
    )