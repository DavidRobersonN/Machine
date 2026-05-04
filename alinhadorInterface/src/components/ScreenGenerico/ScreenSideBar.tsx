import { memo } from 'react'

type ScreenSidebarProps = {
  led?: string
  databaseConnection?: string
  arduinoConnection?: string
  extraLabel?: string
  extraValue?: string
  progressLabel?: string
  progressValue?: number
}

function ScreenSidebarComponent({
  led,
  databaseConnection,
  arduinoConnection,
  extraLabel,
  extraValue,
  progressLabel,
  progressValue,
}: ScreenSidebarProps) {
  return (
    <div className="screen-sidebar">
      {led !== undefined && (
        <div className="screen-row">
          <span>Led:</span>
          <span>{led}</span>
        </div>
      )}

      {databaseConnection !== undefined && (
        <div className="screen-row">
          <span>Data Base</span>
          <span>{databaseConnection}</span>
        </div>
      )}

      {arduinoConnection !== undefined && (
        <div className="screen-row">
          <span>Arduino</span>
          <span>{arduinoConnection}</span>
        </div>
      )}

      {(extraLabel !== undefined || extraValue !== undefined) && (
        <>
          <div className="screen-divider" />

          <div className="screen-row">
            <span>{extraLabel ?? '-'}</span>
            <span>{extraValue ?? '-'}</span>
          </div>
        </>
      )}

      {progressValue !== undefined && (
        <>
          <div className="screen-divider" />

          <div className="screen-progress-label">
            <span>{progressLabel ?? 'Progresso'}</span>
            <span>{progressValue}%</span>
          </div>

          <div className="screen-progress">
            <div
              className="screen-progress-fill"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export const ScreenSidebar = memo(ScreenSidebarComponent)