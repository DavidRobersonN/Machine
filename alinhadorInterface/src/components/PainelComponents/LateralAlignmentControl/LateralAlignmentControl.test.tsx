import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LateralAlignmentControl } from './LateralAlignmentControl'

const sendCommandMock = vi.fn()

vi.mock('../../../context/useMachineContext', () => {
  return {
    useMachineContext: () => ({
      sendCommand: sendCommandMock,
    }),
  }
})

describe('LateralAlignmentControl', () => {
  beforeEach(() => {
    sendCommandMock.mockClear()
  })

  it('deve enviar comando para iniciar leitura lateral ao clicar em "Iniciar leitura"', async () => {
    const user = userEvent.setup()

    render(<LateralAlignmentControl />)

    await user.click(screen.getByRole('button', { name: /iniciar leitura/i }))

    expect(sendCommandMock).toHaveBeenCalledTimes(1)
    expect(sendCommandMock).toHaveBeenCalledWith({
      action: 'lateral_sensor_start_reading',
    })
  })

  it('deve enviar comando para parar leitura lateral ao clicar em "Parar leitura"', async () => {
    const user = userEvent.setup()

    render(<LateralAlignmentControl />)

    await user.click(screen.getByRole('button', { name: /parar leitura/i }))

    expect(sendCommandMock).toHaveBeenCalledTimes(1)
    expect(sendCommandMock).toHaveBeenCalledWith({
      action: 'lateral_sensor_stop_reading',
    })
  })

  it('deve renderizar os dois botões de controle', () => {
    render(<LateralAlignmentControl />)

    expect(
      screen.getByRole('button', { name: /iniciar leitura/i }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /parar leitura/i }),
    ).toBeInTheDocument()
  })
})
