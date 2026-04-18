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
        port: str = 'COM9',
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

    def connect(self) -> bool:
        """
        Tenta abrir a conexão serial com o Arduino.

        Retorna:
        - True  -> se conectou com sucesso
        - False -> se não conseguiu conectar
        """
        if self.connection and self.connection.is_open:
            print('[SerialService] Arduino já estava conectado')
            return True

        try:
            print(f'[SerialService] Tentando conectar em {self.port}...')

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

            print('[SerialService] Arduino conectado com sucesso')
            return True

        except serial.SerialException as error:
            print('[SerialService] Erro ao conectar com o Arduino')
            print(f'[SerialService] Detalhes do erro: {error}')
            self.connection = None
            return False

    def disconnect(self) -> None:
        """
        Fecha a conexão serial, caso ela esteja aberta.

        Esse método não é executado automaticamente quando o Arduino
        é removido fisicamente. Ele só roda se for chamado no código.
        """
        try:
            if self.connection and self.connection.is_open:
                self.connection.close()
                print('[SerialService] Arduino desconectado com sucesso')
        except serial.SerialException as error:
            print(f'[SerialService] Erro ao fechar conexão: {error}')
        finally:
            self.connection = None

    def _invalidate_connection(self) -> None:
        """
        Invalida a conexão atual.

        Esse método é útil quando acontece um erro de leitura/escrita.
        Em vez de manter um objeto serial quebrado dentro da classe,
        nós limpamos a conexão para forçar uma nova tentativa de conexão
        no próximo comando.
        """
        try:
            if self.connection and self.connection.is_open:
                self.connection.close()
        except Exception:
            pass
        finally:
            self.connection = None
            print('[SerialService] Conexão serial marcada como inválida')

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
            print(f'[SerialService] Enviando comando: {command}')

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
            print(f'[SerialService] Resposta recebida: {decoded_data}')
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