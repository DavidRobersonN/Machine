import { describe, expect, it } from 'vitest'
import { initialMachineState, machineReducer } from './machineReducer'

describe('machineReducer', () => {
  it('deve retornar o estado inicial corretamente', () => {
    expect(initialMachineState).toEqual({
      connected: false,
      led: 'Desligado',
      arduino_connected: 'Desconectado',
      logs: [],
      available_ports: [],
      selected_port: null,
      speed_motor_roda: 0,
      lateral_misalignment_current: 0,
      lateral_misalignment_history: [],
      is_lateral_reading_enabled: false,
    })
  })

  it('deve marcar o WebSocket como conectado', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'SOCKET_CONNECTED',
    })

    expect(newState.connected).toBe(true)
  })

  it('deve marcar o WebSocket como desconectado e o Arduino como desconectado', () => {
    const state = {
      ...initialMachineState,
      connected: true,
      arduino_connected: 'Conectado' as const,
    }

    const newState = machineReducer(state, {
      type: 'SOCKET_DISCONNECTED',
    })

    expect(newState.connected).toBe(false)
    expect(newState.arduino_connected).toBe('Desconectado')
  })

  it('deve atualizar a porta selecionada', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'SET_SELECTED_PORT',
      payload: 'COM9',
    })

    expect(newState.selected_port).toBe('COM9')
  })

  it('deve limpar a porta selecionada', () => {
    const state = {
      ...initialMachineState,
      selected_port: 'COM9',
    }

    const newState = machineReducer(state, {
      type: 'SET_SELECTED_PORT',
      payload: null,
    })

    expect(newState.selected_port).toBeNull()
  })

  it('deve atualizar a lista de portas disponíveis', () => {
    const ports = [
      {
        device: 'COM9',
        description: 'Arduino Uno',
        hwid: 'USB123',
      },
      {
        device: 'COM10',
        description: 'USB Serial',
        hwid: 'USB456',
      },
    ]

    const newState = machineReducer(initialMachineState, {
      type: 'SET_AVAILABLE_PORTS',
      payload: ports,
    })

    expect(newState.available_ports).toEqual(ports)
    expect(newState.available_ports).toHaveLength(2)
  })

  it('deve adicionar um log', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'ADD_LOG',
      payload: {
        direction: 'sent',
        message: 'Comando enviado',
      },
    })

    expect(newState.logs).toHaveLength(1)
    expect(newState.logs[0]).toEqual({
      direction: 'sent',
      message: 'Comando enviado',
    })
  })

  it('deve manter apenas os últimos 30 logs', () => {
    let state = initialMachineState

    for (let index = 0; index < 35; index++) {
      state = machineReducer(state, {
        type: 'ADD_LOG',
        payload: {
          direction: 'received',
          message: `Log ${index}`,
        },
      })
    }

    expect(state.logs).toHaveLength(30)
    expect(state.logs[0].message).toBe('Log 5')
    expect(state.logs[29].message).toBe('Log 34')
  })

  it('deve limpar os logs', () => {
    const state = {
      ...initialMachineState,
      logs: [
        {
          direction: 'sent' as const,
          message: 'Comando enviado',
        },
        {
          direction: 'received' as const,
          message: 'Resposta recebida',
        },
      ],
    }

    const newState = machineReducer(state, {
      type: 'CLEAR_LOGS',
    })

    expect(newState.logs).toEqual([])
  })

  it('deve atualizar a velocidade do motor da roda', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'SET_SPEED_MOTOR_RODA',
      payload: 50,
    })

    expect(newState.speed_motor_roda).toBe(50)
  })

  it('deve atualizar diretamente o valor atual do sensor lateral', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'SET_LATERAL_MISALIGNMENT_CURRENT',
      payload: 7.25,
    })

    expect(newState.lateral_misalignment_current).toBe(7.25)
  })

  it('deve atualizar o valor atual do sensor lateral via MACHINE_UPDATED', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        lateral_misalignment_current: 12.5,
      },
    })

    expect(newState.lateral_misalignment_current).toBe(12.5)
  })

  it('deve ligar o LED quando payload.led for ON', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        led: 'ON',
      },
    })

    expect(newState.led).toBe('Ligado')
  })

  it('deve desligar o LED quando payload.led for OFF', () => {
    const state = {
      ...initialMachineState,
      led: 'Ligado' as const,
    }

    const newState = machineReducer(state, {
      type: 'MACHINE_UPDATED',
      payload: {
        led: 'OFF',
      },
    })

    expect(newState.led).toBe('Desligado')
  })

  it('deve conectar o Arduino quando payload.arduino_connected for true', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        arduino_connected: true,
      },
    })

    expect(newState.arduino_connected).toBe('Conectado')
  })

  it('deve desconectar o Arduino quando payload.arduino_connected for false', () => {
    const state = {
      ...initialMachineState,
      arduino_connected: 'Conectado' as const,
    }

    const newState = machineReducer(state, {
      type: 'MACHINE_UPDATED',
      payload: {
        arduino_connected: false,
      },
    })

    expect(newState.arduino_connected).toBe('Desconectado')
  })

  it('deve atualizar selected_port via MACHINE_UPDATED', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        selected_port: 'COM9',
      },
    })

    expect(newState.selected_port).toBe('COM9')
  })

  it('deve atualizar speed_motor_roda via MACHINE_UPDATED', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        speed_motor_roda: 80,
      },
    })

    expect(newState.speed_motor_roda).toBe(80)
  })

  it('deve ativar a leitura lateral', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'MACHINE_UPDATED',
      payload: {
        is_lateral_reading_enabled: true,
      },
    })

    expect(newState.is_lateral_reading_enabled).toBe(true)
  })

  it('deve desativar a leitura lateral', () => {
    const state = {
      ...initialMachineState,
      is_lateral_reading_enabled: true,
    }

    const newState = machineReducer(state, {
      type: 'MACHINE_UPDATED',
      payload: {
        is_lateral_reading_enabled: false,
      },
    })

    expect(newState.is_lateral_reading_enabled).toBe(false)
  })

  it('não deve apagar dados antigos quando MACHINE_UPDATED vier parcial', () => {
    const state = {
      ...initialMachineState,
      led: 'Ligado' as const,
      selected_port: 'COM9',
      speed_motor_roda: 50,
      lateral_misalignment_current: 8.2,
      is_lateral_reading_enabled: true,
    }

    const newState = machineReducer(state, {
      type: 'MACHINE_UPDATED',
      payload: {
        arduino_connected: true,
      },
    })

    expect(newState.led).toBe('Ligado')
    expect(newState.selected_port).toBe('COM9')
    expect(newState.speed_motor_roda).toBe(50)
    expect(newState.lateral_misalignment_current).toBe(8.2)
    expect(newState.is_lateral_reading_enabled).toBe(true)
    expect(newState.arduino_connected).toBe('Conectado')
  })

  it('deve adicionar ponto no histórico lateral', () => {
    const newState = machineReducer(initialMachineState, {
      type: 'ADD_LATERAL_MISALIGNMENT_POINT',
      payload: 3.75,
    })

    expect(newState.lateral_misalignment_history).toHaveLength(1)
    expect(newState.lateral_misalignment_history[0].value).toBe(3.75)
    expect(typeof newState.lateral_misalignment_history[0].id).toBe('number')
  })

  it('deve manter apenas os últimos 100 pontos no histórico lateral', () => {
    let state = initialMachineState

    for (let index = 0; index < 105; index++) {
      state = machineReducer(state, {
        type: 'ADD_LATERAL_MISALIGNMENT_POINT',
        payload: index,
      })
    }

    expect(state.lateral_misalignment_history).toHaveLength(100)
    expect(state.lateral_misalignment_history[0].value).toBe(5)
    expect(state.lateral_misalignment_history[99].value).toBe(104)
  })

  it('deve retornar o mesmo estado para uma action desconhecida', () => {
    const state = {
      ...initialMachineState,
      connected: true,
    }

    const newState = machineReducer(state, {
      type: 'ACTION_DESCONHECIDA',
    } as never)

    expect(newState).toBe(state)
  })
})