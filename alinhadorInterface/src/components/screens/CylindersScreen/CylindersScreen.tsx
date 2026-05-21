import { useMemo } from 'react'

import { useMachineContext } from '../../../context/useMachineContext'

import './CylindersScreen.css'

type CylinderId =
  | 'spoke_tension_left'
  | 'spoke_tension_right'
  | 'nipple_arm_left'
  | 'nipple_arm_right'
  | 'nipple_lift_left'
  | 'nipple_lift_right'

type CylinderKind = 'single' | 'dual'
type CylinderOrientation = 'horizontal' | 'vertical'
type CylinderPosition = 'retracted' | 'extended'

type CylinderConfig = {
  id: CylinderId
  stateKey:
    | 'pneumatic_spoke_tension_left_extended'
    | 'pneumatic_spoke_tension_right_extended'
    | 'pneumatic_nipple_arm_left_extended'
    | 'pneumatic_nipple_arm_right_extended'
    | 'pneumatic_nipple_lift_left_extended'
    | 'pneumatic_nipple_lift_right_extended'
  title: string
  group: string
  description: string
  kind: CylinderKind
  orientation: CylinderOrientation
  extendLabel: string
  retractLabel: string
}

const CYLINDERS: CylinderConfig[] = [
  {
    id: 'spoke_tension_left',
    stateKey: 'pneumatic_spoke_tension_left_extended',
    title: 'Tensao dos raios - esquerdo',
    group: 'Medicao da tensao',
    description: 'Cilindro de dois bracos que pressiona os raios do lado esquerdo.',
    kind: 'dual',
    orientation: 'horizontal',
    extendLabel: 'Pressionar',
    retractLabel: 'Recuar',
  },
  {
    id: 'spoke_tension_right',
    stateKey: 'pneumatic_spoke_tension_right_extended',
    title: 'Tensao dos raios - direito',
    group: 'Medicao da tensao',
    description: 'Cilindro de dois bracos que pressiona os raios do lado direito.',
    kind: 'dual',
    orientation: 'horizontal',
    extendLabel: 'Pressionar',
    retractLabel: 'Recuar',
  },
  {
    id: 'nipple_arm_left',
    stateKey: 'pneumatic_nipple_arm_left_extended',
    title: 'Avanco horizontal - esquerdo',
    group: 'Braco do niple',
    description: 'Avanca horizontalmente o braco que leva o mecanismo ate o niple.',
    kind: 'single',
    orientation: 'horizontal',
    extendLabel: 'Avancar',
    retractLabel: 'Recuar',
  },
  {
    id: 'nipple_arm_right',
    stateKey: 'pneumatic_nipple_arm_right_extended',
    title: 'Avanco horizontal - direito',
    group: 'Braco do niple',
    description: 'Avanca horizontalmente o braco que leva o mecanismo ate o niple.',
    kind: 'single',
    orientation: 'horizontal',
    extendLabel: 'Avancar',
    retractLabel: 'Recuar',
  },
  {
    id: 'nipple_lift_left',
    stateKey: 'pneumatic_nipple_lift_left_extended',
    title: 'Subida do mecanismo - esquerdo',
    group: 'Altura do niple',
    description: 'Sobe e desce o mecanismo esquerdo que gira o niple.',
    kind: 'single',
    orientation: 'vertical',
    extendLabel: 'Subir',
    retractLabel: 'Descer',
  },
  {
    id: 'nipple_lift_right',
    stateKey: 'pneumatic_nipple_lift_right_extended',
    title: 'Subida do mecanismo - direito',
    group: 'Altura do niple',
    description: 'Sobe e desce o mecanismo direito que gira o niple.',
    kind: 'single',
    orientation: 'vertical',
    extendLabel: 'Subir',
    retractLabel: 'Descer',
  },
]

function CylinderDrawing({
  cylinder,
  position,
}: {
  cylinder: CylinderConfig
  position: CylinderPosition
}) {
  const className = [
    'cylinder-drawing',
    `cylinder-drawing--${cylinder.kind}`,
    `cylinder-drawing--${cylinder.orientation}`,
    position === 'extended' ? 'is-extended' : 'is-retracted',
  ].join(' ')

  return (
    <div className={className} aria-hidden="true">
      {cylinder.kind === 'dual' ? (
        <>
          <div className="cylinder-drawing__guided-body">
            <span className="cylinder-drawing__guided-rail cylinder-drawing__guided-rail--top" />
            <span className="cylinder-drawing__guided-rail cylinder-drawing__guided-rail--bottom" />
            <span className="cylinder-drawing__guided-slot cylinder-drawing__guided-slot--front" />
            <span className="cylinder-drawing__guided-slot cylinder-drawing__guided-slot--center" />
            <span className="cylinder-drawing__guided-port cylinder-drawing__guided-port--top" />
            <span className="cylinder-drawing__guided-port cylinder-drawing__guided-port--bottom" />
            <span className="cylinder-drawing__guided-label">TN 2X</span>
          </div>

          <div className="cylinder-drawing__guided-plate">
            <span />
            <span />
          </div>

          <span className="cylinder-drawing__guided-rod cylinder-drawing__guided-rod--top" />
          <span className="cylinder-drawing__guided-rod cylinder-drawing__guided-rod--bottom" />
          <span className="cylinder-drawing__guided-shadow" />
        </>
      ) : (
        <>
          <div className="cylinder-drawing__mount cylinder-drawing__mount--rear" />

          <div className="cylinder-drawing__body">
            <span className="cylinder-drawing__cap cylinder-drawing__cap--rear" />
            <span className="cylinder-drawing__tube" />
            <span className="cylinder-drawing__cap cylinder-drawing__cap--front" />
            <span className="cylinder-drawing__port cylinder-drawing__port--rear" />
            <span className="cylinder-drawing__port cylinder-drawing__port--front" />
            <span className="cylinder-drawing__tie-rod cylinder-drawing__tie-rod--top" />
            <span className="cylinder-drawing__tie-rod cylinder-drawing__tie-rod--bottom" />
          </div>

          <div className="cylinder-drawing__rod cylinder-drawing__rod--primary">
            <span className="cylinder-drawing__clevis" />
          </div>

          <div className="cylinder-drawing__guide" />
        </>
      )}
    </div>
  )
}

export function CylindersScreen() {
  const { state, sendCommand } = useMachineContext()

  const extendedCount = useMemo(
    () => CYLINDERS.filter((cylinder) => state[cylinder.stateKey]).length,
    [state],
  )

  function moveCylinder(cylinder: CylinderConfig, position: CylinderPosition) {
    sendCommand({
      action: 'pneumatic_cylinder_move',
      cylinder: cylinder.id,
      position,
    })
  }

  function retractAll() {
    for (const cylinder of CYLINDERS) {
      sendCommand({
        action: 'pneumatic_cylinder_move',
        cylinder: cylinder.id,
        position: 'retracted',
      })
    }
  }

  return (
    <div className="screen-page cylinders-screen">
      <header className="cylinders-screen__header">
        <div>
          <span className="cylinders-screen__kicker">Pneumatica</span>
          <h2 className="screen-page-title">Cilindros pneumaticos</h2>
          <p>Teste manual dos cilindros da medicao de tensao e do mecanismo do niple.</p>
        </div>

        <div className="cylinders-screen__summary">
          <span>Acionados</span>
          <strong>{extendedCount}/{CYLINDERS.length}</strong>
        </div>
      </header>

      <section className="cylinders-screen__toolbar">
        <button type="button" onClick={retractAll}>
          Recuar todos
        </button>
      </section>

      <section className="cylinders-grid">
        {CYLINDERS.map((cylinder) => {
          const position = state[cylinder.stateKey] ? 'extended' : 'retracted'

          return (
            <article key={cylinder.id} className="cylinder-card">
              <header className="cylinder-card__header">
                <div>
                  <span>{cylinder.group}</span>
                  <h3>{cylinder.title}</h3>
                </div>

                <strong
                  className={
                    position === 'extended'
                      ? 'cylinder-card__state is-extended'
                      : 'cylinder-card__state is-retracted'
                  }
                >
                  {position === 'extended' ? 'Acionado' : 'Recuado'}
                </strong>
              </header>

              <CylinderDrawing cylinder={cylinder} position={position} />

              <p className="cylinder-card__description">
                {cylinder.description}
              </p>

              <div className="cylinder-card__actions">
                <button
                  type="button"
                  className="cylinder-card__button cylinder-card__button--extend"
                  onClick={() => moveCylinder(cylinder, 'extended')}
                >
                  {cylinder.extendLabel}
                </button>

                <button
                  type="button"
                  className="cylinder-card__button"
                  onClick={() => moveCylinder(cylinder, 'retracted')}
                >
                  {cylinder.retractLabel}
                </button>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
