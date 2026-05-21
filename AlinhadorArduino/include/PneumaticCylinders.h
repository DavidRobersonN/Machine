#ifndef PNEUMATIC_CYLINDERS_H
#define PNEUMATIC_CYLINDERS_H

#include <Arduino.h>

class PneumaticCylinders {
private:
  static const int CYLINDER_COUNT = 6;

  const char* ids[CYLINDER_COUNT] = {
    "spoke_tension_left",
    "spoke_tension_right",
    "nipple_arm_left",
    "nipple_arm_right",
    "nipple_lift_left",
    "nipple_lift_right"
  };

  int pins[CYLINDER_COUNT];
  bool extended[CYLINDER_COUNT];

  int getCylinderIndex(String cylinderId);
  void writeCylinder(int index, bool shouldExtend);
  void sendStatusForIndex(int index, String message);

public:
  PneumaticCylinders(
    int spokeTensionLeftPin,
    int spokeTensionRightPin,
    int nippleArmLeftPin,
    int nippleArmRightPin,
    int nippleLiftLeftPin,
    int nippleLiftRightPin
  );

  void begin();
  void setPin(String cylinderId, int pin);
  void move(String cylinderId, String action);
  void retractAll();
  void sendStatus();
};

#endif
