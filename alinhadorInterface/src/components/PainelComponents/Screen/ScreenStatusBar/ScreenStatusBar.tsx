import { useMachineContext } from '../../../../context/MachineContext'

export function ScreenStatusBar() {
  const { state } = useMachineContext()

  return (
    <div className="screen-statusbar">
      <span>{state.connected ? 'Online' : 'Offline'}</span>
      <span>00:00:00</span>
      <span>Count: 0</span>
      <span>X: 0.0mm</span>
      <span>Y: 0.0mm</span>
      <span>Led {state.led}</span>
    </div>
  )
}