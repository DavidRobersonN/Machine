import { memo } from 'react'

type ScreenStatusBarProps = {
  arduinoConnection: string
  led: string
}

function ScreenStatusBarComponent({
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

export const ScreenStatusBar = memo(ScreenStatusBarComponent)