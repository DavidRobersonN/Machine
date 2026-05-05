from django.db import models


class MachineState(models.Model):
    """
    Guarda o estado atual da máquina.
    Aqui fica a "foto atual" do sistema.
    """

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

    # Relação de transmissão:
    # quantas voltas do motor são necessárias para a roda dar uma volta completa.
    # Exemplo:
    # 4.0 = 4 voltas do motor para 1 volta da roda.
    motor_turns_per_wheel_turn = models.FloatField(default=1)

    # =========================
    # SENSOR LATERAL
    # =========================

    lateral_misalignment_current = models.FloatField(default=0)

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
            f'Motor/Wheel Ratio: {self.motor_turns_per_wheel_turn}, '
            f'Lateral Misalignment: {self.lateral_misalignment_current}'
        )