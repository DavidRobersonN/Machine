# Machine / Alinhador

Painel de controle para uma maquina de alinhamento de roda. O projeto integra
um Arduino, um backend Django com WebSocket e uma interface React para controlar
motores, sensores, cilindros pneumaticos, configuracoes da maquina e logs do
sistema.

Este README tambem serve como guia de manutencao. A ideia e ajudar voce a
entender a arquitetura para conseguir implementar uma funcionalidade nova, por
exemplo uma tela nova no painel.

## Visao Geral

O fluxo principal da aplicacao e:

```text
React / Vite
  -> envia comando JSON pelo WebSocket
Django / Channels
  -> interpreta comando e atualiza o banco
  -> envia comando de texto pela Serial USB
Arduino / PlatformIO
  -> executa a acao fisica
  -> responde pela Serial USB
Django / Channels
  -> publica machine_update pelo WebSocket
React / Vite
  -> atualiza estado global e renderiza as telas
```

O ponto mais importante da arquitetura e: telas diferentes nao devem inventar
seu proprio estado da maquina. Sempre que uma informacao representa a maquina
real, ela deve passar pelo backend e ficar centralizada no banco em
`MachineState` ou em `MachineConfig`.

## Estrutura do Repositorio

```text
.
|-- AlinhadorArduino/       # Firmware Arduino / PlatformIO
|-- AlinhadorMark01/        # Backend Django + Channels + banco
|-- alinhadorInterface/     # Frontend React + TypeScript + Vite
|-- docs/                   # Documentacao tecnica e anotacoes antigas
`-- README.md               # Guia geral do projeto
```

## Responsabilidade de Cada Parte

### Frontend: `alinhadorInterface/`

Responsavel por mostrar as telas, receber cliques do usuario e enviar comandos
para o backend.

Arquivos importantes:

```text
src/services/machineSocket.ts              # conexao WebSocket
src/hooks/useMachineSocket.ts              # recebe mensagens e despacha estado
src/context/MachineContext.tsx             # contexto global da maquina
src/context/machineReducer.ts              # atualiza o estado no React
src/types/machine/state.ts                 # formato do estado global
src/types/machine/commands.ts              # comandos enviados ao backend
src/types/machine/messages.ts              # mensagens recebidas do backend
src/types/navigation.ts                    # nomes das telas
src/hooks/machine/useHomeMachinePage.ts    # navegacao e botoes inferiores
src/components/screens/MachineScreenRender.tsx
                                           # escolhe qual tela renderizar
src/components/screens/MenuScreen/         # menu principal
src/components/screens/*Screen/            # telas especificas
```

### Backend: `AlinhadorMark01/`

Responsavel por receber comandos do WebSocket, conversar com o Arduino pela
serial, persistir o estado da maquina e publicar atualizacoes para o frontend.

Arquivos importantes:

```text
machine/consumers.py                       # entrada WebSocket
machine/services/machine_service.py        # orquestra comandos da maquina
machine/services/serial_service.py         # comunicacao serial real
machine/services/simulated_serial_service.py
                                           # serial simulada para testes
machine/services/machine_state_service.py  # le/salva/publica MachineState
machine/models.py                          # MachineState e MachineConfig
machine/admin.py                           # configuracoes no Django Admin
machine/tests/                             # testes do backend
```

### Arduino: `AlinhadorArduino/`

Responsavel pela parte fisica: motores, sensores, cilindros e leitura serial.

Arquivos importantes:

```text
include/Config.h                           # pinos e valores padrao
include/SerialCommandHandler.h             # contrato do interpretador serial
src/SerialCommandHandler.cpp               # comandos recebidos pela serial
src/main.cpp                               # instancia os modulos
src/MotorRoda.cpp                          # motor da roda
src/LateralSensor.cpp                      # sensor lateral
src/SpokeTensionSensor.cpp                 # sensores HX711 dos raios
src/PneumaticCylinders.cpp                 # cilindros pneumaticos
```

## Estado e Configuracao

Use esta regra para decidir onde salvar cada coisa:

- `MachineState`: estado atual da maquina, muda durante o uso.
  Exemplos: roda girando, posicao da roda, leitura de sensor, cilindro
  estendido/recuado.
- `MachineConfig`: configuracao ajustavel da maquina, normalmente definida no
  Django Admin.
  Exemplos: quantidade de raios, calibracao, pinos dos cilindros, passos do
  motor.

Quando uma tela precisa mostrar algo da maquina real, ela deve ler do estado
global do React. Esse estado vem de `MachineState`, via `machine_update`.

## Telas do Painel

As telas sao identificadas em `alinhadorInterface/src/types/navigation.ts`.

Telas atuais:

- `start`: tela inicial.
- `menu`: menu principal.
- `motors`: controle do motor da roda.
- `alignment`: leitura do sensor lateral.
- `wheelMap`: mapa/visualizacao da roda.
- `spokeTension`: medicao de tensao dos raios.
- `cylinders`: teste manual dos cilindros pneumaticos.
- `serial`: selecao de porta COM e monitor serial.
- `logs`: historico de eventos.

## Como Criar Uma Nova Tela

Use este roteiro quando quiser adicionar uma tela nova no painel.

### 1. Criar o nome da tela

Edite:

```text
alinhadorInterface/src/types/navigation.ts
```

Adicione o novo nome no tipo `AppScreen`:

```ts
export type AppScreen =
  | 'start'
  | 'menu'
  | 'minhaNovaTela'
```

### 2. Criar o componente visual

Crie uma pasta em:

```text
alinhadorInterface/src/components/screens/MinhaNovaTelaScreen/
```

Exemplo:

```text
MinhaNovaTelaScreen.tsx
MinhaNovaTelaScreen.css
```

O componente pode usar o contexto da maquina assim:

```ts
import { useMachineContext } from '../../../context/useMachineContext'

export function MinhaNovaTelaScreen() {
  const { state, sendCommand } = useMachineContext()

  return (
    <button onClick={() => sendCommand({ action: 'read_machine_state' })}>
      Ler estado
    </button>
  )
}
```

### 3. Registrar a tela no renderizador

Edite:

```text
alinhadorInterface/src/components/screens/MachineScreenRender.tsx
```

Importe a tela e adicione um `case`:

```tsx
import { MinhaNovaTelaScreen } from './MinhaNovaTelaScreen/MinhaNovaTelaScreen'

case 'minhaNovaTela':
  return <MinhaNovaTelaScreen />
```

Se a tela nao depende de atualizacao em tempo real, adicione ela na comparacao
do `memo`, junto das telas que podem ficar paradas.

### 4. Colocar a tela no menu

Edite:

```text
alinhadorInterface/src/components/screens/MenuScreen/MenuScreen.tsx
```

Adicione uma prop de navegacao, um botao/card no menu e chame:

```ts
onGoToScreen('minhaNovaTela')
```

Na pratica, siga o mesmo padrao usado por `cylinders`, `spokeTension` ou
`wheelMap`.

### 5. Definir o botao de voltar

Edite:

```text
alinhadorInterface/src/hooks/machine/useHomeMachinePage.ts
```

No `getBottomActions`, inclua sua tela no grupo que volta para o menu:

```ts
case 'minhaNovaTela':
  return [
    {
      label: 'Voltar ao menu',
      onClick: () => goToScreen('menu'),
      variant: 'orange' as const,
    },
  ]
```

### 6. Se a tela precisar de dados novos

Se for apenas visual, talvez nao precise mexer no backend. Se a tela representa
algo real da maquina, adicione o dado no estado central.

Frontend:

```text
alinhadorInterface/src/types/machine/state.ts
alinhadorInterface/src/types/machine/messages.ts
alinhadorInterface/src/context/machineReducer.ts
```

Backend:

```text
AlinhadorMark01/machine/models.py
AlinhadorMark01/machine/services/machine_state_service.py
```

Depois rode:

```powershell
cd AlinhadorMark01
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate
```

### 7. Se a tela precisar enviar um comando

Adicione o tipo do comando no frontend:

```text
alinhadorInterface/src/types/machine/commands.ts
```

Exemplo:

```ts
export interface MeuComandoCommand {
  action: 'meu_comando'
  valor: number
}
```

Depois inclua esse comando na uniao `MachineCommand`.

No backend, trate a action em:

```text
AlinhadorMark01/machine/services/machine_service.py
```

Exemplo:

```py
if action == 'meu_comando':
    return self.meu_comando(data)
```

Se o comando precisar chegar ao Arduino, envie uma linha serial padronizada:

```py
self.serial_service.send_command(f'MEU_COMANDO:{valor}')
```

No Arduino, implemente o reconhecimento em:

```text
AlinhadorArduino/src/SerialCommandHandler.cpp
```

### 8. Atualizar testes

Quando adicionar estado, comando ou regra de negocio, atualize os testes:

```text
alinhadorInterface/src/context/machineReducer.test.ts
AlinhadorMark01/machine/tests/
```

## Fluxo de Comandos

Exemplo de comando simples:

```json
{ "action": "motor_roda_start" }
```

O backend transforma isso em comando serial:

```text
MOTOR_RODA_START
```

Exemplo de comando com parametro:

```json
{
  "action": "pneumatic_cylinder_move",
  "cylinder": "spoke_tension_left",
  "position": "extended"
}
```

O backend envia ao Arduino:

```text
PNEUMATIC_CYLINDER:spoke_tension_left:EXTEND
```

## Como Rodar

### 1. Backend Django

```powershell
cd AlinhadorMark01
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

O WebSocket da maquina fica em:

```text
ws://127.0.0.1:8000/ws/machine/
```

O Django Admin fica em:

```text
http://127.0.0.1:8000/admin/
```

### 2. Frontend React

Em outro terminal:

```powershell
cd alinhadorInterface
npm install
npm run dev
```

O frontend conecta no backend em `ws://127.0.0.1:8000/ws/machine/`, definido em
`src/services/machineSocket.ts`.

### 3. Arduino / PlatformIO

```powershell
cd AlinhadorArduino
pio run
pio run -t upload
pio device monitor -b 9600
```

Configuracao atual do firmware:

- Placa: `megaatmega2560`.
- Baud rate: `9600`.
- Porta padrao no backend: `COM9`.
- Sensor lateral: `A0`.
- Motor da roda: pinos `31` e `32`.
- Cilindros pneumaticos: pinos configuraveis no Django Admin.
- Intervalo do sensor lateral: `20ms`, aproximadamente 50 leituras por segundo.

## Comandos de Verificacao

Frontend:

```powershell
cd alinhadorInterface
npm run build
npm run test
```

Backend:

```powershell
cd AlinhadorMark01
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe -m pytest machine\tests -q
```

Arduino:

```powershell
cd AlinhadorArduino
pio run
```

## Boas Praticas do Projeto

- Uma tela deve ser responsavel por interface, nao por guardar estado real da
  maquina isoladamente.
- Estado fisico ou compartilhado deve nascer no backend e ser publicado por
  `machine_update`.
- Configuracao ajustavel deve ir para `MachineConfig` e aparecer no Django
  Admin.
- Comandos do frontend usam `action` em JSON.
- Comandos para o Arduino usam texto simples em maiusculo, separados por `:`.
- Quando adicionar algo fisico, pense nas tres camadas: tela, backend/banco e
  firmware.
- Depois de mudar estado ou comando, rode testes do frontend e backend antes de
  enviar para a maquina real.

## Documentacao Complementar

- [Arquitetura tecnica](docs/arquitetura.md)
- [Tutorial tecnico original](docs/tutorial-projeto-machine.md)
- [Anotacoes iniciais do desenvolvimento](docs/anotacoes-iniciais.md)
- [README do frontend](alinhadorInterface/README.md)

## Observacoes

- O backend inicia com `COM9` como porta padrao, mas a interface permite listar
  e selecionar outra porta serial.
- O estado persistente principal da maquina fica em `MachineState`.
- As configuracoes ajustaveis da maquina ficam em `MachineConfig`.
- A camada de WebSocket usa Django Channels com `InMemoryChannelLayer`, adequado
  para desenvolvimento local.
