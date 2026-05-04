import React from 'react'

export default function PixelLogo({ size = 48, showName = true, showTagline = false, className = '' }) {
  const cell = size / 8
  const gap  = cell * 0.14

  const grid = [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,3,0,0],
    [1,0,0,2,0],
    [1,3,0,0,0],
    [1,0,0,2,0],
  ]

  const colors = {
    0: { fill: '#0A0A0A', opacity: 0.06 },
    1: { fill: '#0A0A0A', opacity: 1 },
    2: { fill: '#0A0A0A', opacity: 0.38 },
    3: { fill: '#0A0A0A', opacity: 0.16 },
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <svg
        width={cell * 5 + gap * 4}
        height={cell * 8 + gap * 7}
        viewBox={`0 0 ${cell * 5 + gap * 4} ${cell * 8 + gap * 7}`}
      >
        {grid.map((row, ri) =>
          row.map((val, ci) => {
            const x = ci * (cell + gap)
            const y = ri * (cell + gap)
            const { fill, opacity } = colors[val]
            return (
              <rect
                key={`${ri}-${ci}`}
                x={x} y={y}
                width={cell} height={cell}
                rx={cell * 0.1}
                fill={fill}
                opacity={opacity}
              />
            )
          })
        )}
      </svg>

      {showName && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: size * 0.55,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#0A0A0A',
            lineHeight: 1,
          }}>
            PIXENIGMA
          </span>
          {showTagline && (
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: size * 0.155,
              letterSpacing: '0.2em',
              color: '#AAAAAA',
              marginTop: size * 0.1,
              lineHeight: 1,
            }}>
              ENIGMA LIVES IN EVERY PIXEL
            </span>
          )}
        </div>
      )}
    </div>
  )
}