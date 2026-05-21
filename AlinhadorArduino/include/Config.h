#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// =======================
// PINOS
// =======================

const int LED_PIN = LED_BUILTIN;

// Sensor lateral
const int LATERAL_SENSOR_PIN = A0;

// Driver STEP/DIR do motor da roda
const int MOTOR_RODA_STEP_PIN = 31;
const int MOTOR_RODA_DIR_PIN = 32;

// Sensores HX711 para tensão dos raios
const int SPOKE_TENSION_LEFT_DOUT_PIN = 3;
const int SPOKE_TENSION_LEFT_SCK_PIN = 2;
const int SPOKE_TENSION_RIGHT_DOUT_PIN = 5;
const int SPOKE_TENSION_RIGHT_SCK_PIN = 4;

// =======================
// CONFIGURAÇÕES DO MOTOR
// =======================

const float MOTOR_RODA_MIN_SPEED = 50.0;
const float MOTOR_RODA_MAX_SPEED = 1000.0;
const float MOTOR_RODA_SPEED_STEP = 100.0;
const float MOTOR_RODA_ACCELERATION = 800.0;
const float MOTOR_RODA_INITIAL_SPEED = 50.0;

// =======================
// CONFIGURAÇÕES DE POSIÇÃO DA RODA
// =======================

// Sua roda tem 36 raios.
const int MOTOR_RODA_TOTAL_SPOKES = 36;

// Valor inicial para teste.
// Exemplo comum: motor 200 passos/volta com driver em 16 microsteps:
// 200 * 16 = 3200 passos por volta.
//
// Se tiver redução, polia ou engrenagem, esse valor precisa ser calibrado.
const long MOTOR_RODA_STEPS_PER_WHEEL_REVOLUTION = 3200;

// =======================
// CONFIGURAÇÕES DO SENSOR LATERAL
// =======================

// 20 ms = aproximadamente 50 leituras/envios por segundo.
const unsigned long SENSOR_INTERVAL = 20;

// O sensor vai de:
// RAW 0    = -15 mm
// RAW 1023 = +15 mm
const float SENSOR_RANGE_MM = 30.0;
const float SENSOR_HALF_RANGE_MM = SENSOR_RANGE_MM / 2.0;

// =======================
// CONFIGURAÇÕES DO HX711
// =======================

const unsigned long SPOKE_TENSION_INTERVAL = 80;
const float SPOKE_TENSION_LEFT_CALIBRATION_FACTOR = -7050.0;
const float SPOKE_TENSION_RIGHT_CALIBRATION_FACTOR = -7050.0;

#endif
