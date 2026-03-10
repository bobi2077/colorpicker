import { useState, useCallback, useEffect } from 'react'
import './App.css'

function hslToHex(h, s, l) {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const HARMONIES = {
  random: {
    label: 'Random',
    generate: () =>
      Array.from({ length: 5 }, () => ({
        h: randomInt(0, 360),
        s: randomInt(45, 85),
        l: randomInt(35, 70),
      })),
  },
  analogous: {
    label: 'Analogous',
    generate: () => {
      const base = randomInt(0, 360)
      const s = randomInt(50, 80)
      return [-30, -15, 0, 15, 30].map((offset) => ({
        h: (base + offset + 360) % 360,
        s,
        l: randomInt(40, 65),
      }))
    },
  },
  complementary: {
    label: 'Complementary',
    generate: () => {
      const base = randomInt(0, 360)
      const s = randomInt(50, 80)
      return [0, 0, 180, 180, 180].map((offset, i) => ({
        h: (base + offset + (i % 2 === 0 ? 0 : 15)) % 360,
        s,
        l: 35 + i * 8,
      }))
    },
  },
  triadic: {
    label: 'Triadic',
    generate: () => {
      const base = randomInt(0, 360)
      const s = randomInt(55, 80)
      return [0, 0, 120, 120, 240].map((offset, i) => ({
        h: (base + offset) % 360,
        s,
        l: 40 + (i % 2) * 15,
      }))
    },
  },
  monochromatic: {
    label: 'Monochromatic',
    generate: () => {
      const h = randomInt(0, 360)
      const s = randomInt(40, 75)
      return [25, 35, 50, 65, 80].map((l) => ({ h, s, l }))
    },
  },
}

function App() {
  const [harmony, setHarmony] = useState('random')
  const [colors, setColors] = useState(() => HARMONIES.random.generate())
  const [copiedColor, setCopiedColor] = useState(null)

  const generate = useCallback(() => {
    setColors(HARMONIES[harmony].generate())
  }, [harmony])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        generate()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [generate])

  const copyColor = async (hex) => {
    await navigator.clipboard.writeText(hex)
    setCopiedColor(hex)
    setTimeout(() => setCopiedColor(null), 1500)
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Color Palette Generator</h1>
        <p>Generate beautiful color harmonies. Click a color to copy.</p>
      </div>

      <div className="controls">
        <select
          className="harmony-select"
          value={harmony}
          onChange={(e) => setHarmony(e.target.value)}
        >
          {Object.entries(HARMONIES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button className="btn btn-generate" onClick={generate}>
          Generate
        </button>
      </div>

      <div className="palette">
        {colors.map((color, i) => {
          const hex = hslToHex(color.h, color.s, color.l)
          return (
            <div
              key={i}
              className="color-card"
              style={{ backgroundColor: `hsl(${color.h}, ${color.s}%, ${color.l}%)` }}
              onClick={() => copyColor(hex)}
            >
              <div className="color-info">
                <div className="hex">{hex.toUpperCase()}</div>
                <div className="hsl">
                  HSL({color.h}, {color.s}%, {color.l}%)
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="hint">Press Space or click Generate for a new palette</p>

      {copiedColor && (
        <div className="copied-toast">
          Copied {copiedColor.toUpperCase()}
        </div>
      )}
    </div>
  )
}

export default App
