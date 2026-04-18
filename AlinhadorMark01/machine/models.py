from django.db import models


class MachineState(models.Model):
    """
    Guarda o estado atual da máquina.
    Aqui fica a "foto atual" do sistema.
    """

    led = models.CharField(max_length=3, default='OFF')

    updated_at = models.DateTimeField(auto_now=True)

    arduino_connected = models.BooleanField(default=False)
    
    def __str__(self):
        return f'MachineState #{self.id} - LED: {self.led}, Arduino: {self.arduino_connected}'