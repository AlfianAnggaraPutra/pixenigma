import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelLogo from '../components/PixelLogo'
import AnimatedGridBg from '../components/AnimatedGridBg'
import { useApp } from '../context/AppContext'

export default function UploadPage() {
  const navigate  = useNavigate()
  const app       = useApp()
  const [dragging, setDragging] = useState(false)
  const [preview,  setPreview]  = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [error,    setError]    = useState('')
  const [btnHover, setBtnHover] = useState(null)
  const inputRef  = useRef()
  const canvasRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (file.type !== 'image/png' || ext !== 'png') {
      setError('Format tidak didukung. Gambar harus berformat PNG (.png)')
      setPreview(null); setFileInfo(null); return
    }
    setError('')

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setFileInfo({
      Nama:   file.name,
      Ukuran: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      Format: 'PNG',
    })

    // Baca piksel via Canvas dan simpan di memori (bukan sessionStorage)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      canvas.width  = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imgData = ctx.getImageData(0, 0, img.width, img.height)
      // Simpan ke context (memori RAM) — tidak ada batas ukuran
      app.setImage(imgData, objectUrl)
    }
    img.src = objectUrl
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <AnimatedGridBg/>
      {/* Canvas tersembunyi untuk baca piksel */}
      <canvas ref={canvasRef} style={{ display:'none' }}/>

      <Navbar/>
      <Stepper current={0}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', position:'relative', zIndex:10 }}>
        <h2 style={pageTitle()}>UPLOAD GAMBAR</h2>
        <p style={pageSubtitle()}>Format yang diterima: hanya PNG</p>

        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDragging(true)}}
          onDragLeave={()=>setDragging(false)}
          onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
          onClick={()=>inputRef.current.click()}
          style={{
            width:'100%', maxWidth:'520px', minHeight:'260px',
            border:`2px dashed ${dragging?'#0A0A0A':error?'#CC0000':preview?'#0A0A0A':'rgba(0,0,0,0.2)'}`,
            borderRadius:'16px',
            background:dragging?'rgba(0,0,0,0.03)':preview?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.7)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'all 0.25s ease', padding:'32px',
            backdropFilter:'blur(4px)', marginBottom:'12px',
          }}
        >
          <input ref={inputRef} type="file" accept=".png,image/png" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
          {preview ? (
            <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px'}}>
              <img src={preview} alt="preview" style={{maxWidth:'100%', maxHeight:'200px', objectFit:'contain', borderRadius:'8px', border:'1px solid rgba(0,0,0,0.08)'}}/>
              <div style={{display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
                {Object.entries(fileInfo).map(([k,v])=>(
                  <div key={k} style={{textAlign:'center'}}>
                    <div style={{fontFamily:"'Space Mono',monospace", fontSize:'8px', letterSpacing:'0.15em', color:'#777777', marginBottom:'3px', textTransform:'uppercase'}}>{k}</div>
                    <div style={{fontFamily:"'Syne',sans-serif", fontSize:'13px', fontWeight:700, color:'#0A0A0A'}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"'Space Mono',monospace", fontSize:'9px', color:'#888888', letterSpacing:'0.1em'}}>Klik untuk ganti gambar</div>
            </div>
          ) : (
            <>
              <UploadSVG dragging={dragging} hasError={!!error}/>
              <div style={{fontFamily:"'Syne',sans-serif", fontSize:'15px', fontWeight:700, letterSpacing:'0.1em', color:'#0A0A0A', marginBottom:'8px', marginTop:'16px', textAlign:'center'}}>
                {dragging?'Lepaskan di sini':'Drag & drop atau klik untuk upload'}
              </div>
              <div style={{fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.12em', color:'#666666'}}>Hanya PNG</div>
            </>
          )}
        </div>

        {error && (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(204,0,0,0.06)', border:'1.5px solid rgba(204,0,0,0.2)', borderRadius:'10px', padding:'10px 16px', marginBottom:'8px', maxWidth:'520px', width:'100%' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#CC0000" strokeWidth="1.3"/>
              <path d="M8 5v4" stroke="#CC0000" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="8" cy="11.5" r="1" fill="#CC0000"/>
            </svg>
            <span style={{fontFamily:"'Space Mono',monospace", fontSize:'10px', color:'#CC0000', letterSpacing:'0.08em', fontWeight:700}}>{error}</span>
          </div>
        )}

        <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
          <button onClick={()=>{ app.reset(); navigate('/') }} onMouseEnter={()=>setBtnHover('back')} onMouseLeave={()=>setBtnHover(null)} style={twoBtn(btnHover==='back')}>← Kembali</button>
          <button
            onClick={()=>{ if(app.getImage().imageData) navigate('/settings') }}
            onMouseEnter={()=>setBtnHover('next')} onMouseLeave={()=>setBtnHover(null)}
            style={{
              ...twoBtn(btnHover==='next'),
              background: !app.getImage().imageData
                ? 'rgba(0,0,0,0.08)'
                : btnHover==='next' ? '#0A0A0A' : 'rgba(255,255,255,0.85)',
              color: !app.getImage().imageData
                ? '#AAAAAA'
                : btnHover==='next' ? '#F7F5F2' : '#0A0A0A',
              border: app.getImage().imageData ? '1.5px solid #0A0A0A' : '1.5px solid transparent',
              cursor: app.getImage().imageData ? 'pointer' : 'not-allowed',
            }}
          >Lanjut →</button>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

function UploadSVG({ dragging, hasError }) {
  const color = hasError?'#CC0000':dragging?'#0A0A0A':'#AAAAAA'
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <rect x="6" y="14" width="40" height="30" rx="4" stroke={color} strokeWidth="1.5"/>
      <path d="M18 30l6-8 6 8 4-5 7 9H8" fill="rgba(0,0,0,0.04)" stroke={color} strokeWidth="1.2" strokeLinejoin="round"/>
      <circle cx="20" cy="24" r="2.5" stroke={color} strokeWidth="1.2"/>
      <path d="M26 6v14M22 9l4-4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="34" y="4" width="14" height="10" rx="2" fill={color} opacity="0.9"/>
      <text x="41" y="12" textAnchor="middle" fill="white" fontSize="6" fontFamily="Inter,sans-serif" fontWeight="700">PNG</text>
    </svg>
  )
}

const twoBtn=(hovered)=>({
  padding:'14px 32px',
  background:hovered?'#0A0A0A':'rgba(255,255,255,0.85)',
  color:hovered?'#F7F5F2':'#0A0A0A',
  fontFamily:"'Syne',sans-serif", fontSize:'12px', fontWeight:700,
  letterSpacing:'0.18em', border:'1.5px solid #0A0A0A',
  borderRadius:'6px', cursor:'pointer', transition:'all 0.25s ease',
  transform:hovered?'translateY(-2px)':'translateY(0)',
  boxShadow:hovered?'0 8px 20px rgba(0,0,0,0.12)':'none',
  backdropFilter:'blur(4px)', textTransform:'uppercase',
})

export function Navbar() {
  return (
    <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 48px', position:'relative', zIndex:10, borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
      <PixelLogo size={28} showName showTagline={false}/>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.2em', color:'#555555', fontWeight:700 }}>V 1.0.0</div>
    </nav>
  )
}

export function Stepper({ current }) {
  const steps = ['Upload','Pengaturan','Hasil']
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'16px 48px', position:'relative', zIndex:10 }}>
      {steps.map((s,i)=>(
        <React.Fragment key={i}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
            <div style={{ width:'30px', height:'30px', borderRadius:'6px', background:i<=current?'#0A0A0A':'rgba(0,0,0,0.08)', color:i<=current?'#F7F5F2':'#888888', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Space Mono',monospace", fontSize:'11px', fontWeight:700, transition:'all 0.3s ease' }}>
              {i<current?'✓':i+1}
            </div>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'9px', letterSpacing:'0.12em', color:i<=current?'#0A0A0A':'#AAAAAA', fontWeight:i<=current?700:400 }}>
              {s.toUpperCase()}
            </span>
          </div>
          {i<steps.length-1&&<div style={{ width:'60px', height:'1px', background:i<current?'#0A0A0A':'rgba(0,0,0,0.12)', margin:'0 8px', marginBottom:'20px', transition:'background 0.3s ease' }}/>}
        </React.Fragment>
      ))}
    </div>
  )
}

export function Footer() {
  return (
    <footer style={{ padding:'16px 48px', display:'flex', justifyContent:'center', borderTop:'1px solid rgba(0,0,0,0.08)', position:'relative', zIndex:10 }}>
      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'9px', letterSpacing:'0.15em', color:'#555555', fontWeight:700 }}>
        © 2025/2026 · UNIVERSITAS AIRLANGGA · PROGRAM STUDI MATEMATIKA
      </span>
    </footer>
  )
}

export function ModeBadge() { return null }
export const pageTitle = () => ({ fontFamily:"'Syne',sans-serif", fontSize:'clamp(18px,3.5vw,26px)', fontWeight:800, letterSpacing:'0.12em', color:'#0A0A0A', marginBottom:'6px', textAlign:'center', textTransform:'uppercase' })
export const pageSubtitle = () => ({ fontFamily:"'Space Mono',monospace", fontSize:'11px', letterSpacing:'0.12em', color:'#444444', marginBottom:'28px', textAlign:'center', fontWeight:700 })