type PainelControlsProps = {
  children?: React.ReactNode
}

export function PainelControls({ children }: PainelControlsProps) {
  return (
    <div className="painel-controls-area">
     {children}
    </div>
  )
}