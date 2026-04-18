export function PainelControls() {
  return (
    <div className="painel-controls-area">
      <div className="direction-pad">
        <button className="btn btn-green btn-arrow up">▲</button>

        <div className="direction-middle">
          <button className="btn btn-green btn-arrow left">◀</button>
          <button className="btn btn-round btn-green">Z/U</button>
          <button className="btn btn-green btn-arrow right">▶</button>
        </div>

        <button className="btn btn-green btn-arrow down">▼</button>
      </div>

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