#include "SpokeTensionSensor.h"

SpokeTensionSensor::SpokeTensionSensor(
  int leftDoutPin,
  int leftSckPin,
  int rightDoutPin,
  int rightSckPin,
  unsigned long interval,
  float leftCalibrationFactor,
  float rightCalibrationFactor
) {
  this->leftDoutPin = leftDoutPin;
  this->leftSckPin = leftSckPin;
  this->rightDoutPin = rightDoutPin;
  this->rightSckPin = rightSckPin;
  this->interval = interval;
  this->leftCalibrationFactor = leftCalibrationFactor;
  this->rightCalibrationFactor = rightCalibrationFactor;

  lastReadTime = 0;
  collecting = false;
}

void SpokeTensionSensor::begin() {
  leftScale.begin(leftDoutPin, leftSckPin);
  rightScale.begin(rightDoutPin, rightSckPin);

  delay(1000);

  leftScale.set_scale(leftCalibrationFactor);
  rightScale.set_scale(rightCalibrationFactor);

  tareBoth();
}

void SpokeTensionSensor::update() {
  if (!collecting) {
    return;
  }

  unsigned long now = millis();

  if (now - lastReadTime < interval) {
    return;
  }

  lastReadTime = now;
  sendNow();
}

float SpokeTensionSensor::readLeftKg() {
  if (!leftScale.is_ready()) {
    return 0.0;
  }

  return leftScale.get_units(20);
}

float SpokeTensionSensor::readRightKg() {
  if (!rightScale.is_ready()) {
    return 0.0;
  }

  return rightScale.get_units(20);
}

void SpokeTensionSensor::sendValues(float leftKg, float rightKg) {
  Serial.print("SPOKE_TENSION:");
  Serial.print(leftKg, 3);
  Serial.print(",");
  Serial.println(rightKg, 3);
}

void SpokeTensionSensor::startCollection() {
  collecting = true;
  lastReadTime = 0;

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"collecting\":true,\"message\":\"coleta_tensao_raios_iniciada\"}");
}

void SpokeTensionSensor::stopCollection() {
  collecting = false;

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"collecting\":false,\"message\":\"coleta_tensao_raios_parada\"}");
}

void SpokeTensionSensor::tareLeft() {
  if (leftScale.is_ready()) {
    leftScale.tare(20);
  }

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"message\":\"tara_esquerda_concluida\"}");
}

void SpokeTensionSensor::tareRight() {
  if (rightScale.is_ready()) {
    rightScale.tare(20);
  }

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"message\":\"tara_direita_concluida\"}");
}

void SpokeTensionSensor::tareBoth() {
  if (leftScale.is_ready()) {
    leftScale.tare(20);
  }

  if (rightScale.is_ready()) {
    rightScale.tare(20);
  }

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"message\":\"tara_ambos_concluida\"}");
}

void SpokeTensionSensor::setLeftCalibrationFactor(float factor) {
  leftCalibrationFactor = factor;
  leftScale.set_scale(leftCalibrationFactor);

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"message\":\"calibracao_esquerda_atualizada\"}");
}

void SpokeTensionSensor::setRightCalibrationFactor(float factor) {
  rightCalibrationFactor = factor;
  rightScale.set_scale(rightCalibrationFactor);

  Serial.println("{\"success\":true,\"type\":\"spoke_tension_status\",\"message\":\"calibracao_direita_atualizada\"}");
}

void SpokeTensionSensor::sendNow() {
  sendValues(readLeftKg(), readRightKg());
}

void SpokeTensionSensor::sendStatus() {
  float leftKg = readLeftKg();
  float rightKg = readRightKg();

  Serial.print("{\"success\":true,\"type\":\"spoke_tension_status\",\"collecting\":");
  Serial.print(collecting ? "true" : "false");
  Serial.print(",\"left_kg\":");
  Serial.print(leftKg, 3);
  Serial.print(",\"right_kg\":");
  Serial.print(rightKg, 3);
  Serial.println(",\"message\":\"status_tensao_raios\"}");
}
