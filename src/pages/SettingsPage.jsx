import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedGridBg from '../components/AnimatedGridBg'
import { Stepper, Footer, Navbar } from './UploadPage'
import { ROTORS } from '../engine/enigma'
import { useApp } from '../context/AppContext'

const F_TITLE = "'Syne', sans-serif"
const F_MONO  = "'Space Mono', monospace"
const F_BODY  = "'Inter', 'Helvetica Neue', Arial, sans-serif"

export default function SettingsPage() {
  const navigate = useNavigate()
  const app      = useApp()

  const [selectedRotors, setSelectedRotors] = useState([null, null, null])
  const [positions,  setPositions]  = useState([0, 0, 0])
  const [posInputs,  setPosInputs]  = useState(['000','000','000'])
  const [posErrors,  setPosErrors]  = useState(['','',''])
  const [pairs,      setPairs]      = useState([['','']])
  const [pairErrors, setPairErrors] = useState([''])
  const [rotorHover, setRotorHover] = useState(null)
  const [btnHover,   setBtnHover]   = useState(null)
  const [globalError,setGlobalError]= useState('')

  const slotLabels = ['Rotor Kanan', 'Rotor Tengah', 'Rotor Kiri']
  const slotKeys   = ['R', 'M', 'L']

  const selectRotor=(slotIdx,rotorId)=>{
    const updated=[...selectedRotors]
    if(updated.some((r,i)=>r===rotorId&&i!==slotIdx))return
    updated[slotIdx]=updated[slotIdx]===rotorId?null:rotorId
    setSelectedRotors(updated)
  }

  const stepPos=(idx,dir)=>{
    const pos=[...positions];pos[idx]=(pos[idx]+dir+256)%256;setPositions(pos)
    const inp=[...posInputs];inp[idx]=String(pos[idx]).padStart(3,'0');setPosInputs(inp)
    const err=[...posErrors];err[idx]='';setPosErrors(err)
  }

  const handlePosInput=(idx,val)=>{
    const cleaned=val.replace(/[^0-9]/g,'')
    const inp=[...posInputs];inp[idx]=cleaned.slice(0,3);setPosInputs(inp)
    const num=parseInt(cleaned||'0')
    const err=[...posErrors]
    if(cleaned.length>0&&num>255){err[idx]='Melebihi batas 0–255';setPosErrors(err);return}
    err[idx]='';setPosErrors(err)
    const pos=[...positions];pos[idx]=isNaN(num)?0:num;setPositions(pos)
  }

  const handlePosBlur=(idx)=>{
    const num=parseInt(posInputs[idx]||'0')
    const safe=isNaN(num)||num<0?0:num>255?255:num
    const pos=[...positions];pos[idx]=safe;setPositions(pos)
    const inp=[...posInputs];inp[idx]=String(safe).padStart(3,'0');setPosInputs(inp)
    const err=[...posErrors];err[idx]='';setPosErrors(err)
  }

  const getAllUsed=(cp,ei)=>cp.flatMap((p,i)=>i===ei?[]:p.filter(v=>v!=='').map(Number))

  const updatePair=(i,side,val)=>{
    const cleaned=val.replace(/[^0-9]/g,'').slice(0,3)
    if(cleaned!==''&&parseInt(cleaned)>255)return
    const updated=[...pairs]
    updated[i]=side===0?[cleaned,updated[i][1]]:[updated[i][0],cleaned]
    setPairs(updated)
    const allUsed=getAllUsed(updated,i)
    const thisVals=updated[i].filter(v=>v!=='').map(Number)
    const selfDup=updated[i][0]!==''&&updated[i][1]!==''&&updated[i][0]===updated[i][1]
    const extDup=thisVals.some(v=>allUsed.includes(v))
    const errors=[...pairErrors]
    errors[i]=selfDup?'Kedua angka tidak boleh sama':extDup?'Angka sudah digunakan di pasangan lain':''
    setPairErrors(errors)
  }

  const addPair=()=>{if(pairs.length>=120)return;setPairs([...pairs,['','']]);setPairErrors([...pairErrors,''])}
  const removePair=(i)=>{
    if(pairs.length<=1){setPairs([['','']]);setPairErrors(['']);return}
    setPairs(pairs.filter((_,idx)=>idx!==i))
    setPairErrors(pairErrors.filter((_,idx)=>idx!==i))
  }

  const validate=()=>{
    if(selectedRotors.some(r=>r===null)){setGlobalError('Pilih 3 rotor terlebih dahulu.');return false}
    for(let i=0;i<pairs.length;i++){
      const[a,b]=pairs[i]
      if((a!==''&&b==='')||(a===''&&b!=='')){
        setGlobalError(`Pasangan #${i+1}: kedua angka harus diisi atau kosongkan keduanya.`);return false
      }
    }
    if(pairErrors.some(e=>e!=='')){setGlobalError('Perbaiki error pada plugboard.');return false}
    setGlobalError('')
    // Simpan settings ke context (memori)
    const validPairs=pairs.filter(p=>p[0]!==''&&p[1]!=='').map(p=>[parseInt(p[0]),parseInt(p[1])])
    app.setSettings({
      rotors:         selectedRotors,
      positions:      positions,
      plugboardPairs: validPairs,
    })
    return true
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F7F5F2', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
      <AnimatedGridBg/>
      <Navbar/>
      <Stepper current={1}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'24px 16px 16px', position:'relative', zIndex:10, maxWidth:'800px', margin:'0 auto', width:'100%', boxSizing:'border-box' }}>

        <h2 style={{ fontFamily:F_TITLE, fontSize:'clamp(18px,4vw,28px)', fontWeight:800, letterSpacing:'0.12em', color:'#0A0A0A', marginBottom:'6px', textAlign:'center', textTransform:'uppercase' }}>
          Pengaturan Enigma
        </h2>
        <p style={{ fontFamily:F_MONO, fontSize:'clamp(9px,2vw,11px)', letterSpacing:'0.12em', color:'#333333', marginBottom:'24px', textAlign:'center', fontWeight:700 }}>
          Konfigurasi rotor, posisi awal, dan plugboard
        </p>

        {/* Section 1: Pilih 3 Rotor */}
        <SectionHeader badge="01" label="Pilih 3 Rotor" sub="Pilih satu rotor untuk setiap slot — Kanan, Tengah, Kiri"/>
        <div style={{ width:'100%', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'14px' }}>
          {slotLabels.map((slotLabel,slotIdx)=>(
            <div key={slotIdx} style={{ background:'rgba(255,255,255,0.85)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:'14px', padding:'16px 14px', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', gap:'10px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                <div style={{ width:'26px', height:'26px', background:selectedRotors[slotIdx]!==null?'#0A0A0A':'rgba(0,0,0,0.08)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.2s ease' }}>
                  <span style={{ fontFamily:F_TITLE, fontSize:'11px', fontWeight:800, color:selectedRotors[slotIdx]!==null?'#F7F5F2':'#888888', lineHeight:1 }}>{slotKeys[slotIdx]}</span>
                </div>
                <div>
                  <div style={{ fontFamily:F_BODY, fontSize:'12px', fontWeight:700, color:'#0A0A0A', letterSpacing:'0.02em', lineHeight:1 }}>{slotLabel}</div>
                  <div style={{ fontFamily:F_MONO, fontSize:'9px', color:'#333333', marginTop:'3px', lineHeight:1, fontWeight:700 }}>
                    {selectedRotors[slotIdx]!==null?ROTORS.find(r=>r.id===selectedRotors[slotIdx])?.label:'Belum dipilih'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                {ROTORS.map(rotor=>{
                  const isSelected=selectedRotors[slotIdx]===rotor.id
                  const isUsed=selectedRotors.some((r,i)=>r===rotor.id&&i!==slotIdx)
                  const hKey=`${slotIdx}-${rotor.id}`
                  return (
                    <button key={rotor.id} disabled={isUsed}
                      onMouseEnter={()=>setRotorHover(hKey)} onMouseLeave={()=>setRotorHover(null)}
                      onClick={()=>selectRotor(slotIdx,rotor.id)}
                      style={{ padding:'8px 10px', background:isSelected?'#0A0A0A':isUsed?'rgba(0,0,0,0.03)':rotorHover===hKey?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.8)', color:isSelected?'#F7F5F2':isUsed?'#CCCCCC':'#0A0A0A', fontFamily:F_BODY, fontSize:'12px', fontWeight:600, border:isSelected?'1.5px solid #0A0A0A':'1.5px solid rgba(0,0,0,0.1)', borderRadius:'8px', cursor:isUsed?'not-allowed':'pointer', transition:'all 0.18s ease', textAlign:'left', width:'100%' }}
                    >{rotor.label}</button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Posisi */}
        <SectionHeader badge="02" label="Posisi Awal Rotor" sub="Posisi awal dengan nilai 0–255 untuk rotor Kanan, Tengah, dan Kiri"/>
        <div style={{ width:'100%', display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'14px' }}>
          {[{label:'Rotor Kanan',key:'i'},{label:'Rotor Tengah',key:'j'},{label:'Rotor Kiri',key:'k'}].map(({label,key},idx)=>(
            <div key={idx} style={{ background:'rgba(255,255,255,0.85)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:'14px', padding:'16px 12px', backdropFilter:'blur(6px)', display:'flex', flexDirection:'column', alignItems:'center', minWidth:0, overflow:'hidden', gap:'10px' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:F_BODY, fontSize:'12px', fontWeight:700, color:'#0A0A0A', letterSpacing:'0.02em', lineHeight:1 }}>{label}</div>
                <div style={{ fontFamily:F_MONO, fontSize:'9px', color:'#333333', marginTop:'4px', lineHeight:1, fontWeight:700 }}>Posisi Awal</div>
              </div>
              <div style={{ fontFamily:F_BODY, fontSize:'clamp(24px,4vw,36px)', fontWeight:800, color:'#0A0A0A', lineHeight:1, letterSpacing:'-0.02em' }}>{posInputs[idx]}</div>
              <div style={{ display:'flex', alignItems:'center', gap:'6px', width:'100%' }}>
                <button onMouseEnter={()=>setBtnHover(`d${idx}`)} onMouseLeave={()=>setBtnHover(null)} onClick={()=>stepPos(idx,-1)} style={{ flex:1, height:'36px', background:btnHover===`d${idx}`?'#0A0A0A':'rgba(0,0,0,0.06)', color:btnHover===`d${idx}`?'#F7F5F2':'#0A0A0A', border:'none', borderRadius:'8px', cursor:'pointer', fontFamily:F_BODY, fontSize:'18px', fontWeight:700, transition:'all 0.18s ease', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <input type="text" value={posInputs[idx]} onChange={e=>handlePosInput(idx,e.target.value)} onBlur={()=>handlePosBlur(idx)} maxLength={3}
                  style={{ flex:2, height:'36px', background:'rgba(255,255,255,0.95)', border:posErrors[idx]?'1.5px solid #CC0000':'1.5px solid rgba(0,0,0,0.12)', borderRadius:'8px', fontFamily:F_BODY, fontSize:'16px', fontWeight:700, color:'#0A0A0A', textAlign:'center', outline:'none', cursor:'text', minWidth:0 }}
                />
                <button onMouseEnter={()=>setBtnHover(`u${idx}`)} onMouseLeave={()=>setBtnHover(null)} onClick={()=>stepPos(idx,1)} style={{ flex:1, height:'36px', background:btnHover===`u${idx}`?'#0A0A0A':'rgba(0,0,0,0.06)', color:btnHover===`u${idx}`?'#F7F5F2':'#0A0A0A', border:'none', borderRadius:'8px', cursor:'pointer', fontFamily:F_BODY, fontSize:'18px', fontWeight:700, transition:'all 0.18s ease', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
              {posErrors[idx]&&<div style={{ fontFamily:F_BODY, fontSize:'10px', color:'#CC0000', fontWeight:500, textAlign:'center' }}>⚠ {posErrors[idx]}</div>}
            </div>
          ))}
        </div>

        {/* Section 3: Plugboard */}
        <SectionHeader badge="03" label="Plugboard" sub={`Maks. 120 Pasangan Plugboard · Pasangan Aktif: ${pairs.filter(p=>p[0]!==''&&p[1]!=='').length} pasangan`}/>
        <div style={{ width:'100%', background:'rgba(255,255,255,0.85)', border:'1.5px solid rgba(0,0,0,0.08)', borderRadius:'14px', padding:'20px', marginBottom:'14px', backdropFilter:'blur(6px)' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px', maxHeight:'220px', overflowY:'auto', paddingRight:'4px' }}>
            {pairs.map((pair,i)=>(
              <div key={i}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <input type="text" placeholder="0–255" value={pair[0]} onChange={e=>updatePair(i,0,e.target.value)} style={pairInput(!!pairErrors[i])}/>
                  <span style={{ fontFamily:F_MONO, fontSize:'12px', color:'#555555', flexShrink:0 }}>↔</span>
                  <input type="text" placeholder="0–255" value={pair[1]} onChange={e=>updatePair(i,1,e.target.value)} style={pairInput(!!pairErrors[i])}/>
                  <button onClick={()=>removePair(i)} style={{ width:'30px', height:'30px', border:'1px solid rgba(0,0,0,0.1)', borderRadius:'6px', background:'transparent', color:'#888888', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>×</button>
                </div>
                {pairErrors[i]&&<div style={{ fontFamily:F_BODY, fontSize:'10px', color:'#CC0000', fontWeight:500, marginTop:'3px' }}>⚠ {pairErrors[i]}</div>}
              </div>
            ))}
          </div>
          {pairs.length<120&&(
            <button onClick={addPair} style={{ marginTop:'12px', padding:'10px', background:'transparent', border:'1.5px dashed rgba(0,0,0,0.15)', borderRadius:'8px', fontFamily:F_BODY, fontSize:'12px', color:'#555555', fontWeight:500, cursor:'pointer', width:'100%', transition:'all 0.2s ease' }}>
              + Tambah Pasangan
            </button>
          )}
        </div>

        {globalError&&<div style={{ fontFamily:F_BODY, fontSize:'12px', color:'#CC0000', fontWeight:500, marginBottom:'8px', width:'100%' }}>⚠ {globalError}</div>}

        <div style={{ display:'flex', gap:'12px', marginTop:'4px', width:'100%', marginBottom:'16px', flexWrap:'wrap' }}>
          <button onMouseEnter={()=>setBtnHover('back')} onMouseLeave={()=>setBtnHover(null)} onClick={()=>navigate('/upload')} style={outlineBtn(btnHover==='back')}>← Kembali</button>
          <button onMouseEnter={()=>setBtnHover('proc')} onMouseLeave={()=>setBtnHover(null)} onClick={()=>{if(validate())navigate('/result')}} style={outlineBtn(btnHover==='proc')}>Proses Sekarang →</button>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

function SectionHeader({ badge, label, sub }) {
  return (
    <div style={{ width:'100%', marginBottom:'10px', display:'flex', alignItems:'center', gap:'10px' }}>
      <div style={{ width:'24px', height:'24px', minWidth:'24px', background:'#0A0A0A', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:'9px', fontWeight:700, color:'#F7F5F2', lineHeight:1 }}>{badge}</span>
      </div>
      <div>
        <div style={{ fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif", fontSize:'15px', fontWeight:700, color:'#0A0A0A', letterSpacing:'0.01em', lineHeight:1 }}>{label}</div>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:'10px', color:'#333333', letterSpacing:'0.08em', marginTop:'4px', lineHeight:1, fontWeight:700 }}>{sub}</div>
      </div>
    </div>
  )
}

const outlineBtn=(hovered)=>({
  flex:1, padding:'14px 20px',
  background:hovered?'#0A0A0A':'rgba(255,255,255,0.85)',
  color:hovered?'#F7F5F2':'#0A0A0A',
  fontFamily:"'Syne',sans-serif", fontSize:'12px', fontWeight:700,
  letterSpacing:'0.15em', border:'1.5px solid #0A0A0A',
  borderRadius:'6px', cursor:'pointer', transition:'all 0.25s ease',
  transform:hovered?'translateY(-2px)':'translateY(0)',
  boxShadow:hovered?'0 8px 20px rgba(0,0,0,0.1)':'none',
  backdropFilter:'blur(4px)', textTransform:'uppercase', minWidth:'140px',
})

const pairInput=(hasError)=>({
  flex:1, padding:'9px 8px', fontFamily:"'Inter',Arial,sans-serif",
  fontSize:'13px', fontWeight:600, color:'#0A0A0A',
  background:'rgba(255,255,255,0.95)',
  border:hasError?'1.5px solid #CC0000':'1.5px solid rgba(0,0,0,0.12)',
  borderRadius:'8px', outline:'none', textAlign:'center', minWidth:0,
})