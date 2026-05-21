import type { MachineState } from '../types/machine'

export const WHEEL_REFERENCE_SPOKE = 1

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360
}

export function getSafeTotalSpokes(value: number) {
  return Math.max(Math.trunc(value), 1)
}

export function getWrappedSpoke(spoke: number, totalSpokes: number) {
  return ((Math.trunc(spoke) - 1) % totalSpokes + totalSpokes) % totalSpokes + 1
}

export function angleToSpoke(angle: number, totalSpokes: number) {
  const safeTotalSpokes = getSafeTotalSpokes(totalSpokes)
  const degreesPerSpoke = 360 / safeTotalSpokes
  const spoke = Math.round(normalizeDegrees(angle) / degreesPerSpoke) + 1

  return spoke > safeTotalSpokes ? 1 : Math.max(spoke, 1)
}

export function getWheelReferenceAngle(state: MachineState) {
  return normalizeDegrees(state.wheel_current_angle ?? state.wheel_position_degrees)
}

export function getWheelVisualRotationDegrees(state: MachineState) {
  return getWheelReferenceAngle(state)
}
