type PainelControlsProps = {
  directionPad?: React.ReactNode
  escButton?: React.ReactNode
  enterButton?: React.ReactNode
  originButton?: React.ReactNode
  frameButton?: React.ReactNode
}

export function PainelControls({
  directionPad,
  escButton,
  enterButton,
  originButton,
  frameButton,
}: PainelControlsProps) {
  return (
    <div className="painel-controls-area">
      {/* Área do direcional */}
      {directionPad}

      {/* Botões principais */}
      {(escButton || enterButton) && (
        <div className="action-buttons">
          {escButton}
          {enterButton}
        </div>
      )}

      {/* Botões auxiliares */}
      {(originButton || frameButton) && (
        <div className="action-buttons">
          {originButton}
          {frameButton}
        </div>
      )}
    </div>
  )
}