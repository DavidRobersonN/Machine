from unittest.mock import Mock, patch

import pytest

from machine.models import MachineConfig, MachineState
from machine.services.machine_state_service import MachineStateService


pytestmark = pytest.mark.django_db


def make_serial_success(command: str) -> dict:
    return {
        'success': True,
        'message': 'Comando enviado com sucesso',
        'command': command,
        'response': None,
        'arduino_connected': True,
    }


def make_service(
    port='COM9',
    connected=True,
):
    serial_service = Mock()
    serial_service.port = port
    serial_service.is_connected.return_value = connected
    serial_service.send_command.side_effect = make_serial_success

    service = MachineStateService(serial_service)
    service.broadcast_service = Mock()

    return service, serial_service


def make_expected_payload(
    *,
    led='OFF',
    arduino_connected=True,
    selected_port='COM9',
    speed_motor_roda=0,
    wheel_position_degrees=0.0,
    wheel_total_turns=0.0,
    wheel_direction='stopped',
    wheel_is_running=False,
    motor_turns_per_wheel_turn=1.0,
    wheel_current_angle=0.0,
    wheel_target_angle=None,
    wheel_current_spoke=1,
    wheel_target_spoke=None,
    wheel_total_spokes=36,
    wheel_is_positioning=False,
    lateral_misalignment_current=0.0,
):
    return {
        'led': led,
        'arduino_connected': arduino_connected,
        'selected_port': selected_port,
        'speed_motor_roda': speed_motor_roda,
        'wheel_position_degrees': wheel_position_degrees,
        'wheel_total_turns': wheel_total_turns,
        'wheel_direction': wheel_direction,
        'wheel_is_running': wheel_is_running,
        'motor_turns_per_wheel_turn': motor_turns_per_wheel_turn,
        'wheel_current_angle': wheel_current_angle,
        'wheel_target_angle': wheel_target_angle,
        'wheel_current_spoke': wheel_current_spoke,
        'wheel_target_spoke': wheel_target_spoke,
        'wheel_total_spokes': wheel_total_spokes,
        'wheel_is_positioning': wheel_is_positioning,
        'lateral_misalignment_current': lateral_misalignment_current,
    }


def test_initial_state_of_service():
    service, serial_service = make_service()

    assert service.serial_service == serial_service
    assert service.last_lateral_broadcast_time == 0.0
    assert service.lateral_broadcast_interval == 0.016
    assert service.SPEED_STEP == 5
    assert service.MIN_SPEED == 0
    assert service.MAX_SPEED == 100


def test_calculate_wheel_turns_per_second_uses_active_machine_config():
    service, _ = make_service()

    MachineConfig.objects.create(
        is_active=True,
        motor_max_speed=1000,
        motor_steps_per_wheel_turn=6400,
    )

    assert service.calculate_wheel_turns_per_second(100) == pytest.approx(
        0.15625,
    )
    assert service.calculate_wheel_turns_per_second(50) == pytest.approx(
        0.078125,
    )


def test_update_wheel_position_realtime_uses_calibrated_wheel_speed():
    service, serial_service = make_service(connected=False)

    MachineConfig.objects.create(
        is_active=True,
        motor_max_speed=1000,
        motor_steps_per_wheel_turn=6400,
    )

    MachineState.objects.create(
        id=1,
        speed_motor_roda=100,
        wheel_direction='clockwise',
        wheel_is_running=True,
    )

    service.update_wheel_position_realtime(interval_seconds=1)

    state = MachineState.objects.get(id=1)

    assert state.wheel_total_turns == pytest.approx(0.15625)
    assert state.wheel_position_degrees == pytest.approx(56.25)
    assert state.arduino_connected is False
    serial_service.is_connected.assert_called()
    service.broadcast_service.broadcast_machine_state.assert_called_once()


def test_update_wheel_position_realtime_does_not_simulate_when_serial_connected():
    service, _ = make_service(connected=True)

    MachineState.objects.create(
        id=1,
        speed_motor_roda=100,
        wheel_direction='clockwise',
        wheel_is_running=True,
    )

    service.update_wheel_position_realtime(interval_seconds=1)

    state = MachineState.objects.get(id=1)

    assert state.wheel_total_turns == 0
    assert state.wheel_position_degrees == 0
    service.broadcast_service.broadcast_machine_state.assert_not_called()


def test_update_wheel_position_from_serial_updates_real_wheel_state_without_broadcast():
    service, _ = make_service(connected=True)

    state = service.update_wheel_position_from_serial({
        'wheel_position_degrees': 90.0,
        'wheel_total_turns': 1.25,
        'wheel_is_running': True,
        'wheel_current_angle': 90.0,
        'wheel_current_spoke': 10,
        'wheel_total_spokes': 36,
        'wheel_is_positioning': False,
    })

    state.refresh_from_db()

    assert state.wheel_position_degrees == 90.0
    assert state.wheel_total_turns == 1.25
    assert state.wheel_is_running is True
    assert state.wheel_current_angle == 90.0
    assert state.wheel_current_spoke == 10
    assert state.wheel_total_spokes == 36
    assert state.wheel_is_positioning is False
    assert state.arduino_connected is True
    service.broadcast_service.broadcast_machine_state.assert_not_called()


def test_serialize_state():
    service, _ = make_service(port='COM9', connected=True)

    state = MachineState.objects.create(
        id=1,
        led='ON',
        arduino_connected=True,
        speed_motor_roda=80,
        lateral_misalignment_current=12.5,
    )

    serialized = service.serialize_state(state)

    assert serialized == make_expected_payload(
        led='ON',
        arduino_connected=True,
        selected_port='COM9',
        speed_motor_roda=80,
        lateral_misalignment_current=12.5,
    )


def test_update_state_updates_led_speed_lateral_value_and_broadcasts():
    service, serial_service = make_service(connected=True)

    state = service.update_state({
        'led': 'ON',
        'speed_motor_roda': 90,
        'lateral_misalignment_current': 7.25,
    })

    state.refresh_from_db()

    assert state.id == 1
    assert state.led == 'ON'
    assert state.speed_motor_roda == 90
    assert state.lateral_misalignment_current == 7.25
    assert state.arduino_connected is True

    serial_service.is_connected.assert_called()

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload=make_expected_payload(
            led='ON',
            arduino_connected=True,
            selected_port='COM9',
            speed_motor_roda=90,
            lateral_misalignment_current=7.25,
        )
    )


def test_update_state_with_empty_data_only_updates_arduino_connection_and_broadcasts():
    service, _ = make_service(connected=False)

    state = MachineState.objects.create(
        id=1,
        led='ON',
        arduino_connected=True,
        speed_motor_roda=50,
        lateral_misalignment_current=3.5,
    )

    updated_state = service.update_state({})

    updated_state.refresh_from_db()

    assert updated_state.id == state.id
    assert updated_state.led == 'ON'
    assert updated_state.speed_motor_roda == 50
    assert updated_state.lateral_misalignment_current == 3.5
    assert updated_state.arduino_connected is False

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload=make_expected_payload(
            led='ON',
            arduino_connected=False,
            selected_port='COM9',
            speed_motor_roda=50,
            lateral_misalignment_current=3.5,
        )
    )


def test_get_current_state_when_arduino_is_connected_keeps_led_state():
    service, _ = make_service(connected=True)

    MachineState.objects.create(
        id=1,
        led='ON',
        arduino_connected=False,
        speed_motor_roda=40,
        lateral_misalignment_current=2.5,
    )

    current_state = service.get_current_state()

    assert current_state == make_expected_payload(
        led='ON',
        arduino_connected=True,
        selected_port='COM9',
        speed_motor_roda=40,
        lateral_misalignment_current=2.5,
    )


def test_get_current_state_when_arduino_is_disconnected_turns_led_off():
    service, _ = make_service(connected=False)

    state = MachineState.objects.create(
        id=1,
        led='ON',
        arduino_connected=True,
        speed_motor_roda=40,
        lateral_misalignment_current=2.5,
    )

    current_state = service.get_current_state()

    state.refresh_from_db()

    assert state.led == 'OFF'
    assert state.arduino_connected is False

    assert current_state == make_expected_payload(
        led='OFF',
        arduino_connected=False,
        selected_port='COM9',
        speed_motor_roda=40,
        lateral_misalignment_current=2.5,
    )


def test_broadcast_lateral_sensor_state_sends_payload_when_interval_has_passed():
    service, _ = make_service()

    with patch('machine.services.machine_state_service.time.monotonic') as monotonic:
        monotonic.return_value = 10.0

        service.broadcast_lateral_sensor_state(12.5)

    assert service.last_lateral_broadcast_time == 10.0

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'lateral_misalignment_current': 12.5,
        }
    )


def test_broadcast_lateral_sensor_state_does_not_send_when_interval_has_not_passed():
    service, _ = make_service()

    service.last_lateral_broadcast_time = 10.0

    with patch('machine.services.machine_state_service.time.monotonic') as monotonic:
        monotonic.return_value = 10.01

        service.broadcast_lateral_sensor_state(12.5)

    service.broadcast_service.broadcast_machine_state.assert_not_called()


def test_broadcast_lateral_sensor_state_sends_again_after_interval():
    service, _ = make_service()

    service.last_lateral_broadcast_time = 10.0

    with patch('machine.services.machine_state_service.time.monotonic') as monotonic:
        monotonic.return_value = 10.06

        service.broadcast_lateral_sensor_state(8.75)

    assert service.last_lateral_broadcast_time == 10.06

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload={
            'lateral_misalignment_current': 8.75,
        }
    )


def test_motor_roda_start_sends_serial_command_and_returns_log():
    service, serial_service = make_service()

    response = service.motor_roda_start()

    serial_service.send_command.assert_called_once_with('MOTOR_RODA_START')

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Motor da roda iniciado',
        'serial': make_serial_success('MOTOR_RODA_START'),
    }


def test_motor_roda_stop_sends_serial_command_and_returns_log():
    service, serial_service = make_service()

    response = service.motor_roda_stop()

    serial_service.send_command.assert_called_once_with('MOTOR_RODA_STOP')

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Motor da roda parado',
        'serial': make_serial_success('MOTOR_RODA_STOP'),
    }


def test_motor_roda_set_clockwise_sends_serial_command_and_returns_log():
    service, serial_service = make_service()

    response = service.motor_roda_set_clockwise()

    serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_SET_CLOCKWISE'
    )

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Motor da roda definido para sentido horário',
        'serial': make_serial_success('MOTOR_RODA_SET_CLOCKWISE'),
    }


def test_motor_roda_set_counter_clockwise_sends_serial_command_and_returns_log():
    service, serial_service = make_service()

    response = service.motor_roda_set_counter_clockwise()

    serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_SET_COUNTER_CLOCKWISE'
    )

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Motor da roda definido para sentido anti-horário',
        'serial': make_serial_success('MOTOR_RODA_SET_COUNTER_CLOCKWISE'),
    }


def test_motor_roda_increase_speed_updates_database_sends_serial_and_broadcasts():
    service, serial_service = make_service(connected=True)

    state = MachineState.objects.create(
        id=1,
        led='OFF',
        arduino_connected=False,
        speed_motor_roda=50,
        lateral_misalignment_current=0,
    )

    response = service.motor_roda_increase_speed()

    state.refresh_from_db()

    assert state.speed_motor_roda == 55
    assert state.arduino_connected is True

    serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_INCREASE_SPEED'
    )

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload=make_expected_payload(
            led='OFF',
            arduino_connected=True,
            selected_port='COM9',
            speed_motor_roda=55,
            lateral_misalignment_current=0.0,
        )
    )

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Velocidade do motor da roda aumentada para 55',
        'serial': make_serial_success('MOTOR_RODA_INCREASE_SPEED'),
    }


def test_motor_roda_increase_speed_respects_max_speed():
    service, _ = make_service(connected=True)

    state = MachineState.objects.create(
        id=1,
        speed_motor_roda=100,
    )

    service.motor_roda_increase_speed()

    state.refresh_from_db()

    assert state.speed_motor_roda == 100


def test_motor_roda_decrease_speed_updates_database_sends_serial_and_broadcasts():
    service, serial_service = make_service(connected=True)

    state = MachineState.objects.create(
        id=1,
        led='OFF',
        arduino_connected=False,
        speed_motor_roda=50,
        lateral_misalignment_current=0,
    )

    response = service.motor_roda_decrease_speed()

    state.refresh_from_db()

    assert state.speed_motor_roda == 45
    assert state.arduino_connected is True

    serial_service.send_command.assert_called_once_with(
        'MOTOR_RODA_DECREASE_SPEED'
    )

    service.broadcast_service.broadcast_machine_state.assert_called_once_with(
        payload=make_expected_payload(
            led='OFF',
            arduino_connected=True,
            selected_port='COM9',
            speed_motor_roda=45,
            lateral_misalignment_current=0.0,
        )
    )

    assert response == {
        'type': 'log',
        'direction': 'received',
        'message': 'Velocidade do motor da roda diminuída para 45',
        'serial': make_serial_success('MOTOR_RODA_DECREASE_SPEED'),
    }


def test_motor_roda_decrease_speed_respects_min_speed():
    service, _ = make_service(connected=True)

    state = MachineState.objects.create(
        id=1,
        speed_motor_roda=0,
    )

    service.motor_roda_decrease_speed()

    state.refresh_from_db()

    assert state.speed_motor_roda == 0
