#include "SerialCommandHandler.h"

SerialCommandHandler::SerialCommandHandler(
  Led& ledReference,
  LateralSensor& lateralSensorReference,
  MotorRoda& motorRodaReference,
  SpokeTensionSensor& spokeTensionSensorReference
)
  : led(ledReference),
    lateralSensor(lateralSensorReference),
    motorRoda(motorRodaReference),
    spokeTensionSensor(spokeTensionSensorReference)
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

  // =======================
  // CONFIGURAÇÃO DINÂMICA
  // =======================

  if (command.startsWith("CONFIG_WHEEL_TOTAL_SPOKES:")) {
    String value = command.substring(
      String("CONFIG_WHEEL_TOTAL_SPOKES:").length()
    );

    int totalSpokes = value.toInt();

    motorRoda.setTotalSpokes(totalSpokes);
    return;
  }

  if (command.startsWith("CONFIG_MOTOR_STEPS_PER_WHEEL_TURN:")) {
    String value = command.substring(
      String("CONFIG_MOTOR_STEPS_PER_WHEEL_TURN:").length()
    );

    long stepsPerWheelTurn = value.toInt();

    motorRoda.setStepsPerWheelRevolution(stepsPerWheelTurn);
    return;
  }

  if (command.startsWith("CONFIG_MOTOR_MAX_SPEED:")) {
    String value = command.substring(
      String("CONFIG_MOTOR_MAX_SPEED:").length()
    );

    float maxSpeed = value.toFloat();

    motorRoda.setMaxSpeed(maxSpeed);
    return;
  }

  if (command.startsWith("CONFIG_MOTOR_ACCELERATION:")) {
    String value = command.substring(
      String("CONFIG_MOTOR_ACCELERATION:").length()
    );

    float acceleration = value.toFloat();

    motorRoda.setAcceleration(acceleration);
    return;
  }

  if (command == "CONFIG_MOTOR_STATUS") {
    motorRoda.sendConfigStatus("status_configuracao_motor_roda");
    return;
  }

  // =======================
  // SENSOR LATERAL
  // =======================

  if (command == "LATERAL_SENSOR_START_READING") {
    lateralSensor.startReading();
    return;
  }

  if (command == "LATERAL_SENSOR_STOP_READING") {
    lateralSensor.stopReading();
    return;
  }

  if (command == "READ_LATERAL_SENSOR") {
    lateralSensor.sendNow();
    return;
  }

  // =======================
  // TENSÃO DOS RAIOS - HX711
  // =======================

  if (command == "SPOKE_TENSION_START_COLLECTION") {
    spokeTensionSensor.startCollection();
    return;
  }

  if (command == "SPOKE_TENSION_STOP_COLLECTION") {
    spokeTensionSensor.stopCollection();
    return;
  }

  if (command == "SPOKE_TENSION_STATUS") {
    spokeTensionSensor.sendStatus();
    return;
  }

  if (command == "SPOKE_TENSION_TARE:LEFT") {
    spokeTensionSensor.tareLeft();
    return;
  }

  if (command == "SPOKE_TENSION_TARE:RIGHT") {
    spokeTensionSensor.tareRight();
    return;
  }

  if (command == "SPOKE_TENSION_TARE:BOTH") {
    spokeTensionSensor.tareBoth();
    return;
  }

  if (command.startsWith("SPOKE_TENSION_SET_CALIBRATION:LEFT:")) {
    String value = command.substring(
      String("SPOKE_TENSION_SET_CALIBRATION:LEFT:").length()
    );

    spokeTensionSensor.setLeftCalibrationFactor(value.toFloat());
    return;
  }

  if (command.startsWith("SPOKE_TENSION_SET_CALIBRATION:RIGHT:")) {
    String value = command.substring(
      String("SPOKE_TENSION_SET_CALIBRATION:RIGHT:").length()
    );

    spokeTensionSensor.setRightCalibrationFactor(value.toFloat());
    return;
  }

  // =======================
  // LED
  // =======================

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

  // =======================
  // TESTE DE CONEXÃO
  // =======================

  if (command == "PING") {
    sendPong();
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
