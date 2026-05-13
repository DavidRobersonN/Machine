#include "MotorRoda.h"

MotorRoda::MotorRoda(
  int stepPin,
  int dirPin,
  float motorMinSpeed,
  float motorMaxSpeed,
  float motorSpeedStep,
  float motorAcceleration,
  float initialSpeed,
  int wheelTotalSpokes,
  long wheelStepsPerRevolution
)
  : motor(AccelStepper::DRIVER, stepPin, dirPin)
{
  minSpeed = motorMinSpeed;
  maxSpeed = motorMaxSpeed;
  speedStep = motorSpeedStep;
  acceleration = motorAcceleration;

  currentSpeed = initialSpeed;

  clockwise = true;
  mode = MOTOR_RODA_STOPPED;

  totalSpokes = wheelTotalSpokes;
  stepsPerWheelRevolution = wheelStepsPerRevolution;

  currentWheelAngle = 0.0;
  targetWheelAngle = 0.0;

  currentSpoke = 1;
  targetSpoke = 1;

  lastPositionStatusMillis = 0;
  positionStatusIntervalMs = 100;

  recalculateWheelConfig();
}

void MotorRoda::recalculateWheelConfig() {
  if (totalSpokes < 1) {
    totalSpokes = 1;
  }

  if (stepsPerWheelRevolution < 1) {
    stepsPerWheelRevolution = 1;
  }

  degreesPerSpoke = 360.0 / totalSpokes;
  stepsPerDegree = stepsPerWheelRevolution / 360.0;

  currentWheelAngle = normalizeAngle(currentWheelAngle);
  targetWheelAngle = normalizeAngle(targetWheelAngle);

  currentSpoke = angleToSpoke(currentWheelAngle);
  targetSpoke = angleToSpoke(targetWheelAngle);
}

void MotorRoda::setTotalSpokes(int newTotalSpokes) {
  if (newTotalSpokes < 1) {
    sendConfigStatus("erro_total_de_raios_invalido");
    return;
  }

  totalSpokes = newTotalSpokes;

  recalculateWheelConfig();

  sendConfigStatus("total_de_raios_atualizado");
}

void MotorRoda::setStepsPerWheelRevolution(long newStepsPerWheelRevolution) {
  if (newStepsPerWheelRevolution < 1) {
    sendConfigStatus("erro_passos_por_volta_da_roda_invalido");
    return;
  }

  stepsPerWheelRevolution = newStepsPerWheelRevolution;

  recalculateWheelConfig();

  sendConfigStatus("passos_por_volta_da_roda_atualizado");
}

void MotorRoda::setMaxSpeed(float newMaxSpeed) {
  if (newMaxSpeed <= 0) {
    sendConfigStatus("erro_velocidade_maxima_invalida");
    return;
  }

  maxSpeed = newMaxSpeed;

  if (currentSpeed > maxSpeed) {
    currentSpeed = maxSpeed;
  }

  motor.setMaxSpeed(maxSpeed);
  applySpeed();

  sendConfigStatus("velocidade_maxima_atualizada");
}

void MotorRoda::setAcceleration(float newAcceleration) {
  if (newAcceleration <= 0) {
    sendConfigStatus("erro_aceleracao_invalida");
    return;
  }

  acceleration = newAcceleration;

  motor.setAcceleration(acceleration);

  sendConfigStatus("aceleracao_atualizada");
}

int MotorRoda::getTotalSpokes() const {
  return totalSpokes;
}

long MotorRoda::getStepsPerWheelRevolution() const {
  return stepsPerWheelRevolution;
}

float MotorRoda::getMaxSpeed() const {
  return maxSpeed;
}

float MotorRoda::getAcceleration() const {
  return acceleration;
}

float MotorRoda::getDegreesPerSpoke() const {
  return degreesPerSpoke;
}

float MotorRoda::getStepsPerDegree() const {
  return stepsPerDegree;
}

void MotorRoda::sendConfigStatus(String message) {
  Serial.print("{\"success\":true,\"type\":\"motor_roda_config_status\",\"message\":\"");
  Serial.print(message);
  Serial.print("\",\"total_spokes\":");
  Serial.print(totalSpokes);
  Serial.print(",\"steps_per_wheel_revolution\":");
  Serial.print(stepsPerWheelRevolution);
  Serial.print(",\"degrees_per_spoke\":");
  Serial.print(degreesPerSpoke, 4);
  Serial.print(",\"steps_per_degree\":");
  Serial.print(stepsPerDegree, 4);
  Serial.print(",\"max_speed\":");
  Serial.print(maxSpeed);
  Serial.print(",\"acceleration\":");
  Serial.print(acceleration);
  Serial.println("}");
}

void MotorRoda::begin() {
  motor.setMaxSpeed(maxSpeed);
  motor.setAcceleration(acceleration);
  motor.setSpeed(currentSpeed);

  motor.setCurrentPosition(0);
  updateCurrentWheelPositionFromMotor();
}

void MotorRoda::update() {
  if (mode == MOTOR_RODA_CONTINUOUS) {
    motor.runSpeed();
    updateCurrentWheelPositionFromMotor();

    unsigned long now = millis();

    if (now - lastPositionStatusMillis >= positionStatusIntervalMs) {
      lastPositionStatusMillis = now;
      sendCompactPositionStatus();
    }

    return;
  }

  if (mode == MOTOR_RODA_POSITIONING) {
    motor.run();

    if (motor.distanceToGo() == 0) {
      mode = MOTOR_RODA_STOPPED;

      currentWheelAngle = targetWheelAngle;
      currentSpoke = targetSpoke;

      sendPositionStatus("position_reached");
    }

    return;
  }
}

void MotorRoda::start() {
  mode = MOTOR_RODA_CONTINUOUS;
  applySpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"RUNNING\",\"speed\":");
  Serial.print(currentSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateSpeedPercent());
  Serial.println(",\"message\":\"motor_da_roda_iniciado\"}");
}

void MotorRoda::stop() {
  mode = MOTOR_RODA_STOPPED;
  motor.setSpeed(0);
  motor.stop();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"state\":\"STOPPED\",\"speed\":");
  Serial.print(currentSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateSpeedPercent());
  Serial.println(",\"message\":\"motor_da_roda_parado\"}");
}

void MotorRoda::setClockwise() {
  clockwise = true;
  applySpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"CLOCKWISE\",\"speed\":");
  Serial.print(currentSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateSpeedPercent());
  Serial.println(",\"message\":\"motor_da_roda_sentido_horario\"}");
}

void MotorRoda::setCounterClockwise() {
  clockwise = false;
  applySpeed();

  Serial.print("{\"success\":true,\"type\":\"motor_roda_status\",\"direction\":\"COUNTER_CLOCKWISE\",\"speed\":");
  Serial.print(currentSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateSpeedPercent());
  Serial.println(",\"message\":\"motor_da_roda_sentido_anti_horario\"}");
}

void MotorRoda::increaseSpeed() {
  currentSpeed += speedStep;

  if (currentSpeed > maxSpeed) {
    currentSpeed = maxSpeed;
  }

  applySpeed();

  sendSpeedStatusMessage("velocidade_do_motor_da_roda_aumentada");
}

void MotorRoda::decreaseSpeed() {
  currentSpeed -= speedStep;

  if (currentSpeed < minSpeed) {
    currentSpeed = minSpeed;
  }

  applySpeed();

  sendSpeedStatusMessage("velocidade_do_motor_da_roda_diminuida");
}

void MotorRoda::applySpeed() {
  float finalSpeed = currentSpeed;

  if (!clockwise) {
    finalSpeed = -currentSpeed;
  }

  if (mode == MOTOR_RODA_CONTINUOUS) {
    motor.setSpeed(finalSpeed);
  }
}

void MotorRoda::sendSpeedStatus() {
  sendSpeedStatusMessage("status_da_velocidade_do_motor_da_roda");
}

void MotorRoda::sendSpeedStatusMessage(String message) {
  Serial.print("{\"success\":true,\"type\":\"motor_roda_speed_status\",\"speed\":");
  Serial.print(currentSpeed);
  Serial.print(",\"speed_percent\":");
  Serial.print(calculateSpeedPercent());
  Serial.print(",\"min_speed\":");
  Serial.print(minSpeed);
  Serial.print(",\"max_speed\":");
  Serial.print(maxSpeed);
  Serial.print(",\"message\":\"");
  Serial.print(message);
  Serial.println("\"}");
}

int MotorRoda::calculateSpeedPercent() {
  float range = maxSpeed - minSpeed;
  float currentPosition = currentSpeed - minSpeed;

  int percent = (currentPosition * 100.0) / range;

  if (percent < 0) {
    percent = 0;
  }

  if (percent > 100) {
    percent = 100;
  }

  return percent;
}

bool MotorRoda::isRunning() const {
  return mode == MOTOR_RODA_CONTINUOUS;
}

bool MotorRoda::isClockwise() const {
  return clockwise;
}

float MotorRoda::getCurrentSpeed() const {
  return currentSpeed;
}

// =======================
// CONTROLE DE POSIÇÃO
// =======================

float MotorRoda::normalizeAngle(float angle) {
  while (angle < 0.0) {
    angle += 360.0;
  }

  while (angle >= 360.0) {
    angle -= 360.0;
  }

  return angle;
}

float MotorRoda::calculateShortestDelta(float targetAngle) {
  float delta = targetAngle - currentWheelAngle;

  while (delta > 180.0) {
    delta -= 360.0;
  }

  while (delta <= -180.0) {
    delta += 360.0;
  }

  return delta;
}

long MotorRoda::angleToSteps(float angle) {
  return round(angle * stepsPerDegree);
}

float MotorRoda::spokeToAngle(int spokeNumber) {
  if (spokeNumber < 1) {
    spokeNumber = 1;
  }

  if (spokeNumber > totalSpokes) {
    spokeNumber = totalSpokes;
  }

  return (spokeNumber - 1) * degreesPerSpoke;
}

int MotorRoda::angleToSpoke(float angle) {
  float normalizedAngle = normalizeAngle(angle);

  int spoke = round(normalizedAngle / degreesPerSpoke) + 1;

  if (spoke > totalSpokes) {
    spoke = 1;
  }

  if (spoke < 1) {
    spoke = 1;
  }

  return spoke;
}

void MotorRoda::setZero() {
  mode = MOTOR_RODA_STOPPED;

  motor.stop();
  motor.setCurrentPosition(0);

  currentWheelAngle = 0.0;
  targetWheelAngle = 0.0;

  currentSpoke = 1;
  targetSpoke = 1;

  sendPositionStatus("zero_set");
}

void MotorRoda::updateCurrentWheelPositionFromMotor() {
  long currentSteps = motor.currentPosition();
  float totalTurns = ((float) currentSteps) / stepsPerWheelRevolution;

  currentWheelAngle = normalizeAngle(totalTurns * 360.0);
  currentSpoke = angleToSpoke(currentWheelAngle);
}

void MotorRoda::goToAngle(float angle) {
  float normalizedTargetAngle = normalizeAngle(angle);
  float deltaAngle = calculateShortestDelta(normalizedTargetAngle);

  long relativeSteps = angleToSteps(deltaAngle);

  targetWheelAngle = normalizedTargetAngle;
  targetSpoke = angleToSpoke(normalizedTargetAngle);

  mode = MOTOR_RODA_POSITIONING;

  motor.move(relativeSteps);

  sendPositionStatus("moving_to_angle");
}

void MotorRoda::goToSpoke(int spokeNumber) {
  if (spokeNumber < 1) {
    spokeNumber = 1;
  }

  if (spokeNumber > totalSpokes) {
    spokeNumber = totalSpokes;
  }

  float angle = spokeToAngle(spokeNumber);

  targetSpoke = spokeNumber;

  goToAngle(angle);
}

void MotorRoda::goToNextSpoke() {
  int nextSpoke = currentSpoke + 1;

  if (nextSpoke > totalSpokes) {
    nextSpoke = 1;
  }

  goToSpoke(nextSpoke);
}

void MotorRoda::goToPreviousSpoke() {
  int previousSpoke = currentSpoke - 1;

  if (previousSpoke < 1) {
    previousSpoke = totalSpokes;
  }

  goToSpoke(previousSpoke);
}

void MotorRoda::sendCurrentPositionStatus() {
  updateCurrentWheelPositionFromMotor();
  sendPositionStatus("position_status");
}

void MotorRoda::sendPositionStatus(String status) {
  Serial.print("{\"success\":true,\"type\":\"motor_roda_position_status\",\"status\":\"");
  Serial.print(status);
  Serial.print("\",\"current_angle\":");
  Serial.print(currentWheelAngle, 2);
  Serial.print(",\"target_angle\":");
  Serial.print(targetWheelAngle, 2);
  Serial.print(",\"current_spoke\":");
  Serial.print(currentSpoke);
  Serial.print(",\"target_spoke\":");
  Serial.print(targetSpoke);
  Serial.print(",\"total_spokes\":");
  Serial.print(totalSpokes);
  Serial.print(",\"wheel_total_turns\":");
  Serial.print(getWheelTotalTurns(), 6);
  Serial.print(",\"is_running\":");

  if (mode == MOTOR_RODA_CONTINUOUS) {
    Serial.print("true");
  } else {
    Serial.print("false");
  }

  Serial.print(",\"is_positioning\":");

  if (mode == MOTOR_RODA_POSITIONING) {
    Serial.print("true");
  } else {
    Serial.print("false");
  }

  Serial.println("}");
}

void MotorRoda::sendCompactPositionStatus() {
  Serial.print("WHEEL_POS:");
  Serial.print(currentWheelAngle, 2);
  Serial.print(",");
  Serial.print(getWheelTotalTurns(), 6);
  Serial.print(",");
  Serial.print(currentSpoke);
  Serial.print(",");

  if (mode == MOTOR_RODA_CONTINUOUS) {
    Serial.print("1");
  } else {
    Serial.print("0");
  }

  Serial.print(",");

  if (mode == MOTOR_RODA_POSITIONING) {
    Serial.println("1");
  } else {
    Serial.println("0");
  }
}

float MotorRoda::getCurrentWheelAngle() const {
  return currentWheelAngle;
}

float MotorRoda::getWheelTotalTurns() {
  return ((float) motor.currentPosition()) / stepsPerWheelRevolution;
}

int MotorRoda::getCurrentSpoke() const {
  return currentSpoke;
}

bool MotorRoda::isPositioning() const {
  return mode == MOTOR_RODA_POSITIONING;
}
