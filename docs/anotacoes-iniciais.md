18/04
Proximo passo vou criar no arduino o codigo orientado a Objetos.. mantendo o codigo atual, apenas do led.


20/04
preciso alterar os componentes que eu criei, para receber props..  quero deixar eles
reutilizaveis, para criar um template que pode ser usado de varias formar..
para os botoes terem funcionaliidades diferentes dependendo da tela que for ser usado

Front
Primeiro Passo: *machineSocket.ts*

  Começa Pelo machineSocket.ts que faz a conexao com o backend, e é onde de
fato vai enviar as informações, ja convertidas em json.. 
  Agora ja tendo a comunicação entre backend e o front, Precisamos interpretar
as mensagens recebidas.

Segundo Passo: *Types/machine.ts*
  Criar o arquivo Types/machine.ts onde é definido o tipos aceitos que virao do
backend, estado global e as actions que o reducer vai entender..

Terceiro Passo: *MachineReducer.ts*
  MachineReducer.ts..  primeiro definimos um estado inicial.. 
  Agora é Feito o Reducer Principal da maquina, ele recebe o estado atual da
maquina e uma ação que queremos executar. 
  Entao dentro dele é executado um switch case, para verificar a ação que foi passado
e dentro de cada case, é executaddo a ação ja pre definida.. e devolve um novo 
estado ja alterado.

Quarto Passo: *MachineContext.tsx*
  Aqui onde Criaremos o Contexto da Maquina, é criado um Reducer, passando o nosso
InitialState, ja implementado em types, e o nosso machineReducer
O que acontece aqui:
  uma função de callback que vai receber uma mensagem em json, verifico qual o type
e o payload que vem dentro dessa mensagem.. obs: meu machineReducer ja precisa estar esperando
essa type, precisa vir do jeito que ele espera.. 

Quinto Passo: *Provider*
  Ainda em  MachineContext.tsx ..    o Retorno do nosso MachineProvider, é um
é uma especie de componente que recebe Children.. ou seja quando envolvermos
algum componente com ele, os filhos terao acesso a esse contexto
  
Sexto Passo: funções de CallBack
Agora podemos acessar de qualquer lugar da nossa aplicação, as funções de call
back que definimos em MachineContext..





Componentes

Exemplo de Componente Botao Led

1 Passo
Componente Botao Generico, que recebe Props com:
                                          nome:
                                          função de callback:

2 Passo
Utilizar esse Botao que receber Props dentro de um template..  para posteriormente esse template, ser utilizado de diferentes formas.. mas com
a mesa aparencia.. mas com utilizadades diferentes em cada botao dependendo como eu utilize esse template
          
2 Passo
Utilizar ele dentro de um Componente que vai fazer a Função de Led

                                          import { useMachineContext } from '../../context/MachineContext'
                                          import { Botao } from '../Botao/Botao'

                                          export function Led() {
                                            const { sendCommand } = useMachineContext()

                                            function handleTurnLedOn() {
                                              sendCommand({
                                                action: 'led_on',
                                              })
                                            }

                                            function handleTurnLedOff() {
                                              sendCommand({
                                                action: 'led_off',
                                              })
                                            }

                                            return (
                                              <>
                                                <Botao nome="Ligar" onClick={handleTurnLedOn} />
                                                <Botao nome="Desligar" onClick={handleTurnLedOff} />
                                              </>
                                            )
                                



*Implementando Função de Verificar desalinhamento*

*1 Passo* 
 *Atualize seus tipos*

src/types/machine/state.ts

```ts
  export type MisalignmentPoint = {
    id: number
    value: number
  }
```

  Agora adicione no seu MachineState
/* ESTADO GLOBAL DA APLICAÇÃO */
```ts
export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
  available_ports: SerialPortInfo[]
  selected_port: SelectedSerialPortState
  speed_motor_roda: number

  lateral_misalignment_current: number
  lateral_misalignment_history: MisalignmentPoint[]
}
```




*2 Passo Atualize o estado inicial*

No seu initialMachineState, adicione os dois novos campos:

```ts
export const initialMachineState: MachineState = {
  connected: false,
  led: 'Desligado',
  arduino_connected: 'Desconectado',
  logs: [],
  available_ports: [],
  selected_port: null,
  speed_motor_roda: 0,
  lateral_misalignment_current: 0,
  lateral_misalignment_history: [],
}
```




*3 Passo Adicione as actions no MachineAction*

No seu tipo MachineAction, adicione essas duas actions:

```ts
| { type: 'SET_LATERAL_MISALIGNMENT_CURRENT'; payload: number }
| { type: 'ADD_LATERAL_MISALIGNMENT_POINT'; payload: number }
```





*4 Passo Atualize o reducer*

No seu machineReducer, adicione estes dois case:

```ts
  case 'SET_LATERAL_MISALIGNMENT_CURRENT':
    return {
      ...state,
      lateral_misalignment_current: action.payload,
    }

  case 'ADD_LATERAL_MISALIGNMENT_POINT': {
    const newPoint = {
      id: Date.now(),
      value: action.payload,
    }

    const updatedHistory = [
      ...state.lateral_misalignment_history,
      newPoint,
    ].slice(-100)

    return {
      ...state,
      lateral_misalignment_history: updatedHistory,
    }
  }
```




*5. Crie o tipo da mensagem WebSocket*

No arquivo onde você tipa suas mensagens do backend, adicione:


```ts
export type LateralMisalignmentMessage = {
  type: 'lateral_misalignment'
  value: number
}
```
E coloque no union principal:

```ts
export type MachineMessage =
  | MachineUpdateMessage
  | AvailablePortsMessage
  | LogMessage
  | LateralMisalignmentMessage

```
Exemplo da mensagem que o backend deve mandar:
```ts
{
  "type": "lateral_misalignment",
  "value": 0.28
}
```




*6. Atualize seu useMachineContext*

  Aqui é a parte mais importante.

  Você vai usar useRef para guardar o último valor recebido sem atualizar o gráfico a cada mensagem.

  No seu hook, importe:

```ts

  const latestLateralValueRef = useRef(0)
  const hasReceivedLateralValueRef = useRef(false)

  // Sempre que receber um valor de desalinhamento lateral, atualizamos a referência mais recente e marcamos que já recebemos um valor
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!hasReceivedLateralValueRef.current) {
        return
      }

      dispatch({
        type: 'ADD_LATERAL_MISALIGNMENT_POINT',
        payload: latestLateralValueRef.current,
      })
      //e o intervalo 100
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])
```
  E dentro de HandleMachineMessage:

  ```ts

      if (message.type === 'lateral_misalignment') {
        latestLateralValueRef.current = message.value
        hasReceivedLateralValueRef.current = true

        dispatch({
          type: 'SET_LATERAL_MISALIGNMENT_CURRENT',
          payload: message.value,
        })

        return
      }
  ```


*7. Crie o componente do gráfico*

  Crie a pasta:

  src/components/OscillationChart/

  OscillationChart.tsx

*8 CSS do gráfico*
OscillationChart.css


*9. Crie a tela de alinhamento lateral*

Crie:

src/components/screens/LateralAlignmentScreen/

Dentro dela:

LateralAlignmentScreen.tsx

*10. CSS da tela*
LateralAlignmentScreen.css


*11. Atualizar o tipo AppScreen*

Abra:

src/types/navigation.ts

Você provavelmente tem algo assim:

export type AppScreen =
  | 'start'
  | 'menu'
  | 'led'
  | 'motors'
  | 'logs'
  | 'serial'

Adicione:
```ts
| 'alignment'
```

*12. Atualizar o useHomeMachinePage*

No retorno do seu hook, adicione estes dois valores:

```ts
  lateralMisalignmentCurrent: state.lateral_misalignment_current,
  lateralMisalignmentHistory: state.lateral_misalignment_history,
```



Implementando função de verificar desalinhamento lateral
1. Atualize os tipos do estado

Arquivo:

src/types/machine/state.ts

Adicione o tipo do ponto do gráfico:

export type MisalignmentPoint = {
  id: number
  value: number
}

Depois adicione os novos campos no MachineState:

export interface MachineState {
  connected: boolean
  led: LedUiState
  arduino_connected: ArduinoConnectionState
  logs: MachineLog[]
  available_ports: SerialPortInfo[]
  selected_port: SelectedSerialPortState
  speed_motor_roda: number

  lateral_misalignment_current: number
  lateral_misalignment_history: MisalignmentPoint[]
}
2. Atualize o estado inicial

Arquivo:

src/context/machineReducer.ts

No initialMachineState, adicione:

export const initialMachineState: MachineState = {
  connected: false,
  led: 'Desligado',
  arduino_connected: 'Desconectado',
  logs: [],
  available_ports: [],
  selected_port: null,
  speed_motor_roda: 0,

  lateral_misalignment_current: 0,
  lateral_misalignment_history: [],
}
3. Adicione as actions no reducer

Arquivo:

src/types/machine/actions.ts

Adicione no MachineAction:

| { type: 'SET_LATERAL_MISALIGNMENT_CURRENT'; payload: number }
| { type: 'ADD_LATERAL_MISALIGNMENT_POINT'; payload: number }

Arquivo completo ficaria assim:

import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
} from './state'

import type { MachineUpdatePayload } from './messages'

export type MachineAction =
  | { type: 'SOCKET_CONNECTED' }
  | { type: 'SOCKET_DISCONNECTED' }
  | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
  | { type: 'ADD_LOG'; payload: MachineLog }
  | { type: 'CLEAR_LOGS' }
  | { type: 'SET_AVAILABLE_PORTS'; payload: SerialPortInfo[] }
  | { type: 'SET_SELECTED_PORT'; payload: SelectedSerialPortState }
  | { type: 'SET_SPEED_MOTOR_RODA'; payload: number }
  | { type: 'SET_LATERAL_MISALIGNMENT_CURRENT'; payload: number }
  | { type: 'ADD_LATERAL_MISALIGNMENT_POINT'; payload: number }
4. Atualize o reducer

Arquivo:

src/context/machineReducer.ts

Adicione estes dois case no switch:

case 'SET_LATERAL_MISALIGNMENT_CURRENT':
  return {
    ...state,
    lateral_misalignment_current: action.payload,
  }

case 'ADD_LATERAL_MISALIGNMENT_POINT': {
  const newPoint = {
    id: Date.now(),
    value: action.payload,
  }

  const updatedHistory = [
    ...state.lateral_misalignment_history,
    newPoint,
  ].slice(-100)

  return {
    ...state,
    lateral_misalignment_history: updatedHistory,
  }
}

Esse .slice(-100) mantém apenas os últimos 100 pontos do gráfico.

5. Crie o tipo da mensagem WebSocket

Arquivo:

src/types/machine/messages.ts

Adicione:

export type LateralMisalignmentMessage = {
  type: 'lateral_misalignment'
  value: number
  raw?: number
  unit?: string
}

Depois coloque no union principal:

export type MachineMessage =
  | MachineUpdateMessage
  | AvailablePortsMessage
  | SerialPortSelectedMessage
  | SerialPortDisconnectedMessage
  | LedStatusMessage
  | MachineReadMessage
  | ConnectionMessage
  | LogMessage
  | ErrorMessage
  | InfoMessage
  | PongMessage
  | LateralMisalignmentMessage

A mensagem que o backend deve mandar será assim:

{
  "type": "lateral_misalignment",
  "value": 0.28,
  "raw": 523,
  "unit": "mm"
}
6. Atualize o machine.ts

Arquivo:

src/types/machine/machine.ts

Como você separou os tipos em arquivos menores, deixe o machine.ts como centralizador:

export type {
  LedBackendState,
  LedUiState,
  ArduinoConnectionState,
  SelectedSerialPortState,
  MachineLog,
  SerialPortInfo,
  MisalignmentPoint,
  MachineState,
} from './state'

export type {
  MachineUpdatePayload,
  MachineUpdateMessage,
  AvailablePortsMessage,
  SerialPortSelectedMessage,
  SerialPortDisconnectedMessage,
  LedStatusMessage,
  MachineReadMessage,
  ConnectionMessage,
  LogMessage,
  ErrorMessage,
  InfoMessage,
  PongMessage,
  LateralMisalignmentMessage,
  MachineMessage,
} from './messages'

export type { MachineAction } from './actions'

export type MotorRodaCommand =
  | { action: 'motor_roda_start' }
  | { action: 'motor_roda_stop' }
  | { action: 'motor_roda_set_clockwise' }
  | { action: 'motor_roda_set_counter_clockwise' }
  | { action: 'motor_roda_increase_speed' }
  | { action: 'motor_roda_decrease_speed' }

export interface ListSerialPortsCommand {
  action: 'list_serial_ports'
}

export interface SelectPortCommand {
  action: 'select_serial_port'
  port: string
}

export interface DisconnectSerialPortCommand {
  action: 'disconnect_serial_port'
}

export interface PingCommand {
  action: 'ping'
}

export interface LedOnCommand {
  action: 'led_on'
}

export interface LedOffCommand {
  action: 'led_off'
}

export interface ReadMachineStateCommand {
  action: 'read_machine_state'
}

export interface LateralSensorStatusCommand {
  action: 'lateral_sensor_status'
}

export interface LateralSensorCalibrateZeroCommand {
  action: 'lateral_sensor_calibrate_zero'
}

export type MachineCommand =
  | ListSerialPortsCommand
  | SelectPortCommand
  | DisconnectSerialPortCommand
  | PingCommand
  | LedOnCommand
  | LedOffCommand
  | ReadMachineStateCommand
  | MotorRodaCommand
  | LateralSensorStatusCommand
  | LateralSensorCalibrateZeroCommand
7. Atualize o MachineContext

Arquivo:

src/context/MachineContext.tsx

No import do React, adicione:

useEffect,
useRef,

Ficando assim:

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'

Dentro do MachineProvider, logo após o useReducer, adicione:

const latestLateralValueRef = useRef(0)
const hasReceivedLateralValueRef = useRef(false)

Depois adicione o useEffect:

useEffect(() => {
  const intervalId = window.setInterval(() => {
    if (!hasReceivedLateralValueRef.current) {
      return
    }

    dispatch({
      type: 'ADD_LATERAL_MISALIGNMENT_POINT',
      payload: latestLateralValueRef.current,
    })
  }, 100)

  return () => {
    window.clearInterval(intervalId)
  }
}, [])

Dentro do handleMachineMessage, adicione:

if (message.type === 'lateral_misalignment') {
  latestLateralValueRef.current = message.value
  hasReceivedLateralValueRef.current = true

  dispatch({
    type: 'SET_LATERAL_MISALIGNMENT_CURRENT',
    payload: message.value,
  })

  return
}

Esse fluxo faz o valor atual atualizar imediatamente, mas o gráfico só recebe pontos a cada 100ms.

8. Crie o componente do gráfico

Crie a pasta:

src/components/OscillationChart/

Crie o arquivo:

src/components/OscillationChart/OscillationChart.tsx

Código:

import type { MisalignmentPoint } from '../../types/machine/machine'
import './OscillationChart.css'

type OscillationChartProps = {
  title: string
  value: number
  points: MisalignmentPoint[]
  minValue?: number
  maxValue?: number
  unit?: string
}

export function OscillationChart({
  title,
  value,
  points,
  minValue = -2,
  maxValue = 2,
  unit = ' mm',
}: OscillationChartProps) {
  const width = 520
  const height = 180
  const padding = 20

  const usableWidth = width - padding * 2
  const usableHeight = height - padding * 2

  function normalizeY(pointValue: number) {
    const percentage = (pointValue - minValue) / (maxValue - minValue)

    return height - padding - percentage * usableHeight
  }

  function normalizeX(index: number) {
    if (points.length <= 1) {
      return padding
    }

    return padding + (index / (points.length - 1)) * usableWidth
  }

  const linePoints = points
    .map((point, index) => {
      const x = normalizeX(index)
      const y = normalizeY(point.value)

      return `${x},${y}`
    })
    .join(' ')

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

        <strong className="oscillation-chart-value">
          {value.toFixed(2)}
          {unit}
        </strong>
      </div>

      <svg
        className="oscillation-chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      >
        <rect
          x={padding}
          y={padding}
          width={usableWidth}
          height={usableHeight}
          className="oscillation-chart-border"
        />

        <line
          x1={padding}
          y1={centerY}
          x2={width - padding}
          y2={centerY}
          className="oscillation-chart-center-line"
        />

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
9. Crie o CSS do gráfico

Arquivo:

src/components/OscillationChart/OscillationChart.css

Código:

.oscillation-chart {
  width: 100%;
  background: #07111f;
  border: 1px solid rgba(0, 255, 170, 0.25);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 0 20px rgba(0, 255, 170, 0.08);
}

.oscillation-chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.oscillation-chart-title {
  margin: 0;
  font-size: 18px;
  color: #e8fff7;
}

.oscillation-chart-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #78a99a;
}

.oscillation-chart-value {
  font-size: 28px;
  color: #00ffaa;
  font-family: monospace;
}

.oscillation-chart-svg {
  width: 100%;
  height: 180px;
  display: block;
}

.oscillation-chart-border {
  fill: rgba(0, 0, 0, 0.15);
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
}

.oscillation-chart-center-line {
  stroke: rgba(255, 255, 255, 0.25);
  stroke-width: 1;
  stroke-dasharray: 6 6;
}

.oscillation-chart-line {
  fill: none;
  stroke: #00ffaa;
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(0, 255, 170, 0.7));
}
10. Crie a tela de alinhamento lateral

Crie a pasta:

src/components/screens/LateralAlignmentScreen/

Crie o arquivo:

src/components/screens/LateralAlignmentScreen/LateralAlignmentScreen.tsx

Código:

import type { MisalignmentPoint } from '../../../types/machine/machine'
import { OscillationChart } from '../../OscillationChart/OscillationChart'
import './LateralAlignmentScreen.css'

type LateralAlignmentScreenProps = {
  value: number
  history: MisalignmentPoint[]
}

export function LateralAlignmentScreen({
  value,
  history,
}: LateralAlignmentScreenProps) {
  const maxValue =
    history.length > 0
      ? Math.max(...history.map((point) => point.value))
      : 0

  const minValue =
    history.length > 0
      ? Math.min(...history.map((point) => point.value))
      : 0

  const averageValue =
    history.length > 0
      ? history.reduce((total, point) => total + point.value, 0) /
        history.length
      : 0

  return (
    <div className="screen-page lateral-alignment-screen">
      <h2 className="screen-page-title">Alinhamento lateral</h2>

      <OscillationChart
        title="Gráfico de oscilação"
        value={value}
        points={history}
        minValue={-2}
        maxValue={2}
        unit=" mm"
      />

      <div className="lateral-alignment-cards">
        <div className="lateral-alignment-card">
          <span>Atual</span>
          <strong>{value.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Máximo</span>
          <strong>{maxValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Mínimo</span>
          <strong>{minValue.toFixed(2)} mm</strong>
        </div>

        <div className="lateral-alignment-card">
          <span>Média</span>
          <strong>{averageValue.toFixed(2)} mm</strong>
        </div>
      </div>
    </div>
  )
}
11. Crie o CSS da tela

Arquivo:

src/components/screens/LateralAlignmentScreen/LateralAlignmentScreen.css

Código:

.lateral-alignment-screen {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lateral-alignment-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.lateral-alignment-card {
  background: #07111f;
  border: 1px solid rgba(0, 255, 170, 0.2);
  border-radius: 12px;
  padding: 12px;
}

.lateral-alignment-card span {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #78a99a;
}

.lateral-alignment-card strong {
  font-size: 18px;
  color: #e8fff7;
  font-family: monospace;
}
12. Atualize o tipo AppScreen

Arquivo:

src/types/navigation.ts

Adicione:

| 'alignment'

Exemplo:

export type AppScreen =
  | 'start'
  | 'menu'
  | 'led'
  | 'motors'
  | 'alignment'
  | 'logs'
  | 'serial'
13. Atualize o useHomeMachinePage

Arquivo:

src/hooks/machine/useHomeMachinePage.ts

No return, adicione:

lateralMisalignmentCurrent: state.lateral_misalignment_current,
lateralMisalignmentHistory: state.lateral_misalignment_history,

Exemplo:

return {
  currentScreen,
  logs,
  availablePorts,
  selectedPort,
  sidebarProps,
  statusBarProps,
  led: state.led,
  arduinoConnected: statusBarProps.arduinoConnection,
  speedMotorRoda: state.speed_motor_roda,

  lateralMisalignmentCurrent: state.lateral_misalignment_current,
  lateralMisalignmentHistory: state.lateral_misalignment_history,

  bottomActions,

  goToScreen,
  handleListSerialPorts,
  handleSelectPort,
  handleClearLogs,
  handleDisconnectPort,
}

No getBottomActions, adicione:

case 'alignment':
  return [
    {
      label: 'Voltar ao menu',
      onClick: () => goToScreen('menu'),
      variant: 'orange' as const,
    },
  ]
14. Atualize a HomePage

Arquivo:

src/pages/HomePage.tsx

Pegue os dois valores do hook:

lateralMisalignmentCurrent,
lateralMisalignmentHistory,

E passe para o MachineScreenRenderer:

<MachineScreenRenderer
  led={led}
  currentScreen={currentScreen}
  logs={logs}
  availablePorts={availablePorts}
  selectedPort={selectedPort}
  arduinoConnected={arduinoConnected}
  speedMotorRoda={speedMotorRoda}
  lateralMisalignmentCurrent={lateralMisalignmentCurrent}
  lateralMisalignmentHistory={lateralMisalignmentHistory}
  onSelectPort={handleSelectPort}
  onGoToScreen={goToScreen}
  onListSerialPorts={handleListSerialPorts}
/>
15. Atualize o MachineScreenRenderer

Arquivo:

src/components/screens/MachineScreenRender.tsx

Importe a tela:

import { LateralAlignmentScreen } from './LateralAlignmentScreen/LateralAlignmentScreen'

Importe o tipo:

import type {
  MachineLog,
  SelectedSerialPortState,
  SerialPortInfo,
  ArduinoConnectionState,
  LedUiState,
  MisalignmentPoint,
} from '../../types/machine'

Adicione nas props:

lateralMisalignmentCurrent: number
lateralMisalignmentHistory: MisalignmentPoint[]

Receba na função:

lateralMisalignmentCurrent,
lateralMisalignmentHistory,

Adicione no MenuScreen:

onSelectAlignment={() => onGoToScreen('alignment')}

E adicione o case:

case 'alignment':
  return (
    <LateralAlignmentScreen
      value={lateralMisalignmentCurrent}
      history={lateralMisalignmentHistory}
    />
  )
16. Atualize o MenuScreen

Arquivo:

src/components/screens/MenuScreen.tsx

Adicione a prop:

onSelectAlignment: () => void

Código final:

type MenuScreenProps = {
  onSelectLed: () => void
  onSelectLogs: () => void
  onSelectSerial: () => void
  onSelectMotors: () => void
  onSelectAlignment: () => void
}

export function MenuScreen({
  onSelectLed,
  onSelectLogs,
  onSelectSerial,
  onSelectMotors,
  onSelectAlignment,
}: MenuScreenProps) {
  return (
    <div className="screen-page">
      <h2 className="screen-page-title">Menu principal</h2>

      <div className="screen-page-actions">
        <button className="btn btn-green" onClick={onSelectLed}>
          LED
        </button>

        <button className="btn btn-green" onClick={onSelectMotors}>
          Motores
        </button>

        <button className="btn btn-green" onClick={onSelectAlignment}>
          Alinhamento lateral
        </button>

        <button className="btn btn-green" onClick={onSelectLogs}>
          Logs
        </button>

        <button className="btn btn-green" onClick={onSelectSerial}>
          Portas COM
        </button>
      </div>
    </div>
  )
}
Resultado final do fluxo

Depois disso, o frontend fica assim:

Backend envia:
{ type: "lateral_misalignment", value: 0.28 }

MachineContext recebe
↓
atualiza lateral_misalignment_current
↓
guarda último valor no useRef
↓
a cada 100ms adiciona valor no lateral_misalignment_history
↓
LateralAlignmentScreen recebe value e history
↓
OscillationChart desenha o gráfico

Agora sua arquitetura fica bem organizada:

types/machine/state.ts
  estado global

types/machine/messages.ts
  mensagens backend → frontend

types/machine/actions.ts
  actions do reducer

context/MachineContext.tsx
  recebe mensagens do WebSocket

context/machineReducer.ts
  atualiza o estado global

hooks/machine/useHomeMachinePage.ts
  prepara dados da página

pages/HomePage.tsx
  passa dados para a tela

components/screens/MachineScreenRender.tsx
  decide qual tela renderizar

components/screens/LateralAlignmentScreen/
  tela visual do desalinhamento

components/OscillationChart/
  gráfico reutilizável



















*Arduino*

para verificar as portas disponiveis
python -m serial.tools.list_ports -v


*Templates*

atualmente o que esta no meu painel machine, vai ser o o meu template





*Criando Log para mostrar postas COM disponiveis no Sistema*

1 Passo: *adicionar as portas no seu estado global*
  Front: Criando tipo em Types/Machine.ts

```ts
        export type SerialPortInfo = {
          device: string
          description: string
          hwid: string
        }
```


2 Passo: *Estado inicial*
  Front: Ainda no Machine.ts, dentro da interface MachineState:

```ts
        export interface MachineState {
          connected: boolean
          led: LedUiState
          arduino_connected: ArduinoConnectionState
          logs: MachineLog[]
          available_ports: SerialPortInfo[]
        }

```
3 Passo: *Criar mensagem vinda do backend*
  Front: Ainda no Machine.ts. Adicionar um novo tipo de mensagem:
```ts
        export interface AvailablePortsMessage {
          type: 'available_ports'
          ports: SerialPortInfo[]
        }
```
  E inclua isso na Uniao de Mensagens:
```ts
/*
  União de todas as mensagens que podem chegar
  do backend pelo WebSocket.
*/
        export type MachineMessage =
          | MachineUpdateMessage
          | ConnectionMessage
          | ErrorMessage
          | InfoMessage
          | LogMessage
          | AvailablePortsMessage
```

4 passo: *Criar action para o reducer*
    Front: Machine.ts
```ts
/*
  Ações que o reducer entende.
*/
        export type MachineAction =
          | { type: 'SOCKET_CONNECTED' }
          | { type: 'SOCKET_DISCONNECTED' }
          | { type: 'MACHINE_UPDATED'; payload: MachineUpdatePayload }
          | { type: 'ADD_LOG'; payload: MachineLog }
          | { type: 'CLEAR_LOGS' }
          | { type: 'SET_AVAILABLE_PORTS'; payload: SerialPortInfo[] }
```

5 Passo: *Atualizar o reducer*
  Front: No machineReducer.ts, adicione este case:
```ts
          case 'SET_AVAILABLE_PORTS':
            return {
              ...state,
              available_ports: action.payload,
            }
```


Passo 6: *Fazer o contexto entender essa nova mensagem*
  Front: No MachineContext, dentro do handleMachineMessage, adicione:
```ts
          if (message.type === 'available_ports') {
            dispatch({
              type: 'SET_AVAILABLE_PORTS',
              payload: message.ports,
            })

            dispatch({
              type: 'ADD_LOG',
              payload: {
                direction: 'received',
                message: `Portas encontradas: ${message.ports.length}`,
              },
            })

            return
          }
```


Passo 7: *Criar comando para pedir as portas*
  Front: Seu frontend pode pedir ao backend para listar as portas via WebSocket:
```ts
          sendCommand({
            action: 'list_serial_ports',
          })
```


Passo 8:



Passo 9: *Backend: responder ao comando*
  No seu MachineService, você pode tratar assim:
```py
          from serial.tools import list_ports

          class MachineService:
              def handle_command(self, data):
                  action = data.get('action')

                  if action == 'list_serial_ports':
                      ports = []
                      for port in list_ports.comports():
                          ports.append({
                              'device': port.device,
                              'description': port.description,
                              'hwid': port.hwid,
                          })

                      return {
                          'type': 'available_ports',
                          'ports': ports,
                      }

                  return {
                      'type': 'error',
                      'message': 'Ação desconhecida',
                  }
```






*Atualiazando o componente Led para a nova arquitetura*

1 Passo
  MachinePainelControls
    Este componente é responsável por renderizar os controles específicos de cada tela do painel

  -Foi adicionado led ao case, retornando o <LedControl/>

2 Passo
  useHomeMachinePage.ts
  // Este hook é responsável por gerenciar a lógica da página principal da máquina, 
  // que inclui a navegação entre telas, gerenciamento de ações comuns (como listar 
  // portas seriais, limpar logs, etc) e fornecer os dados necessários para renderizar as telas.

  -Foi adicionado o state.led ao retorno do hook

3 Passo
  MachineScreenRender.tsx
  // Este componente é responsável por renderizar a tela principal do painel, exibindo o conteúdo de acordo 
  // com a tela selecionada no menu lateral. Ele recebe as informações 
  // necessárias para cada tela e as funções de controle como props, garantindo que a lógica de navegação e controle esteja centralizada aqui.

  -foi adicionado state.led as Props
    led: LedUiState
    e adicionado as cases
```ts        
    case 'led':
      return <LedScreen 
        led={led}
      />
```












A lógica de navegação

Fica em um container/page, por exemplo:

PainelMachinePage.tsx
ou MachineController.tsx

Esse componente decide:

em qual tela você está
o que renderizar no screenMain
o que acontece quando aperta ▲ ▼ ◀ ▶ Enter Esc


```ts
import { useMemo } from 'react'
import type {
  MachineCommand,
  MachineState,
  SelectPortCommand,
} from '../../types/machine'

type SerialPortSelectorProps = {
  state: MachineState
  dispatch: React.Dispatch<any>
  send: (payload: MachineCommand) => void
}

export function SerialPortSelector({
  state,
  dispatch,
  send,
}: SerialPortSelectorProps) {
  // Lista de portas disponíveis vinda do estado global
  const ports = state.available_ports

  /*
    Descobre em qual posição do array está a porta atualmente selecionada.
    Se nenhuma estiver selecionada, o resultado será -1.
  */
  const selectedIndex = useMemo(() => {
    return ports.findIndex((port) => port.device === state.selected_port)
  }, [ports, state.selected_port])

  /*
    Índice seguro para navegação.
    Se ainda não houver porta selecionada, usamos 0 como referência.
  */
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0

  /*
    Seleciona a porta anterior na lista.
    Aqui apenas atualizamos o state do frontend.
    Ainda não enviamos nada para o backend.
  */
  function handlePreviousPort() {
    if (ports.length === 0) return

    const previousIndex =
      safeIndex === 0 ? ports.length - 1 : safeIndex - 1

    const previousPort = ports[previousIndex]

    dispatch({
      type: 'SET_SELECTED_PORT',
      payload: previousPort.device,
    })
  }

  /*
    Seleciona a próxima porta na lista.
    Também só altera o state local/global do frontend.
  */
  function handleNextPort() {
    if (ports.length === 0) return

    const nextIndex =
      safeIndex === ports.length - 1 ? 0 : safeIndex + 1

    const nextPort = ports[nextIndex]

    dispatch({
      type: 'SET_SELECTED_PORT',
      payload: nextPort.device,
    })
  }

  /*
    Confirma a porta escolhida e envia ao backend.
    Esse é o momento em que o frontend realmente manda o comando.
  */
  function handleConfirmPort() {
    if (!state.selected_port) return

    const command: SelectPortCommand = {
      action: 'select_port',
      port: state.selected_port,
    }

    send(command)
  }

  /*
    Solicita ao backend a lista atualizada de portas seriais.
  */
  function handleListPorts() {
    send({ action: 'list_serial_ports' })
  }

  /*
    Busca o objeto completo da porta selecionada
    para exibir device, description e hwid na tela.
  */
  const selectedPortInfo =
    ports.find((port) => port.device === state.selected_port) ?? null

  return (
    <div className="serial-port-selector">
      <h3>Porta COM</h3>

      <div className="serial-port-display">
        {selectedPortInfo ? (
          <>
            <p>
              <strong>Selecionada:</strong> {selectedPortInfo.device}
            </p>
            <p>{selectedPortInfo.description}</p>
            <p>{selectedPortInfo.hwid}</p>
          </>
        ) : (
          <p>Nenhuma porta selecionada</p>
        )}
      </div>

      <div className="serial-port-actions">
        <button onClick={handlePreviousPort}>◀ Porta Anterior</button>
        <button onClick={handleNextPort}>Próxima Porta ▶</button>
        <button onClick={handleConfirmPort}>Enter / Confirmar</button>
        <button onClick={handleListPorts}>Listar Portas Seriais</button>
      </div>

      <ul className="serial-port-list">
        {ports.map((port) => (
          <li
            key={port.device}
            className={
              state.selected_port === port.device ? 'selected-port' : ''
            }
          >
            {port.device} - {port.description}
          </li>
        ))}
      </ul>
    </div>
  )
}
```
Visão geral da arquitetura
src/
  hooks/
    machine/
      useLedActions.ts

  components/
    controls/
      ToggleControl/
        ToggleControl.tsx

    PainelComponents/
      led/
        LedControl.tsx

  pages/
    HomePage.tsx

A ideia principal é separar o projeto em responsabilidades:

pages → montam telas
components → mostram interface
hooks → guardam lógica reutilizável ligada ao React
components/controls → peças genéricas
components/PainelComponents → peças específicas do painel/máquina
1. hooks/machine/useLedActions.ts
Função dele

Esse arquivo guarda a lógica de ação do LED.

Exemplo do que fica aí:

ligar LED
desligar LED
chamar sendCommand
conversar com contexto
Por que isso fica em hooks

Porque ele usa:

useMachineContext()
estado/contexto React
lógica ligada à interface

Ou seja, ele não é um componente visual.
Ele é uma camada de comportamento.

Papel na arquitetura

Ele responde à pergunta:

“Como eu executo a ação de ligar ou desligar o LED?”

Então:

HomePage não precisa saber como ligar LED
LedControl não precisa saber como montar comando
o hook centraliza isso
Resumo para anotação
useLedActions.ts = lógica de ações do LED.
Fica em hooks porque usa contexto e encapsula comportamento reutilizável.
2. components/controls/ToggleControl/ToggleControl.tsx
Função dele

Esse é o componente genérico de UI.

Ele não sabe nada sobre LED.
Ele apenas mostra dois botões, por exemplo:

ativar / desativar
ligar / desligar
iniciar / parar
Por que ele fica em controls

Porque ele é um controle reutilizável da interface.

Você pode usar esse mesmo componente para:

LED
motor
sensor
conexão serial
modo automático
Papel na arquitetura

Ele responde à pergunta:

“Como mostrar um controle visual de duas ações opostas?”

Ele só cuida da aparência e da interação visual.

O que ele não deve fazer

Ele não deve:

usar useMachineContext
montar payload de comando
saber o que é LED
saber o que é Arduino

Porque isso faria ele deixar de ser genérico.

Resumo para anotação
ToggleControl.tsx = componente visual genérico.
Serve para qualquer controle binário (ligar/desligar, ativar/desativar, iniciar/parar).
Não conhece regra de negócio.
3. components/PainelComponents/led/LedControl.tsx
Função dele

Esse componente é a ponte entre:

o componente genérico (ToggleControl)
a lógica específica do LED (useLedActions)

Ele é específico do domínio da sua máquina.

Por que ele fica em PainelComponents/led

Porque ele já não é mais genérico.
Ele representa um controle real do painel: o controle do LED.

Então ele pertence à área da máquina/painel.

Papel na arquitetura

Ele responde à pergunta:

“Como eu monto o controle específico do LED usando as peças genéricas do sistema?”

Ele pega:

turnLedOn
turnLedOff

e injeta isso no ToggleControl.

Por que isso é útil

Porque você separa:

o genérico → ToggleControl
o específico → LedControl

Assim, amanhã você pode ter:

MotorControl.tsx
SensorControl.tsx
SerialConnectionControl.tsx

todos usando componentes genéricos por baixo.

Resumo para anotação
LedControl.tsx = componente específico do LED.
Conecta a lógica do LED com o componente genérico de interface.
É um adaptador entre domínio e UI reutilizável.
4. pages/HomePage.tsx
Função dele

A HomePage é a composição da tela.

Ela não deve ficar cheia de regra de negócio.
Ela deve principalmente:

organizar layout
juntar componentes
passar estado necessário para a tela
Papel na arquitetura

Ela responde à pergunta:

“Quais partes aparecem na tela inicial?”

Exemplo:

ScreenMain
ScreenStatusBar
PainelControls
LedControl
SerialPortList
O que a HomePage não deve fazer

Ela não deve virar lugar de:

handleTurnLedOn
handleTurnLedOff
handleStartMotor
handleStopMotor
handleSelectPort

Se fizer isso, ela começa a virar um “arquivo depósito de lógica”.

Resumo para anotação
HomePage.tsx = monta a tela.
Seu papel é composição, não concentração de lógica.
Relação entre as camadas

O fluxo fica assim:

HomePage
  -> usa LedControl
      -> usa useLedActions
          -> usa useMachineContext
      -> renderiza ToggleControl

Ou, em palavras:

a página monta o componente do LED
o componente do LED usa o hook com a lógica
o hook envia os comandos
o componente visual só exibe os botões
O grande benefício dessa arquitetura

Ela cria baixo acoplamento.

Sem arquitetura

Se você colocasse tudo na HomePage:

a página ficaria gigante
a lógica ficaria espalhada
seria difícil testar
seria difícil reutilizar
Com essa arquitetura

Cada parte tem uma responsabilidade clara:

Hook = lógica
Componente genérico = UI reutilizável
Componente específico = adaptação do domínio
Página = composição
Regra profissional que você pode anotar

Use esta regra no projeto:

1. Se o código usa React Context, estado, efeitos e ações reutilizáveis

coloque em hooks

2. Se o código só desenha interface e recebe props

coloque em components

3. Se o componente é reutilizável e genérico

coloque em components/controls

4. Se o componente é específico da máquina

coloque em components/PainelComponents

5. Se o arquivo só junta partes para formar uma tela

coloque em pages

Como isso escala no seu projeto

Essa arquitetura foi uma boa escolha porque seu projeto vai crescer.
Você já está indo para algo com:

LED
motor
portas COM
telas/menu
status da máquina
sensores
comandos manuais

Então amanhã você pode fazer assim:

src/
  hooks/
    machine/
      useLedActions.ts
      useMotorActions.ts
      useSerialPortActions.ts
      useMenuNavigation.ts

  components/
    controls/
      ToggleControl/
        ToggleControl.tsx
      DirectionPad/
        DirectionPad.tsx
      MenuList/
        MenuList.tsx

    PainelComponents/
      led/
        LedControl.tsx
      motor/
        MotorControl.tsx
      serial/
        SerialPortControl.tsx
      menu/
        MainMenu.tsx

  pages/
    HomePage.tsx
    LedPage.tsx
    SerialPortPage.tsx

Ou seja, o padrão que você montou já prepara o projeto para escalar.

Uma observação importante

Essa arquitetura está ótima para ações ligadas ao React.

Mais para frente, quando você quiser subir o nível ainda mais, você pode adicionar:

services/
  machine/
    machineCommands.ts

Aí esse arquivo ficaria responsável por criar os comandos, por exemplo:

createLedOnCommand()
createLedOffCommand()
createRotateMotorCommand()

Então a divisão ficaria ainda melhor:

services = criação e transformação de dados
hooks = uso desses dados com contexto/UI
components = interface
pages = composição

Mas, por enquanto, o que você fez já está muito bom.

Anotação pronta para você guardar
Arquitetura atual do projeto:

1. pages/
Responsável por montar a tela.
A página junta os componentes e organiza o layout.
Não deve concentrar lógica de negócio.

2. hooks/
Responsável por encapsular lógica reutilizável ligada ao React.
Aqui ficam ações que usam contexto, estado e envio de comandos.
Exemplo: useLedActions.ts

3. components/controls/
Responsável por componentes genéricos e reutilizáveis da interface.
Esses componentes não conhecem a regra de negócio.
Exemplo: ToggleControl.tsx

4. components/PainelComponents/
Responsável por componentes específicos do domínio da máquina.
Esses componentes conectam a lógica do domínio com componentes genéricos.
Exemplo: LedControl.tsx

Fluxo:
HomePage monta a tela
LedControl representa o controle específico do LED
useLedActions guarda a lógica do LED
ToggleControl renderiza os botões de forma genérica


*modelo arquitetura do estado no front*
state.ts
O que a aplicação guarda no estado

commands.ts
O que o React envia para o Django

messages.ts
O que o Django envia para o React

actions.ts
O que o reducer usa internamente