import type { ReactNode } from 'react'

type PainelMachineProps = {
  screenMain: ReactNode
  screenStatusBar?: ReactNode
  sideControls?: ReactNode
  bottomControls?: ReactNode
}

export function PainelMachineTemplate({
  screenMain,
  screenStatusBar,
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
              {screenStatusBar}
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