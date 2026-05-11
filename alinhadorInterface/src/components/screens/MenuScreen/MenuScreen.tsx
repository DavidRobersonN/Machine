import { memo, useMemo } from 'react'

import './MenuScreen.css'

type MenuScreenProps = {
  onSelectLogs: () => void
  onSelectSerial: () => void
  onSelectMotors: () => void
  onSelectAlignment: () => void
}

type MenuCard = {
  title: string
  description: string
  badge: string
  icon: string
  onClick: () => void
  featured?: boolean
}

function MenuScreenComponent({
  onSelectLogs,
  onSelectSerial,
  onSelectMotors,
  onSelectAlignment,
}: MenuScreenProps) {
  const menuCards = useMemo<MenuCard[]>(
    () => [
      {
        title: 'Motores',
        description: 'Controle da roda, velocidade, sentido e posição por raio.',
        badge: 'Controle principal',
        icon: '⚙️',
        onClick: onSelectMotors,
        featured: true,
      },
      {
        title: 'Alinhamento lateral',
        description: 'Acompanhe o sensor lateral e o histórico de oscilação.',
        badge: 'Sensor',
        icon: '📈',
        onClick: onSelectAlignment,
        featured: true,
      },
      {
        title: 'Portas COM',
        description: 'Conecte o Arduino, monitore a serial e envie configurações.',
        badge: 'Comunicação',
        icon: '🔌',
        onClick: onSelectSerial,
      },
      {
        title: 'Logs',
        description: 'Consulte mensagens enviadas, recebidas e eventos do sistema.',
        badge: 'Diagnóstico',
        icon: '📋',
        onClick: onSelectLogs,
      },
    ],
    [
      onSelectLogs,
      onSelectSerial,
      onSelectMotors,
      onSelectAlignment,
    ],
  )

  return (
    <div className="menu-screen">
      <header className="menu-screen-header">
        <div>
          <span className="menu-screen-kicker">Painel da máquina</span>

          <h2 className="menu-screen-title">Menu principal</h2>

          <p className="menu-screen-description">
            Escolha uma área para controlar, monitorar ou configurar a máquina
            alinhadora de rodas.
          </p>
        </div>
      </header>

      <section className="menu-screen-grid">
        {menuCards.map((card) => (
          <button
            key={card.title}
            type="button"
            className={`menu-card ${card.featured ? 'featured' : ''}`}
            onClick={card.onClick}
          >
            <div className="menu-card-top">
              <span className="menu-card-icon">{card.icon}</span>
              <span className="menu-card-badge">{card.badge}</span>
            </div>

            <div className="menu-card-body">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>

            <span className="menu-card-action">Abrir →</span>
          </button>
        ))}
      </section>
    </div>
  )
}

export const MenuScreen = memo(MenuScreenComponent)