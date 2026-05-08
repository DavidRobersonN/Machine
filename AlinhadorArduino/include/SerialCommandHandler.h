#ifndef SERIAL_COMMAND_HANDLER_H
#define SERIAL_COMMAND_HANDLER_H

#include <Arduino.h>
#include "Led.h"
#include "LateralSensor.h"
#include "MotorRoda.h"

class SerialCommandHandler {
private:
  Led& led;
  LateralSensor& lateralSensor;
  MotorRoda& motorRoda;

  String inputBuffer;

  void handleCommand(String command);

  void sendPong();
  void sendUnknownCommandError(String command);

public:
  SerialCommandHandler(
    Led& ledReference,
    LateralSensor& lateralSensorReference,
    MotorRoda& motorRodaReference
  );

  void update();
};

#endif