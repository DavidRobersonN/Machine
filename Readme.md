18/04
Proximo passo vou criar no arduino o codigo orientado a Objetos.. mantendo o codigo atual, apenas do led.


Front
Primeiro Passo: machineSocket.ts

  Começa Pelo machineSocket.ts que faz a conexao com o backend, e é onde de
fato vai enviar as informações, ja convertidas em json.. 
  Agora ja tendo a comunicação entre backend e o front, Precisamos interpretar
as mensagens recebidas.

Segundo Passo: Types/machine.ts
  Criar o arquivo Types/machine.ts onde é definido o tipos aceitos que virao do
backend, estado global e as actions que o reducer vai entender..

Terceiro Passo: MachineReducer.ts
  MachineReducer.ts..  primeiro definimos um estado inicial.. 
  Agora é Feito o Reducer Principal da maquina, ele recebe o estado atual da
maquina e uma ação que queremos executar. 
  Entao dentro dele é executado um switch case, para verificar a ação que foi passado
e dentro de cada case, é executaddo a ação ja pre definida.. e devolve um novo 
estado ja alterado.

Quarto Passo: MachineContext.tsx
  Aqui onde Criaremos o Contexto da Maquina, é criado um Reducer, passando o nosso
InitialState, ja implementado em types, e o nosso machineReducer
O que acontece aqui:
  uma função de callback que vai receber uma mensagem em json, verifico qual o type
e o payload que vem dentro dessa mensagem.. obs: meu machineReducer ja precisa estar esperando
essa type, precisa vir do jeito que ele espera.. 

Quinto Passo: Provider
  Ainda em  MachineContext.tsx ..    o Retorno do nosso MachineProvider, é um
é uma especie de componente que recebe Children.. ou seja quando envolvermos
algum componente com ele, os filhos terao acesso a esse contexto
  
Sexto Passo: funções de CallBack
Agora podemos acessar de qualquer lugar da nossa aplicação, as funções de call
back que definimos em MachineContext..
