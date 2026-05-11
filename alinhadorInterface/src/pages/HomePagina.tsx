import { useMemo } from 'react'

import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'

import { ScreenMain } from '../components/ScreenGenerico/ScreenMain'

import { MachinePainelControls } from '../components/screens/MachinePainelControls'
import { MachineScreenRenderer } from '../components/screens/MachineScreenRender'

import { useHomeMachinePage } from '../hooks/machine/useHomeMachinePage'

import { PainelMachineTemplate } from '../templates/PainelMachineTemplate'

export function HomePage() {
  const {
    currentScreen,
    logs,
    availablePorts,
    selectedPort,
    arduinoConnected,
    speedMotorRoda,
    lateralMisalignmentCurrent,
    lateralMisalignmentHistory,
    bottomActions,
    led,
    wheelPositionDegrees,
    wheelTotalTurns,
    wheelDirection,
    wheelIsRunning,
    motorTurnsPerWheelTurn,

    goToScreen,
    handleListSerialPorts,
    handleSelectPort,
  } = useHomeMachinePage()

  const painelControls = useMemo(() => {
    return <MachinePainelControls currentScreen={currentScreen} />
  }, [currentScreen])

  const screenContent = useMemo(() => {
    return (
      <MachineScreenRenderer
        currentScreen={currentScreen}
        logs={logs}
        availablePorts={availablePorts}
        selectedPort={selectedPort}
        arduinoConnected={arduinoConnected}
        speedMotorRoda={speedMotorRoda}
        wheelPositionDegrees={wheelPositionDegrees}
        wheelTotalTurns={wheelTotalTurns}
        wheelDirection={wheelDirection}
        wheelIsRunning={wheelIsRunning}
        motorTurnsPerWheelTurn={motorTurnsPerWheelTurn}
        lateralMisalignmentCurrent={lateralMisalignmentCurrent}
        lateralMisalignmentHistory={lateralMisalignmentHistory}
        onSelectPort={handleSelectPort}
        onGoToScreen={goToScreen}
        onListSerialPorts={handleListSerialPorts}
      />
    )
  }, [
    led,
    currentScreen,
    logs,
    availablePorts,
    selectedPort,
    arduinoConnected,
    speedMotorRoda,
    wheelPositionDegrees,
    wheelTotalTurns,
    wheelDirection,
    wheelIsRunning,
    motorTurnsPerWheelTurn,
    lateralMisalignmentCurrent,
    lateralMisalignmentHistory,
    handleSelectPort,
    goToScreen,
    handleListSerialPorts,
  ])

  const screenMain = useMemo(() => {
    return (
      <ScreenMain painelControls={painelControls}>
        {screenContent}
      </ScreenMain>
    )
  }, [painelControls, screenContent])

  const bottomControlsContent = useMemo(() => {
    return <BottomControls actions={bottomActions} />
  }, [bottomActions])

  return (
    <PainelMachineTemplate
      screenMain={screenMain}
      bottomControls={bottomControlsContent}
    />
  )
}