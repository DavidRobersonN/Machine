#include <Arduino.h>

#include "Config.h"
#include "Led.h"
#include "LateralSensor.h"
#include "MotorRoda.h"
#include "SerialCommandHandler.h"

// =======================
// OBJETOS DO SISTEMA
// =======================

Led led(LED_PIN);

LateralSensor lateralSensor(
  LATERAL_SENSOR_PIN,
  SENSOR_INTERVAL,
  SENSOR_RANGE_MM
);

MotorRoda motorRoda(
  MOTOR_RODA_STEP_PIN,
  MOTOR_RODA_DIR_PIN,
  MOTOR_RODA_MIN_SPEED,
  MOTOR_RODA_MAX_SPEED,
  MOTOR_RODA_SPEED_STEP,
  MOTOR_RODA_ACCELERATION,
  MOTOR_RODA_INITIAL_SPEED,
  MOTOR_RODA_TOTAL_SPOKES,
  MOTOR_RODA_STEPS_PER_WHEEL_REVOLUTION
);

SerialCommandHandler serialCommandHandler(
  led,
  lateralSensor,
  motorRoda
);

// =======================
// SETUP
// =======================

void setup() {
  Serial.begin(9600);

  led.begin();
  lateralSensor.begin();
  motorRoda.begin();

  delay(300);

  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"arduino_iniciado_com_sensor_lateral\"}");
  Serial.flush();
}

// =======================
// LOOP
// =======================

void loop() {
  serialCommandHandler.update();

  motorRoda.update();

  lateralSensor.update();
}