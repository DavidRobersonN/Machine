import json
import time
import serial


class SerialService:
    """
    Service responsável por conversar diretamente com o Arduino.

    Funções principais:
    - abrir a conexão serial
    - enviar comandos
    - ler respostas
    - fechar a conexão
    """

    def __init__(
        self,
        port: str = 'COM9',
        baudrate: int = 9600,
        timeout: float = 1.0,
    ):
        self.port = port
        print(f'Valor de Self.port =>{self.port}...')
        self.baudrate = baudrate
        self.timeout = timeout
        self.connection = None

        print('[SerialService] Serviço iniciado')
        print(f'[SerialService] Porta configurada: {self.port}')
        print(f'[SerialService] Baudrate configurado: {self.baudrate}')

    def connect(self) -> bool:
        """
        Abre a conexão serial com o Arduino.
        Retorna True se conectar com sucesso.
        """

        print(f'[SerialService] Tentando conectar ao Arduino na porta => {self.port}...')

        if self.connection and self.connection.is_open:
            return True

        try:
            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=self.timeout,
            )

            print('[SerialService] Arduino conectado com sucesso')

            # Pequena pausa para o Arduino reiniciar ao abrir a serial
            time.sleep(2)
            return True

        except serial.SerialException as error:
            print('[SerialService] Erro ao conectar com o Arduino')
            print(f'[SerialService] Detalhes do erro: {error}')
            self.connection = None
            return False

    def disconnect(self) -> None:
        """
        Fecha a conexão serial, se estiver aberta.
        """
        if self.connection and self.connection.is_open:
            self.connection.close()
            self.connection = None

    def is_connected(self) -> bool:
        """
        Verifica se a conexão serial está aberta.
        """
        return bool(self.connection and self.connection.is_open)

    def send_command(self, command: str) -> dict:
        """
        Envia um comando simples para o Arduino e tenta ler uma resposta.
        """
        if not self.is_connected():
            connected = self.connect()

            if not connected:
                return {
                    'success': False,
                    'message': 'Não foi possível conectar ao Arduino',
                    'command': command,
                    'response': None,
                }

        try:
            command_to_send = f'{command}\n'
            self.connection.write(command_to_send.encode('utf-8'))

            response = self.read_line()

            return {
                'success': True,
                'message': 'Comando enviado com sucesso',
                'command': command,
                'response': response,
            }

        except serial.SerialException as error:
            return {
                'success': False,
                'message': f'Erro ao enviar comando: {error}',
                'command': command,
                'response': None,
            }

    def read_line(self) -> str | None:
        """
        Lê uma linha enviada pelo Arduino.
        """
        if not self.is_connected():
            return None

        try:
            raw_data = self.connection.readline()
            if not raw_data:
                return None

            return raw_data.decode('utf-8').strip()

        except Exception as error:
            print(f'Erro ao ler serial: {error}')
            return None

    def read_json(self) -> dict | None:
        """
        Tenta ler uma linha da serial e converter para JSON.
        Útil quando o Arduino envia dados estruturados.
        """
        line = self.read_line()

        if not line:
            return None

        try:
            return json.loads(line)
        except json.JSONDecodeError:
            return None