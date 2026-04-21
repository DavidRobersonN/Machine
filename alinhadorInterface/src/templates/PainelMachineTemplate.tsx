import type { ReactNode } from 'react'

type PainelMachineProps = {
  screenMain: ReactNode
  screenStatusBar: ReactNode
  screenPainelControls: ReactNode
  botaoled: ReactNode
  botaoSerialPortList: ReactNode
}

export function PainelMachineTemplate({
  screenMain,
  screenStatusBar,
  screenPainelControls,
  botaoled,
  botaoSerialPortList,
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
          {screenPainelControls}
          
        </div>
        {botaoled}
        {botaoSerialPortList}
      </div>
      
    </section>
  )
}