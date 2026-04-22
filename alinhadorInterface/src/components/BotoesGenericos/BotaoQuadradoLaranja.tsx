type BotaoProps = {
  nome: string
  onClick: () => void
  className?: string
}

export function BotaoQuadradoLaranja({
  nome,
  onClick,
  className="btn btn-orange",
}: BotaoProps) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {nome}
    </button>
  )
}