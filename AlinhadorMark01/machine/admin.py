from django.contrib import admin

from machine.models import MachineConfig, MachineState


@admin.register(MachineState)
class MachineStateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'led',
        'arduino_connected',
        'speed_motor_roda',
        'wheel_position_degrees',
        'wheel_direction',
        'wheel_is_running',
        'lateral_misalignment_current',
        'updated_at',
    )

    readonly_fields = (
        'updated_at',
    )

    fieldsets = (
        (
            'Estado geral',
            {
                'fields': (
                    'led',
                    'arduino_connected',
                    'speed_motor_roda',
                    'updated_at',
                )
            },
        ),
        (
            'Roda',
            {
                'fields': (
                    'wheel_position_degrees',
                    'wheel_total_turns',
                    'wheel_direction',
                    'wheel_is_running',
                    'motor_turns_per_wheel_turn',
                )
            },
        ),
        (
            'Sensor lateral',
            {
                'fields': (
                    'lateral_misalignment_current',
                )
            },
        ),
    )


@admin.register(MachineConfig)
class MachineConfigAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'is_active',
        'wheel_total_spokes',
        'motor_steps_per_wheel_turn',
        'motor_turns_per_wheel_turn',
        'serial_baudrate',
        'updated_at',
    )

    list_filter = (
        'is_active',
        'serial_baudrate',
        'wheel_total_spokes',
    )

    search_fields = (
        'name',
    )

    readonly_fields = (
        'updated_at',
    )

    fieldsets = (
        (
            'Identificação',
            {
                'fields': (
                    'name',
                    'is_active',
                    'updated_at',
                )
            },
        ),
        (
            'Comunicação serial',
            {
                'fields': (
                    'serial_baudrate',
                )
            },
        ),
        (
            'Configuração da roda e motor',
            {
                'fields': (
                    'wheel_total_spokes',
                    'motor_steps_per_wheel_turn',
                    'motor_steps_per_motor_turn',
                    'motor_microsteps',
                    'motor_turns_per_wheel_turn',
                    'motor_max_speed',
                    'motor_acceleration',
                )
            },
        ),
        (
            'Pinos do motor da roda',
            {
                'fields': (
                    'motor_step_pin',
                    'motor_dir_pin',
                    'motor_enable_pin',
                )
            },
        ),
        (
            'Sensor lateral',
            {
                'fields': (
                    'lateral_sensor_pin',
                    'lateral_sensor_zero_offset',
                    'lateral_sensor_dead_zone',
                )
            },
        ),
        (
            'LED / testes',
            {
                'fields': (
                    'led_pin',
                )
            },
        ),
    )