import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { join } from 'path'

const iconDir = join(process.cwd(), 'public/icons')

function createIcon(size: number) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#faf7f2'
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = '#2c1810'
  ctx.font = `bold ${size * 0.15}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SOFIA', size / 2, size / 2)

  const buffer = canvas.toBuffer('image/png')
  writeFileSync(join(iconDir, `icon-${size}x${size}.png`), buffer)
  console.log(`Created icon-${size}x${size}.png`)
}

try {
  createIcon(192)
  createIcon(512)
  console.log('PWA icons created successfully')
} catch (error) {
  console.error('Error creating icons:', error)
  process.exit(1)
}
