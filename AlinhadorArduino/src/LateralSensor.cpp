#include "LateralSensor.h"

LateralSensor::LateralSensor(
  int pin,
  unsigned long readInterval,
  float rangeMm
) {
  sensorPin = pin;
  interval = readInterval;

  sensorRangeMm = rangeMm;
  sensorHalfRangeMm = rangeMm / 2.0;

  lastReadTime = 0;
  readingEnabled = false;
  lastSentSensorMm = 999.0;
}

void LateralSensor::begin() {
  pinMode(sensorPin, INPUT);
}

void LateralSensor::update() {
  if (!readingEnabled) {
    return;
  }

  unsigned long now = millis();

  if (now - lastReadTime < interval) {
    return;
  }

  lastReadTime = now;

  float positionMm = readMm();

  lastSentSensorMm = positionMm;

  Serial.print("POS:");
  Serial.println(positionMm, 2);
}

void LateralSensor::startReading() {
  // Primeiro envia o status para o Django.
  sendStatus(true);

  // Pequena pausa para evitar mistura entre JSON e POS.
  delay(100);

  // Depois libera o envio contínuo.
  readingEnabled = true;
  lastReadTime = millis();
}

void LateralSensor::stopReading() {
  // Para imediatamente o envio contínuo.
  readingEnabled = false;

  // Depois informa o status.
  sendStatus(false);
}

bool LateralSensor::isReadingEnabled() const {
  return readingEnabled;
}

float LateralSensor::readMm() {
  int raw = analogRead(sensorPin);

  float positionMm = ((raw / 1023.0) * sensorRangeMm) - sensorHalfRangeMm;

  return positionMm;
}

void LateralSensor::sendNow() {
  float positionMm = readMm();

  Serial.print("POS:");
  Serial.println(positionMm, 2);
}

void LateralSensor::sendStatus(bool enabled) {
  if (enabled) {
    Serial.println("{\"type\":\"lateral_sensor_status\",\"reading_enabled\":true,\"message\":\"leitura_lateral_iniciada\"}");
  } else {
    Serial.println("{\"type\":\"lateral_sensor_status\",\"reading_enabled\":false,\"message\":\"leitura_lateral_parada\"}");
  }

  Serial.flush();
}