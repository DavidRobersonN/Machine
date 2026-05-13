#ifndef LATERAL_SENSOR_H
#define LATERAL_SENSOR_H

#include <Arduino.h>

class LateralSensor {
private:
  static const int FILTER_WINDOW_SIZE = 5;

  int sensorPin;

  unsigned long interval;
  unsigned long lastReadTime;

  float sensorRangeMm;
  float sensorHalfRangeMm;

  bool readingEnabled;
  float lastSentSensorMm;
  float lastFilteredSensorMm;
  bool hasFilteredSensorMm;

  float filterWindow[FILTER_WINDOW_SIZE];
  int filterWindowIndex;
  int filterWindowCount;

  void resetFilter();
  float readRawMm();
  float calculateMedian(float sample);
  float limitSuddenJump(float value);

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
