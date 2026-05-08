#ifndef LATERAL_SENSOR_H
#define LATERAL_SENSOR_H

#include <Arduino.h>

class LateralSensor {
private:
  int sensorPin;

  unsigned long interval;
  unsigned long lastReadTime;

  float sensorRangeMm;
  float sensorHalfRangeMm;

  bool readingEnabled;
  float lastSentSensorMm;

public:
  LateralSensor(
    int pin,
    unsigned long readInterval,
    float rangeMm
  );

  void begin();

  void update();

  void startReading();
  void stopReading();

  bool isReadingEnabled() const;

  float readMm();

  void sendNow();
  void sendStatus(bool enabled);
};

#endif