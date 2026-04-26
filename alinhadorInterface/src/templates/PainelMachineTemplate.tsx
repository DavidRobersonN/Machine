import type { ReactNode } from 'react'

type PainelMachineTemplateProps = {
  screenMain: ReactNode
  bottomControls?: ReactNode
}

export function PainelMachineTemplate({
  screenMain,
  bottomControls,
}: PainelMachineTemplateProps) {
  return (
    <section className="painel-machine">
      <div className="painel-shell">
        {screenMain}

        {bottomControls && (
          <div className="panel-bottom-controls">
            {bottomControls}
          </div>
        )}
      </div>
    </section>
  )
}