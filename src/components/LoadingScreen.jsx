import React, { useEffect, useRef } from 'react'
import AnimatedGridBg from './AnimatedGridBg'

const TOTAL_DURATION = 9500

export default function LoadingScreen({ onComplete }) {
  const progressRef  = useRef(0)
  const rafRef       = useRef(null)
  const dotRef       = useRef(1)
  const dotRafRef    = useRef(null)
  const exitRef      = useRef(false)

  // Canvas refs
  const gearCanvasRef = useRef(null)
  const barCanvasRef  = useRef(null)
  const labelRef      = useRef(null)
  const pctRef        = useRef(null)
  const containerRef  = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const gCanvas = gearCanvasRef.current
    const bCanvas = barCanvasRef.current
    if (!gCanvas || !bCanvas) return

    const gCtx = gCanvas.getContext('2d')
    const bCtx = bCanvas.getContext('2d')

    // Gear angles
    let aTop = 0   // top-right gear (big)
    let aLeft = 0  // left gear (medium)
    let aBott = 0  // bottom gear (medium)

    // Gear on progress bar
    let aBar = 0

    // Dot animation
    let lastDot = start
    let dotCount = 1

    // ── Draw a solid gear (like reference image 2) ──
    function drawGear(ctx, cx, cy, r, teeth, angle, fillColor) {
      const ri    = r * 0.62   // root (inner of teeth)
      const ro    = r * 1.0    // tip
      const hole  = r * 0.32   // center hole

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(angle)

      // Build gear path
      ctx.beginPath()
      for (let i = 0; i < teeth; i++) {
        const base  = (i / teeth) * Math.PI * 2
        const next  = ((i + 1) / teeth) * Math.PI * 2
        const w     = (next - base) * 0.28  // tooth width

        // root arc from previous tooth to this
        const prevEnd = base - (next - base) * 0.28
        if (i === 0) ctx.moveTo(ri * Math.cos(base - w), ri * Math.sin(base - w))
        else ctx.lineTo(ri * Math.cos(base - w), ri * Math.sin(base - w))

        // tooth: up to tip, flat across, back down
        ctx.lineTo(ro * Math.cos(base - w * 0.5), ro * Math.sin(base - w * 0.5))
        ctx.lineTo(ro * Math.cos(base + w * 0.5), ro * Math.sin(base + w * 0.5))
        ctx.lineTo(ri * Math.cos(base + w),        ri * Math.sin(base + w))

        // arc along root to next tooth
        ctx.arc(0, 0, ri, base + w, next - w, false)
      }
      ctx.closePath()
      ctx.fillStyle = fillColor
      ctx.fill()

      // Center hole (cut out)
      ctx.beginPath()
      ctx.arc(0, 0, hole, 0, Math.PI * 2)
      ctx.fillStyle = '#F7F5F2'
      ctx.fill()

      // Small inner ring detail
      ctx.beginPath()
      ctx.arc(0, 0, hole * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = fillColor
      ctx.fill()

      ctx.restore()
    }

    // ── Gear system positions (triangular like image 1) ──
    // Canvas size 200x180
    // Top-right: big gear
    // Left: medium gear meshing with top-right
    // Bottom: medium gear meshing with top-right and left
    const GW = 200, GH = 180
    gCanvas.width  = GW
    gCanvas.height = GH

    const bigR  = 46
    const medR  = 30

    // top-right gear center
    const gTx = GW * 0.62, gTy = GH * 0.30
    // left gear: touches top-right
    const gLx = gTx - (bigR + medR) * Math.cos(Math.PI * 0.18)
    const gLy = gTy + (bigR + medR) * Math.sin(Math.PI * 0.18)
    // bottom gear: touches top-right AND left
    const gBx = gTx - (bigR + medR) * Math.cos(Math.PI * 0.58)
    const gBy = gTy + (bigR + medR) * Math.sin(Math.PI * 0.58)

    const bigTeeth = 24
    const medTeeth = Math.round(bigTeeth * medR / bigR)

    // Speed ratios (opposite direction, proportional to radius)
    function animateGears(now) {
      const elapsed = now - start
      const pct     = Math.min(elapsed / TOTAL_DURATION, 1)

      // Update progress
      progressRef.current = pct * 100
      if (pctRef.current) pctRef.current.textContent = Math.round(pct * 100) + '%'

      // Dot animation
      if (now - lastDot > 500) {
        dotCount = dotCount >= 3 ? 1 : dotCount + 1
        if (labelRef.current) labelRef.current.textContent = 'Loading' + '.'.repeat(dotCount)
        lastDot = now
      }

      // Progress bar canvas
      const BW = 360, BH = 28
      bCanvas.width  = BW
      bCanvas.height = BH
      bCtx.clearRect(0, 0, BW, BH)

      // Track
      bCtx.beginPath()
      bCtx.roundRect(0, (BH - 12) / 2, BW, 12, 6)
      bCtx.fillStyle = '#E0DDD8'
      bCtx.fill()

      // Fill
      const fillW = Math.max(0, pct * BW - 6)
      if (fillW > 0) {
        bCtx.beginPath()
        bCtx.roundRect(0, (BH - 12) / 2, fillW, 12, 6)
        bCtx.fillStyle = '#0A0A0A'
        bCtx.fill()
      }

      // Gear on bar — center vertically on bar
      const gBarX = Math.min(pct * BW, BW - 10)
      const gBarY = BH / 2
      aBar += 0.08
      drawGear(bCtx, gBarX, gBarY, 10, 8, aBar, '#0A0A0A')
      // Redraw center hole white to match bar bg/fill
      bCtx.beginPath()
      bCtx.arc(gBarX, gBarY, 10 * 0.32, 0, Math.PI * 2)
      bCtx.fillStyle = gBarX > fillW ? '#F7F5F2' : '#F7F5F2'
      bCtx.fill()

      // Gear system
      gCtx.clearRect(0, 0, GW, GH)
      aTop  += 0.015
      aLeft  = -aTop * (bigR / medR) + Math.PI / medTeeth
      aBott  = -aTop * (bigR / medR)

      drawGear(gCtx, gTx, gTy, bigR, bigTeeth, aTop,  '#555555')
      drawGear(gCtx, gLx, gLy, medR, medTeeth, aLeft, '#888888')
      drawGear(gCtx, gBx, gBy, medR, medTeeth, aBott, '#888888')

      if (pct < 1) {
        rafRef.current = requestAnimationFrame(animateGears)
      } else if (!exitRef.current) {
        exitRef.current = true
        if (containerRef.current) {
          containerRef.current.style.opacity = '0'
        }
        setTimeout(() => onComplete(), 800)
      }
    }

    rafRef.current = requestAnimationFrame(animateGears)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#F7F5F2',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9998,
        transition: 'opacity 0.8s ease',
        opacity: 1,
        overflow: 'hidden',
      }}
    >
      <AnimatedGridBg />

      <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth:'440px', padding:'0 40px' }}>

        {/* Gear system canvas */}
        <canvas ref={gearCanvasRef} style={{ marginBottom:'20px' }}/>

        {/* Brand */}
        <div style={{ fontFamily:'Syne, sans-serif', fontSize:'15px', fontWeight:800, letterSpacing:'0.35em', color:'#0A0A0A', marginBottom:'32px' }}>
          PIXENIGMA
        </div>

        {/* Loading... | persen */}
        <div style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <div ref={labelRef} style={{ fontFamily:'Space Mono, monospace', fontSize:'11px', letterSpacing:'0.12em', color:'#333333', fontWeight:700 }}>
            Loading.
          </div>
          <div ref={pctRef} style={{ fontFamily:'Space Mono, monospace', fontSize:'11px', letterSpacing:'0.1em', color:'#333333', fontWeight:700 }}>
            0%
          </div>
        </div>

        {/* Progress bar canvas */}
        <canvas ref={barCanvasRef} style={{ width:'100%', height:'28px' }}/>
      </div>
    </div>
  )
}