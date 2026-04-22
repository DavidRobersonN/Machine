type BotaoProps = {
  nome: string
  onClick: () => void
  className?: string
}

export function BotaoQuadradoVerde({
  nome,
  onClick,
  className = 'btn btn-green',
}: BotaoProps) {
  return (
    <button type="button" className={className} onClick={onClick}>
      {nome}
    </button>
  )
}