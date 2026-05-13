# Arquitetura tecnica

Este documento resume o funcionamento real do projeto com base no codigo atual.

## Componentes

```text
AlinhadorArduino/
  Firmware Arduino com PlatformIO.

AlinhadorMark01/
  Backend Django, Django Channels, WebSocket e comunicacao serial.

alinhadorInterface/
  Frontend React, TypeScript e Vite.
```

## Fluxo principal

```text
Arduino
  -> Serial USB
SerialService
  -> MachineConsumer
MachineService / MachineStateService
  -> BroadcastService
WebSocket
  -> machineSocket.ts
useMachineSocket.ts
  -> MachineContext.tsx
machineReducer.ts
  -> telas do painel
```

## Arduino

O firmware fica em `AlinhadorArduino/`.

Arquivos principais:

- `src/main.cpp`: inicializa objetos e executa o loop principal.
- `include/Config.h`: pinos, velocidades, intervalo do sensor e configuracoes iniciais.
- `src/SerialCommandHandler.cpp`: interpreta comandos recebidos pela serial.
- `src/LateralSensor.cpp`: le o sensor lateral e envia `POS:<valor>`.
- `src/MotorRoda.cpp`: controla giro continuo, posicionamento por angulo e posicionamento por raio.
- `src/Led.cpp`: controla LED de teste/status.

Configuracao atual:

```text
board = megaatmega2560
monitor_speed = 9600
sensor lateral = A0
motor roda STEP = 31
motor roda DIR = 32
intervalo sensor = 20ms
```

## Backend Django

O backend fica em `AlinhadorMark01/`.

Arquivos principais:

- `manage.py`: entrada de comandos Django.
- `alinhador/settings.py`: configuracao Django e Channels.
- `alinhador/asgi.py`: entrada ASGI para HTTP e WebSocket.
- `machine/routing.py`: rota `ws/machine/`.
- `machine/consumers.py`: WebSocket principal da maquina.
- `machine/services/serial_service.py`: conexao, escrita e leitura serial.
- `machine/services/machine_service.py`: orquestra comandos recebidos do frontend.
- `machine/services/machine_state_service.py`: atualiza estado e publica eventos.
- `machine/services/broadcast_service.py`: envia `machine_update` para o grupo WebSocket.
- `machine/models.py`: `MachineState` e `MachineConfig`.

## Frontend React

O frontend fica em `alinhadorInterface/`.

Arquivos principais:

- `src/services/machineSocket.ts`: cria o WebSocket.
- `src/hooks/useMachineSocket.ts`: gerencia conexao e envio.
- `src/context/MachineContext.tsx`: recebe mensagens e fornece estado global.
- `src/context/machineReducer.ts`: aplica atualizacoes no estado.
- `src/hooks/machine/useHomeMachinePage.ts`: controla navegacao e dados da pagina principal.
- `src/components/screens/MachineScreenRender.tsx`: escolhe qual tela renderizar.
- `src/types/machine/commands.ts`: comandos enviados ao backend.
- `src/types/machine/messages.ts`: mensagens recebidas do backend.
- `src/types/machine/state.ts`: formato do estado global.

## WebSocket

Rota do backend:

```text
ws://127.0.0.1:8000/ws/machine/
```

Ao conectar, o backend envia o estado atual:

```json
{
  "type": "machine_update",
  "payload": {
    "led": "OFF",
    "arduino_connected": false,
    "selected_port": "COM9",
    "speed_motor_roda": 0,
    "lateral_misalignment_current": 0
  }
}
```

O frontend envia comandos assim:

```json
{ "action": "motor_roda_start" }
```

O backend responde com mensagens como:

```json
{ "type": "log", "direction": "received", "message": "..." }
```

ou publica atualizacoes:

```json
{ "type": "machine_update", "payload": { "speed_motor_roda": 5 } }
```

## Serial

O `SerialService` usa:

```text
port = COM9
baudrate = 9600
timeout = 0.05
```

A porta padrao e `COM9`, mas a tela de portas seriais permite listar e selecionar outra porta.

O backend envia comandos de texto terminados por quebra de linha:

```text
MOTOR_RODA_START
LATERAL_SENSOR_START_READING
CONFIG_WHEEL_TOTAL_SPOKES:36
```

O Arduino envia mensagens de texto ou JSON pela serial. Exemplos:

```text
POS:12.50
```

```json
{
  "success": true,
  "type": "motor_roda_position_status",
  "current_angle": 90,
  "current_spoke": 10,
  "is_positioning": false
}
```

## Sensor lateral

O Arduino envia leituras no formato:

```text
POS:<valor_em_mm>
```

Exemplo:

```text
POS:12.50
```

No codigo atual:

- o Arduino tenta enviar a cada `20ms`;
- o backend limita o broadcast do sensor para cerca de `20` atualizacoes por segundo;
- o frontend adiciona pontos ao historico do grafico a cada `100ms`;
- o historico do grafico mantem os ultimos `100` pontos.

## Motor da roda

O motor aceita comandos de giro continuo:

```text
MOTOR_RODA_START
MOTOR_RODA_STOP
MOTOR_RODA_SET_CLOCKWISE
MOTOR_RODA_SET_COUNTER_CLOCKWISE
MOTOR_RODA_INCREASE_SPEED
MOTOR_RODA_DECREASE_SPEED
```

Tambem aceita comandos de posicionamento:

```text
MOTOR_RODA_SET_ZERO
MOTOR_RODA_GO_TO_ANGLE:<angulo>
MOTOR_RODA_GO_TO_SPOKE:<raio>
MOTOR_RODA_NEXT_SPOKE
MOTOR_RODA_PREVIOUS_SPOKE
MOTOR_RODA_POSITION_STATUS
```

## Configuracao da maquina

As configuracoes persistentes ficam no model `MachineConfig`.

Quando o frontend envia:

```json
{ "action": "sync_machine_config" }
```

O backend envia para o Arduino comandos como:

```text
CONFIG_WHEEL_TOTAL_SPOKES:36
CONFIG_MOTOR_STEPS_PER_WHEEL_TURN:6400
CONFIG_MOTOR_MAX_SPEED:1000
CONFIG_MOTOR_ACCELERATION:500
CONFIG_MOTOR_STATUS
```

## Verificacao atual

Comandos usados para validar o estado atual do projeto:

```powershell
cd alinhadorInterface
npm run build
```

```powershell
cd AlinhadorMark01
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe -m pytest machine\tests -q
```

Resultado no momento da revisao:

```text
Frontend build: OK
Django check: OK
Backend tests: 117 passed
```
