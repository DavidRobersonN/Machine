#include <Arduino.h>

#include "Config.h"
#include "Led.h"
#include "LateralSensor.h"
#include "MotorRoda.h"
#include "SerialCommandHandler.h"
#include "SpokeTensionSensor.h"

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

SpokeTensionSensor spokeTensionSensor(
  SPOKE_TENSION_LEFT_DOUT_PIN,
  SPOKE_TENSION_LEFT_SCK_PIN,
  SPOKE_TENSION_RIGHT_DOUT_PIN,
  SPOKE_TENSION_RIGHT_SCK_PIN,
  SPOKE_TENSION_INTERVAL,
  SPOKE_TENSION_LEFT_CALIBRATION_FACTOR,
  SPOKE_TENSION_RIGHT_CALIBRATION_FACTOR
);

SerialCommandHandler serialCommandHandler(
  led,
  lateralSensor,
  motorRoda,
  spokeTensionSensor
);

// =======================
// SETUP
// =======================

void setup() {
  Serial.begin(9600);

  led.begin();
  lateralSensor.begin();
  motorRoda.begin();
  spokeTensionSensor.begin();

  delay(300);

  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"arduino_iniciado_com_sensor_lateral_e_hx711\"}");
  Serial.flush();
}

// =======================
// LOOP
// =======================

void loop() {
  serialCommandHandler.update();

  motorRoda.update();

  lateralSensor.update();

  spokeTensionSensor.update();
}
