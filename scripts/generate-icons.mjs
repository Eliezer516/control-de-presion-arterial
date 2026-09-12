import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'icons')

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// Heart implicit equation: (x^2 + y^2 - 1)^3 - x^2*y^3 < 0
function heartInside(x, y) {
  const a = x * x + y * y - 1
  return a * a * a - x * x * y * y * y < 0
}

const PALETTE = {
  bg: [244, 209, 61, 255], // #F4D13D yellow
  outline: [11, 11, 11, 255], // near-black
  red: [255, 107, 107, 255], // #FF6B6B
  shadow: [11, 11, 11, 255],
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4)
  const SS = 4 // supersampling factor (4x4)
  const heartScale = size * 0.27
  const cx = size / 2
  const cy = size * 0.56
  const shadowDx = size * 0.05
  const shadowDy = size * 0.06

  const cover = (px, py, scale) => {
    let inside = 0
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const ux = ((px + (sx + 0.5) / SS) - cx) / (heartScale * scale)
        const uy = (((py + (sy + 0.5) / SS) - cy) / (heartScale * scale)) * 1.15
        if (heartInside(ux, uy)) inside++
      }
    }
    return inside / (SS * SS)
  }

  const mix = (a, b, t) => a + (b - a) * t
  const blend = (dst, src, alpha, idx) => {
    const a = alpha * (src[3] / 255)
    dst[idx] = Math.round(mix(dst[idx], src[0], a))
    dst[idx + 1] = Math.round(mix(dst[idx + 1], src[1], a))
    dst[idx + 2] = Math.round(mix(dst[idx + 2], src[2], a))
    dst[idx + 3] = Math.round(mix(dst[idx + 3], 255, a))
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4
      rgba[idx] = PALETTE.bg[0]
      rgba[idx + 1] = PALETTE.bg[1]
      rgba[idx + 2] = PALETTE.bg[2]
      rgba[idx + 3] = 255

      // offset shadow heart
      const shadowCov = cover(x - shadowDx, y - shadowDy, 1.02)
      if (shadowCov > 0) blend(rgba, PALETTE.shadow, shadowCov, idx)

      // black outline (slightly larger heart)
      const outerCov = cover(x, y, 1.1)
      if (outerCov > 0) blend(rgba, PALETTE.outline, outerCov, idx)

      // main red heart overlay
      const innerCov = cover(x, y, 1)
      if (innerCov > 0) blend(rgba, PALETTE.red, innerCov, idx)
    }
  }

  return encodePNG(size, size, rgba)
}

mkdirSync(OUT_DIR, { recursive: true })

const targets = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['icon-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]

for (const [name, size] of targets) {
  writeFileSync(join(OUT_DIR, name), drawIcon(size))
  console.log(`generated public/icons/${name} (${size}x${size})`)
}