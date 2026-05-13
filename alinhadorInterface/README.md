# Alinhador Interface

Interface React do projeto Machine / Alinhador. Esta aplicacao renderiza o painel da maquina, conecta no backend Django por WebSocket e envia comandos para controle de serial, motor da roda, sensor lateral, LED e logs.

## Stack

- React 19
- TypeScript
- Vite
- Vitest
- ESLint

## Como rodar

```powershell
cd alinhadorInterface
npm install
npm run dev
```

O backend deve estar rodando em `127.0.0.1:8000`, porque o WebSocket esta configurado em:

```text
src/services/machineSocket.ts
ws://127.0.0.1:8000/ws/machine/
```

## Scripts

```powershell
npm run dev            # servidor de desenvolvimento
npm run build          # typecheck + build de producao
npm run preview        # preview do build
npm run lint           # verificacao ESLint
npm run test           # testes com Vitest
npm run test:watch     # testes em modo watch
npm run test:coverage  # cobertura de testes
```

## Fluxo da interface

```text
machineSocket.ts
  -> useMachineSocket.ts
MachineContext.tsx
  -> machineReducer.ts
useHomeMachinePage.ts
  -> HomePagina.tsx
PainelMachineTemplate.tsx
  -> MachineScreenRenderer.tsx
Telas especificas
```

## Pastas principais

```text
src/
|-- components/   # Componentes visuais e telas do painel
|-- context/      # MachineContext e reducer global
|-- hooks/        # Hooks de WebSocket, navegacao e dados da maquina
|-- pages/        # Pagina principal do painel
|-- services/     # Cliente WebSocket
|-- templates/    # Composicao visual do painel
`-- types/        # Tipos de comandos, mensagens, estado e navegacao
```

## Estado global

O estado principal fica em `src/context/MachineContext.tsx` e `src/context/machineReducer.ts`.

Ele controla:

- conexao do WebSocket;
- status do Arduino;
- LED;
- portas seriais disponiveis;
- porta serial selecionada;
- velocidade e estado do motor da roda;
- posicao da roda;
- leitura atual do sensor lateral;
- historico do grafico de desalinhamento;
- logs da interface.

## Mensagens

O frontend envia comandos com o campo `action`, definidos em:

```text
src/types/machine/commands.ts
```

Exemplos:

```json
{ "action": "list_serial_ports" }
{ "action": "select_serial_port", "port": "COM9" }
{ "action": "motor_roda_start" }
{ "action": "motor_roda_go_to_angle", "angle": 90 }
{ "action": "lateral_sensor_start_reading" }
```

O backend responde com mensagens tipadas em:

```text
src/types/machine/messages.ts
```

A mensagem mais importante para atualizar a tela e:

```json
{
  "type": "machine_update",
  "payload": {
    "arduino_connected": true,
    "lateral_misalignment_current": 12.5
  }
}
```

## Telas

As telas disponiveis sao:

- `start`: tela inicial;
- `menu`: menu principal;
- `motors`: controle do motor da roda;
- `alignment`: leitura e grafico do sensor lateral;
- `serial`: portas COM e monitor serial;
- `logs`: historico de mensagens.

## Testes e build

```powershell
npm run build
npm run test
```

O build executa `tsc -b` antes do Vite, entao erros de tipos quebram o processo antes de gerar `dist/`.
