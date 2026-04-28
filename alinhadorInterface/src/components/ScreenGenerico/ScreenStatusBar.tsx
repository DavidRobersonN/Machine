type ScreenStatusBarProps = {
  arduinoConnection: string
  led: string
}

export function ScreenStatusBar({
  arduinoConnection,
  led,
}: ScreenStatusBarProps) {
  return (
    <div className="screen-statusbar">
      <span>Arduino: {arduinoConnection}</span>
      <span>LED: {led}</span>
    </div>
  )
}