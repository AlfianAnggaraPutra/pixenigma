import React, { useEffect, useState } from 'react'
import AnimatedGridBg from './AnimatedGridBg'

export default function SplashScreen({ onComplete }) {
  const [phase,       setPhase]       = useState('enter')
  const [showName,    setShowName]    = useState(false)
  const [showTagline, setShowTagline] = useState(false)
  const [pixelPhase,  setPixelPhase]  = useState(0)
  const [lineWidth,   setLineWidth]   = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPixelPhase(1), 400)
    const t2 = setTimeout(() => setPixelPhase(2), 900)
    const t3 = setTimeout(() => setPixelPhase(3), 1300)
    const t4 = setTimeout(() => setShowName(true), 1500)
    const t5 = setTimeout(() => setShowTagline(true), 1950)
    const t6 = setTimeout(() => setLineWidth(100), 2100)
    const t7 = setTimeout(() => setPhase('exit'), 6200)
    const t8 = setTimeout(() => onComplete(), 6900)
    return () => [t1,t2,t3,t4,t5,t6,t7,t8].forEach(clearTimeout)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#F7F5F2',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      transition: 'opacity 0.7s ease',
      opacity: phase === 'exit' ? 0 : 1,
      overflow: 'hidden',
    }}>
      <AnimatedGridBg />
      <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', gap:'24px' }}>
        <AnimatedPixelP phase={pixelPhase} />
        <div style={{ overflow:'hidden', height:'56px', display:'flex', alignItems:'center' }}>
          <div style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(30px, 5vw, 44px)',
            fontWeight: 800, letterSpacing: '0.32em', color: '#0A0A0A',
            transform: showName ? 'translateY(0)' : 'translateY(64px)',
            transition: 'transform 0.7s cubic-bezier(0.34,1.4,0.64,1)',
          }}>PIXENIGMA</div>
        </div>
        <div style={{
          width: `${lineWidth}%`, maxWidth: '280px', height: '1px',
          background: 'linear-gradient(to right, transparent, #888888, transparent)',
          transition: 'width 0.8s ease',
        }} />
        {/* Poin 1: tagline lebih gelap */}
        <div style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '11px', letterSpacing: '0.28em',
          color: '#333333', fontWeight: 700,
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}>
          ENIGMA LIVES IN EVERY PIXEL
        </div>
      </div>
      {/* Poin 1: versi lebih gelap */}
      <div style={{
        position: 'absolute', bottom: '36px',
        fontFamily: 'Space Mono, monospace',
        fontSize: '10px', letterSpacing: '0.2em',
        color: '#555555', fontWeight: 700,
        opacity: showTagline ? 1 : 0,
        transition: 'opacity 0.6s ease 0.3s',
        zIndex: 2,
      }}>
        V 1.0.0
      </div>
    </div>
  )
}

function AnimatedPixelP({ phase }) {
  const cell = 11, gap = 1.8
  const grid = [
    [1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],
    [1,0,3,0,0],[1,0,0,2,0],[1,3,0,0,0],[1,0,0,2,0],
  ]
  const getOpacity = (val, ri, phase) => {
    const base = val===1?1:val===2?0.38:val===3?0.16:0.06
    if (phase===0) return 0
    if (phase===1) return (val===1&&ri<4)?base:0.04
    if (phase===2) return val===1?base:ri>=4?0.04:0.06
    return base
  }
  const w = cell*5+gap*4, h = cell*8+gap*7
  return (
    <svg width={w*2.2} height={h*2.2} viewBox={`0 0 ${w} ${h}`}>
      {grid.map((row,ri)=>row.map((val,ci)=>(
        <rect key={`${ri}-${ci}`}
          x={ci*(cell+gap)} y={ri*(cell+gap)}
          width={cell} height={cell} rx={1.2}
          fill="#0A0A0A" opacity={getOpacity(val,ri,phase)}
          style={{transition:'opacity 0.45s ease'}}
        />
      )))}
    </svg>
  )
}