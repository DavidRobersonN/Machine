#include "Led.h"

Led::Led(int ledPin) {
  pin = ledPin;
  ledState = false;
}

void Led::begin() {
  pinMode(pin, OUTPUT);

  digitalWrite(pin, LOW);
  ledState = false;
}

void Led::turnOn() {
  digitalWrite(pin, HIGH);
  ledState = true;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"led_ligado\"}");
}

void Led::turnOff() {
  digitalWrite(pin, LOW);
  ledState = false;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"led_desligado\"}");
}

bool Led::isOn() const {
  return ledState;
}

void Led::sendStatus() {
  if (ledState) {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"led_atualmente_ligado\"}");
  } else {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"led_atualmente_desligado\"}");
  }
}