/*
  ============================================================
  PROJETO: Alinhador - Controle inicial apenas do LED
  ARQUIVO ÚNICO para usar no Arduino IDE
  ============================================================

  O que este código faz:
  - abre comunicação serial com o computador
  - recebe comandos enviados pelo Django
  - liga ou desliga o LED da placa
  - responde de volta pela serial

  Comandos aceitos:
  - LED_ON
  - LED_OFF
  - LED_STATUS
  - PING

  Respostas:
  - {"success":true,"type":"led_status","state":"ON","message":"LED ligado"}
  - {"success":true,"type":"led_status","state":"OFF","message":"LED desligado"}
  - {"success":true,"type":"pong","message":"Arduino conectado"}
  - {"success":false,"type":"error","message":"Comando desconhecido"}

  Observação:
  - usamos LED_BUILTIN, que normalmente é o LED interno da placa
  - em muitos Arduinos esse LED fica no pino 13
*/

const int LED_PIN = LED_BUILTIN;

// Guarda o estado atual do LED em memória.
// Isso facilita responder ao comando LED_STATUS.
bool ledState = false;

// String usada para acumular os caracteres recebidos pela serial.
// Vamos ler até encontrar a quebra de linha \n.
String inputBuffer = "";

void setup() {
  // Inicia a comunicação serial.
  // Use a mesma velocidade configurada no backend, se ele depender disso.
  Serial.begin(9600);

  // Define o pino do LED como saída.
  pinMode(LED_PIN, OUTPUT);

  // Garante que o LED comece desligado.
  digitalWrite(LED_PIN, LOW);
  ledState = false;

  // Pequena pausa para estabilizar a serial.
  delay(300);

  // Mensagem inicial para confirmar que o Arduino subiu.
  Serial.println("{\"success\":true,\"type\":\"startup\",\"message\":\"Arduino iniciado com sucesso\"}");
}

void loop() {
  readSerialCommands();
}

/*
  ------------------------------------------------------------
  Função responsável por ler a serial caractere por caractere.
  Quando encontra '\n', entende que um comando completo chegou.
  ------------------------------------------------------------
*/
void readSerialCommands() {
  while (Serial.available() > 0) {
    char receivedChar = Serial.read();

    // Ignora retorno de carro.
    // Isso ajuda quando o Serial Monitor envia \r\n.
    if (receivedChar == '\r') {
      continue;
    }

    // Quando chega a quebra de linha, processamos o comando.
    if (receivedChar == '\n') {
      inputBuffer.trim();

      // Só processa se houver algo escrito.
      if (inputBuffer.length() > 0) {
        handleCommand(inputBuffer);
      }

      // Limpa o buffer para o próximo comando.
      inputBuffer = "";
    } else {
      // Continua montando o comando recebido.
      inputBuffer += receivedChar;
    }
  }
}

/*
  ------------------------------------------------------------
  Interpreta o comando recebido e executa a ação correspondente.
  ------------------------------------------------------------
*/
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

  sendUnknownCommandError(command);
}

/*
  ------------------------------------------------------------
  Liga o LED e atualiza a variável de estado.
  Depois responde pela serial.
  ------------------------------------------------------------
*/
void turnLedOn() {
  digitalWrite(LED_PIN, HIGH);
  ledState = true;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"LED ligado\"}");
}

/*
  ------------------------------------------------------------
  Desliga o LED e atualiza a variável de estado.
  Depois responde pela serial.
  ------------------------------------------------------------
*/
void turnLedOff() {
  digitalWrite(LED_PIN, LOW);
  ledState = false;

  Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"LED desligado\"}");
}

/*
  ------------------------------------------------------------
  Envia o estado atual do LED.
  Esse comando é útil para o backend consultar o estado.
  ------------------------------------------------------------
*/
void sendLedStatus() {
  if (ledState) {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"ON\",\"message\":\"LED atualmente ligado\"}");
  } else {
    Serial.println("{\"success\":true,\"type\":\"led_status\",\"state\":\"OFF\",\"message\":\"LED atualmente desligado\"}");
  }
}

/*
  ------------------------------------------------------------
  Resposta simples para testar se o Arduino está conectado.
  ------------------------------------------------------------
*/
void sendPong() {
  Serial.println("{\"success\":true,\"type\":\"pong\",\"message\":\"Arduino conectado\"}");
}

/*
  ------------------------------------------------------------
  Resposta enviada quando o comando não existe.
  ------------------------------------------------------------
*/
void sendUnknownCommandError(String command) {
  Serial.print("{\"success\":false,\"type\":\"error\",\"message\":\"Comando desconhecido: ");
  Serial.print(command);
  Serial.println("\"}");
}