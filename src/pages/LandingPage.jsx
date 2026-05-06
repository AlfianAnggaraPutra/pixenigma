import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelLogo from '../components/PixelLogo'
import AnimatedGridBg from '../components/AnimatedGridBg'

export default function LandingPage() {
  const navigate  = useNavigate()
  const [hovered,   setHovered]   = useState(false)
  const [cardHover, setCardHover] = useState(null)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fade = (delay) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(18px)',
    transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
  })

  const cards = [
    {
      icon: (isHov) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {[0,1,2,3].map(r=>[0,1,2,3].map(c=>(
            <rect key={`${r}${c}`} x={c*6+1} y={r*6+1} width="4" height="4" rx="0.8"
              fill={isHov ? '#F7F5F2' : '#0A0A0A'}
              opacity={r===0||r===3||c===0?1:0.15}/>
          )))}
        </svg>
      ),
      title: 'Pixel-Level',
      desc:  'Setiap piksel gambar diproses secara individual menggunakan algoritma Enigma',
    },
    {
      icon: (isHov) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={isHov?'#F7F5F2':'#0A0A0A'} strokeWidth="1.3"/>
          <circle cx="12" cy="12" r="6"  stroke={isHov?'#F7F5F2':'#0A0A0A'} strokeWidth="1.1"/>
          <circle cx="12" cy="12" r="2"  fill={isHov?'#F7F5F2':'#0A0A0A'}/>
          {[0,60,120,180,240,300].map(d=>{
            const r=d*Math.PI/180
            return <line key={d}
              x1={12+6*Math.cos(r)} y1={12+6*Math.sin(r)}
              x2={12+10*Math.cos(r)} y2={12+10*Math.sin(r)}
              stroke={isHov?'#F7F5F2':'#0A0A0A'} strokeWidth="1.2" strokeLinecap="round"/>
          })}
        </svg>
      ),
      title: '5 Pilihan Rotor',
      desc:  'Pilih 3 dari 5 rotor dengan affine cipher unik untuk kombinasi enkripsi yang kuat',
    },
    {
      // Ikon plugboard: dua titik dihubungkan kabel — relevan untuk pasangan substitusi
      icon: (isHov) => {
        const c = isHov ? '#F7F5F2' : '#0A0A0A'
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Konektor kiri */}
            <circle cx="4"  cy="8"  r="2" fill={c}/>
            <circle cx="4"  cy="12" r="2" fill={c}/>
            <circle cx="4"  cy="16" r="2" fill={c}/>
            {/* Konektor kanan */}
            <circle cx="20" cy="8"  r="2" fill={c}/>
            <circle cx="20" cy="12" r="2" fill={c}/>
            <circle cx="20" cy="16" r="2" fill={c}/>
            {/* Kabel pasangan 1: atas ke atas */}
            <path d="M6 8 C12 8 12 8 18 8" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            {/* Kabel pasangan 2: tengah ke bawah (silang) */}
            <path d="M6 12 C12 12 12 16 18 16" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
            {/* Kabel pasangan 3: bawah ke tengah (silang) */}
            <path d="M6 16 C12 16 12 12 18 12" stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          </svg>
        )
      },
      title: '120 Pasangan Plugboard',
      desc:  'Plugboard mendukung hingga 120 pasangan substitusi angka untuk keamanan tambahan',
    },
    {
      // Ikon enkripsi/dekripsi: gambar dengan ikon kunci di atasnya
      icon: (isHov) => {
        const c = isHov ? '#F7F5F2' : '#0A0A0A'
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {/* Frame gambar */}
            <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.3"/>
            {/* Gunung dalam gambar */}
            <path d="M5 18l4-5 3 4 3-3 4 4" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Gembok kecil di pojok kanan atas — menandakan enkripsi */}
            <rect x="15" y="2" width="7" height="6" rx="1.5" fill={c}/>
            <path d="M17 4V3a1.5 1.5 0 013 0v1" stroke={isHov?'#0A0A0A':'#F7F5F2'} strokeWidth="1.1" strokeLinecap="round"/>
            <circle cx="18.5" cy="5.5" r="0.8" fill={isHov?'#0A0A0A':'#F7F5F2'}/>
          </svg>
        )
      },
      title: 'Enkripsi & Dekripsi',
      desc:  'Enkripsi gambar PNG menjadi tak terbaca, lalu dekripsi kembali ke gambar semula dengan kunci yang sama',
    },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <AnimatedGridBg />

      {/* Navbar */}
      <nav style={{
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'28px 48px', position:'relative', zIndex:10,
        borderBottom:'1px solid rgba(0,0,0,0.08)',
        ...fade(0),
      }}>
        <PixelLogo size={32} showName showTagline={false}/>
        <div style={{ fontFamily:"'Space Mono', monospace", fontSize:'10px', letterSpacing:'0.2em', color:'#555555', fontWeight:700 }}>
          V 1.0.0
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'48px 24px 32px', position:'relative', zIndex:10 }}>

        {/* Badge */}
        <div style={{
          fontFamily:"'Space Mono', monospace",
          fontSize:'10px', letterSpacing:'0.25em', color:'#222222',
          border:'1.5px solid rgba(0,0,0,0.2)',
          background:'rgba(255,255,255,0.8)',
          padding:'7px 20px', borderRadius:'100px',
          marginBottom:'36px', backdropFilter:'blur(4px)', fontWeight:700,
          ...fade(0.1),
        }}>
          PIXEL-LEVEL ENIGMA ENCRYPTION
        </div>

        {/* Logo P */}
        <div style={{ marginBottom:'20px', ...fade(0.2) }}>
          <PixelLogo size={80} showName={false}/>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily:"'Syne', sans-serif",
          fontSize:'clamp(28px,7.5vw,72px)',
          fontWeight:800, letterSpacing:'0.07em',
          color:'#0A0A0A', lineHeight:1,
          marginBottom:'14px', textAlign:'center',
          ...fade(0.3),
        }}>
          PIXENIGMA
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily:"'Space Mono', monospace",
          fontSize:'clamp(10px,1.4vw,12px)',
          letterSpacing:'0.28em', color:'#333333',
          fontWeight:700, marginBottom:'52px', textAlign:'center',
          ...fade(0.4),
        }}>
          ENIGMA LIVES IN EVERY PIXEL
        </p>

        {/* Poin 1: tombol putih default, hover hitam */}
        <div style={{ ...fade(0.5) }}>
          <button
            onClick={() => navigate('/upload')}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              padding:'18px 64px',
              background: hovered ? '#0A0A0A' : '#FFFFFF',
              color: hovered ? '#F7F5F2' : '#0A0A0A',
              fontFamily:"'Syne', sans-serif",
              fontSize:'14px', fontWeight:700,
              letterSpacing:'0.22em',
              border:'1.5px solid #0A0A0A',
              cursor:'pointer',
              borderRadius:'6px',
              transition:'all 0.25s ease',
              transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
              boxShadow: hovered
                ? '0 12px 32px rgba(0,0,0,0.18)'
                : '0 2px 8px rgba(0,0,0,0.06)',
              display:'flex', alignItems:'center', gap:'12px',
              backdropFilter:'blur(4px)',
            }}
          >
            <LockIcon color={hovered ? '#F7F5F2' : '#0A0A0A'}/>
            MULAI SEKARANG
          </button>
        </div>

        {/* Cards */}
        <div style={{
          display:'flex', gap:'12px',
          marginTop:'72px', flexWrap:'wrap', justifyContent:'center',
          ...fade(0.65),
        }}>
          {cards.map((card, i) => {
            const isHov = cardHover === i
            return (
              <div
                key={i}
                onMouseEnter={() => setCardHover(i)}
                onMouseLeave={() => setCardHover(null)}
                style={{
                  background: isHov ? '#0A0A0A' : 'rgba(255,255,255,0.85)',
                  border:'1.5px solid ' + (isHov ? '#0A0A0A' : 'rgba(0,0,0,0.12)'),
                  borderRadius:'14px',
                  padding:'22px 18px',
                  width:'175px', textAlign:'center',
                  cursor:'default',
                  transition:'all 0.25s ease',
                  transform: isHov ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHov ? '0 14px 36px rgba(0,0,0,0.14)' : '0 2px 8px rgba(0,0,0,0.04)',
                  backdropFilter:'blur(6px)',
                }}
              >
                <div style={{ marginBottom:'12px', display:'flex', justifyContent:'center' }}>
                  {card.icon(isHov)}
                </div>
                {/* Poin 1: font judul kartu — Inter semibold, readable & elegan */}
                <div style={{
                  fontFamily:"'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize:'13px', fontWeight:700,
                  letterSpacing:'0.02em',
                  color: isHov ? '#F7F5F2' : '#0A0A0A',
                  marginBottom:'8px',
                  transition:'color 0.25s ease',
                }}>
                  {card.title}
                </div>
                {/* Deskripsi */}
                <div style={{
                  fontFamily:"'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize:'11px',
                  color: isHov ? 'rgba(247,245,242,0.8)' : '#444444',
                  lineHeight:1.65,
                  letterSpacing:'0.01em',
                  fontWeight:400,
                  transition:'color 0.25s ease',
                }}>
                  {card.desc}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding:'20px 48px', display:'flex', justifyContent:'center',
        borderTop:'1px solid rgba(0,0,0,0.08)',
        position:'relative', zIndex:10,
        ...fade(0.8),
      }}>
        <span style={{ fontFamily:"'Space Mono', monospace", fontSize:'10px', letterSpacing:'0.15em', color:'#555555', fontWeight:700 }}>
          © 2025/2026 · UNIVERSITAS AIRLANGGA · PROGRAM STUDI MATEMATIKA
        </span>
      </footer>
    </div>
  )
}

function LockIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="8" rx="2" stroke={color} strokeWidth="1.4"/>
      <path d="M5 7V5a3 3 0 016 0v2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="11" r="1.2" fill={color}/>
    </svg>
  )
}