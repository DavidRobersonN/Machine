/*
  ============================================================
  PROJETO: Alinhador - Controle inicial do LED + Motor da Roda
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
*/

// =======================
// PINOS
// =======================

const int LED_PIN = LED_BUILTIN;

// Ajuste esses pinos conforme sua ligação no driver do motor.
const int MOTOR_RODA_STEP_PIN = 2;
const int MOTOR_RODA_DIR_PIN = 3;

// =======================
// ESTADOS
// =======================

bool ledState = false;

// Indica se o motor da roda está girando ou parado.
bool motorRodaRunning = false;

// Guarda o sentido atual do motor.
// true = horário
// false = anti-horário
bool motorRodaClockwise = true;

// Controle de velocidade do motor.
// Quanto menor o intervalo, mais rápido o motor gira.
unsigned long motorRodaStepIntervalMicros = 800;

// Guarda o último momento em que um passo foi dado.
unsigned long lastMotorRodaStepMicros = 0;

// Estado atual do pulso STEP.
// Usamos isso para alternar HIGH/LOW sem travar o Arduino.
bool motorRodaStepState = LOW;

// String usada para acumular os caracteres recebidos pela serial.
String inputBuffer = "";

void setup() {
  Serial.begin(9600);

  pinMode(LED_PIN, OUTPUT);

  pinMode(MOTOR_RODA_STEP_PIN, OUTPUT);
  pinMode(MOTOR_RODA_DIR_PIN, OUTPUT);

  digitalWrite(LED_PIN, LOW);
  ledState = false;

  digitalWrite(MOTOR_RODA_STEP_PIN, LOW);
  digitalWrite(MOTOR_RODA_DIR_PIN, HIGH);

  motorRodaRunning = false;
  motorRodaClockwise = true;

  delay(300);

  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"Arduino iniciado com sucesso\"}");
}

void loop() {
  readSerialCommands();
  updateMotorRoda();
}

/*
  ------------------------------------------------------------
  Lê a serial caractere por caractere.
  Quando encontra '\n', processa o comando completo.
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
  Interpreta o comando recebido.
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
  // TESTE DE CONEXÃO
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

  sendUnknownCommandError(command);
}

/*
  ------------------------------------------------------------
  Atualiza o motor da roda sem travar o loop.
  
  Isso é importante porque, mesmo com o motor girando,
  o Arduino continua conseguindo ler novos comandos da serial.
  ------------------------------------------------------------
*/
void updateMotorRoda() {
  if (!motorRodaRunning) {
    return;
  }

  unsigned long currentMicros = micros();

  if (currentMicros - lastMotorRodaStepMicros >= motorRodaStepIntervalMicros) {
    lastMotorRodaStepMicros = currentMicros;

    motorRodaStepState = !motorRodaStepState;

    digitalWrite(MOTOR_RODA_STEP_PIN, motorRodaStepState);
  }
}

/*
  ------------------------------------------------------------
  MOTOR DA RODA
  ------------------------------------------------------------
*/
void startMotorRoda() {
  motorRodaRunning = true;
  lastMotorRodaStepMicros = micros();

  Serial.println("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"RUNNING\",\"message\":\"Motor da roda iniciado\"}");
}

void stopMotorRoda() {
  motorRodaRunning = false;
  motorRodaStepState = LOW;

  digitalWrite(MOTOR_RODA_STEP_PIN, LOW);

  Serial.println("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"STOPPED\",\"message\":\"Motor da roda parado\"}");
}

void setMotorRodaClockwise() {
  motorRodaClockwise = true;

  digitalWrite(MOTOR_RODA_DIR_PIN, HIGH);

  Serial.println("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"CLOCKWISE\",\"message\":\"Motor da roda definido para sentido horario\"}");
}

void setMotorRodaCounterClockwise() {
  motorRodaClockwise = false;

  digitalWrite(MOTOR_RODA_DIR_PIN, LOW);

  Serial.println("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"COUNTER_CLOCKWISE\",\"message\":\"Motor da roda definido para sentido anti-horario\"}");
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