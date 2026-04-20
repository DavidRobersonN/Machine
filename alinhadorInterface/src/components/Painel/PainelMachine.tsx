import { ScreenMain } from '../Screen/ScreenMain/ScreenMain'
import { ScreenStatusBar } from '../Screen/ScreenStatusBar/ScreenStatusBar'
import { PainelControls } from '../PainelControls/PainelControls'
import { Botoes } from '../Botoes/Botoes'

export function PainelMachine() {
  return (
    <section className="painel-machine">
      <div className="painel-shell">
        <div className="painel-inner">
          <div className="painel-display-area">
            <div className="display-screen">
              <ScreenMain />
              <ScreenStatusBar />
            </div>
          </div>

          <PainelControls />
        </div>

        <Botoes />

      </div>
    </section>
  )
}