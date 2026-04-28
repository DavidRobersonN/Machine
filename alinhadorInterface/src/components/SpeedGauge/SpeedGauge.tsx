import './SpeedGauge.css'

type SpeedGaugeProps = {
  value: number
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(startAngle: number, endAngle: number) {
  const start = polarToCartesian(80, 80, 58, startAngle)
  const end = polarToCartesian(80, 80, 58, endAngle)

  return [
    'M',
    start.x,
    start.y,
    'A',
    58,
    58,
    0,
    0,
    1,
    end.x,
    end.y,
  ].join(' ')
}

export function SpeedGauge({ value }: SpeedGaugeProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  const needleAngle = 180 + (safeValue / 100) * 180
  const needleEnd = polarToCartesian(80, 80, 46, needleAngle)

  return (
    <div className="speed-gauge">
      <p className="speed-gauge-title">Velocidade</p>

      <svg
        className="speed-gauge-svg"
        viewBox="0 0 160 105"
        role="img"
        aria-label={`Velocidade ${safeValue}%`}
      >
        <path
          d={describeArc(180, 360)}
          fill="none"
          stroke="#e8e8e8"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={describeArc(180, 216)}
          fill="none"
          stroke="#35b44a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={describeArc(218, 254)}
          fill="none"
          stroke="#b7d63d"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={describeArc(256, 292)}
          fill="none"
          stroke="#ffd31a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={describeArc(294, 330)}
          fill="none"
          stroke="#ff9f1a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={describeArc(332, 360)}
          fill="none"
          stroke="#e6302a"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <line
          x1="80"
          y1="80"
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#1f1f1f"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <circle
          cx="80"
          cy="80"
          r="10"
          fill="#1f1f1f"
          stroke="#d9d9d9"
          strokeWidth="4"
        />
      </svg>

      <strong className="speed-gauge-value">{safeValue}%</strong>
    </div>
  )
}