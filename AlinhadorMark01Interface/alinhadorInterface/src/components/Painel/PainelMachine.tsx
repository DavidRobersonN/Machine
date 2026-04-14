import './Styles.css'

export function PainelMachine() {
  return (
    <section className="painel-machine">
      <div className="painel-shell">
        <div className="painel-inner">
          <div className="painel-display-area">
            <div className="display-screen">
              <div className="screen-main">
                <div className="screen-canvas" />

                <div className="screen-sidebar">
                  <div className="screen-row">
                    <span>File:</span>
                    <span>LOGO</span>
                  </div>

                  <div className="screen-row">
                    <span>Mode:</span>
                    <span>Auto</span>
                  </div>

                  <div className="screen-divider" />

                  <div className="screen-row">
                    <span>X:</span>
                    <span>0.000</span>
                  </div>

                  <div className="screen-row">
                    <span>Y:</span>
                    <span>0.000</span>
                  </div>

                  <div className="screen-row">
                    <span>Z:</span>
                    <span>0.000</span>
                  </div>

                  <div className="screen-divider" />

                  <div className="screen-progress-label">
                    <span>Progress</span>
                    <span>50%</span>
                  </div>

                  <div className="screen-progress">
                    <div className="screen-progress-fill" />
                  </div>
                </div>
              </div>

              <div className="screen-statusbar">
                <span>Idle</span>
                <span>00:00:00</span>
                <span>Count: 0</span>
                <span>X: 0.0mm</span>
                <span>Y: 0.0mm</span>
                <span>Laser OFF</span>
              </div>
            </div>
          </div>

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
        </div>

        <div className="painel-bottom-buttons">
          <button className="btn btn-round btn-red btn-reset">Reset</button>
          <button className="btn btn-green">Pulse</button>
          <button className="btn btn-green">Speed</button>
          <button className="btn btn-green">Min Power</button>
          <button className="btn btn-green">Max Power</button>
          <button className="btn btn-green">File</button>
          <button className="btn btn-orange">Start / Pause</button>
        </div>
      </div>
    </section>
  )
}