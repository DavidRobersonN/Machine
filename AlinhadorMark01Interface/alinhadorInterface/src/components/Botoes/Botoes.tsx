import { Led } from '../led/Led'

export function Botoes() {
  return (
    <div className="painel-bottom-buttons">
      <button className="btn btn-round btn-red btn-reset">Reset</button>
      <Led />
      <button className="btn btn-green">Min Power</button>
      <button className="btn btn-green">Max Power</button>
      <button className="btn btn-green">File</button>
      <button className="btn btn-orange">Start / Pause</button>
    </div>
  )
}