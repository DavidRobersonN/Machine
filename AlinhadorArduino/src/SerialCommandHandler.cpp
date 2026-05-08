#include "SerialCommandHandler.h"

SerialCommandHandler::SerialCommandHandler(
  Led& ledReference,
  LateralSensor& lateralSensorReference,
  MotorRoda& motorRodaReference
)
  : led(ledReference),
    lateralSensor(lateralSensorReference),
    motorRoda(motorRodaReference)
{
  inputBuffer = "";
}

void SerialCommandHandler::update() {
  while (Serial.available() > 0) {
    char receivedChar = Serial.read();

    if (receivedChar == '\r') {
      continue;
    }

    if (receivedChar == '\n') {
      inputBuffer.trim();

      if (inputBuffer.length() > 0) {
        handleCommand(inputBuffer);
      }

      inputBuffer = "";
    } else {
      inputBuffer += receivedChar;
    }
  }
}

void SerialCommandHandler::handleCommand(String command) {
  command.trim();

  if (command == "LATERAL_SENSOR_START_READING") {
    lateralSensor.startReading();
    return;
  }

  if (command == "LATERAL_SENSOR_STOP_READING") {
    lateralSensor.stopReading();
    return;
  }

  if (command == "LED_ON") {
    led.turnOn();
    return;
  }

  if (command == "LED_OFF") {
    led.turnOff();
    return;
  }

  if (command == "LED_STATUS") {
    led.sendStatus();
    return;
  }

  if (command == "PING") {
    sendPong();
    return;
  }

  if (command == "READ_LATERAL_SENSOR") {
    lateralSensor.sendNow();
    return;
  }

  // =======================
  // MOTOR DA RODA - GIRO CONTÍNUO
  // =======================

  if (command == "MOTOR_RODA_START") {
    motorRoda.start();
    return;
  }

  if (command == "MOTOR_RODA_STOP") {
    motorRoda.stop();
    return;
  }

  if (command == "MOTOR_RODA_SET_CLOCKWISE") {
    motorRoda.setClockwise();
    return;
  }

  if (command == "MOTOR_RODA_SET_COUNTER_CLOCKWISE") {
    motorRoda.setCounterClockwise();
    return;
  }

  if (command == "MOTOR_RODA_INCREASE_SPEED") {
    motorRoda.increaseSpeed();
    return;
  }

  if (command == "MOTOR_RODA_DECREASE_SPEED") {
    motorRoda.decreaseSpeed();
    return;
  }

  if (command == "MOTOR_RODA_SPEED_STATUS") {
    motorRoda.sendSpeedStatus();
    return;
  }

  // =======================
  // MOTOR DA RODA - POSIÇÃO
  // =======================

  if (command == "MOTOR_RODA_SET_ZERO") {
    motorRoda.setZero();
    return;
  }

  if (command.startsWith("MOTOR_RODA_GO_TO_ANGLE:")) {
    String value = command.substring(
      String("MOTOR_RODA_GO_TO_ANGLE:").length()
    );

    float angle = value.toFloat();

    motorRoda.goToAngle(angle);
    return;
  }

  if (command.startsWith("MOTOR_RODA_GO_TO_SPOKE:")) {
    String value = command.substring(
      String("MOTOR_RODA_GO_TO_SPOKE:").length()
    );

    int spoke = value.toInt();

    motorRoda.goToSpoke(spoke);
    return;
  }

  if (command == "MOTOR_RODA_NEXT_SPOKE") {
    motorRoda.goToNextSpoke();
    return;
  }

  if (command == "MOTOR_RODA_PREVIOUS_SPOKE") {
    motorRoda.goToPreviousSpoke();
    return;
  }

  if (command == "MOTOR_RODA_POSITION_STATUS") {
    motorRoda.sendCurrentPositionStatus();
    return;
  }

  sendUnknownCommandError(command);
}

void SerialCommandHandler::sendPong() {
  Serial.println("{\"success\":true,\"type\":\"pong\",\"message\":\"arduino_conectado\"}");
}

void SerialCommandHandler::sendUnknownCommandError(String command) {
  Serial.print("{\"success\":false,\"type\":\"error\",\"message\":\"comando_desconhecido:");
  Serial.print(command);
  Serial.println("\"}");
}