import { BottomControls } from '../components/PainelComponents/BottomControls/BottomControls'

import { ScreenMain } from '../components/ScreenGenerico/ScreenMain'

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
    wheelPositionDegrees,
    wheelTotalTurns,
    wheelDirection,
    wheelIsRunning,
    motorTurnsPerWheelTurn,

    goToScreen,
    handleListSerialPorts,
    handleSelectPort,
  } = useHomeMachinePage()

  return (
    <PainelMachineTemplate
      screenMain={
        <ScreenMain>
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
        </ScreenMain>
      }
      bottomControls={
        <BottomControls actions={bottomActions} />
      }
    />
  )
}