type BotaoProps = {
  nome: string
  onClick: () => void
  className?: string
}

export function BotaoRedondoVermelho({
  nome,
  onClick,
  className = "btn btn-round btn-red btn-reset",
}: BotaoProps) {
  return (
    <button className={className} onClick={onClick}>
      {nome}
    </button>
  )
}