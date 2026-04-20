import { Led } from '../led/Led'

export function Botoes() {
  return (
    <div className="painel-bottom-buttons">
      <Led />
      <button type="button" className="btn btn-green">
        Min Power
      </button>
      <button type="button" className="btn btn-green">
        Max Power
      </button>
      <button type="button" className="btn btn-green">
        File
      </button>
      <button type="button" className="btn btn-orange">
        Start / Pause
      </button>
    </div>
  )
}