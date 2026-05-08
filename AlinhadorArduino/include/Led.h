#ifndef LED_H
#define LED_H

#include <Arduino.h>

class Led {
private:
  int pin;
  bool ledState;

public:
  Led(int ledPin);

  void begin();

  void turnOn();
  void turnOff();

  bool isOn() const;

  void sendStatus();
};

#endif