from unittest.mock import Mock, patch

import pytest
import serial

from machine.services.serial_service import SerialService


def test_initial_state():
    service = SerialService(
        port='COM9',
        baudrate=9600,
        timeout=0.05,
    )

    assert service.port == 'COM9'
    assert service.baudrate == 9600
    assert service.timeout == 0.05
    assert service.connection is None


def test_set_port_none_disconnects_and_clears_port():
    service = SerialService(port='COM9')

    service.disconnect = Mock()

    service.set_port(None)

    service.disconnect.assert_called_once()
    assert service.port is None


def test_set_port_empty_keeps_current_port():
    service = SerialService(port='COM9')

    service.disconnect = Mock()

    service.set_port('')

    service.disconnect.assert_not_called()
    assert service.port == 'COM9'


def test_set_port_same_port_keeps_current_connection():
    service = SerialService(port='COM9')

    service.disconnect = Mock()

    service.set_port('COM9')

    service.disconnect.assert_not_called()
    assert service.port == 'COM9'


def test_set_port_new_port_disconnects_and_updates_port():
    service = SerialService(port='COM9')

    service.disconnect = Mock()

    service.set_port('COM10')

    service.disconnect.assert_called_once()
    assert service.port == 'COM10'


def test_is_connected_returns_false_without_connection():
    service = SerialService()

    assert service.is_connected() is False


def test_is_connected_returns_true_when_connection_is_open():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = True

    service.connection = fake_connection

    assert service.is_connected() is True


def test_is_connected_returns_false_when_connection_is_closed():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = False

    service.connection = fake_connection

    assert service.is_connected() is False


def test_connect_returns_true_when_already_connected():
    service = SerialService(port='COM9')

    fake_connection = Mock()
    fake_connection.is_open = True

    service.connection = fake_connection

    result = service.connect()

    assert result is True


def test_connect_returns_false_when_no_port_selected():
    service = SerialService(port=None)

    result = service.connect()

    assert result is False
    assert service.connection is None


@patch('machine.services.serial_service.time.sleep')
@patch('machine.services.serial_service.serial.Serial')
def test_connect_success(mock_serial_class, mock_sleep):
    service = SerialService(
        port='COM9',
        baudrate=9600,
        timeout=0.05,
    )

    fake_connection = Mock()
    fake_connection.is_open = True

    mock_serial_class.return_value = fake_connection

    result = service.connect()

    assert result is True
    assert service.connection == fake_connection

    mock_serial_class.assert_called_once_with(
        port='COM9',
        baudrate=9600,
        timeout=0.05,
        write_timeout=0.05,
    )

    mock_sleep.assert_called_once_with(2)
    fake_connection.reset_input_buffer.assert_called_once()
    fake_connection.reset_output_buffer.assert_called_once()


@patch('machine.services.serial_service.serial.Serial')
def test_connect_serial_exception_invalidates_connection(mock_serial_class):
    service = SerialService(port='COM9')

    mock_serial_class.side_effect = serial.SerialException('porta indisponível')

    result = service.connect()

    assert result is False
    assert service.connection is None


@patch('machine.services.serial_service.serial.Serial')
def test_connect_unexpected_exception_invalidates_connection(mock_serial_class):
    service = SerialService(port='COM9')

    mock_serial_class.side_effect = RuntimeError('erro inesperado')

    result = service.connect()

    assert result is False
    assert service.connection is None


def test_disconnect_closes_open_connection_and_clears_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = True

    service.connection = fake_connection

    service.disconnect()

    fake_connection.close.assert_called_once()
    assert service.connection is None


def test_disconnect_with_closed_connection_only_clears_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = False

    service.connection = fake_connection

    service.disconnect()

    fake_connection.close.assert_not_called()
    assert service.connection is None


def test_disconnect_handles_exception_and_clears_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = True
    fake_connection.close.side_effect = RuntimeError('erro ao fechar')

    service.connection = fake_connection

    service.disconnect()

    assert service.connection is None


def test_invalidate_connection_closes_open_connection_and_clears_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = True

    service.connection = fake_connection

    service._invalidate_connection()

    fake_connection.close.assert_called_once()
    assert service.connection is None


def test_invalidate_connection_handles_exception_and_clears_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.is_open = True
    fake_connection.close.side_effect = RuntimeError('erro ao fechar')

    service.connection = fake_connection

    service._invalidate_connection()

    assert service.connection is None


def test_ensure_connection_returns_true_when_already_connected():
    service = SerialService()

    service.is_connected = Mock(return_value=True)
    service.connect = Mock()

    result = service.ensure_connection()

    assert result is True
    service.connect.assert_not_called()


def test_ensure_connection_tries_to_connect_when_not_connected():
    service = SerialService()

    service.is_connected = Mock(return_value=False)
    service.connect = Mock(return_value=True)

    result = service.ensure_connection()

    assert result is True
    service.connect.assert_called_once()


def test_send_command_returns_error_when_connection_fails():
    service = SerialService(port='COM9')

    service.ensure_connection = Mock(return_value=False)

    response = service.send_command('LATERAL_SENSOR_START_READING')

    assert response == {
        'success': False,
        'message': 'Não foi possível conectar ao Arduino',
        'command': 'LATERAL_SENSOR_START_READING',
        'response': None,
        'arduino_connected': False,
    }


def test_send_command_writes_command_without_reading_response():
    service = SerialService(port='COM9')

    fake_connection = Mock()
    fake_connection.is_open = True

    service.connection = fake_connection
    service.ensure_connection = Mock(return_value=True)

    response = service.send_command('LATERAL_SENSOR_START_READING')

    fake_connection.write.assert_called_once_with(
        b'LATERAL_SENSOR_START_READING\n'
    )
    fake_connection.flush.assert_called_once()

    # Importante:
    # este teste garante que send_command NÃO lê resposta da serial.
    fake_connection.readline.assert_not_called()

    assert response == {
        'success': True,
        'message': 'Comando enviado com sucesso',
        'command': 'LATERAL_SENSOR_START_READING',
        'response': None,
        'arduino_connected': True,
    }


def test_send_command_handles_serial_exception_and_invalidates_connection():
    service = SerialService(port='COM9')

    fake_connection = Mock()
    fake_connection.is_open = True
    fake_connection.write.side_effect = serial.SerialException('erro serial')

    service.connection = fake_connection
    service.ensure_connection = Mock(return_value=True)

    response = service.send_command('LED_ON')

    assert response['success'] is False
    assert response['command'] == 'LED_ON'
    assert response['response'] is None
    assert response['arduino_connected'] is False
    assert 'Erro ao enviar comando' in response['message']
    assert service.connection is None


def test_send_command_handles_os_error_and_invalidates_connection():
    service = SerialService(port='COM9')

    fake_connection = Mock()
    fake_connection.is_open = True
    fake_connection.write.side_effect = OSError('erro no sistema')

    service.connection = fake_connection
    service.ensure_connection = Mock(return_value=True)

    response = service.send_command('LED_ON')

    assert response['success'] is False
    assert response['command'] == 'LED_ON'
    assert response['response'] is None
    assert response['arduino_connected'] is False
    assert 'Erro ao enviar comando' in response['message']
    assert service.connection is None


def test_read_line_returns_none_when_not_connected():
    service = SerialService()

    service.is_connected = Mock(return_value=False)

    response = service.read_line()

    assert response is None


def test_read_line_returns_none_when_no_raw_data():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.return_value = b''

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    assert response is None


def test_read_line_decodes_and_strips_data():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.return_value = b'POS:12.50\r\n'

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    fake_connection.readline.assert_called_once()
    assert response == 'POS:12.50'


def test_read_line_ignores_invalid_utf8_bytes():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.return_value = b'POS:12.50\xff\r\n'

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    assert response == 'POS:12.50'


def test_read_line_handles_serial_exception_and_invalidates_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.side_effect = serial.SerialException('erro leitura')

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    assert response is None
    assert service.connection is None


def test_read_line_handles_os_error_and_invalidates_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.side_effect = OSError('erro os')

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    assert response is None
    assert service.connection is None


def test_read_line_handles_unexpected_exception_and_invalidates_connection():
    service = SerialService()

    fake_connection = Mock()
    fake_connection.readline.side_effect = RuntimeError('erro inesperado')

    service.connection = fake_connection
    service.is_connected = Mock(return_value=True)

    response = service.read_line()

    assert response is None
    assert service.connection is None


def test_read_json_returns_none_when_no_line():
    service = SerialService()

    service.read_line = Mock(return_value=None)

    response = service.read_json()

    assert response is None


def test_read_json_returns_dict_when_line_is_valid_json():
    service = SerialService()

    service.read_line = Mock(
        return_value='{"type":"lateral_sensor_status","reading_enabled":true}'
    )

    response = service.read_json()

    assert response == {
        'type': 'lateral_sensor_status',
        'reading_enabled': True,
    }


def test_read_json_returns_none_when_line_is_invalid_json():
    service = SerialService()

    service.read_line = Mock(return_value='POS:12.50')

    response = service.read_json()

    assert response is None