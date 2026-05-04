Tutorial do Projeto Machine / Alinhador
1. Visão geral do projeto

Seu projeto é um painel de controle para uma máquina de alinhamento de roda.

A arquitetura geral é esta:

Arduino
  ↓ Serial USB
Django Backend
  ↓ WebSocket
React Frontend
  ↓ State global / props
Componentes visuais da tela

A ideia principal é:

Arduino mede ou executa algo
↓
Django lê ou envia comandos pela serial
↓
Django manda atualizações para o frontend via WebSocket
↓
React atualiza o estado global
↓
Componentes mostram o estado na tela

Hoje seu projeto já trabalha com:

LED
Porta serial
Status do Arduino
Motor da roda
Velocidade do motor
Sensor de desalinhamento lateral
Gráfico de oscilação
Logs
Menu de navegação
2. Fluxo principal da aplicação
Fluxo resumido
Arduino
↓
SerialService
↓
MachineConsumer
↓
MachineStateService
↓
BroadcastService
↓
WebSocket
↓
machineSocket.ts
↓
useMachineSocket.ts
↓
MachineContext.tsx
↓
machineReducer.ts
↓
useHomeMachinePage.ts
↓
HomePage.tsx
↓
MachineScreenRenderer.tsx
↓
Tela específica

Esse é o caminho completo de uma informação.

Por exemplo, quando o Arduino envia:

POS:12.50

o caminho é:

Arduino envia POS:12.50
↓
Django lê pela serial
↓
Django identifica que começa com POS:
↓
Django converte para float
↓
Django manda machine_update pelo WebSocket
↓
React recebe a mensagem
↓
MachineContext atualiza o state
↓
LateralAlignmentScreen recebe o valor
↓
OscillationChart mostra no gráfico
3. Arduino

O Arduino é responsável por:

Ler o sensor lateral
Controlar o motor
Controlar LED
Responder comandos vindos do backend
Enviar valores pela Serial

No seu código Arduino, o sensor lateral envia mensagens assim:

Serial.print("POS:");
Serial.println(positionMm, 1);

Ou seja, ele manda algo como:

POS:14.8
POS:15.0
POS:-2.3

O Django espera exatamente esse formato:

POS:valor

No código que revisamos, o Arduino estava com:

const unsigned long SENSOR_INTERVAL = 20;

Isso significa que ele tenta mandar leitura a cada 20ms, aproximadamente:

50 leituras por segundo

Esse ponto foi importante porque antes estava com 100ms ou 120ms, o que limitava o envio para aproximadamente 8 a 10 leituras por segundo.

4. Backend Django

O backend Django tem alguns papéis principais:

Abrir conexão serial com o Arduino
Enviar comandos para o Arduino
Ler respostas do Arduino
Interpretar mensagens da serial
Enviar atualizações para o frontend via WebSocket
Salvar estados importantes no banco quando necessário
4.1 SerialService

O arquivo serial_service.py é o responsável por conversar diretamente com o Arduino.

Ele cuida de:

Selecionar porta serial
Conectar
Desconectar
Enviar comandos
Ler linhas da serial
Ler JSON quando necessário

A função mais importante para o sensor lateral é:

def read_line(self) -> str | None:

Ela usa:

raw_data = self.connection.readline()

Isso significa que o Django fica lendo linha por linha que o Arduino envia.

O timeout está configurado como:

timeout: float = 0.05

Esse valor é aceitável para o fluxo atual. Ele permite que o backend leia com boa frequência quando o Arduino está enviando rápido.

4.2 MachineConsumer

O MachineConsumer é o WebSocket principal do backend.

Ele faz estas coisas:

Aceita conexão WebSocket
Adiciona o cliente ao grupo machine_updates
Cria uma thread para escutar a serial
Envia o estado inicial para o frontend
Recebe comandos do frontend
Envia respostas para o frontend

A parte mais importante para o sensor lateral é o listener da serial:

def start_serial_listener(self):

Esse listener fica rodando em loop:

Verifica se a serial está conectada
↓
Lê uma linha da serial
↓
Se a linha começa com POS:
↓
Converte o valor para float
↓
Chama broadcast_lateral_sensor_state(value)

O fluxo é este:

line = self.machine_service.serial_service.read_line()

if line.startswith('POS:'):
    value = float(line.replace('POS:', '').strip())

    self.machine_state_service.broadcast_lateral_sensor_state(value)

Esse é o ponto onde o Django transforma uma mensagem crua do Arduino em atualização para o frontend.

Durante os testes, você adicionou contadores para medir velocidade. Eles mostraram que, depois de ajustar o Arduino, o Django passou a receber cerca de 50 leituras por segundo.

Para a aplicação final, aqueles print de velocidade podem ser removidos, porque eram só para diagnóstico.

4.3 MachineStateService

O MachineStateService cuida do estado da máquina.

Ele tem dois tipos de responsabilidade:

1. Atualizações persistentes
   Exemplo: LED, velocidade do motor, estado salvo no banco

2. Atualizações rápidas em tempo real
   Exemplo: sensor lateral

Para o sensor lateral, a função principal é:

def broadcast_lateral_sensor_state(self, value: float) -> None:

Ela envia o valor para o frontend sem salvar no banco:

self.broadcast_service.broadcast_machine_state(
    payload={
        'lateral_misalignment_current': value,
    }
)

Isso é correto, porque leitura rápida de sensor não deve ficar salvando no banco a cada atualização.

O serviço também tem um controle de frequência:

self.lateral_broadcast_interval = 0.05

Isso limita o envio para aproximadamente:

20 atualizações por segundo

Esse valor é bom para o frontend. Para uma tela visual, 20 a 30 atualizações por segundo já costuma parecer em tempo real.

4.4 BroadcastService

O BroadcastService é uma camada simples para enviar mensagens para o grupo WebSocket.

Ele envia mensagens assim:

{
    'type': 'machine_update',
    'payload': payload,
}

Então, quando o sensor lateral manda valor, o frontend recebe algo assim:

{
  "type": "machine_update",
  "payload": {
    "lateral_misalignment_current": 12.5
  }
}

Esse formato é o padrão principal do seu sistema.

5. Frontend React

O frontend é organizado em algumas camadas:

services
hooks
context
reducer
pages
screen renderer
screens
components visuais
6. WebSocket no frontend
6.1 machineSocket.ts

Esse arquivo cria a conexão WebSocket com o Django.

Ele usa:

const socket = new WebSocket('ws://127.0.0.1:8000/ws/machine/')

Esse endereço aponta para o backend local.

O socket.onmessage faz:

const data = JSON.parse(event.data) as MachineMessage

onMessage(data)

Ou seja:

Recebe mensagem crua do Django
↓
Converte JSON para objeto
↓
Entrega para o callback onMessage

Esse arquivo não deve ter regra de negócio. Ele só cria, recebe e envia mensagens.

Também é importante manter:

socket.onclose = () => {
  onClose()
}

porque isso atualiza o estado de conexão quando o WebSocket fecha.

6.2 useMachineSocket.ts

Esse hook usa o machineSocket.ts.

Ele faz:

Cria o socket
Guarda o socket em uma ref
Fecha o socket ao desmontar
Fornece a função send

O papel dele é deixar o uso do WebSocket mais limpo dentro do contexto.

Ele recebe:

onConnected
onDisconnected
onMachineMessage

E cria o socket assim:

const socket = createMachineSocket(
  onConnected,
  onDisconnected,
  onMachineMessage,
)

Esse arquivo está correto e deve continuar simples.

7. MachineContext

O MachineContext.tsx é uma das partes mais importantes do frontend.

Ele guarda o estado global da máquina usando:

const [state, dispatch] = useReducer(machineReducer, initialMachineState)

Ele fornece para o resto da aplicação:

state
dispatch
send
sendCommand
7.1 O que o MachineContext faz

Ele é responsável por:

Guardar estado global
Receber mensagens do WebSocket
Transformar mensagens em actions do reducer
Enviar comandos para o backend
Registrar logs
Controlar conexão/desconexão
Atualizar valor do sensor lateral
Atualizar histórico do gráfico
7.2 Quando chega machine_update

Quando chega uma mensagem:

{
  "type": "machine_update",
  "payload": {
    "lateral_misalignment_current": 10.5
  }
}

O MachineContext deve:

Guardar o valor mais recente em uma ref
Marcar que já recebeu valor lateral
Fazer dispatch de MACHINE_UPDATED

A ideia correta é:

if (message.type === 'machine_update') {
  const lateralValue = message.payload.lateral_misalignment_current

  if (lateralValue !== undefined) {
    latestLateralValueRef.current = lateralValue
    hasReceivedLateralValueRef.current = true
  }

  dispatch({
    type: 'MACHINE_UPDATED',
    payload: message.payload,
  })

  return
}

Isso faz duas coisas:

MACHINE_UPDATED
→ atualiza o valor atual mostrado na tela

latestLateralValueRef
→ guarda o último valor para alimentar o histórico do gráfico
7.3 Histórico do gráfico

O histórico não deve ser atualizado a cada mensagem recebida, porque podem chegar muitas mensagens por segundo.

Por isso o seu projeto usa um setInterval:

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

Esse trecho alimenta o gráfico a cada:

100ms = 10 pontos por segundo

Isso é bom porque:

O valor atual pode atualizar rápido
O gráfico recebe pontos em frequência controlada
A aplicação não fica pesada demais
8. machineReducer

O machineReducer.ts é a função que realmente altera o estado global.

Ele recebe:

state atual
action

E retorna:

novo state
8.1 Estado inicial

Seu estado inicial tem:

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

Isso significa:

Começa desconectado
LED desligado
Arduino desconectado
Sem logs
Sem porta selecionada
Velocidade 0
Desalinhamento atual 0
Histórico vazio
8.2 MACHINE_UPDATED

Essa action atualiza partes do estado vindas do backend.

Ela trata:

LED
Arduino conectado
Porta selecionada
Velocidade do motor
Valor atual do desalinhamento

Para o sensor lateral:

lateral_misalignment_current:
  lateralValue !== undefined
    ? lateralValue
    : state.lateral_misalignment_current,

Ou seja:

Se veio valor novo, atualiza
Se não veio, mantém o valor antigo

Isso é importante porque machine_update pode vir só com uma parte do estado.

Exemplo:

{
  "type": "machine_update",
  "payload": {
    "arduino_connected": true
  }
}

Nesse caso, ele não deve apagar LED, velocidade ou sensor.

8.3 ADD_LATERAL_MISALIGNMENT_POINT

Essa action adiciona pontos no histórico do gráfico:

const newPoint = {
  id: Date.now(),
  value: action.payload,
}

Depois mantém apenas os últimos 100 pontos:

const updatedHistory = [
  ...state.lateral_misalignment_history,
  newPoint,
].slice(-100)

Isso evita que o array cresça infinitamente.

O gráfico então mostra só os pontos mais recentes.

9. Tipos TypeScript

Seus tipos principais ficam em:

src/types/machine
9.1 state.ts

Esse arquivo define o formato do estado global.

O sensor lateral usa:

export type MisalignmentPoint = {
  id: number
  value: number
}

E no MachineState:

lateral_misalignment_current: number
lateral_misalignment_history: MisalignmentPoint[]

Isso significa:

lateral_misalignment_current
→ valor atual do sensor

lateral_misalignment_history
→ lista de pontos para o gráfico
9.2 messages.ts

Esse arquivo define o que o backend pode mandar para o frontend.

O principal é:

export interface MachineUpdatePayload {
  led?: LedBackendState
  arduino_connected?: boolean
  selected_port?: SelectedSerialPortState
  speed_motor_roda?: number
  lateral_misalignment_current?: number
}

Todos os campos são opcionais porque o backend pode mandar só o que mudou.

Exemplo só do sensor:

{
  "lateral_misalignment_current": 10.2
}

Exemplo do LED:

{
  "led": "ON",
  "arduino_connected": true
}
9.3 actions.ts

Esse arquivo define as actions internas do reducer.

Para o sensor lateral, as principais são:

| { type: 'SET_LATERAL_MISALIGNMENT_CURRENT'; payload: number }
| { type: 'ADD_LATERAL_MISALIGNMENT_POINT'; payload: number }

Mas no fluxo normal atual, o valor atual é atualizado principalmente por:

MACHINE_UPDATED

E o histórico por:

ADD_LATERAL_MISALIGNMENT_POINT
10. useHomeMachinePage

Esse hook organiza os dados da página principal.

Ele junta:

state global
dados da tela
ações dos botões inferiores
funções de navegação
funções de porta serial

Ele retorna coisas como:

currentScreen
logs
availablePorts
selectedPort
sidebarProps
statusBarProps
led
speedMotorRoda
lateralMisalignmentCurrent
lateralMisalignmentHistory
bottomActions

Esse hook é importante porque deixa a HomePage mais limpa.

10.1 bottomActions com useMemo

Você colocou:

const bottomActions = useMemo(() => {
  return getBottomActions({
    currentScreen,
    goToScreen,
    handleClearLogs,
    handleListSerialPorts,
    handleDisconnectPort,
  })
}, [
  currentScreen,
  goToScreen,
  handleClearLogs,
  handleListSerialPorts,
  handleDisconnectPort,
])

Isso é bom porque evita recriar os botões inferiores toda vez que qualquer coisa muda.

Como você percebeu no React DevTools, isso ajuda a reduzir renderizações desnecessárias.

11. HomePage

A HomePage monta o painel principal.

Ela usa:

const {
  currentScreen,
  logs,
  availablePorts,
  selectedPort,
  arduinoConnected,
  speedMotorRoda,
  lateralMisalignmentCurrent,
  lateralMisalignmentHistory,
  sidebarProps,
  statusBarProps,
  bottomActions,
  led,
  goToScreen,
  handleListSerialPorts,
  handleSelectPort,
} = useHomeMachinePage()

E monta:

<PainelMachineTemplate
  screenMain={...}
  bottomControls={...}
/>

A estrutura visual é:

PainelMachineTemplate
  ├── ScreenMain
  │     ├── MachineScreenRenderer
  │     ├── ScreenSidebar
  │     ├── ScreenStatusBar
  │     └── MachinePainelControls
  │
  └── BottomControls
12. MachineScreenRenderer

Esse componente escolhe qual tela mostrar.

Ele recebe:

currentScreen

E faz:

switch (currentScreen)

Exemplo:

case 'alignment':
  return (
    <LateralAlignmentScreen
      value={lateralMisalignmentCurrent}
      history={lateralMisalignmentHistory}
    />
  )

Ou seja:

Se a tela atual for alignment
↓
Mostra LateralAlignmentScreen
↓
Passa valor atual e histórico

Esse componente é o lugar certo para adicionar novas telas.

13. LateralAlignmentScreen

Essa é a tela do alinhamento lateral.

Ela recebe:

value
history

E calcula:

Valor máximo
Valor mínimo
Média

Com:

useMemo

Isso é bom porque o cálculo só refaz quando o history muda.

Ela renderiza:

Título
Gráfico de oscilação
Card Atual
Card Máximo
Card Mínimo
Card Média

E passa para o gráfico:

<OscillationChart
  title="Gráfico de oscilação"
  value={value}
  points={history}
  minValue={-15}
  maxValue={15}
  unit=" mm"
/>
14. OscillationChart

Esse componente desenha o gráfico.

Ele recebe:

title
value
points
minValue
maxValue
unit

Ele mostra:

Título
Valor atual
SVG do gráfico
Linha central
Texto de escala
Polyline com histórico

A linha do gráfico vem de:

<polyline
  points={linePoints}
  className="oscillation-chart-line"
/>

O linePoints é gerado a partir do histórico:

points.map(...)

Você já colocou useMemo para evitar recalcular desnecessariamente.

15. Como criar uma nova tela

Suponha que você queira criar uma nova tela chamada:

VerticalAlignmentScreen

O passo a passo seria:

Passo 1 — criar o componente

Criar arquivo:

src/components/screens/VerticalAlignmentScreen/VerticalAlignmentScreen.tsx

Exemplo:

import './VerticalAlignmentScreen.css'

type VerticalAlignmentScreenProps = {
  value: number
}

export function VerticalAlignmentScreen({
  value,
}: VerticalAlignmentScreenProps) {
  return (
    <div className="screen-page vertical-alignment-screen">
      <h2 className="screen-page-title">Alinhamento vertical</h2>

      <div className="vertical-alignment-card">
        <span>Valor atual</span>
        <strong>{value.toFixed(2)} mm</strong>
      </div>
    </div>
  )
}
Passo 2 — adicionar tipo de tela

No arquivo de navegação, provavelmente:

src/types/navigation.ts

Você teria algo assim:

export type AppScreen =
  | 'start'
  | 'menu'
  | 'led'
  | 'motors'
  | 'logs'
  | 'serial'
  | 'alignment'

Adicione:

| 'verticalAlignment'

Ficaria:

export type AppScreen =
  | 'start'
  | 'menu'
  | 'led'
  | 'motors'
  | 'logs'
  | 'serial'
  | 'alignment'
  | 'verticalAlignment'
Passo 3 — adicionar no menu

No MachineScreenRenderer, dentro do MenuScreen, você teria que passar uma nova função para abrir a tela.

Hoje você tem algo como:

<MenuScreen
  onSelectLed={() => onGoToScreen('led')}
  onSelectLogs={() => onGoToScreen('logs')}
  onSelectSerial={onListSerialPorts}
  onSelectMotors={() => onGoToScreen('motors')}
  onSelectAlignment={() => onGoToScreen('alignment')}
/>

Você adicionaria:

onSelectVerticalAlignment={() => onGoToScreen('verticalAlignment')}

Mas isso exige também alterar o MenuScreen para receber essa prop e criar o botão.

Passo 4 — importar a nova tela

No MachineScreenRenderer:

import { VerticalAlignmentScreen } from './VerticalAlignmentScreen/VerticalAlignmentScreen'
Passo 5 — adicionar case no switch
case 'verticalAlignment':
  return (
    <VerticalAlignmentScreen
      value={verticalMisalignmentCurrent}
    />
  )

Claro que antes você precisaria criar esse valor no state.

16. Como adicionar um novo valor vindo do Arduino

Suponha que você queira adicionar sensor vertical.

O Arduino poderia mandar:

VERT:3.50

O Django teria que ler isso no MachineConsumer:

if line.startswith('VERT:'):
    value = float(line.replace('VERT:', '').strip())

    self.machine_state_service.broadcast_vertical_sensor_state(value)

Depois criar no MachineStateService:

def broadcast_vertical_sensor_state(self, value: float) -> None:
    self.broadcast_service.broadcast_machine_state(
        payload={
            'vertical_misalignment_current': value,
        }
    )

No frontend, adicionar em MachineUpdatePayload:

vertical_misalignment_current?: number

Adicionar no MachineState:

vertical_misalignment_current: number
vertical_misalignment_history: MisalignmentPoint[]

Adicionar no initialMachineState:

vertical_misalignment_current: 0,
vertical_misalignment_history: [],

Adicionar no reducer:

vertical_misalignment_current:
  action.payload.vertical_misalignment_current !== undefined
    ? action.payload.vertical_misalignment_current
    : state.vertical_misalignment_current,

E se quiser histórico:

case 'ADD_VERTICAL_MISALIGNMENT_POINT':

Depois passar pela HomePage, MachineScreenRenderer e tela nova.

17. Como criar um novo comando para o Arduino

Exemplo: calibrar sensor lateral.

Você já tem comando no TypeScript:

export interface LateralSensorCalibrateZeroCommand {
  action: 'lateral_sensor_calibrate_zero'
}

O fluxo para comando é:

Botão no React
↓
sendCommand({ action: '...' })
↓
MachineContext
↓
useMachineSocket
↓
machineSocket.ts
↓
Django receive()
↓
MachineService.handle_command()
↓
SerialService.send_command()
↓
Arduino handleCommand()

Para um comando novo funcionar, ele precisa existir nos dois lados.

17.1 No frontend

Criar uma função:

function handleCalibrateSensor() {
  sendCommand({
    action: 'lateral_sensor_calibrate_zero',
  })
}
17.2 No backend

No MachineService.handle_command, precisa mapear:

if action == 'lateral_sensor_calibrate_zero':
    return self.serial_service.send_command('LATERAL_SENSOR_CALIBRATE_ZERO')
17.3 No Arduino

No handleCommand:

if (command == "LATERAL_SENSOR_CALIBRATE_ZERO") {
  calibrateLateralSensorZero();
  return;
}

E criar a função:

void calibrateLateralSensorZero() {
  // lógica de calibração
  Serial.println("{\"success\":true,\"type\":\"info\",\"message\":\"Sensor lateral calibrado\"}");
}
18. Padrão ideal para criar novos componentes

Para não quebrar a aplicação, siga sempre esta ordem:

1. Criar o componente visual puro

Primeiro crie um componente que só recebe props.

Exemplo:

type SensorValueCardProps = {
  label: string
  value: number
  unit?: string
}

export function SensorValueCard({
  label,
  value,
  unit = ' mm',
}: SensorValueCardProps) {
  return (
    <div className="sensor-value-card">
      <span>{label}</span>
      <strong>{value.toFixed(2)}{unit}</strong>
    </div>
  )
}

Esse componente não deve acessar contexto, WebSocket ou reducer.

2. Testar com valor fixo

Antes de ligar no state real, teste assim:

<SensorValueCard label="Teste" value={12.34} />

Se aparecer certo, o visual está ok.

3. Passar valor por props

Depois passe o valor real:

<SensorValueCard
  label="Desalinhamento atual"
  value={lateralMisalignmentCurrent}
/>
4. Só depois mexer no backend ou reducer

Não misture tudo de uma vez.

A ordem segura é:

Componente visual
↓
Props
↓
State
↓
Reducer
↓
Context
↓
WebSocket
↓
Backend
↓
Arduino
19. Como evitar renderização desnecessária

Você usou o React DevTools para ver quando componentes renderizam.

Você percebeu que muitos componentes piscavam quando o sensor atualizava.

Isso acontece porque:

sensor atualiza state global
↓
context muda
↓
HomePage renderiza
↓
componentes filhos podem renderizar

Para reduzir isso, você começou a usar:

memo
useMemo
useCallback
19.1 Quando usar memo

Use memo em componentes que recebem props simples e não precisam renderizar toda hora.

Bons candidatos:

ScreenSidebar
ScreenStatusBar
BottomControls
MachinePainelControls
PainelControls

Exemplo:

import { memo } from 'react'

function ScreenStatusBarComponent({
  arduinoConnection,
  led,
}: ScreenStatusBarProps) {
  return (
    <div className="screen-statusbar">
      <span>Arduino: {arduinoConnection}</span>
      <span>LED: {led}</span>
    </div>
  )
}

export const ScreenStatusBar = memo(ScreenStatusBarComponent)
19.2 Quando usar useMemo

Use useMemo quando você calcula algo derivado de dados.

Exemplo:

const { maxValue, minValue, averageValue } = useMemo(() => {
  ...
}, [history])

Isso evita recalcular máximo, mínimo e média em renderizações que não mudam o histórico.

19.3 Quando usar useCallback

Use useCallback em funções passadas para componentes filhos.

Exemplo:

const goToScreen = useCallback((screen: AppScreen) => {
  setCurrentScreen(screen)
}, [])

Isso ajuda o memo dos componentes filhos a funcionar melhor.

20. O que aprendemos sobre velocidade hoje

Durante os testes, descobrimos:

Antes
Arduino enviava a cada 100ms ou 120ms
↓
Django recebia 8 a 11 leituras/s
↓
Frontend parecia atrasado
Depois

Mudando o Arduino para:

const unsigned long SENSOR_INTERVAL = 20;

O Django passou a receber:

aproximadamente 50 leituras/s

Depois vimos que o frontend também recebia rápido.

Então o gargalo inicial era o intervalo do Arduino.

21. Frequência recomendada

Para seu projeto, uma boa configuração é:

Arduino lendo/enviando: 20ms
Django limitando broadcast: 0.05s
Histórico do gráfico no frontend: 100ms

Isso significa:

Arduino → Django: até 50/s
Django → Frontend: até 20/s
Histórico do gráfico: 10 pontos/s
Valor atual: atualiza quando chega machine_update

Essa combinação é equilibrada.

Ela evita:

travamento
renderização excessiva
gráfico pesado
WebSocket sobrecarregado
22. Checklist para criar uma nova feature

Sempre que for criar uma nova função, siga este checklist:

Frontend
[ ] Criar tipo no state.ts, se for estado global
[ ] Criar campo no MachineState
[ ] Adicionar valor no initialMachineState
[ ] Adicionar campo no MachineUpdatePayload, se vier do backend
[ ] Adicionar action no actions.ts, se necessário
[ ] Atualizar machineReducer
[ ] Expor valor no useHomeMachinePage
[ ] Passar prop na HomePage
[ ] Passar prop no MachineScreenRenderer
[ ] Criar tela ou componente visual
Backend
[ ] Arduino envia mensagem no formato combinado
[ ] SerialService consegue ler a linha
[ ] MachineConsumer interpreta a linha
[ ] MachineStateService cria função de broadcast/update
[ ] BroadcastService envia machine_update
[ ] MachineService trata comandos, se for comando
Arduino
[ ] Criar leitura ou ação
[ ] Criar função específica
[ ] Criar comando no handleCommand, se necessário
[ ] Enviar resposta em formato previsível
[ ] Evitar delay() desnecessário
[ ] Usar millis() para tarefas repetitivas
23. Padrão recomendado de mensagens
Arduino para Django

Para sensor rápido:

POS:12.50

Para JSON de resposta de comando:

{"success":true,"type":"led_status","state":"ON","message":"LED ligado"}
Django para React

Sempre que atualizar estado:

{
  "type": "machine_update",
  "payload": {
    "campo": "valor"
  }
}

Para logs:

{
  "type": "log",
  "direction": "received",
  "message": "Mensagem..."
}

Para erro:

{
  "type": "error",
  "message": "Erro..."
}
24. Regra de ouro do seu projeto

A regra mais importante é:

Componente visual não deve saber de WebSocket, Django ou Arduino.

Componente visual deve receber props.

Exemplo bom:

<LateralAlignmentScreen
  value={lateralMisalignmentCurrent}
  history={lateralMisalignmentHistory}
/>

Exemplo ruim:

LateralAlignmentScreen acessando WebSocket diretamente

O fluxo correto é:

WebSocket
↓
Context
↓
Reducer
↓
Hook da página
↓
Props
↓
Componente visual
25. Resumo final do fluxo do sensor lateral
1. Arduino lê o sensor no pino A0

2. Arduino converte RAW para milímetros

3. Arduino envia:
   POS:valor

4. Django Consumer lê a linha pela serial

5. Se a linha começa com POS:
   converte para float

6. MachineStateService envia:
   lateral_misalignment_current

7. BroadcastService manda:
   type: machine_update

8. machineSocket.ts recebe pelo WebSocket

9. useMachineSocket repassa para MachineContext

10. MachineContext:
    - guarda último valor em ref
    - dispara MACHINE_UPDATED
    - alimenta histórico a cada 100ms

11. machineReducer:
    - atualiza lateral_misalignment_current
    - adiciona pontos em lateral_misalignment_history

12. useHomeMachinePage expõe os dados

13. HomePage passa para MachineScreenRenderer

14. MachineScreenRenderer escolhe LateralAlignmentScreen

15. LateralAlignmentScreen calcula máximo, mínimo e média

16. OscillationChart desenha o gráfico