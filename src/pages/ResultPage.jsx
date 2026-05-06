import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PixelLogo from '../components/PixelLogo'
import AnimatedGridBg from '../components/AnimatedGridBg'
import { Stepper, Footer } from './UploadPage'
import { ROTORS } from '../engine/enigma'
import { useApp } from '../context/AppContext'

export default function ResultPage() {
  const navigate  = useNavigate()
  const app       = useApp()
  const canvasRef = useRef()
  const workerRef = useRef(null)

  const [status,      setStatus]      = useState('processing')
  const [resultUrl,   setResultUrl]   = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [stats,       setStats]       = useState(null)
  const [btnHover,    setBtnHover]    = useState(null)

  useEffect(() => {
    // Ambil data dari context (memori) — bukan sessionStorage
    const { imageData, imageUrl } = app.getImage()
    const { rotors: rotorIds, positions, plugboardPairs } = app.getSettings()

    // Kalau tidak ada data, kembali ke landing
    if (!imageData || !rotorIds || rotorIds.some(r => r === null)) {
      navigate('/'); return
    }

    setOriginalUrl(imageUrl)

    const rotors = rotorIds.map(id => ROTORS.find(r => r.id === id))
    const start  = performance.now()

    // Web Worker inline — zero copy transfer
    const workerCode = `
      function mod256(x){return((x%256)+256)%256}
      function modInverse(a){
        a=mod256(a)
        for(let x=1;x<256;x++){if((a*x)%256===1)return x}
        throw new Error('no inverse')
      }
      function affineEncrypt(x,A,B){return mod256(A*x+B)}
      function affineDecrypt(y,A,B){return mod256(modInverse(A)*(y-B))}
      function reflector(x){
        if(x>=240&&x<=248)return x+8
        if(x>=249&&x<=255)return x-8
        return x%20<10?x+10:x-10
      }
      function buildPlugboard(pairs){
        const map=new Uint8Array(256)
        for(let v=0;v<256;v++)map[v]=v
        for(const[a,b]of pairs){map[a]=b;map[b]=a}
        return map
      }
      function advanceRotors(i,j,k){
        let ni=mod256(i+1),nj=j,nk=k
        if(ni===0){nj=mod256(j+1);if(nj===0)nk=mod256(k+1)}
        return[ni,nj,nk]
      }
      function rotorFwd(x,A,B,pos){return mod256(affineEncrypt(mod256(x+pos),A,B)-pos)}
      function rotorBwd(x,A,B,pos){return mod256(affineDecrypt(mod256(x+pos),A,B)-pos)}

      self.onmessage=function(e){
        const{buf,rotors,positions,pairs}=e.data
        const data=new Uint8ClampedArray(buf)
        const P=buildPlugboard(pairs)
        const[R,M,L]=rotors
        let[ri,rj,rk]=positions
        const total=data.length/4
        for(let px=0;px<data.length;px+=4){
          ;[ri,rj,rk]=advanceRotors(ri,rj,rk)
          for(let c=0;c<3;c++){
            let x=P[data[px+c]]
            x=rotorFwd(x,R.A,R.B,ri)
            x=rotorFwd(x,M.A,M.B,rj)
            x=rotorFwd(x,L.A,L.B,rk)
            x=reflector(x)
            x=rotorBwd(x,L.A,L.B,rk)
            x=rotorBwd(x,M.A,M.B,rj)
            x=rotorBwd(x,R.A,R.B,ri)
            data[px+c]=P[x]
          }
        }
        self.postMessage({buf:data.buffer},[data.buffer])
      }
    `

    const blob   = new Blob([workerCode], { type:'application/javascript' })
    const url    = URL.createObjectURL(blob)
    const worker = new Worker(url)
    workerRef.current = worker

    worker.onmessage = (e) => {
      URL.revokeObjectURL(url)
      const resultData    = new Uint8ClampedArray(e.data.buf)
      const resultImgData = new ImageData(resultData, imageData.width, imageData.height)

      const canvas = canvasRef.current
      canvas.width  = imageData.width
      canvas.height = imageData.height
      const ctx = canvas.getContext('2d')
      ctx.putImageData(resultImgData, 0, 0)

      // Export PNG via toBlob — lebih akurat dari toDataURL
      canvas.toBlob((blob) => {
        const rUrl    = URL.createObjectURL(blob)
        const elapsed = ((performance.now() - start) / 1000).toFixed(2)
        setResultUrl(rUrl)
        setStats({
          Piksel:  (imageData.width * imageData.height).toLocaleString(),
          Dimensi: `${imageData.width} × ${imageData.height}`,
          Waktu:   elapsed + 's',
        })
        setStatus('done')
      }, 'image/png', 1.0)

      worker.terminate()
    }

    worker.onerror = () => {
      URL.revokeObjectURL(url)
      worker.terminate()
      setStatus('error')
    }

    // Transfer buffer zero-copy ke Worker
    const transferBuf = imageData.data.buffer.slice(0)
    worker.postMessage({ buf: transferBuf, rotors, positions, pairs: plugboardPairs }, [transferBuf])

    return () => { if (workerRef.current) workerRef.current.terminate() }
  }, [navigate, app])

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = 'pixenigma_result.png'
    a.click()
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <AnimatedGridBg/>
      <canvas ref={canvasRef} style={{ display:'none' }}/>

      <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 48px', position:'relative', zIndex:10, borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
        <PixelLogo size={28} showName showTagline={false}/>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.2em', color:'#555555', fontWeight:700 }}>V 1.0.0</div>
      </nav>
      <Stepper current={2}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'32px 24px', position:'relative', zIndex:10, maxWidth:'800px', margin:'0 auto', width:'100%' }}>

        {status === 'processing' && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'28px', flex:1, padding:'80px 0' }}>
            <SpinnerCircle/>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:'18px', fontWeight:800, letterSpacing:'0.15em', color:'#0A0A0A', marginBottom:'8px' }}>MEMPROSES GAMBAR</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'11px', letterSpacing:'0.15em', color:'#555555', fontWeight:700 }}>Memproses piksel satu per satu...</div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign:'center', padding:'60px 0', flex:1 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", color:'#CC0000', fontSize:'12px', letterSpacing:'0.1em', marginBottom:'24px', fontWeight:700 }}>
              ⚠ Terjadi kesalahan saat memproses gambar.
            </div>
            <button onMouseEnter={()=>setBtnHover('err')} onMouseLeave={()=>setBtnHover(null)} onClick={()=>navigate('/')} style={outlineBtn(btnHover==='err')}>
              KEMBALI KE AWAL
            </button>
          </div>
        )}

        {status === 'done' && (
          <>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:'clamp(18px,3vw,24px)', fontWeight:800, letterSpacing:'0.12em', color:'#0A0A0A', marginBottom:'8px', textAlign:'center' }}>
              GAMBAR BERHASIL DIPROSES
            </h2>
            <p style={{ fontFamily:"'Space Mono',monospace", fontSize:'12px', letterSpacing:'0.13em', color:'#333333', marginBottom:'28px', textAlign:'center', fontWeight:700 }}>
              Silahkan download atau simpan file PNG beserta konfigurasi kuncinya
            </p>

            {/* Stats */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', justifyContent:'center', marginBottom:'24px' }}>
              {stats && Object.entries(stats).map(([k,v])=>(
                <div key={k} style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:'12px', padding:'16px 22px', textAlign:'center', backdropFilter:'blur(4px)', minWidth:'108px' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'9px', letterSpacing:'0.18em', color:'#555555', marginBottom:'7px', textTransform:'uppercase', fontWeight:700 }}>{k}</div>
                  <div style={{ fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif", fontSize:'17px', fontWeight:700, color:'#0A0A0A', letterSpacing:'-0.01em', lineHeight:1 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Before / After */}
            <div style={{ width:'100%', maxWidth:'660px', background:'rgba(255,255,255,0.88)', border:'1.5px solid rgba(0,0,0,0.1)', borderRadius:'16px', overflow:'hidden', marginBottom:'24px', backdropFilter:'blur(4px)' }}>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ flex:1, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.18em', color:'#333333', marginBottom:'10px', fontWeight:700 }}>SEBELUM</div>
                  {originalUrl&&<img src={originalUrl} alt="sebelum" style={{ width:'100%', maxHeight:'240px', objectFit:'contain', borderRadius:'8px' }}/>}
                </div>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 8px', flexShrink:0 }}>
                  <div style={{ width:'36px', height:'36px', background:'#0A0A0A', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#F7F5F2" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div style={{ flex:1, padding:'16px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'10px', letterSpacing:'0.18em', color:'#333333', marginBottom:'10px', fontWeight:700 }}>SESUDAH</div>
                  {resultUrl&&<img src={resultUrl} alt="sesudah" style={{ width:'100%', maxHeight:'240px', objectFit:'contain', borderRadius:'8px' }}/>}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center' }}>
              <button onMouseEnter={()=>setBtnHover('dl')} onMouseLeave={()=>setBtnHover(null)} onClick={handleDownload} style={outlineBtn(btnHover==='dl')}>
                <DownloadSVG color={btnHover==='dl'?'#F7F5F2':'#0A0A0A'}/> DOWNLOAD PNG
              </button>
              <button onMouseEnter={()=>setBtnHover('new')} onMouseLeave={()=>setBtnHover(null)} onClick={()=>{ app.reset(); navigate('/') }} style={outlineBtn(btnHover==='new')}>
                <RefreshSVG color={btnHover==='new'?'#F7F5F2':'#0A0A0A'}/> PROSES BARU
              </button>
            </div>
          </>
        )}
      </div>
      <Footer/>
    </div>
  )
}

function SpinnerCircle() {
  const canvasRef = useRef()
  const rafRef    = useRef(null)
  const angleRef  = useRef(0)
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas)return
    const ctx=canvas.getContext('2d')
    const sz=64,cx=sz/2,r=26
    const draw=()=>{
      ctx.clearRect(0,0,sz,sz)
      ctx.beginPath();ctx.arc(cx,cx,r,0,Math.PI*2);ctx.strokeStyle='#E0DDD8';ctx.lineWidth=3;ctx.stroke()
      ctx.beginPath();ctx.arc(cx,cx,r,angleRef.current,angleRef.current+Math.PI*0.65)
      ctx.strokeStyle='#0A0A0A';ctx.lineWidth=3;ctx.lineCap='round';ctx.stroke()
      angleRef.current+=0.055
      rafRef.current=requestAnimationFrame(draw)
    }
    rafRef.current=requestAnimationFrame(draw)
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current)}
  },[])
  return <canvas ref={canvasRef} width={64} height={64} style={{width:'64px',height:'64px'}}/>
}

function DownloadSVG({color}){
  return(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M4 7l3 3 3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11h10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></svg>)
}

function RefreshSVG({color}){
  return(<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7a4.5 4.5 0 104.5-4.5c-1.5 0-2.8.7-3.7 1.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><path d="M3 2v3h3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
}

const outlineBtn=(hovered)=>({
  padding:'15px 32px',
  background:hovered?'#0A0A0A':'rgba(255,255,255,0.85)',
  color:hovered?'#F7F5F2':'#0A0A0A',
  fontFamily:"'Syne',sans-serif", fontSize:'12px', fontWeight:700,
  letterSpacing:'0.18em', border:'1.5px solid #0A0A0A',
  borderRadius:'6px', cursor:'pointer', transition:'all 0.25s ease',
  transform:hovered?'translateY(-2px)':'translateY(0)',
  boxShadow:hovered?'0 8px 24px rgba(0,0,0,0.12)':'none',
  display:'flex', alignItems:'center', gap:'8px',
  backdropFilter:'blur(4px)',
})