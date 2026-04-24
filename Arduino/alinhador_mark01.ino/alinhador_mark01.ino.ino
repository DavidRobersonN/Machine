/*
  ============================================================
  PROJETO: Alinhador - LED + Motor da Roda com AccelStepper
  ARQUIVO ÚNICO para usar no Arduino IDE
  ============================================================

  Comandos aceitos:

  LED:
  - LED_ON
  - LED_OFF
  - LED_STATUS

  TESTE:
  - PING

  MOTOR DA RODA:
  - MOTOR_RODA_START
  - MOTOR_RODA_STOP
  - MOTOR_RODA_SET_CLOCKWISE
  - MOTOR_RODA_SET_COUNTER_CLOCKWISE
  - MOTOR_RODA_INCREASE_SPEED
  - MOTOR_RODA_DECREASE_SPEED
  - MOTOR_RODA_SPEED_STATUS
*/

#include <AccelStepper.h>

// =======================
// PINOS
// =======================

const int LED_PIN = LED_BUILTIN;

// Driver STEP/DIR
const int MOTOR_RODA_STEP_PIN = 31;
const int MOTOR_RODA_DIR_PIN = 32;

// =======================
// MOTOR COM ACCELSTEPPER
// =======================

// DRIVER = usa pino STEP + pino DIR
AccelStepper motorRoda(
  AccelStepper::DRIVER,
  MOTOR_RODA_STEP_PIN,
  MOTOR_RODA_DIR_PIN
);

// =======================
// CONFIGURAÇÕES DO MOTOR
// =======================

// Velocidade em passos por segundo.
// Ajuste esses valores conforme seu motor/driver/fonte.
const float MOTOR_RODA_MIN_SPEED = 100.0;
const float MOTOR_RODA_MAX_SPEED = 2000.0;
const float MOTOR_RODA_SPEED_STEP = 100.0;

// Aceleração em passos por segundo ao quadrado.
const float MOTOR_RODA_ACCELERATION = 800.0;

// Velocidade inicial.
float motorRodaSpeed = 500.0;

// Indica se o motor está rodando.
bool motorRodaRunning = false;

// true = horário
// false = anti-horário
bool motorRodaClockwise = true;

// =======================
// ESTADOS
// =======================

bool ledState = false;

// Buffer da serial
String inputBuffer = "";

void setup() {
  Serial.begin(9600);

  pinMode(LED_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  ledState = false;

  motorRoda.setMaxSpeed(MOTOR_RODA_MAX_SPEED);
  motorRoda.setAcceleration(MOTOR_RODA_ACCELERATION);
  motorRoda.setSpeed(motorRodaSpeed);

  delay(300);

  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"Arduino iniciado com AccelStepper\"}");
}

void loop() {
  readSerialCommands();
  updateMotorRoda();
}

/*
  ------------------------------------------------------------
  Lê comandos da serial.
  ------------------------------------------------------------
*/
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

/*
  ------------------------------------------------------------
  Interpreta comandos recebidos.
  ------------------------------------------------------------
*/
void handleCommand(String command) {
  command.trim();

  // =======================
  // LED
  // =======================

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

  // =======================
  // TESTE
  // =======================

  if (command == "PING") {
    sendPong();
    return;
  }

  // =======================
  // MOTOR DA RODA
  // =======================

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

/*
  ------------------------------------------------------------
  Atualiza o motor.

  Aqui está a parte mais importante:
  o runSpeed() precisa ser chamado o tempo todo no loop().
  ------------------------------------------------------------
*/
void updateMotorRoda() {
  if (!motorRodaRunning) {
    return;
  }

  motorRoda.runSpeed();
}

/*
  ------------------------------------------------------------
  MOTOR DA RODA
  ------------------------------------------------------------
*/
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

/*
  ------------------------------------------------------------
  VELOCIDADE DO MOTOR
  ------------------------------------------------------------
*/
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

/*
  ------------------------------------------------------------
  LED
  ------------------------------------------------------------
*/
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

/*
  ------------------------------------------------------------
  PING
  ------------------------------------------------------------
*/
void sendPong() {
  Serial.println("{\"success\":true,\"type\":\"pong\",\"message\":\"Arduino conectado\"}");
}

/*
  ------------------------------------------------------------
  ERRO
  ------------------------------------------------------------
*/
void sendUnknownCommandError(String command) {
  Serial.print("{\"success\":false,\"type\":\"error\",\"message\":\"Comando desconhecido: ");
  Serial.print(command);
  Serial.println("\"}");
}