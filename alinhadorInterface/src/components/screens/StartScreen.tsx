type StartScreenProps = {
  onEnterMenu: () => void
}

export function StartScreen({ onEnterMenu }: StartScreenProps) {
  return (
    <div className="screen-page">
      <h1 className="screen-page-title">Alinhador</h1>
      <p className="screen-page-text">Sistema iniciado com sucesso.</p>

      <button className="btn btn-green" onClick={onEnterMenu}>
        Entrar no menu
      </button>
    </div>
  )
}