import { BLOCK_SIZE, BOARD_HEIGHT, BOARD_WIDTH, EVENT_MOVEMENTS } from './consts'
import './style.css'

let score = 0
let $score = document.querySelector('span')
if ($score) $score.innerHTML = score.toString()

const canvas = document.querySelector('canvas')
const context = canvas?.getContext('2d')

if (canvas) {
  canvas.width = BOARD_WIDTH * BLOCK_SIZE
  canvas.height = BOARD_HEIGHT * BLOCK_SIZE
}

context?.scale(BLOCK_SIZE, BLOCK_SIZE)

const board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

function getRandomX(shapeSize: number) {
  const rand = Math.floor(Math.random() * BOARD_WIDTH)

  return rand - shapeSize >= 0 ? rand - shapeSize : rand
}

// Random pieces
const PIECES = [
  [
    [1, 1],
    [1, 1],
  ],[
    [1, 1, 1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [1, 0],
    [1, 0],
    [1, 1]
  ]
]

function getRandomPiece() {
  return PIECES[
    Math.floor(Math.random() * PIECES.length)
  ]
}

// Pieza player
const shape = getRandomPiece()
const piece = {
  position: {
    x: getRandomX(shape[0].length),
    y: 0
  },
  shape,
}

// Game loop y auto drop
let dropCounter = 0
let lastTime = 0

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time

  dropCounter += deltaTime

  if (dropCounter > 1000) {
    piece.position.y++
    dropCounter = 0
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  }

  draw()
  requestAnimationFrame(update)
}

function draw() {
  if (!context) return

  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas?.width || 0, canvas?.height || 0)

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = '#fff'
        context.fillRect(x, y, 1, 1)
      }
    })
  })

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = 'red'
        context.fillRect(
          piece.position.x + x,
          piece.position.y + y,
          1,
          1
        )
      }
    })
  })
}

document.addEventListener('keydown', event => {
  if (event.key === EVENT_MOVEMENTS.LEFT) {
    piece.position.x--
    if (checkCollision()) piece.position.x++
  } else if (event.key === EVENT_MOVEMENTS.RIGHT) {
    piece.position.x++
    if (checkCollision()) piece.position.x--
  } else if (event.key === EVENT_MOVEMENTS.DOWN) {
    piece.position.y++
    if (checkCollision()) {
      piece.position.y--
      solidifyPiece()
      removeRows()
    }
  } else if (event.key === EVENT_MOVEMENTS.UP) {
    const rotated = []

    for (let i = 0; i < piece.shape[0].length; i++) {
      const row = []
      for (let j = piece.shape.length-1; j >= 0; j--) {
        row.push(piece.shape[j][i])
      }

      rotated.push(row)
    }

    const previousShape = piece.shape
    piece.shape = rotated
    if (checkCollision()) piece.shape = previousShape
  }
})

function checkCollision() {
  return piece.shape.some((row, y) => {
    return row.some((value, x) => {
      return (
        value !== 0 &&
        board[y + piece.position.y]?.[x + piece.position.x] !== 0
      )
    })
  })
}

function solidifyPiece () {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1
      }
    })
  })

  piece.shape = getRandomPiece()
  piece.position = {
    x: getRandomX(piece.shape[0].length),
    y: 0
  }

  if (checkCollision()) {
    alert('Game over')
    board.forEach((row) => row.fill(0))
  }
}

function removeRows() {
  const rowsToRemove: number[] = []

  board.forEach((row, y) => {
    if (row.every(value => value === 1)) {
      rowsToRemove.push(y)
    }
  })

  rowsToRemove.forEach(y => {
    board.splice(y, 1)
    board.unshift(Array(BOARD_WIDTH).fill(0))
    score += 100
    if ($score) $score.innerHTML = score.toString()
  })
}

const $section = document.querySelector('section')

$section?.addEventListener('click', () => {
  update()

  $section?.setAttribute('style', 'display: none;')
  document.querySelector('strong')?.setAttribute('style', 'display: block;')

  const audio = new window.Audio('./tetris.mp3')
  audio.volume = 0.01
  audio.play()
})
