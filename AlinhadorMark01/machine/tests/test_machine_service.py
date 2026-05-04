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

    assert response == {
        'type': 'serial_port_disconnected',
        'selected_port': None,
        'message': 'Arduino desconectado',
    }


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


def test_motor_roda_start():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_START')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_start()

    service.serial_service.send_command.assert_called_once_with('MOTOR_RODA_START')
    service.machine_state_service.update_state.assert_called_once_with({})

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Comando enviado com sucesso',
    }


def test_motor_roda_stop():
    service = MachineService()

    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_STOP')
    )
    service.machine_state_service.update_state = Mock()

    response = service.motor_roda_stop()

    service.serial_service.send_command.assert_called_once_with('MOTOR_RODA_STOP')

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

    assert response['type'] == 'log'
    assert response['direction'] == 'received'


def test_motor_roda_increase_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 50,
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
        'speed_motor_roda': 60,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_motor_roda_increase_speed_respects_max_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 1000,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_INCREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    service.motor_roda_increase_speed()

    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 1000,
    })


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
        'speed_motor_roda': 40,
    })

    assert response['type'] == 'log'
    assert response['direction'] == 'received'
    assert response['message'] == 'Comando enviado com sucesso'


def test_motor_roda_decrease_speed_respects_min_speed():
    service = MachineService()

    service.machine_state_service.get_current_state = Mock(return_value={
        'speed_motor_roda': 0,
    })
    service.serial_service.send_command = Mock(
        return_value=make_serial_success('MOTOR_RODA_DECREASE_SPEED')
    )
    service.machine_state_service.update_state = Mock()

    service.motor_roda_decrease_speed()

    service.machine_state_service.update_state.assert_called_once_with({
        'speed_motor_roda': 0,
    })


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