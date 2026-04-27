import json
import time
import serial


class SerialService:
    """
    Service responsável por conversar diretamente com o Arduino.

    Essa classe centraliza toda a comunicação serial.
    Ou seja, ela cuida de:
    - abrir a conexão com a porta COM
    - verificar se está conectado
    - enviar comandos
    - ler respostas
    - encerrar a conexão

    Esta versão foi ajustada para:
    - perceber desconexão com mais rapidez
    - limpar a conexão quando ocorrer erro
    - tentar evitar que a aplicação fique presa em um objeto serial inválido
    """

    def __init__(
        self,
        port: str | None = None,
        baudrate: int = 9600,
        timeout: float = 0.3,
    ):
        """
        Método executado assim que a classe é instanciada.

        Parâmetros:
        - port: porta serial usada pelo Arduino
        - baudrate: velocidade da comunicação
        - timeout: tempo máximo de espera por leitura

        Observação:
        - deixei o timeout menor para a aplicação perceber mais rápido
          quando não há resposta.
        """
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.connection = None

    def set_port(self, port: str | None) -> None:
        """
        Atualiza a porta serial usada pelo Arduino.

        Regras:
        - se receber None, limpa a porta selecionada
        - se a porta for igual à atual, não faz nada
        - se a porta for diferente, fecha a conexão atual antes de trocar
        """

        # Se vier None, significa que queremos limpar a porta selecionada
        if port is None:
            if self.connection and self.connection.is_open:
                self.disconnect()

            self.port = None
            print('[SerialService] Porta serial selecionada foi limpa.')
            return

        # Se vier string vazia, aí sim é um erro de uso
        if port == '':
            print('[SerialService] Porta vazia informada. Mantendo porta atual.')
            return

        if port == self.port:
            print(
                f'[SerialService] Porta {port} já está selecionada. '
                'Nenhuma troca necessária.'
            )
            return

        if self.connection and self.connection.is_open:
            self.disconnect()

        self.port = port
        print(f'[SerialService] Porta serial atualizada para: {self.port}')

    def connect(self) -> bool:
        """
        Tenta abrir a conexão serial com o Arduino.

        Retorna:
        - True  -> se conectou com sucesso
        - False -> se não conseguiu conectar
        """
        if self.connection and self.connection.is_open:
            return True

        if not self.port:
            print('[SerialService] Nenhuma porta serial foi selecionada')
            self.connection = None
            return False

        try:

            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
                write_timeout=self.timeout,
            )

            # Pequena pausa para o Arduino reiniciar ao abrir a serial.
            time.sleep(2)

            # Limpa buffers antigos para evitar ler lixo de inicialização.
            self.connection.reset_input_buffer()
            self.connection.reset_output_buffer()
            print('[SerialService] Conexão com Arduino estabelecida com sucesso')

            return True

        except serial.SerialException as error:
            print('[SerialService] Erro ao conectar com o Arduino')
            print(f'[SerialService] Detalhes do erro: {error}')
            self.connection = None
            return False
        

    def disconnect_serial_port(self) -> dict:
        current_port = self.serial_service.port

        self.serial_service.disconnect()

        # Agora isso vai funcionar, porque set_port aceita None
        self.serial_service.set_port(None)

        self.machine_state_service.update_state({
            'led': 'OFF',
            'selected_port': None,
        })

        return {
            'type': 'serial_port_disconnected',
            'selected_port': None,
            'message': (
                f'Arduino desconectado da porta {current_port}'
                if current_port
                else 'Arduino desconectado'
            ),
        }
    
    def is_connected(self) -> bool:
        """
        Verifica se a conexão serial parece ativa.

        Importante:
        - `is_open` apenas informa se o objeto serial está aberto no Python.
        - Isso NÃO garante 100% que o Arduino continua fisicamente conectado.
        - A confirmação real normalmente acontece quando tentamos ler ou escrever.
        """
        return bool(self.connection and self.connection.is_open)

    def ensure_connection(self) -> bool:
        """
        Garante que exista uma conexão pronta para uso.

        Fluxo:
        - se já estiver conectado, retorna True
        - se não estiver, tenta conectar
        """
        if self.is_connected():
            return True

        print('[SerialService] Conexão não estava ativa. Tentando reconectar...')
        return self.connect()

    def send_command(self, command: str) -> dict:
        """
        Envia um comando para o Arduino e tenta ler uma resposta.

        Fluxo:
        1. garante conexão
        2. limpa buffer de entrada para evitar resposta antiga
        3. envia comando
        4. tenta ler resposta
        5. se ocorrer erro, invalida a conexão
        """
        if not self.ensure_connection():
            return {
                'success': False,
                'message': 'Não foi possível conectar ao Arduino',
                'command': command,
                'response': None,
                'arduino_connected': False,
            }

        try:
            command_to_send = f'{command}\n'

            # Limpa o buffer de entrada para não pegar sobra de mensagem antiga.
            self.connection.reset_input_buffer()

            self.connection.write(command_to_send.encode('utf-8'))
            self.connection.flush()

            response = self.read_line()

            return {
                'success': True,
                'message': 'Comando enviado com sucesso',
                'command': command,
                'response': response,
                'arduino_connected': self.is_connected(),
            }

        except (serial.SerialException, OSError) as error:
            print('[SerialService] Erro ao enviar comando')
            print(f'[SerialService] Detalhes do erro: {error}')
            self._invalidate_connection()

            return {
                'success': False,
                'message': f'Erro ao enviar comando: {error}',
                'command': command,
                'response': None,
                'arduino_connected': False,
            }

    def read_line(self) -> str | None:
        """
        Lê uma linha da serial.

        Retorna:
        - string -> quando recebe uma linha válida
        - None   -> quando não chegou nada ou houve erro

        Observação:
        - se o Arduino foi desconectado, esse método pode lançar erro;
          nesse caso a conexão é invalidada para permitir reconexão futura.
        """
        if not self.is_connected():
            print('[SerialService] Tentativa de leitura sem conexão ativa')
            return None

        try:
            raw_data = self.connection.readline()

            if not raw_data:
                return None

            decoded_data = raw_data.decode('utf-8', errors='ignore').strip()
            return decoded_data

        except (serial.SerialException, OSError) as error:
            print('[SerialService] Erro ao ler serial')
            print(f'[SerialService] Detalhes do erro: {error}')
            self._invalidate_connection()
            return None

        except Exception as error:
            print('[SerialService] Erro inesperado ao ler serial')
            print(f'[SerialService] Detalhes do erro: {error}')
            self._invalidate_connection()
            return None

    def read_json(self) -> dict | None:
        """
        Lê uma linha da serial e tenta converter para JSON.

        Retorna:
        - dict -> se a linha recebida for um JSON válido
        - None -> se não vier nada ou se o conteúdo não for JSON
        """
        line = self.read_line()

        if not line:
            return None

        try:
            return json.loads(line)
        except json.JSONDecodeError:
            print('[SerialService] A resposta recebida não era um JSON válido')
            return None