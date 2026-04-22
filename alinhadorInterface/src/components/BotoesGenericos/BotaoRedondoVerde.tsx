type BotaoProps = {
  nome: string
  onClick: () => void
  className?: string
}

export function BotaoRedondoVerde({
  nome,
  onClick,
  className = "btn btn-round btn-green btn-reset",
}: BotaoProps) {
  return (
    <button className={className} onClick={onClick}>
      {nome}
    </button>
  )
}