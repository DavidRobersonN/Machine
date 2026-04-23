type ScreenStatusBarProps = {
  connected: boolean
  led: string
}

export function ScreenStatusBar({
  connected,
  led,

}: ScreenStatusBarProps) {
  return (
    <div className="screen-statusbar">
      {/* Mostra se a máquina está conectada ou não */}
      <span>{connected ? 'Online' : 'Offline'}</span>

      {/* Estado atual do LED */}
      <span>Led {led}</span>
    </div>
  )
}