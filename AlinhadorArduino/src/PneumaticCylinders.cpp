#include "PneumaticCylinders.h"

PneumaticCylinders::PneumaticCylinders(
  int spokeTensionLeftPin,
  int spokeTensionRightPin,
  int nippleArmLeftPin,
  int nippleArmRightPin,
  int nippleLiftLeftPin,
  int nippleLiftRightPin
) {
  pins[0] = spokeTensionLeftPin;
  pins[1] = spokeTensionRightPin;
  pins[2] = nippleArmLeftPin;
  pins[3] = nippleArmRightPin;
  pins[4] = nippleLiftLeftPin;
  pins[5] = nippleLiftRightPin;

  for (int index = 0; index < CYLINDER_COUNT; index++) {
    extended[index] = false;
  }
}

void PneumaticCylinders::begin() {
  for (int index = 0; index < CYLINDER_COUNT; index++) {
    pinMode(pins[index], OUTPUT);
    writeCylinder(index, false);
  }

  Serial.println("{\"success\":true,\"type\":\"pneumatic_cylinders_status\",\"message\":\"cilindros_pneumaticos_iniciados\"}");
}

int PneumaticCylinders::getCylinderIndex(String cylinderId) {
  cylinderId.trim();

  for (int index = 0; index < CYLINDER_COUNT; index++) {
    if (cylinderId == ids[index]) {
      return index;
    }
  }

  return -1;
}

void PneumaticCylinders::writeCylinder(int index, bool shouldExtend) {
  extended[index] = shouldExtend;
  digitalWrite(pins[index], shouldExtend ? HIGH : LOW);
}

void PneumaticCylinders::setPin(String cylinderId, int pin) {
  int index = getCylinderIndex(cylinderId);

  if (index < 0) {
    Serial.print("{\"success\":false,\"type\":\"pneumatic_cylinder_config_status\",\"message\":\"cilindro_invalido\",\"cylinder\":\"");
    Serial.print(cylinderId);
    Serial.println("\"}");
    return;
  }

  if (pin < 0) {
    Serial.print("{\"success\":false,\"type\":\"pneumatic_cylinder_config_status\",\"message\":\"pino_invalido\",\"cylinder\":\"");
    Serial.print(cylinderId);
    Serial.println("\"}");
    return;
  }

  pinMode(pins[index], INPUT);

  pins[index] = pin;

  pinMode(pins[index], OUTPUT);
  writeCylinder(index, extended[index]);

  Serial.print("{\"success\":true,\"type\":\"pneumatic_cylinder_config_status\",\"message\":\"pino_atualizado\",\"cylinder\":\"");
  Serial.print(ids[index]);
  Serial.print("\",\"pin\":");
  Serial.print(pins[index]);
  Serial.println("}");
}

void PneumaticCylinders::move(String cylinderId, String action) {
  int index = getCylinderIndex(cylinderId);

  if (index < 0) {
    Serial.print("{\"success\":false,\"type\":\"pneumatic_cylinder_status\",\"message\":\"cilindro_invalido\",\"cylinder\":\"");
    Serial.print(cylinderId);
    Serial.println("\"}");
    return;
  }

  action.trim();
  action.toUpperCase();

  if (action == "EXTEND") {
    writeCylinder(index, true);
    sendStatusForIndex(index, "cilindro_acionado");
    return;
  }

  if (action == "RETRACT") {
    writeCylinder(index, false);
    sendStatusForIndex(index, "cilindro_recuado");
    return;
  }

  Serial.print("{\"success\":false,\"type\":\"pneumatic_cylinder_status\",\"message\":\"acao_invalida\",\"cylinder\":\"");
  Serial.print(ids[index]);
  Serial.print("\",\"action\":\"");
  Serial.print(action);
  Serial.println("\"}");
}

void PneumaticCylinders::retractAll() {
  for (int index = 0; index < CYLINDER_COUNT; index++) {
    writeCylinder(index, false);
  }

  Serial.println("{\"success\":true,\"type\":\"pneumatic_cylinders_status\",\"message\":\"todos_os_cilindros_recuados\"}");
}

void PneumaticCylinders::sendStatusForIndex(int index, String message) {
  Serial.print("{\"success\":true,\"type\":\"pneumatic_cylinder_status\",\"message\":\"");
  Serial.print(message);
  Serial.print("\",\"cylinder\":\"");
  Serial.print(ids[index]);
  Serial.print("\",\"pin\":");
  Serial.print(pins[index]);
  Serial.print(",\"extended\":");
  Serial.print(extended[index] ? "true" : "false");
  Serial.println("}");
}

void PneumaticCylinders::sendStatus() {
  Serial.print("{\"success\":true,\"type\":\"pneumatic_cylinders_status\",\"cylinders\":[");

  for (int index = 0; index < CYLINDER_COUNT; index++) {
    if (index > 0) {
      Serial.print(",");
    }

    Serial.print("{\"id\":\"");
    Serial.print(ids[index]);
    Serial.print("\",\"pin\":");
    Serial.print(pins[index]);
    Serial.print(",\"extended\":");
    Serial.print(extended[index] ? "true" : "false");
    Serial.print("}");
  }

  Serial.println("]}");
}
