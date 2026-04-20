import { Clique } from '../TesteClique/Clique'

export function PainelControls() {
  return (
    <div className="painel-controls-area">
      <Clique />

      <div className="action-buttons">
        <button className="btn btn-red">Esc</button>
        <button className="btn btn-orange">Enter</button>
      </div>

      <div className="action-buttons">
        <button className="btn btn-green">Origin</button>
        <button className="btn btn-green">Frame</button>
      </div>
    </div>
  )
}