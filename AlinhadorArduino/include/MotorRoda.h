#ifndef MOTOR_RODA_H
#define MOTOR_RODA_H

#include <Arduino.h>
#include <AccelStepper.h>

enum MotorRodaMode {
  MOTOR_RODA_STOPPED,
  MOTOR_RODA_CONTINUOUS,
  MOTOR_RODA_POSITIONING
};

class MotorRoda {
private:
  AccelStepper motor;

  float minSpeed;
  float maxSpeed;
  float speedStep;
  float acceleration;

  float currentSpeed;

  bool clockwise;

  MotorRodaMode mode;

  int totalSpokes;
  long stepsPerWheelRevolution;

  float degreesPerSpoke;
  float stepsPerDegree;

  float currentWheelAngle;
  float targetWheelAngle;

  int currentSpoke;
  int targetSpoke;

  void applySpeed();

  float normalizeAngle(float angle);
  float calculateShortestDelta(float targetAngle);

  long angleToSteps(float angle);
  float spokeToAngle(int spokeNumber);
  int angleToSpoke(float angle);

  void sendPositionStatus(String status);

public:
  MotorRoda(
    int stepPin,
    int dirPin,
    float motorMinSpeed,
    float motorMaxSpeed,
    float motorSpeedStep,
    float motorAcceleration,
    float initialSpeed,
    int wheelTotalSpokes,
    long wheelStepsPerRevolution
  );

  void begin();

  void update();

  void start();
  void stop();

  void setClockwise();
  void setCounterClockwise();

  void increaseSpeed();
  void decreaseSpeed();

  void sendSpeedStatus();
  void sendSpeedStatusMessage(String message);

  int calculateSpeedPercent();

  bool isRunning() const;
  bool isClockwise() const;
  float getCurrentSpeed() const;

  // =======================
  // CONTROLE DE POSIÇÃO
  // =======================

  void setZero();
  void goToAngle(float angle);
  void goToSpoke(int spokeNumber);
  void goToNextSpoke();
  void goToPreviousSpoke();
  void sendCurrentPositionStatus();

  float getCurrentWheelAngle() const;
  int getCurrentSpoke() const;
  bool isPositioning() const;
};

#endif