'use client'
import { useState } from 'react'

const TABS = [
  {icon:'🏠',label:'Главная'},
  {icon:'🗺️',label:'Парк'},
  {icon:'🛍️',label:'Маркет'},
  {icon:'❤️',label:'Избранное'},
  {icon:'👤',label:'Профиль'}
]

const COUNTRIES = [
  {id:'russia',name:'Россия',emoji:'🇷🇺'},
  {id:'india',name:'Индия',emoji:'🇮🇳'},
  {id:'nepal',name:'Непал',emoji:'🇳🇵'},
  {id:'china',name:'Китай',emoji:'🇨🇳'},
  {id:'sea',name:'Юго-Вост. Азия',emoji:'🌴'},
  {id:'ca',name:'Центр. Азия',emoji:'🏔️'}
]

const ACTIONS = [
  {icon:'🏨',label:'Отели'},
  {icon:'🍽️',label:'Рестораны'},
  {icon:'🎨',label:'МК'},
  {icon:'🎭',label:'Квесты'}
]

export default function Home() {
  const [tab, setTab] = useState(0)
  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#0a0a0f,#000)',paddingBottom:100}}>
      <div style={{padding:'60px 20px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:13}}>Добро пожаловать</p>
          <h1 style={{fontSize:28,fontWeight:700}}>🌍 ЭтноМир</h1>
        </div>
        <div style={{width:44,height:44,borderRadius:22,background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>👤</div>
      </div>

      <div style={{margin:'0 20px 24px',borderRadius:20,height:200,background:'linear-gradient(135deg,#1a0a2e,#0d1f3c)',border:'1px solid rgba(255,255,255,0.1)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:24}}>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:12,marginBottom:4}}>Этнографический парк-музей</p>
          <h2 style={{fontSize:22,fontWeight:700,marginBottom:12}}>40 стран мира в одном месте</h2>
          <button style={{background:'#0A84FF',color:'#fff',border:'none',borderRadius:12,padding:'10px 20px',fontSize:14,fontWeight:600,cursor:'pointer',width:'fit-content'}}>Купить билет →</button>
        </div>
        <div style={{position:'absolute',top:20,right:20,fontSize:60,opacity:0.3}}>🌍</div>
      </div>

      <div style={{padding:'0 20px',marginBottom:24}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:16}}>Страны мира</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {COUNTRIES.map(c => (
            <div key={c.id} style={{borderRadius:16,padding:16,textAlign:'center',cursor:'pointer',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{fontSize:28,marginBottom:6}}>{c.emoji}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',fontWeight:500}}>{c.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'0 20px',marginBottom:24}}>
        <h3 style={{fontSize:18,fontWeight:600,marginBottom:16}}>Быстрый доступ</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
          {ACTIONS.map(a => (
            <div key={a.label} style={{borderRadius:16,padding:'14px 8px',textAlign:'center',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',cursor:'pointer'}}>
              <div style={{fontSize:24,marginBottom:6}}>{a.icon}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.6)'}}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>

      <nav style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',display:'flex',gap:4,padding:'8px 12px',borderRadius:28,zIndex:100,background:'rgba(28,28,30,0.9)',backdropFilter:'blur(40px)',WebkitBackdropFilter:'blur(40px)',border:'1px solid rgba(255,255,255,0.12)',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
        {TABS.map((t,i) => (
          <button key={i} onClick={() => setTab(i)} style={{display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 16px',borderRadius:20,border:'none',cursor:'pointer',background:tab===i?'rgba(10,132,255,0.25)':'transparent',minWidth:56}}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span style={{fontSize:9,marginTop:2,color:tab===i?'#0A84FF':'rgba(255,255,255,0.4)',fontWeight:tab===i?600:400}}>{t.label}</span>
          </button>
        ))}
      </nav>
    </main>
  )
}
