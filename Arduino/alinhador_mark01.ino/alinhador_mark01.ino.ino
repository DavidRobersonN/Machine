#include <AccelStepper.h>

// =======================
// PINOS
// =======================

const int LED_PIN = LED_BUILTIN;

// Sensor lateral
const int LATERAL_SENSOR_PIN = A0;

// Driver STEP/DIR
const int MOTOR_RODA_STEP_PIN = 31;
const int MOTOR_RODA_DIR_PIN = 32;

// =======================
// MOTOR COM ACCELSTEPPER
// =======================

AccelStepper motorRoda(
  AccelStepper::DRIVER,
  MOTOR_RODA_STEP_PIN,
  MOTOR_RODA_DIR_PIN
);

// =======================
// CONFIGURAÇÕES DO MOTOR
// =======================

const float MOTOR_RODA_MIN_SPEED = 100.0;
const float MOTOR_RODA_MAX_SPEED = 2000.0;
const float MOTOR_RODA_SPEED_STEP = 100.0;
const float MOTOR_RODA_ACCELERATION = 800.0;

float motorRodaSpeed = 500.0;
bool motorRodaRunning = false;
bool motorRodaClockwise = true;

// =======================
// SENSOR LATERAL
// =======================

// 20 ms = aproximadamente 50 leituras/envios por segundo.
// Para testar velocidade, deixamos baixo.
const unsigned long SENSOR_INTERVAL = 20;

unsigned long lastSensorReadTime = 0;

// O sensor vai de:
// RAW 0    = -15 mm
// RAW 1023 = +15 mm
const float SENSOR_RANGE_MM = 30.0;
const float SENSOR_HALF_RANGE_MM = SENSOR_RANGE_MM / 2.0;

float lastSentSensorMm = 999.0;

// =======================
// ESTADOS
// =======================

bool ledState = false;
String inputBuffer = "";

// =======================
// SETUP
// =======================

void setup() {
  Serial.begin(9600);

  pinMode(LED_PIN, OUTPUT);
  pinMode(LATERAL_SENSOR_PIN, INPUT);

  digitalWrite(LED_PIN, LOW);
  ledState = false;

  motorRoda.setMaxSpeed(MOTOR_RODA_MAX_SPEED);
  motorRoda.setAcceleration(MOTOR_RODA_ACCELERATION);
  motorRoda.setSpeed(motorRodaSpeed);

  delay(300);

  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"Arduino iniciado com sensor lateral\"}");
}

// =======================
// LOOP
// =======================

void loop() {
  readSerialCommands();
  updateMotorRoda();
  updateLateralSensor();
}

// =======================
// SENSOR LATERAL
// =======================

float readLateralSensorMm() {
  int raw = analogRead(LATERAL_SENSOR_PIN);

  float positionMm = ((raw / 1023.0) * SENSOR_RANGE_MM) - SENSOR_HALF_RANGE_MM;

  return positionMm;
}

void updateLateralSensor() {
  unsigned long now = millis();

  if (now - lastSensorReadTime < SENSOR_INTERVAL) {
    return;
  }

  lastSensorReadTime = now;

  float positionMm = readLateralSensorMm();

  lastSentSensorMm = positionMm;

  Serial.print("POS:");
  Serial.println(positionMm, 2);
}

void sendLateralSensorNow() {
  float positionMm = readLateralSensorMm();

  Serial.print("POS:");
  Serial.println(positionMm, 2);
}

// =======================
// SERIAL
// =======================

void readSerialCommands() {
  while (Serial.available() > 0) {
    char receivedChar = Serial.read();

    if (receivedChar == '\r') {
      continue;
    }

    if (receivedChar == '\n') {
      inputBuffer.trim();

      if (inputBuffer.length() > 0) {
        handleCommand(inputBuffer);
      }

      inputBuffer = "";
    } else {
      inputBuffer += receivedChar;
    }
  }
}

void handleCommand(String command) {
  command.trim();

  if (command == "LED_ON") {
    turnLedOn();
    return;
  }

  if (command == "LED_OFF") {
    turnLedOff();
    return;
  }

  if (command == "LED_STATUS") {
    sendLedStatus();
    return;
  }

  if (command == "PING") {
    sendPong();
    return;
  }

  if (command == "READ_LATERAL_SENSOR") {
    sendLateralSensorNow();
    return;
  }

  if (command == "MOTOR_RODA_START") {
    startMotorRoda();
    return;
  }

  if (command == "MOTOR_RODA_STOP") {
    stopMotorRoda();
    return;
  }

  if (command == "MOTOR_RODA_SET_CLOCKWISE") {
    setMotorRodaClockwise();
    return;
  }

  if (command == "MOTOR_RODA_SET_COUNTER_CLOCKWISE") {
    setMotorRodaCounterClockwise();
    return;
  }

  if (command == "MOTOR_RODA_INCREASE_SPEED") {
    increaseMotorRodaSpeed();
    return;
  }

  if (command == "MOTOR_RODA_DECREASE_SPEED") {
    decreaseMotorRodaSpeed();
    return;
  }

  if (command == "MOTOR_RODA_SPEED_STATUS") {
    sendMotorRodaSpeedStatus();
    return;
  }

  sendUnknownCommandError(command);
}

// =======================
// MOTOR
// =======================

void updateMotorRoda() {
  if (!motorRodaRunning) {
    return;
  }

  motorRoda.runSpeed();
}

void startMotorRoda() {
  motorRodaRunning = true;
  applyMotorRodaSpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"RUNNING\",\"speed\":");
  Serial.print(motorRodaSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateMotorRodaSpeedPercent());
  Serial.println(",\"message\":\"Motor da roda iniciado\"}");
}

void stopMotorRoda() {
  motorRodaRunning = false;
  motorRoda.setSpeed(0);

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"STOPPED\",\"speed\":");
  Serial.print(motorRodaSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateMotorRodaSpeedPercent());
  Serial.println(",\"message\":\"Motor da roda parado\"}");
}

void setMotorRodaClockwise() {
  motorRodaClockwise = true;
  applyMotorRodaSpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"CLOCKWISE\",\"speed\":");
  Serial.print(motorRodaSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateMotorRodaSpeedPercent());
  Serial.println(",\"message\":\"Motor da roda definido para sentido horario\"}");
}

void setMotorRodaCounterClockwise() {
  motorRodaClockwise = false;
  applyMotorRodaSpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"COUNTER_CLOCKWISE\",\"speed\":");
  Serial.print(motorRodaSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateMotorRodaSpeedPercent());
  Serial.println(",\"message\":\"Motor da roda definido para sentido anti-horario\"}");
}

void increaseMotorRodaSpeed() {
  motorRodaSpeed += MOTOR_RODA_SPEED_STEP;

  if (motorRodaSpeed > MOTOR_RODA_MAX_SPEED) {
    motorRodaSpeed = MOTOR_RODA_MAX_SPEED;
  }

  applyMotorRodaSpeed();
  sendMotorRodaSpeedStatusMessage("Velocidade do motor da roda aumentada");
}

void decreaseMotorRodaSpeed() {
  motorRodaSpeed -= MOTOR_RODA_SPEED_STEP;

  if (motorRodaSpeed < MOTOR_RODA_MIN_SPEED) {
    motorRodaSpeed = MOTOR_RODA_MIN_SPEED;
  }

  applyMotorRodaSpeed();
  sendMotorRodaSpeedStatusMessage("Velocidade do motor da roda diminuida");
}

void applyMotorRodaSpeed() {
  float finalSpeed = motorRodaSpeed;

  if (!motorRodaClockwise) {
    finalSpeed = -motorRodaSpeed;
  }

  if (motorRodaRunning) {
    motorRoda.setSpeed(finalSpeed);
  }
}

void sendMotorRodaSpeedStatus() {
  sendMotorRodaSpeedStatusMessage("Status da velocidade do motor da roda");
}

void sendMotorRodaSpeedStatusMessage(String message) {
  Serial.print("{\"success\":true,\"type\":\"motor_roda_speed_status\",\"speed\":");
  Serial.print(motorRodaSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateMotorRodaSpeedPercent());
  Serial.print(",\"min_speed\":");
  Serial.print(MOTOR_RODA_MIN_SPEED);
  Serial.print(",\"max_speed\":");
  Serial.print(MOTOR_RODA_MAX_SPEED);
  Serial.print(",\"message\":\"");
  Serial.print(message);
  Serial.println("\"}");
}

int calculateMotorRodaSpeedPercent() {
  float range = MOTOR_RODA_MAX_SPEED - MOTOR_RODA_MIN_SPEED;
  float currentPosition = motorRodaSpeed - MOTOR_RODA_MIN_SPEED;

  int percent = (currentPosition * 100.0) / range;

  if (percent < 0) {
    percent = 0;
  }

  if (percent > 100) {
    percent = 100;
  }

  return percent;
}

// =======================
// LED
// =======================

void turnLedOn() {
  digitalWrite(LED_PIN, HIGH);
  ledState = true;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"LED ligado\"}");
}

void turnLedOff() {
  digitalWrite(LED_PIN, LOW);
  ledState = false;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"LED desligado\"}");
}

void sendLedStatus() {
  if (ledState) {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"LED atualmente ligado\"}");
  } else {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"LED atualmente desligado\"}");
  }
}

// =======================
// PING
// =======================

void sendPong() {
  Serial.println("{\"success\":true,\"type\":\"pong\",\"message\":\"Arduino conectado\"}");
}

// =======================
// ERRO
// =======================

void sendUnknownCommandError(String command) {
  Serial.print("{\"success\":false,\"type\":\"error\",\"message\":\"Comando desconhecido: ");
  Serial.print(command);
  Serial.println("\"}");
}