#ifndef SPOKE_TENSION_SENSOR_H
#define SPOKE_TENSION_SENSOR_H

#include <Arduino.h>
#include <HX711.h>

class SpokeTensionSensor {
private:
  HX711 leftScale;
  HX711 rightScale;

  int leftDoutPin;
  int leftSckPin;
  int rightDoutPin;
  int rightSckPin;

  unsigned long interval;
  unsigned long lastReadTime;

  float leftCalibrationFactor;
  float rightCalibrationFactor;

  bool collecting;

  float readLeftKg();
  float readRightKg();
  void sendValues(float leftKg, float rightKg);

public:
  SpokeTensionSensor(
    int leftDoutPin,
    int leftSckPin,
    int rightDoutPin,
    int rightSckPin,
    unsigned long interval,
    float leftCalibrationFactor,
    float rightCalibrationFactor
  );

  void begin();
  void update();

  void startCollection();
  void stopCollection();
  void tareLeft();
  void tareRight();
  void tareBoth();
  void setLeftCalibrationFactor(float factor);
  void setRightCalibrationFactor(float factor);
  void sendNow();
  void sendStatus();
};

#endif
