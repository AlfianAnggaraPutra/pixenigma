import React, { useEffect, useRef } from 'react'

export default function AnimatedGridBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const CELL = 48
    const GAP  = 1
    let W, H, cols, rows
    let cells = []
    let animFrame

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      cols = Math.ceil(W / CELL) + 1
      rows = Math.ceil(H / CELL) + 1
      cells = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: c * CELL,
            y: r * CELL,
            opacity: 0,
            target: 0,
            timer: Math.random() * 300,
          })
        }
      }
    }

    let activeSet = new Set()
    let tick = 0

    function pickNewActive() {
      const idx = Math.floor(Math.random() * cells.length)
      if (!activeSet.has(idx)) {
        activeSet.add(idx)
        cells[idx].target = 0.12 + Math.random() * 0.1
        cells[idx].timer  = 60 + Math.random() * 120
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.045)'
      ctx.lineWidth   = 0.8
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath()
        ctx.moveTo(c * CELL, 0)
        ctx.lineTo(c * CELL, H)
        ctx.stroke()
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath()
        ctx.moveTo(0, r * CELL)
        ctx.lineTo(W, r * CELL)
        ctx.stroke()
      }

      // Animate cells
      cells.forEach((cell, i) => {
        cell.timer--
        if (cell.timer <= 0) {
          if (activeSet.has(i)) {
            cell.target = 0
            if (cell.opacity < 0.01) activeSet.delete(i)
          }
        }
        cell.opacity += (cell.target - cell.opacity) * 0.05

        if (cell.opacity > 0.005) {
          ctx.fillStyle = `rgba(0,0,0,${cell.opacity})`
          ctx.fillRect(cell.x + GAP, cell.y + GAP, CELL - GAP * 2, CELL - GAP * 2)
        }
      })

      // Occasionally activate new cell
      tick++
      if (tick % 18 === 0) pickNewActive()
      if (tick % 45 === 0) pickNewActive()

      animFrame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(animFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}