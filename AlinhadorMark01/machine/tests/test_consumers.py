import json
from unittest.mock import Mock, patch

from machine.consumers import MachineConsumer


def make_consumer():
    """
    Cria uma instância do MachineConsumer sem abrir conexão real de WebSocket.

    A ideia é testar os métodos diretamente:
    - connect
    - receive
    - disconnect
    - machine_update
    - start_serial_listener
    - handle_serial_json_message
    """

    consumer = object.__new__(MachineConsumer)

    consumer.channel_layer = Mock()
    consumer.channel_name = 'test-channel'
    consumer.send = Mock()
    consumer.accept = Mock()

    return consumer


def get_sent_json_messages(consumer):
    """
    Pega todas as mensagens enviadas por self.send(text_data=...)
    e converte de JSON string para dict.
    """

    messages = []

    for call in consumer.send.call_args_list:
        text_data = call.kwargs.get('text_data')
        messages.append(json.loads(text_data))

    return messages


def test_connect_accepts_websocket_adds_group_starts_listeners_and_sends_initial_state():
    consumer = make_consumer()

    fake_state = {
        'connected': False,
        'led': 'OFF',
        'arduino_connected': False,
        'selected_port': None,
        'speed_motor_roda': 0,
        'lateral_misalignment_current': 0,
        'is_lateral_reading_enabled': False,
    }

    fake_machine_state_service = Mock()
    fake_machine_state_service.get_current_state.return_value = fake_state

    fake_machine_service = Mock()
    fake_machine_service.machine_state_service = fake_machine_state_service

    with patch('machine.consumers.MachineService', return_value=fake_machine_service):
        with patch('machine.consumers.async_to_sync', side_effect=lambda func: func):
            with patch('machine.consumers.threading.Thread') as mock_thread:
                fake_thread_instance = Mock()
                mock_thread.return_value = fake_thread_instance

                consumer.connect()

    consumer.channel_layer.group_add.assert_called_once_with(
        'machine_updates',
        'test-channel',
    )

    consumer.accept.assert_called_once()

    assert consumer.serial_listener_running is True
    assert consumer.machine_service == fake_machine_service
    assert consumer.machine_state_service == fake_machine_state_service

    # O consumer atual inicia 2 threads:
    # 1. start_serial_listener
    # 2. start_wheel_position_listener
    assert mock_thread.call_count == 2
    assert fake_thread_instance.start.call_count == 2

    messages = get_sent_json_messages(consumer)

    assert messages[-1] == {
        'type': 'machine_update',
        'payload': fake_state,
    }


def test_receive_with_valid_json_sends_logs_and_backend_response():
    consumer = make_consumer()

    backend_response = {
        'type': 'pong',
        'message': 'Backend ativo',
    }

    fake_machine_service = Mock()
    fake_machine_service.handle_command.return_value = backend_response

    consumer.machine_service = fake_machine_service

    consumer.receive(json.dumps({
        'action': 'ping',
    }))

    fake_machine_service.handle_command.assert_called_once_with({
        'action': 'ping',
    })

    messages = get_sent_json_messages(consumer)

    assert messages[0]['type'] == 'log'
    assert messages[0]['direction'] == 'received'
    assert 'Mensagem recebida do frontend' in messages[0]['message']

    assert messages[1]['type'] == 'log'
    assert messages[1]['direction'] == 'sent'
    assert 'Resposta enviada pelo backend' in messages[1]['message']

    assert messages[2] == backend_response


def test_receive_with_invalid_json_sends_error_message():
    consumer = make_consumer()

    consumer.receive('{json_invalido')

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'error',
            'message': 'JSON inválido enviado pelo frontend',
        }
    ]


def test_receive_when_handle_command_raises_exception_sends_error_message():
    consumer = make_consumer()

    fake_machine_service = Mock()
    fake_machine_service.handle_command.side_effect = RuntimeError(
        'erro no backend'
    )

    consumer.machine_service = fake_machine_service

    consumer.receive(json.dumps({
        'action': 'ping',
    }))

    messages = get_sent_json_messages(consumer)

    assert messages[-1] == {
        'type': 'error',
        'message': 'erro no backend',
    }


def test_disconnect_stops_listeners_removes_group_and_disconnects_serial_service():
    consumer = make_consumer()

    fake_serial_service = Mock()

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    consumer.machine_service = fake_machine_service
    consumer.serial_listener_running = True
    consumer.wheel_position_listener_running = True

    with patch('machine.consumers.async_to_sync', side_effect=lambda func: func):
        consumer.disconnect(close_code=1000)

    assert consumer.serial_listener_running is False

    if hasattr(consumer, 'wheel_position_listener_running'):
        assert consumer.wheel_position_listener_running is False

    consumer.channel_layer.group_discard.assert_called_once_with(
        'machine_updates',
        'test-channel',
    )

    fake_serial_service.disconnect.assert_called_once()


def test_disconnect_without_machine_service_does_not_raise_error():
    consumer = make_consumer()

    consumer.serial_listener_running = True
    consumer.wheel_position_listener_running = True

    with patch('machine.consumers.async_to_sync', side_effect=lambda func: func):
        consumer.disconnect(close_code=1000)

    assert consumer.serial_listener_running is False

    if hasattr(consumer, 'wheel_position_listener_running'):
        assert consumer.wheel_position_listener_running is False

    consumer.channel_layer.group_discard.assert_called_once_with(
        'machine_updates',
        'test-channel',
    )


def test_machine_update_sends_machine_update_message_to_frontend():
    consumer = make_consumer()

    event = {
        'payload': {
            'lateral_misalignment_current': 12.5,
        },
    }

    consumer.machine_update(event)

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'machine_update',
            'payload': {
                'lateral_misalignment_current': 12.5,
            },
        }
    ]


def test_handle_serial_json_message_motor_roda_position_status_broadcasts_machine_update():
    consumer = make_consumer()

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_state_service = fake_machine_state_service

    was_handled = consumer.handle_serial_json_message({
        'success': True,
        'type': 'motor_roda_position_status',
        'status': 'position_reached',
        'current_angle': 90.0,
        'target_angle': 90.0,
        'current_spoke': 10,
        'target_spoke': 10,
        'total_spokes': 36,
        'is_positioning': False,
    })

    assert was_handled is True

    fake_broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'wheel_current_angle': 90.0,
            'wheel_target_angle': 90.0,
            'wheel_current_spoke': 10,
            'wheel_target_spoke': 10,
            'wheel_total_spokes': 36,
            'wheel_is_positioning': False,
        }
    )

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'serial_message',
            'direction': 'received',
            'message': (
                'Status da posição da roda: '
                'ângulo atual 90.0°, '
                'raio atual 10, '
                'status position_reached'
            ),
        }
    ]


def test_handle_serial_json_message_motor_roda_position_status_ignores_none_values():
    consumer = make_consumer()

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_state_service = fake_machine_state_service

    was_handled = consumer.handle_serial_json_message({
        'success': True,
        'type': 'motor_roda_position_status',
        'status': 'moving_to_angle',
        'current_angle': 110.0,
        'target_angle': None,
        'current_spoke': 12,
        'target_spoke': None,
        'total_spokes': 36,
        'is_positioning': True,
    })

    assert was_handled is True

    fake_broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'wheel_current_angle': 110.0,
            'wheel_current_spoke': 12,
            'wheel_total_spokes': 36,
            'wheel_is_positioning': True,
        }
    )


def test_handle_serial_json_message_lateral_sensor_status_broadcasts_reading_enabled():
    consumer = make_consumer()

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_state_service = fake_machine_state_service

    was_handled = consumer.handle_serial_json_message({
        'success': True,
        'type': 'lateral_sensor_status',
        'reading_enabled': True,
        'message': 'leitura_lateral_iniciada',
    })

    assert was_handled is True

    fake_broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'is_lateral_reading_enabled': True,
        }
    )

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'serial_message',
            'direction': 'received',
            'message': 'leitura_lateral_iniciada',
        }
    ]


def test_handle_serial_json_message_lateral_sensor_status_uses_fallback_message():
    consumer = make_consumer()

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_state_service = fake_machine_state_service

    was_handled = consumer.handle_serial_json_message({
        'success': True,
        'type': 'lateral_sensor_status',
        'reading_enabled': False,
    })

    assert was_handled is True

    fake_broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'is_lateral_reading_enabled': False,
        }
    )

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'serial_message',
            'direction': 'received',
            'message': 'Status da leitura lateral atualizado',
        }
    ]


def test_handle_serial_json_message_unknown_type_returns_false():
    consumer = make_consumer()

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_state_service = fake_machine_state_service

    was_handled = consumer.handle_serial_json_message({
        'type': 'mensagem_desconhecida',
        'message': 'qualquer coisa',
    })

    assert was_handled is False

    fake_broadcast_service.broadcast_machine_state.assert_not_called()
    consumer.send.assert_not_called()


def test_start_serial_listener_broadcasts_lateral_sensor_value_when_receives_pos_line():
    consumer = make_consumer()

    fake_serial_service = Mock()
    fake_serial_service.is_connected.return_value = True
    fake_serial_service.read_line.return_value = 'POS:12.50'

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_machine_state_service = Mock()

    def stop_after_broadcast(value):
        consumer.serial_listener_running = False

    fake_machine_state_service.broadcast_lateral_sensor_state.side_effect = (
        stop_after_broadcast
    )

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    consumer.start_serial_listener()

    fake_serial_service.read_line.assert_called_once()
    fake_machine_state_service.broadcast_lateral_sensor_state.assert_called_once_with(
        12.50
    )


def test_start_serial_listener_handles_motor_roda_position_status_json_line():
    consumer = make_consumer()

    serial_line = json.dumps({
        'success': True,
        'type': 'motor_roda_position_status',
        'status': 'position_reached',
        'current_angle': 90.0,
        'target_angle': 90.0,
        'current_spoke': 10,
        'target_spoke': 10,
        'total_spokes': 36,
        'is_positioning': False,
    })

    fake_serial_service = Mock()
    fake_serial_service.is_connected.return_value = True

    def read_line_once():
        consumer.serial_listener_running = False
        return serial_line

    fake_serial_service.read_line.side_effect = read_line_once

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    consumer.start_serial_listener()

    fake_broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'wheel_current_angle': 90.0,
            'wheel_target_angle': 90.0,
            'wheel_current_spoke': 10,
            'wheel_target_spoke': 10,
            'wheel_total_spokes': 36,
            'wheel_is_positioning': False,
        }
    )


def test_start_serial_listener_sends_unknown_json_as_serial_message():
    consumer = make_consumer()

    serial_line = json.dumps({
        'success': True,
        'type': 'startup',
        'message': 'arduino_iniciado',
    })

    fake_serial_service = Mock()
    fake_serial_service.is_connected.return_value = True

    def read_line_once():
        consumer.serial_listener_running = False
        return serial_line

    fake_serial_service.read_line.side_effect = read_line_once

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_broadcast_service = Mock()

    fake_machine_state_service = Mock()
    fake_machine_state_service.broadcast_service = fake_broadcast_service

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    consumer.start_serial_listener()

    fake_broadcast_service.broadcast_machine_state.assert_not_called()

    messages = get_sent_json_messages(consumer)

    assert messages == [
        {
            'type': 'serial_message',
            'direction': 'received',
            'message': serial_line,
        }
    ]


def test_start_serial_listener_ignores_empty_line():
    consumer = make_consumer()

    fake_serial_service = Mock()
    fake_serial_service.is_connected.return_value = True

    def read_line_once():
        consumer.serial_listener_running = False
        return None

    fake_serial_service.read_line.side_effect = read_line_once

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_machine_state_service = Mock()

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    consumer.start_serial_listener()

    fake_machine_state_service.broadcast_lateral_sensor_state.assert_not_called()


def test_start_serial_listener_waits_when_serial_is_not_connected():
    consumer = make_consumer()

    fake_serial_service = Mock()

    def is_connected_once():
        consumer.serial_listener_running = False
        return False

    fake_serial_service.is_connected.side_effect = is_connected_once

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_machine_state_service = Mock()

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    with patch('machine.consumers.time.sleep') as mock_sleep:
        consumer.start_serial_listener()

    mock_sleep.assert_called_once_with(0.001)
    fake_serial_service.read_line.assert_not_called()
    fake_machine_state_service.broadcast_lateral_sensor_state.assert_not_called()


def test_start_serial_listener_handles_invalid_pos_value_without_crashing():
    consumer = make_consumer()

    fake_serial_service = Mock()
    fake_serial_service.is_connected.return_value = True

    calls = {'count': 0}

    def read_line_side_effect():
        calls['count'] += 1

        if calls['count'] == 1:
            return 'POS:valor_invalido'

        consumer.serial_listener_running = False
        return None

    fake_serial_service.read_line.side_effect = read_line_side_effect

    fake_machine_service = Mock()
    fake_machine_service.serial_service = fake_serial_service

    fake_machine_state_service = Mock()

    consumer.machine_service = fake_machine_service
    consumer.machine_state_service = fake_machine_state_service
    consumer.serial_listener_running = True

    consumer.start_serial_listener()

    fake_machine_state_service.broadcast_lateral_sensor_state.assert_not_called()