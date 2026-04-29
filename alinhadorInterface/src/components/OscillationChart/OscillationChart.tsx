import type { MisalignmentPoint } from '../../types/machine/machine'
import './OscillationChart.css'

type OscillationChartProps = {
  // Título que aparece no topo do gráfico
  title: string

  // Valor atual do sensor lateral
  value: number

  // Lista de pontos usados para desenhar a linha do gráfico
  points: MisalignmentPoint[]

  // Valor mínimo da escala do gráfico
  // Exemplo: -15 mm
  minValue?: number

  // Valor máximo da escala do gráfico
  // Exemplo: +15 mm
  maxValue?: number

  // Unidade exibida junto dos valores
  // Exemplo: " mm"
  unit?: string
}

export function OscillationChart({
  title,
  value,
  points,
  minValue = -15,
  maxValue = 15,
  unit = ' mm',
}: OscillationChartProps) {
  // Largura total do SVG.
  // É a área onde o gráfico será desenhado.
  const width = 520

  // Altura total do SVG.
  const height = 180

  // Espaçamento interno do gráfico.
  // Serve para não desenhar a linha encostada nas bordas.
  const padding = 20

  // Largura útil do gráfico.
  // Remove o padding da esquerda e da direita.
  const usableWidth = width - padding * 2

  // Altura útil do gráfico.
  // Remove o padding de cima e de baixo.
  const usableHeight = height - padding * 2

  // Esta função converte um valor em milímetros para uma posição vertical no SVG.
  //
  // Exemplo:
  // - Se o valor for +15 mm, ele deve aparecer perto do topo.
  // - Se o valor for 0 mm, ele deve aparecer no meio.
  // - Se o valor for -15 mm, ele deve aparecer perto da parte de baixo.
  function normalizeY(pointValue: number) {
    // Garante que o valor nunca passe dos limites do gráfico.
    //
    // Se vier maior que maxValue, usa maxValue.
    // Se vier menor que minValue, usa minValue.
    const clampedValue = Math.max(minValue, Math.min(maxValue, pointValue))

    // Converte o valor para uma porcentagem dentro da escala.
    //
    // Exemplo com minValue = -15 e maxValue = 15:
    // -15 vira 0
    // 0 vira 0.5
    // 15 vira 1
    const percentage = (clampedValue - minValue) / (maxValue - minValue)

    // No SVG, o eixo Y funciona ao contrário:
    // quanto maior o Y, mais para baixo o ponto fica.
    //
    // Por isso subtraímos a posição calculada da altura.
    return height - padding - percentage * usableHeight
  }

  // Esta função converte o índice do ponto para uma posição horizontal no SVG.
  //
  // O primeiro ponto fica no começo do gráfico.
  // O último ponto fica no final do gráfico.
  // Os pontos do meio são distribuídos proporcionalmente.
  function normalizeX(index: number) {
    // Se tiver apenas um ponto ou nenhum ponto,
    // desenhamos no começo da área útil.
    if (points.length <= 1) {
      return padding
    }

    // Distribui os pontos igualmente pela largura útil do gráfico.
    return padding + (index / (points.length - 1)) * usableWidth
  }

  // Monta a string de pontos usada pelo <polyline>.
  //
  // O SVG espera algo assim:
  // "20,90 40,85 60,100 80,70"
  //
  // Cada par representa:
  // x,y
  const linePoints = points
    .map((point, index) => {
      // Calcula a posição horizontal do ponto
      const x = normalizeX(index)

      // Calcula a posição vertical com base no valor em mm
      const y = normalizeY(point.value)

      // Retorna no formato que o SVG entende
      return `${x},${y}`
    })
    .join(' ')

  // Calcula a posição vertical da linha central do gráfico.
  // Essa linha representa o valor 0 mm.
  const centerY = normalizeY(0)

  return (
    <div className="oscillation-chart">
      <div className="oscillation-chart-header">
        <div>
          <h2 className="oscillation-chart-title">{title}</h2>

          <p className="oscillation-chart-subtitle">
            Desalinhamento lateral em tempo real
          </p>
        </div>

        {/* Valor atual do sensor lateral */}
        <strong className="oscillation-chart-value">
          {value.toFixed(2)}
          {unit}
        </strong>
      </div>

      {/* 
        Área SVG onde o gráfico é desenhado.

        viewBox define o sistema de coordenadas interno do SVG.
        Aqui estamos usando:
        largura: 520
        altura: 180
      */}
      <svg
        className="oscillation-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      >
        {/* 
          Retângulo que representa a borda/área útil do gráfico.
          Ele usa o padding para não ficar colado no SVG.
        */}
        <rect
          x={padding}
          y={padding}
          width={usableWidth}
          height={usableHeight}
          className="oscillation-chart-border"
        />

        {/* 
          Linha horizontal central.
          Representa o ponto 0 mm.
        */}
        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          className="oscillation-chart-center-line"
        />

        {/* Texto do valor máximo no topo do gráfico */}
        <text
          x={padding}
          y={padding - 6}
          className="oscillation-chart-axis-text"
        >
          +{maxValue}
          {unit}
        </text>

        {/* Texto indicando a linha zero */}
        <text
          x={padding}
          y={centerY - 6}
          className="oscillation-chart-axis-text"
        >
          0
          {unit}
        </text>

        {/* Texto do valor mínimo na parte inferior */}
        <text
          x={padding}
          y={height - 4}
          className="oscillation-chart-axis-text"
        >
          {minValue}
          {unit}
        </text>

        {/* 
          Linha do gráfico.

          O polyline liga todos os pontos do histórico.
          Só desenhamos se houver pelo menos 2 pontos,
          porque com apenas 1 ponto ainda não existe linha.
        */}
        {points.length > 1 && (
          <polyline
            points={linePoints}
            className="oscillation-chart-line"
          />
        )}
      </svg>
    </div>
  )
}