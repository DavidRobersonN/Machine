import json
import time
import serial


class SerialService:
    """
    Service responsável por conversar diretamente com o Arduino.

    Essa classe centraliza toda a comunicação serial:
    - seleciona a porta
    - abre conexão
    - verifica conexão
    - envia comandos
    - lê respostas
    - fecha conexão
    """

    def __init__(
        self,
        port: str | None = None,
        baudrate: int = 9600,
        timeout: float = 0.05,
    ):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        self.connection = None

    def set_port(self, port: str | None) -> None:
        """
        Atualiza a porta serial usada pelo Arduino.

        Se a porta mudar, fecha a conexão atual antes.
        """

        if port is None:
            self.disconnect()
            self.port = None
            print('[SerialService] Porta serial selecionada foi limpa.')
            return

        if port == '':
            print('[SerialService] Porta vazia informada. Mantendo porta atual.')
            return

        if port == self.port:
            print(f'[SerialService] Porta {port} já está selecionada.')
            return

        self.disconnect()

        self.port = port
        print(f'[SerialService] Porta serial atualizada para: {self.port}')

    def connect(self) -> bool:
        """
        Tenta abrir a conexão serial com o Arduino.

        Retorna True se conectar e False se falhar.
        """

        if self.connection and self.connection.is_open:
            return True

        if not self.port:
            print('[SerialService] Nenhuma porta serial foi selecionada')
            self.connection = None
            return False

        try:
            print(f'[SerialService] Tentando conectar na porta {self.port}...')

            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
                write_timeout=self.timeout,
            )

            # O Arduino normalmente reinicia quando a serial abre.
            time.sleep(2)

            self.connection.reset_input_buffer()
            self.connection.reset_output_buffer()

            print('[SerialService] Conexão com Arduino estabelecida com sucesso')

            return True

        except serial.SerialException as error:
            print('[SerialService] Erro ao conectar com o Arduino')
            print(f'[SerialService] Porta: {self.port}')
            print(f'[SerialService] Detalhes do erro: {error}')

            self._invalidate_connection()

            return False

        except Exception as error:
            print('[SerialService] Erro inesperado ao conectar com o Arduino')
            print(f'[SerialService] Porta: {self.port}')
            print(f'[SerialService] Detalhes do erro: {error}')

            self._invalidate_connection()

            return False

    def disconnect(self) -> None:
        """
        Fecha a conexão serial atual.
        """

        if self.connection:
            try:
                if self.connection.is_open:
                    self.connection.close()
                    print('[SerialService] Conexão serial fechada')
            except Exception as error:
                print('[SerialService] Erro ao fechar conexão serial')
                print(f'[SerialService] Detalhes do erro: {error}')
            finally:
                self.connection = None

    def _invalidate_connection(self) -> None:
        """
        Limpa a conexão quando ocorre erro.
        """

        try:
            if self.connection and self.connection.is_open:
                self.connection.close()
        except Exception:
            pass
        finally:
            self.connection = None

    def is_connected(self) -> bool:
        """
        Verifica se existe uma conexão serial aberta.
        """

        return bool(self.connection and self.connection.is_open)

    def ensure_connection(self) -> bool:
        """
        Garante que exista uma conexão ativa.
        """

        if self.is_connected():
            return True

        print('[SerialService] Conexão não estava ativa. Tentando conectar...')
        return self.connect()

    def send_command(self, command: str) -> dict:
        """
        Envia um comando para o Arduino.

        Importante:
        - Este método NÃO lê resposta da serial.
        - A leitura contínua deve ficar apenas no listener do MachineConsumer.
        - Isso evita duas partes do backend lendo a serial ao mesmo tempo.
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

            self.connection.write(command_to_send.encode('utf-8'))
            self.connection.flush()

            return {
                'success': True,
                'message': 'Comando enviado com sucesso',
                'command': command,
                'response': None,
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
        """

        line = self.read_line()

        if not line:
            return None

        try:
            return json.loads(line)
        except json.JSONDecodeError:
            print('[SerialService] A resposta recebida não era um JSON válido')
            print(f'[SerialService] Conteúdo recebido: {line}')
            return None