export function useNavigationActions() {

  function moveUp() {
    console.log('Clicou para cima')
    // sendCommand({ action: 'move_up' })
  }

  function moveLeft() {
    console.log('Clicou para esquerda')
    // sendCommand({ action: 'move_left' })
  }

  function selectCenter() {
    console.log('Clicou no centro')
    // sendCommand({ action: 'select_center' })
  }

  function moveRight() {
    console.log('Clicou para direita')
    // sendCommand({ action: 'move_right' })
  }

  function moveDown() {
    console.log('Clicou para baixo')
    // sendCommand({ action: 'move_down' })
  }

  function handleEsc() {
    console.log('Esc')
    // sendCommand({ action: 'esc' })
  }

  function handleEnter() {
    console.log('Enter')
    // sendCommand({ action: 'enter' })
  }

  function handleOrigin() {
    console.log('Origin')
    // sendCommand({ action: 'origin' })
  }

  function handleFrame() {
    console.log('Frame')
    // sendCommand({ action: 'frame' })
  }

  return {
    moveUp,
    moveLeft,
    selectCenter,
    moveRight,
    moveDown,
    handleEsc,
    handleEnter,
    handleOrigin,
    handleFrame,
  }
}