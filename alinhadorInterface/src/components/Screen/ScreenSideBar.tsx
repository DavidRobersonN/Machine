type ScreenSidebarProps = {
  led: string
  databaseConnection: string
  arduinoConnection: string
  extraLabel?: string
  extraValue?: string
  progressLabel?: string
  progressValue?: number
}

export function ScreenSidebar({
  led,
  databaseConnection,
  arduinoConnection,
  extraLabel = 'Vai Receber Props',
  extraValue = 'Valor',
  progressLabel = 'Progress',
  progressValue = 50,
}: ScreenSidebarProps) {
  return (
    <div className="screen-sidebar">
      <div className="screen-row">
        <span>Led:</span>
        <span>{led}</span>
      </div>

      <div className="screen-row">
        <span>Data Base</span>
        <span>{databaseConnection}</span>
      </div>

      <div className="screen-row">
        <span>Arduino</span>
        <span>{arduinoConnection}</span>
      </div>

      <div className="screen-divider" />

      <div className="screen-row">
        <span>{extraLabel}</span>
        <span>{extraValue}</span>
      </div>

      <div className="screen-divider" />

      <div className="screen-progress-label">
        <span>{progressLabel}</span>
        <span>{progressValue}%</span>
      </div>

      <div className="screen-progress">
        <div
          className="screen-progress-fill"
          style={{ width: `${progressValue}%` }}
        />
      </div>
    </div>
  )
}