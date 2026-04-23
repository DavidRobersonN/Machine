import type { ReactNode } from 'react'

type PainelMachineProps = {
  screenMain: ReactNode
  sideControls?: ReactNode
  bottomControls?: ReactNode
}

export function PainelMachineTemplate({
  screenMain,
  sideControls,
  bottomControls,
}: PainelMachineProps) {
  return (
    <section className="painel-machine">
      <div className="painel-shell">
        <div className="painel-inner">
          <div className="painel-display-area">
            <div className="display-screen">
              {screenMain}
            </div>
          </div>

          {sideControls}
        </div>

        {bottomControls && (
          <div className="panel-bottom-controls">
            {bottomControls}
          </div>
        )}
      </div>
    </section>
  )
}