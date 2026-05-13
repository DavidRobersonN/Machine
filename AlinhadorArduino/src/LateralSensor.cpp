#include "LateralSensor.h"

const float MAX_SENSOR_STEP_PER_READ_MM = 3.0;

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
  lastFilteredSensorMm = 0.0;
  hasFilteredSensorMm = false;

  filterWindowIndex = 0;
  filterWindowCount = 0;

  for (int index = 0; index < FILTER_WINDOW_SIZE; index++) {
    filterWindow[index] = 0.0;
  }
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
  resetFilter();

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

void LateralSensor::resetFilter() {
  filterWindowIndex = 0;
  filterWindowCount = 0;
  hasFilteredSensorMm = false;
  lastFilteredSensorMm = 0.0;

  for (int index = 0; index < FILTER_WINDOW_SIZE; index++) {
    filterWindow[index] = 0.0;
  }
}

float LateralSensor::readRawMm() {
  int raw = analogRead(sensorPin);

  float positionMm = ((raw / 1023.0) * sensorRangeMm) - sensorHalfRangeMm;

  return positionMm;
}

float LateralSensor::calculateMedian(float sample) {
  filterWindow[filterWindowIndex] = sample;
  filterWindowIndex = (filterWindowIndex + 1) % FILTER_WINDOW_SIZE;

  if (filterWindowCount < FILTER_WINDOW_SIZE) {
    filterWindowCount++;
  }

  float values[FILTER_WINDOW_SIZE];

  for (int index = 0; index < filterWindowCount; index++) {
    values[index] = filterWindow[index];
  }

  for (int index = 1; index < filterWindowCount; index++) {
    float currentValue = values[index];
    int position = index - 1;

    while (position >= 0 && values[position] > currentValue) {
      values[position + 1] = values[position];
      position--;
    }

    values[position + 1] = currentValue;
  }

  int middleIndex = filterWindowCount / 2;

  if (filterWindowCount % 2 == 0) {
    return (values[middleIndex - 1] + values[middleIndex]) / 2.0;
  }

  return values[middleIndex];
}

float LateralSensor::limitSuddenJump(float value) {
  if (!hasFilteredSensorMm) {
    hasFilteredSensorMm = true;
    lastFilteredSensorMm = value;

    return value;
  }

  float delta = value - lastFilteredSensorMm;

  if (delta > MAX_SENSOR_STEP_PER_READ_MM) {
    value = lastFilteredSensorMm + MAX_SENSOR_STEP_PER_READ_MM;
  } else if (delta < -MAX_SENSOR_STEP_PER_READ_MM) {
    value = lastFilteredSensorMm - MAX_SENSOR_STEP_PER_READ_MM;
  }

  lastFilteredSensorMm = value;

  return value;
}

float LateralSensor::readMm() {
  float rawPositionMm = readRawMm();
  float medianPositionMm = calculateMedian(rawPositionMm);

  return limitSuddenJump(medianPositionMm);
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
