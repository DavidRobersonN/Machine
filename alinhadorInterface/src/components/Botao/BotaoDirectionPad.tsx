type BotaoDirectionPadProps = {
  onClickUp: () => void
  onClickLeft: () => void
  onClickCenter: () => void
  onClickRight: () => void
  onClickDown: () => void
}

export function BotaoDirectionPad({
  onClickUp,
  onClickLeft,
  onClickCenter,
  onClickRight,
  onClickDown,
}: BotaoDirectionPadProps) {
  return (
    <div className="direction-pad">
      <button className="btn btn-green btn-arrow up" onClick={onClickUp}>
        ▲
      </button>

      <div className="direction-middle">
        <button className="btn btn-green btn-arrow left" onClick={onClickLeft}>
          ◀
        </button>

        <button className="btn btn-green btn-round" onClick={onClickCenter}>
          Z/U
        </button>

        <button className="btn btn-green btn-arrow right" onClick={onClickRight}>
          ▶
        </button>
      </div>

      <button className="btn btn-green btn-arrow down" onClick={onClickDown}>
        ▼
      </button>
    </div>
  )
}