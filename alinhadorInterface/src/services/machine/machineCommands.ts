export function createLedOnCommand() {
  return { action: 'led_on' as const }
}

export function createLedOffCommand() {
  return { action: 'led_off' as const }
}