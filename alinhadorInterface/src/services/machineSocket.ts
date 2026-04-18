import type { MachineMessage } from '../types/machine'

/*
  Esta função é responsável por CRIAR e CONFIGURAR o WebSocket da máquina.

  Ela recebe 3 funções como parâmetro:
  - onOpen: o que fazer quando a conexão abrir
  - onClose: o que fazer quando a conexão fechar
  - onMessage: o que fazer quando chegar uma mensagem do backend

  Depois de configurar tudo, ela retorna o socket pronto para uso.
*/
export function createMachineSocket(
  onOpen: () => void,
  onClose: () => void,
  onMessage: (message: MachineMessage) => void,
) {
  /*
    Aqui estamos criando uma nova conexão WebSocket.

    Esse endereço:
    ws://127.0.0.1:8000/ws/machine/

    significa:
    - ws://  -> protocolo WebSocket
    - 127.0.0.1 -> localhost, ou seja, sua própria máquina
    - 8000 -> porta do backend Django
    - /ws/machine/ -> rota WebSocket criada no backend
  */
  const socket = new WebSocket('ws://127.0.0.1:8000/ws/machine/')

  /*
    socket.onopen é executado automaticamente
    quando a conexão com o servidor é aberta com sucesso.

    Aqui nós apenas chamamos a função onOpen,
    que veio como parâmetro.
  */
  socket.onopen = () => {
    onOpen()
  }

  /*
    socket.onclose é executado automaticamente
    quando a conexão é fechada.

    Pode acontecer, por exemplo:
    - se o servidor cair
    - se o navegador fechar
    - se a conexão for encerrada manualmente

    Aqui chamamos a função onClose.
  */
  socket.onclose = () => {
    onClose()
  }

  /*
    socket.onmessage é executado sempre que
    o frontend recebe uma mensagem do backend via WebSocket.

    O parâmetro "event" contém os dados enviados pelo servidor.
  */
  socket.onmessage = (event) => {
    try {
      /*
        event.data normalmente chega como texto JSON.
        Então usamos JSON.parse para transformar esse texto
        em um objeto JavaScript/TypeScript.

        "as MachineMessage" diz ao TypeScript:
        "considere que esse objeto tem o formato MachineMessage".
      */
      const data = JSON.parse(event.data) as MachineMessage

      /*
        Esse log aparece apenas no console do navegador.
        Ele é útil para depuração, mas não substitui
        os logs visuais da aplicação.
      */
      console.log('Mensagem recebida do WebSocket:', data)

      /*
        Depois de converter a mensagem,
        chamamos a função onMessage e enviamos os dados para ela.

        Assim, quem criou o socket pode decidir
        o que fazer com a mensagem recebida.
      */
      onMessage(data)
    } catch (error) {
      /*
        Se der erro ao converter a mensagem com JSON.parse,
        ele entra aqui.

        Isso pode acontecer se o backend mandar algo
        que não esteja em formato JSON válido.
      */
      console.error('Erro ao ler mensagem do WebSocket:', error)
    }
  }

  /*
    No final, retornamos o socket já configurado.

    Assim, quem chamar essa função poderá:
    - guardar o socket em uma variável
    - fechar depois
    - reutilizar em outras funções
  */
  return socket
}

/*
  Esta função é responsável por ENVIAR mensagens pelo WebSocket.

  Ela recebe:
  - socket -> a conexão WebSocket já criada
  - payload -> os dados que queremos enviar ao backend

  Retorna:
  - true  -> se conseguiu enviar
  - false -> se não conseguiu enviar
*/
export function sendSocketMessage(socket: WebSocket, payload: unknown): boolean {
  /*
    Antes de enviar qualquer coisa, precisamos verificar
    se o socket realmente está conectado.

    WebSocket.OPEN significa que a conexão está aberta
    e pronta para enviar mensagens.
  */
  if (socket.readyState !== WebSocket.OPEN) {
    /*
      Se não estiver conectado, mostramos erro no console
      e retornamos false.
    */
    console.error('WebSocket não está conectado')
    return false
  }

  /*
    Aqui transformamos o payload em texto JSON
    usando JSON.stringify.

    Isso é necessário porque o WebSocket normalmente
    envia dados em formato de texto.
  */
  socket.send(JSON.stringify(payload))

  /*
    Se chegou até aqui, significa que a mensagem
    foi enviada com sucesso.
  */
  return true
}