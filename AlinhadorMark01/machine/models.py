from django.db import models


class MachineState(models.Model):
    """
    Guarda o estado atual da máquina.
    Aqui fica a "foto atual" do sistema.
    """

    id = models.BigAutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name='ID',
    )

    led = models.CharField(max_length=3, default='OFF')

    updated_at = models.DateTimeField(auto_now=True)

    arduino_connected = models.BooleanField(default=False)

    speed_motor_roda = models.IntegerField(default=0)

    # =========================
    # RODA
    # =========================

    # Posição atual da roda em graus.
    # Deve ficar normalmente entre 0 e 359.
    wheel_position_degrees = models.FloatField(default=0)

    # Quantidade total de voltas completas/parciais da roda.
    # Exemplo:
    # 0.5 = meia volta
    # 1.0 = uma volta completa
    # 2.0 = duas voltas completas
    wheel_total_turns = models.FloatField(default=0)

    # Sentido atual da roda:
    # stopped, clockwise ou counter_clockwise.
    wheel_direction = models.CharField(
        max_length=30,
        default='stopped',
    )

    # Informa se a roda está girando no momento.
    wheel_is_running = models.BooleanField(default=False)

    # Estado de posicionamento espelhado do Arduino.
    wheel_current_angle = models.FloatField(default=0)
    wheel_target_angle = models.FloatField(null=True, blank=True, default=None)
    wheel_current_spoke = models.IntegerField(default=1)
    wheel_target_spoke = models.IntegerField(null=True, blank=True, default=None)
    wheel_total_spokes = models.IntegerField(default=36)
    wheel_is_positioning = models.BooleanField(default=False)

    # Relação de transmissão:
    # quantas voltas do motor são necessárias para a roda dar uma volta completa.
    # Exemplo:
    # 4.0 = 4 voltas do motor para 1 volta da roda.
    motor_turns_per_wheel_turn = models.FloatField(default=1)

    # =========================
    # SENSOR LATERAL
    # =========================

    lateral_misalignment_current = models.FloatField(default=0)

    # =========================
    # TENSÃO DOS RAIOS - HX711
    # =========================

    spoke_tension_left_kg = models.FloatField(default=0)
    spoke_tension_right_kg = models.FloatField(default=0)
    is_spoke_tension_collecting = models.BooleanField(default=False)

    # =========================
    # CILINDROS PNEUMATICOS
    # =========================

    pneumatic_spoke_tension_left_extended = models.BooleanField(default=False)
    pneumatic_spoke_tension_right_extended = models.BooleanField(default=False)
    pneumatic_nipple_arm_left_extended = models.BooleanField(default=False)
    pneumatic_nipple_arm_right_extended = models.BooleanField(default=False)
    pneumatic_nipple_lift_left_extended = models.BooleanField(default=False)
    pneumatic_nipple_lift_right_extended = models.BooleanField(default=False)

    def __str__(self):
        return (
            f'MachineState #{self.id} - '
            f'LED: {self.led}, '
            f'Arduino: {self.arduino_connected}, '
            f'Speed: {self.speed_motor_roda}, '
            f'Wheel Position: {self.wheel_position_degrees}, '
            f'Wheel Turns: {self.wheel_total_turns}, '
            f'Wheel Direction: {self.wheel_direction}, '
            f'Wheel Running: {self.wheel_is_running}, '
            f'Wheel Angle: {self.wheel_current_angle}, '
            f'Wheel Spoke: {self.wheel_current_spoke}/{self.wheel_total_spokes}, '
            f'Motor/Wheel Ratio: {self.motor_turns_per_wheel_turn}, '
            f'Lateral Misalignment: {self.lateral_misalignment_current}, '
            f'Spoke Tension L/R: {self.spoke_tension_left_kg}/'
            f'{self.spoke_tension_right_kg}, '
            f'Pneumatic cylinders: '
            f'{self.pneumatic_spoke_tension_left_extended}/'
            f'{self.pneumatic_spoke_tension_right_extended}/'
            f'{self.pneumatic_nipple_arm_left_extended}/'
            f'{self.pneumatic_nipple_arm_right_extended}/'
            f'{self.pneumatic_nipple_lift_left_extended}/'
            f'{self.pneumatic_nipple_lift_right_extended}'
        )


class MachineConfig(models.Model):
    """
    Guarda as configurações da máquina.

    Diferente do MachineState, este model não representa o estado atual,
    mas sim os parâmetros usados para configurar o Arduino, sensores e motores.

    A ideia é permitir alterar esses valores pelo Django Admin sem precisar
    modificar o código do Arduino ou do backend a cada teste.
    """

    id = models.BigAutoField(
        auto_created=True,
        primary_key=True,
        serialize=False,
        verbose_name='ID',
    )

    name = models.CharField(
        max_length=100,
        default='Configuração principal',
    )

    is_active = models.BooleanField(
        default=True,
        help_text='Define se esta configuração é a configuração ativa da máquina.',
    )

    updated_at = models.DateTimeField(auto_now=True)

    # =========================
    # SERIAL
    # =========================

    serial_baudrate = models.IntegerField(
        default=9600,
        help_text='Velocidade de comunicação serial com o Arduino.',
    )

    # =========================
    # RODA
    # =========================

    wheel_total_spokes = models.IntegerField(
        default=36,
        help_text='Quantidade total de raios da roda. Exemplo: 36.',
    )

    # Quantos passos o motor precisa executar para a roda dar 1 volta completa.
    # Este é o campo mais importante para calibrar a relação motor/roda.
    motor_steps_per_wheel_turn = models.IntegerField(
        default=6400,
        help_text='Quantidade de passos do motor para a roda dar uma volta completa.',
    )

    # Quantos passos o motor possui em uma volta própria.
    # Exemplo comum: motor de passo 1.8° = 200 passos por volta.
    motor_steps_per_motor_turn = models.IntegerField(
        default=200,
        help_text='Quantidade de passos do motor para uma volta do próprio eixo.',
    )

    # Microstepping configurado no driver.
    # Exemplo: 1, 2, 4, 8, 16, 32.
    motor_microsteps = models.IntegerField(
        default=1,
        help_text='Configuração de micro passos usada no driver do motor.',
    )

    # Relação mecânica aproximada:
    # quantas voltas do motor são necessárias para a roda dar uma volta.
    motor_turns_per_wheel_turn = models.FloatField(
        default=1,
        help_text='Quantidade de voltas do motor para a roda dar uma volta completa.',
    )

    motor_max_speed = models.FloatField(
        default=1000,
        help_text='Velocidade máxima do motor usada no Arduino.',
    )

    motor_acceleration = models.FloatField(
        default=500,
        help_text='Aceleração do motor usada no Arduino.',
    )

    # =========================
    # PINOS DO MOTOR DA RODA
    # =========================

    motor_step_pin = models.IntegerField(
        default=2,
        help_text='Pino STEP do driver do motor da roda.',
    )

    motor_dir_pin = models.IntegerField(
        default=3,
        help_text='Pino DIR do driver do motor da roda.',
    )

    motor_enable_pin = models.IntegerField(
        default=4,
        help_text='Pino ENABLE do driver do motor da roda.',
    )

    # =========================
    # SENSOR LATERAL
    # =========================

    lateral_sensor_pin = models.CharField(
        max_length=10,
        default='A0',
        help_text='Pino analógico usado pelo sensor lateral. Exemplo: A0.',
    )

    lateral_sensor_zero_offset = models.FloatField(
        default=0,
        help_text='Offset de calibração do sensor lateral em milímetros.',
    )

    lateral_sensor_dead_zone = models.FloatField(
        default=0,
        help_text='Zona morta do sensor lateral em milímetros.',
    )

    # =========================
    # TENSÃO DOS RAIOS - HX711
    # =========================

    spoke_tension_left_dout_pin = models.IntegerField(
        'Pino DOUT esquerdo',
        default=3,
        help_text='Pino DT/DOUT do HX711 do lado esquerdo.',
    )

    spoke_tension_left_sck_pin = models.IntegerField(
        'Pino SCK esquerdo',
        default=2,
        help_text='Pino SCK/CLK do HX711 do lado esquerdo.',
    )

    spoke_tension_right_dout_pin = models.IntegerField(
        'Pino DOUT direito',
        default=5,
        help_text='Pino DT/DOUT do HX711 do lado direito.',
    )

    spoke_tension_right_sck_pin = models.IntegerField(
        'Pino SCK direito',
        default=4,
        help_text='Pino SCK/CLK do HX711 do lado direito.',
    )

    spoke_tension_left_calibration_factor = models.FloatField(
        'Fator de calibração esquerdo',
        default=-7050,
        help_text='Fator de calibração do HX711 esquerdo.',
    )

    spoke_tension_right_calibration_factor = models.FloatField(
        'Fator de calibração direito',
        default=-7050,
        help_text='Fator de calibração do HX711 direito.',
    )

    spoke_tension_read_interval_ms = models.IntegerField(
        'Intervalo de leitura em ms',
        default=80,
        help_text='Intervalo de leitura/envio dos HX711 em milissegundos.',
    )

    # =========================
    # CILINDROS PNEUMATICOS
    # =========================

    pneumatic_spoke_tension_left_pin = models.IntegerField(
        'Cilindro tensao esquerdo',
        default=22,
        help_text='Pino da valvula solenoide do cilindro de tensao esquerdo.',
    )

    pneumatic_spoke_tension_right_pin = models.IntegerField(
        'Cilindro tensao direito',
        default=23,
        help_text='Pino da valvula solenoide do cilindro de tensao direito.',
    )

    pneumatic_nipple_arm_left_pin = models.IntegerField(
        'Cilindro avanco horizontal esquerdo',
        default=24,
        help_text='Pino da valvula do avanco horizontal esquerdo do mecanismo do niple.',
    )

    pneumatic_nipple_arm_right_pin = models.IntegerField(
        'Cilindro avanco horizontal direito',
        default=25,
        help_text='Pino da valvula do avanco horizontal direito do mecanismo do niple.',
    )

    pneumatic_nipple_lift_left_pin = models.IntegerField(
        'Cilindro sobe/desce esquerdo',
        default=26,
        help_text='Pino da valvula do cilindro vertical esquerdo do mecanismo do niple.',
    )

    pneumatic_nipple_lift_right_pin = models.IntegerField(
        'Cilindro sobe/desce direito',
        default=27,
        help_text='Pino da valvula do cilindro vertical direito do mecanismo do niple.',
    )

    # =========================
    # LED / TESTES
    # =========================

    led_pin = models.IntegerField(
        default=13,
        help_text='Pino usado para LED de teste/status.',
    )

    class Meta:
        verbose_name = 'Configuração da máquina'
        verbose_name_plural = 'Configurações da máquina'

    def __str__(self):
        return (
            f'{self.name} - '
            f'Raios: {self.wheel_total_spokes}, '
            f'Passos/volta roda: {self.motor_steps_per_wheel_turn}, '
            f'Ativa: {self.is_active}'
        )
