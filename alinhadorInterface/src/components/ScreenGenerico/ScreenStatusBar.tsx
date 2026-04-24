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
      <span>{arduinoConnection}</span>
      <span>Led {led}</span>
    </div>
  )
}