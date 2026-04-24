type SpeedGaugeProps = {
  value: number
}

export function SpeedGauge({ value }: SpeedGaugeProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  const angle = -120 + (safeValue / 100) * 240

  return (
    <div className="speed-gauge">
      <p className="speed-gauge-title">Velocidade</p>

      <div className="speed-gauge-arc">
        <div className="speed-gauge-segment speed-gauge-segment-low" />
        <div className="speed-gauge-segment speed-gauge-segment-mid" />
        <div className="speed-gauge-segment speed-gauge-segment-high" />

        <div
          className="speed-gauge-needle"
          style={{ transform: `rotate(${angle}deg)` }}
        />

        <div className="speed-gauge-center" />
      </div>

      <strong className="speed-gauge-value">{safeValue}%</strong>
    </div>
  )
}