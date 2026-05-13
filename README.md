# Machine / Alinhador

Painel de controle para uma maquina de alinhamento de roda. O projeto integra um Arduino, um backend Django com WebSocket e uma interface React para controlar motores, acompanhar o sensor lateral, monitorar portas seriais e visualizar logs do sistema.

## Visao geral

O fluxo principal da aplicacao e:

```text
Arduino
  -> Serial USB
Django / Channels
  -> WebSocket
React / Vite
  -> Estado global
Telas do painel
```

O Arduino executa comandos fisicos e envia leituras pela serial. O backend le a porta serial, interpreta comandos e publica atualizacoes pelo WebSocket. O frontend recebe essas mensagens, atualiza o estado global e renderiza as telas do painel.

## Funcionalidades

- Selecao e desconexao de porta serial.
- Monitor serial para enviar comandos manuais ao Arduino.
- Controle de LED de teste/status.
- Controle do motor da roda: iniciar, parar, sentido e velocidade.
- Posicionamento da roda por angulo ou por raio.
- Sincronizacao de configuracoes da maquina salvas no Django Admin.
- Leitura do sensor lateral em tempo real.
- Grafico historico de oscilacao/desalinhamento lateral.
- Logs de comandos enviados, mensagens recebidas e eventos do sistema.

## Estrutura do repositorio

```text
.
|-- AlinhadorArduino/       # Firmware Arduino / PlatformIO
|-- AlinhadorMark01/        # Backend Django + Channels
|-- alinhadorInterface/     # Frontend React + TypeScript + Vite
|-- docs/                   # Documentacao tecnica e anotacoes antigas
`-- README.md               # Visao geral do projeto
```

## Como rodar

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

### 2. Frontend React

Em outro terminal:

```powershell
cd alinhadorInterface
npm install
npm run dev
```

O frontend conecta no backend em `ws://127.0.0.1:8000/ws/machine/`, definido em `src/services/machineSocket.ts`.

### 3. Arduino / PlatformIO

```powershell
cd AlinhadorArduino
pio run
pio run -t upload
pio device monitor -b 9600
```

Configuracao atual do firmware:

- Placa: `megaatmega2560`
- Baud rate: `9600`
- Sensor lateral: `A0`
- Motor da roda: pinos `31` e `32`
- Intervalo do sensor lateral: `20ms`, aproximadamente 50 leituras por segundo

## Comandos de verificacao

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

## Comunicacao principal

O frontend envia comandos JSON pelo WebSocket, por exemplo:

```json
{ "action": "motor_roda_start" }
```

O backend transforma esse comando em texto serial para o Arduino:

```text
MOTOR_RODA_START
```

O Arduino responde pela serial. O backend publica a resposta no WebSocket, e o React atualiza o estado global.

Para o sensor lateral, o Arduino envia linhas no formato:

```text
POS:12.50
```

O backend converte esse valor e envia `machine_update` para o frontend.

## Documentacao

- [Arquitetura tecnica](docs/arquitetura.md)
- [Tutorial tecnico original](docs/tutorial-projeto-machine.md)
- [Anotacoes iniciais do desenvolvimento](docs/anotacoes-iniciais.md)
- [README do frontend](alinhadorInterface/README.md)

## Observacoes

- O backend inicia com `COM9` como porta padrao, mas a interface permite listar e selecionar outra porta serial.
- O estado persistente principal da maquina fica em `MachineState`.
- As configuracoes ajustaveis da maquina ficam em `MachineConfig` e podem ser usadas para sincronizar o Arduino.
- A camada de WebSocket usa Django Channels com `InMemoryChannelLayer`, adequado para desenvolvimento local.
