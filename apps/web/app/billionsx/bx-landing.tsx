// @ts-nocheck
'use client';
// ═══════════════════════════════════════════════════════════════════
// BillionsX Landing — FULLY SELF-CONTAINED
// Zero imports from EthnoMir. All data from props (fed by bx schema).
// Can be moved to any Next.js project with copy-paste.
// ═══════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useRef } from 'react';

type BXCase = {
  id: number; slug: string; name: string; city: string; headline: string;
  context: string; game_changer: string; products: string[];
  color: string; logo_url: string | null; images: string[];
  kpis?: {label:string;value:string;desc:string}[];
  timeline?: string; challenge?: string; solution?: string; results?: string[];
};
type BXProduct = { id: number; slug: string; name: string; tagline: string; color: string; description?: string; features?: string[]; case_count?: number; };
type BXTeamMember = { id: number; name: string; role: string; bio: string; };
type BXTestimonial = { id: number; author_name: string; author_role: string; author_company: string; quote: string; revenue_impact: string; case_id: number | null; };


// ═══ BillionsX Design System v2.1 — Apple iOS 26+ Standard ═══
const DS={blue:'#007AFF',green:'#34C759',indigo:'#5856D6',orange:'#FF9500',pink:'#FF2D55',purple:'#AF52DE',red:'#FF3B30',teal:'#5AC8FA',yellow:'#FFCC00',label:'#000',label2:'rgba(60,60,67,0.60)',label3:'rgba(60,60,67,0.30)',label4:'rgba(60,60,67,0.18)',fill:'rgba(120,120,128,0.20)',fill2:'rgba(120,120,128,0.16)',fill3:'rgba(118,118,128,0.12)',fill4:'rgba(116,116,128,0.08)',bg:'#FFFFFF',bg2:'#F2F2F7',separator:'rgba(60,60,67,0.29)',link:'#007AFF',fontDisplay:"-apple-system,'SF Pro Display',BlinkMacSystemFont,system-ui,sans-serif",fontText:"-apple-system,'SF Pro Text',BlinkMacSystemFont,system-ui,sans-serif",s:{0:0,1:4,2:8,3:12,4:16,5:20,6:24,8:32,10:40,12:48,16:64,20:80,24:96},r:{xs:6,sm:8,md:12,lg:16,xl:20,card:20,btn:14,input:12,sheet:28,tab:36,full:9999},sh:{0:'none',1:'0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)',2:'0 2px 8px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',3:'0 4px 12px rgba(0,0,0,.10),0 8px 24px rgba(0,0,0,.08)'}};
const BFD = DS.fontDisplay;
const BFT = DS.fontText;

function useInView(th = 0.1) {
  const r = useRef(null);
  const [v, s] = useState(false);
  useEffect(() => {
    const el = r.current; if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { s(true); o.disconnect(); } }, { threshold: th });
    o.observe(el); return () => o.disconnect();
  }, [th]);
  return [r, v];
}

function useSpring(active, delay) {
  const [st, setSt] = useState({ opacity: 0, y: 30 });
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    const t = setTimeout(() => { ran.current = true; setSt({ opacity: 1, y: 0 }); }, delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return st;
}
// Tilda zoomin: scale from X to 1
function useZoom(active, delay, from=0.95) {
  const [st, setSt] = useState({ opacity: 0, scale: from });
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    const t = setTimeout(() => { ran.current = true; setSt({ opacity: 1, scale: 1 }); }, delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return st;
}
// Tilda fadeinright: slide from right
function useFadeRight(active, delay, dist=25) {
  const [st, setSt] = useState({ opacity: 0, x: dist });
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    const t = setTimeout(() => { ran.current = true; setSt({ opacity: 1, x: 0 }); }, delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return st;
}

function Visual({ active, delay }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [delta, setDelta] = useState(0);
  const initRef = useRef<number|null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const raw = (vh - rect.top) / (vh + rect.height);
        const p = Math.max(0, Math.min(1, raw));
        if (initRef.current === null) initRef.current = p;
        setDelta(p - initRef.current);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // Parallax only applies DELTA from initial position → starts centered
  const d = delta;
  // Scale parallax by screen width (full values at 1440px, proportionally less on mobile)
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const k = Math.min(vw / 1440, 1);   // 0.22 on 320px, 0.67 on 960px, 1.0 on 1440px+
  const mx = d * 120 * k;
  const my = d * 80 * k;
  const sc = 1 + d * 0.25 * k;
  const offsetX = -80 * k;            // visual center offset scales too
  return (
    <div ref={containerRef} style={{width:"100%",maxWidth:960,marginTop:DS.s[12],position:"relative"}}>
      <div style={{width:"100%",background:"linear-gradient(135deg, #FFD700 0%, #FF8C00 25%, #FF4500 50%, #FF1493 75%, #C71585 100%)",aspectRatio:"16/9",borderRadius:20}}/>
      <img src="https://static.tildacdn.com/tild6633-6561-4636-b361-316432393130/billions-x-pack-moto.png" alt="BillionsX" style={{position:"absolute",top:"50%",left:"50%",width:"103.5%",height:"auto",objectFit:"contain",filter:"drop-shadow(0 20px 40px rgba(0,0,0,.25))",transform:`translate(calc(-50% + ${offsetX}px), -50%) translateX(${mx}px) translateY(${my}px) scale(${sc})`,transformOrigin:"center center",willChange:"transform"}} />
    </div>
  );
}

function AnimNum({to,prefix="",suffix="",dur=1800,go}) {
  const [v,setV]=useState(0);
  const ran=useRef(false);
  useEffect(()=>{
    if(!go||ran.current)return;ran.current=true;
    const t0=performance.now();
    const tick=n=>{const p=Math.min((n-t0)/dur,1);setV(Math.round(to*(1-Math.pow(2,-10*p))));if(p<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  },[go,to,dur]);
  return <>{prefix}{v.toLocaleString("en-US")}{suffix}</>;
}

function NumbersBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"48px clamp(24px,6vw,48px) 48px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[6]}}>
        <div style={{fontFamily:BFT,fontSize:12,fontWeight:600,letterSpacing:"0.01em",textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[2],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Масштаб</div>
        <div style={{fontFamily:BFD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:DS.label,letterSpacing:"-0.04em",lineHeight:1,opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.85)",transition:"opacity .6s ease .4s, transform .8s cubic-bezier(.2,.8,.2,1) .4s"}}><AnimNum to={80} prefix="$" suffix="B+" go={vis} dur={2000}/></div>
        <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label3,lineHeight:"18px",marginTop:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .7s"}}>Совокупная капитализация клиентов Billions X</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3],textAlign:"center",marginBottom:DS.s[6]}}>
        {[{n:1,p:"$",s:"B+",l:"Продано недвижимости клиентам"},{n:100,s:"+",l:"Стран, где работают клиенты"},{n:300,s:"+",l:"Проектов"},{n:15,s:"+",l:"Лет на рынке"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"16px 12px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.92)",transition:`opacity .5s ease ${.8+i*.15}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.8+i*.15}s`}}>
            <div style={{fontFamily:BFD,fontSize:"clamp(26px,5.5vw,34px)",fontWeight:700,color:DS.label,letterSpacing:"-0.02em",lineHeight:1.1}}><AnimNum to={m.n} prefix={m.p||""} suffix={m.s||""} go={vis} dur={1500}/></div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label3,lineHeight:"16px",marginTop:DS.s[1]}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:DS.s[3],textAlign:"center"}}>
        {[{v:"x50-120",l:"Возврат на $1 в девелопменте"},{v:"x20",l:"Рост ORBI Group за 1.5 года"},{v:"160M+",l:"Охват в СМИ в одном кейсе"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"16px 12px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.92)",transition:`opacity .5s ease ${1.4+i*.12}s, transform .7s cubic-bezier(.2,.8,.2,1) ${1.4+i*.12}s`}}>
            <div style={{fontFamily:BFD,fontSize:20,fontWeight:600,color:DS.label,letterSpacing:0.38,lineHeight:"25px"}}>{m.v}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,lineHeight:"13px",marginTop:DS.s[1]}}>{m.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const RESULTS = [
  {metric:"ROI недвижимость",val:"x50-120",ctx:"Продажи недвижимости клиентов на $1B+ при бюджетах кратно ниже отраслевых"},
  {metric:"ROI продукты",val:"x20-60",ctx:"Медиа-охват 160M+, победа на CES, ТОП-5 Amazon — при бюджетах уровня xLaunch"},
  {metric:"ROI корпорации",val:"Системный",ctx:"Методологии xSales внедрены в компаниях с $43B и $34.2B капитализации"},
  {metric:"Рост клиента",val:"x20",ctx:"ORBI Group за 1.5 года: от локальной компании до 55 офисов в 19 странах"},
  {metric:"Выход в лидеры",val:"1 год",ctx:"PARQ Development → №1 застройщик Бали"},
  {metric:"Медиа-охват",val:"160M+",ctx:"Breathe Helper: Fox, CBS, ABC, Mashable, Insider"},
  {metric:"Крупные блогеры",val:"11.5M+",ctx:"Гарик Харламов (9M+), Владимир Древс (1.5M+), Артём Бриус (1M+)"},
  {metric:"Спроектировано",val:"~1,000",ctx:"Metaverse Bank — полный продакт-менеджмент экранов приложения"},
];

function ResultsBlock() {
  const scrollRef=useRef(null);
  const [active,setActive]=useState(0);
  const [ref,vis]=useInView(0.15);
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const fn=()=>{const cw=el.firstChild?el.firstChild.offsetWidth+12:280;setActive(Math.min(Math.round(el.scrollLeft/cw),RESULTS.length-1));};
    el.addEventListener("scroll",fn,{passive:true});
    return ()=>el.removeEventListener("scroll",fn);
  },[]);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",maxWidth:960,margin:"0 auto",padding:"80px 0 80px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:DS.s[6],textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Что мы сделали</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Это не сгенерирует AI.</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Большая тройка использует «правило ×10» при обосновании стоимости проектов и ROI маркетинговых инвестиций. Результаты Billions X превышают эти показатели:</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {RESULTS.map((r,i)=>(
          <div key={i} style={{flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:DS.s[5],display:"flex",flexDirection:"column",willChange:"transform,opacity",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,letterSpacing:.5,lineHeight:"14px",marginBottom:8}}>{r.metric}</div>
            <div style={{fontFamily:BFD,fontSize:32,fontWeight:700,color:DS.label,letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:10}}>{r.val}</div>
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"17px",letterSpacing:-0.1}}>{r.ctx}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:DS.s[2],marginTop:20}}>
        {RESULTS.map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
      </div>
    </div>
  );
}

function AwardsBlock() {
  const [ref,vis]=useInView(0.15);
  const aw=[
    {n:"FIABCI Prix d'Excellence",d:"«Оскар» мировой недвижимости.\nЖюри из 40 стран.",cl:"ORBI Group"},
    {n:"CES Innovation Winner",d:"Крупнейшая выставка\nэлектроники мира. ТОП-5 Amazon.",cl:"Bite Helper"},
    {n:"Google Exclusive Partner",d:"Единственный эксклюзивный\nпартнёр Google Maps в мире.",cl:"MaxboxVR"},
    {n:"Forbes Mercury Awards",d:"Шорт-лист Forbes Woman\nMercury Awards.",cl:"Аквакласс"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,background:DS.bg,padding:"clamp(64px,12vw,120px) clamp(24px,6vw,48px)",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,background:"radial-gradient(circle,rgba(200,175,100,.06) 0%,transparent 60%)",pointerEvents:"none"}}/>
      <div style={{maxWidth:560,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .7s ease .1s"}}>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"rgba(180,155,80,.50)",marginBottom:20}}>Признание</div>
          <h2 style={{fontFamily:BFD,fontSize:"clamp(32px,7vw,44px)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:1.05,color:DS.label,margin:0}}>Признано лучшими</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {aw.map((a,i)=>(
            <div key={i} style={{background:DS.fill4,borderRadius:DS.r.sheet,padding:"40px 24px 36px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",minHeight:260,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",transition:`all .7s cubic-bezier(.2,.8,.2,1) ${.25+i*.1}s`}}>
              <img src="https://static.tildacdn.net/tild6432-6165-4331-a237-353863663131/billionsx-award.svg" alt="" style={{width:72,height:72,opacity:.3,filter:"sepia(.6) brightness(.6)",marginBottom:DS.s[6]}}/>
              <div style={{fontFamily:BFD,fontSize:18,fontWeight:700,color:DS.label,letterSpacing:"-0.015em",lineHeight:1.25,marginBottom:14}}>{a.n}</div>
              <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label3,lineHeight:1.5,whiteSpace:"pre-line",flex:1}}>{a.d}</div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:600,color:"rgba(180,155,80,.55)",letterSpacing:".04em",marginTop:20}}>{a.cl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── CASE SLIDER (auto-rotating images) ──────────────────────────
function CaseSlider({imgs,cl,logo,loc,name}:{imgs?:string[],cl:string,logo?:string,loc:string,name:string}) {
  const [idx,setIdx]=useState(0);
  const len=imgs?.length||0;
  useEffect(()=>{if(len<2)return;const t=setInterval(()=>setIdx(p=>(p+1)%len),3500);return()=>clearInterval(t);},[len]);
  return (
    <div style={{height:180,position:"relative",overflow:"hidden",background:`linear-gradient(135deg, ${cl}, ${cl}dd)`}}>
      {imgs&&imgs.map((src,i)=><img key={src} src={src} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===idx?.88:0,transition:"opacity .8s ease",willChange:"opacity"}} />)}
      <div style={{position:"absolute",inset:0,background:len?"linear-gradient(180deg, rgba(0,0,0,.15) 0%, transparent 40%, rgba(0,0,0,.55) 100%)":"linear-gradient(180deg, transparent 50%, rgba(0,0,0,.45) 100%)",pointerEvents:"none"}} />
      {logo&&<div style={{position:"absolute",top:12,right:12,zIndex:2,width:32,height:32,borderRadius:DS.r.sm,background:DS.fill3,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:DS.s[1],border:".5px solid rgba(255,255,255,.25)"}}><img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"contain",filter:"brightness(0) invert(1)",opacity:.9}} /></div>}
      <div style={{position:"absolute",top:12,left:16,zIndex:1}}><span style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.bg,background:DS.fill3,backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:DS.r.xs,padding:"3px 8px",letterSpacing:.3}}>{loc}</span></div>
      <div style={{position:"absolute",bottom:12,left:16,right:52,zIndex:1}}><div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:DS.bg,letterSpacing:-0.5,lineHeight:"28px",textShadow:"0 1px 4px rgba(0,0,0,.3)"}}>{name}</div></div>
      {len>1&&<div style={{position:"absolute",bottom:14,right:16,zIndex:2,display:"flex",gap:4}}>{imgs!.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:2,background:i===idx?"#fff":"rgba(255,255,255,.4)",transition:"background .3s"}} />)}</div>}
    </div>
  );
}

// ─── CASES BLOCK (reads from props) ──────────────────────────────
function CasesBlock({ cases, onCaseClick }: { cases: BXCase[]; onCaseClick?: (c: BXCase) => void }) {
  const [ref,vis]=useInView();
  const scrollRef=useRef<HTMLDivElement>(null);
  const [filter,setFilter]=useState("all");
  // Get unique products across all cases
  const allProducts = Array.from(new Set(cases.flatMap(c=>c.products||[])));
  const tabOrder = ["xProduction","xVision","xSales","xPerformance","xBrand","xAI"];
  allProducts.sort((a,b)=>{const ai=tabOrder.indexOf(a),bi=tabOrder.indexOf(b);return (ai===-1?99:ai)-(bi===-1?99:bi);});
  const filtered = filter==="all" ? cases : cases.filter(c=>(c.products||[]).includes(filter));
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px 0 80px",overflow:"hidden"}}>
      <div style={{paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",marginBottom:20,textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Избранные проекты</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Кейсы, которые говорят за нас</h2>
        {/* Product filter */}
        <div style={{display:"flex",gap:DS.s[2],overflowX:"auto",scrollbarWidth:"none",paddingBottom:4,justifyContent:"center"}}>
          <div onClick={()=>setFilter("all")} style={{fontFamily:BFT,fontSize:12,fontWeight:filter==="all"?600:400,color:filter==="all"?"#fff":"rgba(0,0,0,.45)",background:filter==="all"?"#000":"rgba(0,0,0,.04)",borderRadius:DS.r.md,padding:"7px 14px",cursor:"pointer",flexShrink:0,transition:"all .2s",border:filter==="all"?"none":".5px solid rgba(0,0,0,.06)"}}>Все</div>
          {allProducts.map(p=>{
            return(
              <div key={p} onClick={()=>setFilter(filter===p?"all":p)} style={{fontFamily:BFT,fontSize:12,fontWeight:filter===p?600:400,color:filter===p?"#fff":"rgba(0,0,0,.45)",background:filter===p?"#007AFF":"rgba(0,0,0,.04)",borderRadius:DS.r.md,padding:"7px 14px",cursor:"pointer",flexShrink:0,transition:"all .2s",border:filter===p?"none":".5px solid rgba(0,0,0,.06)"}}>{p}</div>
            );
          })}
        </div>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {filtered.map((s,i)=>(
          <div key={s.id} onClick={()=>onCaseClick?.(s)} style={{flex:"0 0 clamp(280px,75vw,400px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",display:"flex",flexDirection:"column",cursor:"pointer",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.3+i*.04}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.3+i*.04}s`}}>
            <CaseSlider imgs={s.images} cl={s.color} logo={s.logo_url||undefined} loc={s.city} name={s.name} />
            <div style={{padding:"14px 20px 0"}}><div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:DS.label,letterSpacing:-0.3,lineHeight:"19px"}}>{s.headline}</div></div>
            <div style={{padding:"12px 20px",flex:1,display:"flex",flexDirection:"column",gap:DS.s[3]}}>
              <div><div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,marginBottom:3}}>Контекст</div><div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"17px"}}>{s.context}</div></div>
              <div><div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,marginBottom:3}}>Game Changer</div><div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"17px"}}>{s.game_changer}</div></div>
              <div style={{marginTop:"auto",display:"flex",flexWrap:"wrap",gap:DS.s[2]}}>{(s.products||[]).map((b,bi)=>(<span key={bi} style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.red,background:DS.fill4,border:`1px solid ${DS.red}1F`,borderRadius:DS.r.full,padding:"3px 10px"}}>{b}</span>))}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CATS=[
  {l:"Технологии",b:"Google · Microsoft · IBM · Oracle · Sony · PayPal · Snapchat"},
  {l:"Автомобили",b:"BMW · Mercedes-Benz · Audi · Jaguar · Land Rover · Nissan · Peugeot"},
  {l:"Аэрокосмос",b:"NASA · US Air Force"},
  {l:"Финансы",b:"Visa · Mastercard · JP Morgan · Deloitte · PwC · Accenture"},
  {l:"FMCG",b:"Nike · Adidas · Puma · Coca-Cola · Nestlé · P&G · Henkel · Cadbury"},
  {l:"Люкс",b:"Hugo Boss · Tommy Hilfiger · Bombay Sapphire"},
  {l:"Медиа",b:"Disney · BBC · Universal · Discovery · NBC · ITV · The Guardian"},
  {l:"Авиа",b:"American Airlines · British Airways · Hawaiian Airlines"},
  {l:"Фарма",b:"Pfizer · Bayer · Johnson & Johnson"},
  {l:"Энергетика",b:"ExxonMobil · General Electric · Siemens · Goodyear"},
  {l:"Отели",b:"Hilton · Radisson · Marriott · Hyatt"},
  {l:"Ритейл",b:"Walmart · Target · McDonald's · Krispy Kreme"},
  {l:"Телеком",b:"Vodafone · O2"},
  {l:"НКО",b:"WWF · British Council"},
];
function BrandsBlock() {
  const [ref,vis]=useInView();
  const T='https://static.tildacdn.net/';
  const logos=[
    T+'tild3036-3734-4566-b161-316136326262/google-1-1.svg',
    T+'tild6133-3264-4833-b836-353230626635/microsoft.svg',
    T+'tild6331-3966-4235-a639-386634343662/nasa-3.svg',
    T+'tild3637-3432-4131-b636-613035353932/virgin.svg',
    T+'tild6365-6364-4466-b266-646632306432/bbc-2.svg',
    T+'tild3630-6332-4463-a462-623335633931/snapchat-1.svg',
    T+'tild6139-3333-4462-b638-643134393835/johnson-johnson.svg',
    T+'tild6136-6532-4838-b531-313732343866/adidas-9.svg',
    T+'tild3437-6565-4336-a135-646133633838/rolls-royce-por-hern.svg',
    T+'tild6431-6236-4537-a337-363334306134/hugo-boss-logo.svg',
    T+'tild3138-6139-4438-a239-356533326264/lego-2.svg',
    T+'tild3531-6261-4239-a634-316532383639/mastercard-2.svg',
    T+'tild3735-3137-4265-a661-366136313265/universal-3.svg',
    T+'tild3162-3562-4136-b437-633333386434/mercedes-benz-4.svg',
    T+'tild3437-6134-4461-a532-313266353239/jp-morgan.svg',
    T+'tild3166-3336-4561-a339-306263386662/accenture-2.svg',
    T+'tild3265-6266-4661-b230-316435363464/wwf.svg',
    T+'tild3265-3465-4530-b430-343831333764/walmart.svg',
    T+'tild3830-3034-4964-a332-353065373566/american-airlines.svg',
    T+'tild3832-3263-4664-a466-366338666436/audi-11.svg',
    T+'tild3464-3039-4639-a562-386563396262/visa.svg',
    T+'tild6439-6434-4266-b764-323530343464/bmw.svg',
    T+'tild3966-3935-4734-b836-663833633034/disney.svg',
    T+'tild3432-6165-4764-b035-366166646330/puma-logo.svg',
    T+'tild3230-6537-4737-b631-393939656132/procter-gamble-1.svg',
    T+'tild3034-3365-4239-b135-313333633037/general-electric.svg',
    T+'tild6666-3264-4139-b861-663865623839/pfizer-1.svg',
    T+'tild3435-6164-4330-a465-396331313630/hilton-2.svg',
    T+'tild6135-6361-4866-b137-613131623131/ibm.svg',
    T+'tild3339-3762-4162-a332-646332323361/sony-2.svg',
    T+'tild3539-3162-4338-a438-623062613561/deloitte-2.svg',
    T+'tild3865-3936-4538-b736-353232633737/pwc.svg',
    T+'tild3331-3539-4035-a533-623061316632/bayer-5.svg',
    T+'tild3261-6332-4433-b262-613964336265/oracle-2.svg',
    T+'tild3835-6230-4336-a131-373562633536/siemens-3.svg',
    T+'tild3262-3363-4132-b162-393461656331/vodafone-8.svg',
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{display:"flex",justifyContent:"center",gap:DS.s[4],marginBottom:20,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>
          <img src={T+"tild3733-3933-4430-b664-343465353562/forbes.svg"} alt="Forbes" style={{height:18,opacity:.4}}/>
          <img src={T+"tild3764-6661-4136-b465-323638613235/fortune.svg"} alt="Fortune" style={{height:18,opacity:.4}}/>
        </div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(34px,8vw,44px)",fontWeight:700,letterSpacing:"-0.025em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Клиенты наших клиентов</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Бренды из Forbes и Fortune 500. Присоединяйтесь.</p>
      </div>
      {/* Infinite marquee — Apple-style */}
      <style>{'@keyframes bxMarquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}'}</style>
      <div style={{overflow:"hidden",maskImage:"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",opacity:vis?1:0,transition:"opacity .8s ease .4s"}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.s[10],animation:"bxMarquee 40s linear infinite",width:"max-content"}}>
          {[...logos,...logos].map((src,i)=>(
            <img key={i} src={src} alt="" loading="lazy" style={{height:20,opacity:.22,filter:"grayscale(1)",flexShrink:0}}/>
          ))}
        </div>
      </div>
      <div style={{overflow:"hidden",maskImage:"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",WebkitMaskImage:"linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)",opacity:vis?1:0,transition:"opacity .8s ease .6s",marginTop:20}}>
        <div style={{display:"flex",alignItems:"center",gap:DS.s[10],animation:"bxMarquee 50s linear infinite reverse",width:"max-content"}}>
          {[...logos.slice(18),...logos.slice(0,18),...logos.slice(18),...logos.slice(0,18)].map((src,i)=>(
            <img key={i} src={src} alt="" loading="lazy" style={{height:20,opacity:.22,filter:"grayscale(1)",flexShrink:0}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

const INDUSTRIES=["Недвижимость","Гостиничный бизнес","Промышленная автоматизация","Тяжёлое машиностроение","Транспорт и логистика","Государственный брендинг","VR/AR","Потребительская электроника","Медицина и MedTech","Финтех","Развлечения","Образование и EdTech","Мероприятия и MICE","Издательство и медиа","Детское развитие","Персональный брендинг","Инвестиции и венчур","AI и разработка","Туризм","Строительство","Автомобили","Аэрокосмос","Фармацевтика","FMCG","Люкс и мода","Авиация","Ритейл","Энергетика","Телеком","Финансы","Еда и напитки","Спорт","Медиа","Профессиональные услуги","НКО"];

function IndustriesBlock() {
  const [ref,vis]=useInView(0.1);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>35+ индустрий</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Каждая индустрия — свой язык</h2>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:DS.s[2],justifyContent:"center"}}>
        {INDUSTRIES.map((t,i)=>(
          <span key={i} style={{display:"inline-block",padding:"6px 14px",borderRadius:DS.r.full,fontFamily:BFT,fontSize:12,fontWeight:600,lineHeight:"15px",letterSpacing:-0.1,background:DS.label,border:"none",color:DS.bg,opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.8)",transition:`opacity .4s ease ${.35+i*.025}s, transform .5s cubic-bezier(.2,.8,.2,1) ${.35+i*.025}s`}}>{t}</span>
        ))}
      </div>
    </div>
  );
}

const SYSTEMS=[
  {x:"xVision",t:"Стратегическое видение",d:"Прежде чем строить — нужно видеть всю карту. Анализ рынка, конкурентной среды и аудитории, собранный в единую книгу стратегии.",c:"Аналитика → Стратегия бренда → Продуктовая сила → Генетический бренд-инжиниринг → Стратегия продвижения → Дорожная карта → Книга стратегии",ai:"Анализ больших массивов рыночных данных",aig:"Полнота картины, недоступная при ручном анализе"},
  {x:"xGenetics",t:"ДНК бренда",d:"У каждого бренда есть ДНК — набор свойств, которые определяют его судьбу. Мы находим суперсилу и встраиваем недостающие гены.",c:"Genetic Brand Engineering — 5 генов: Agile Gene, Profit Gene, Hit Gene, Global Gene, Champion Gene",ai:"Моделирование сценариев позиционирования",aig:"Тестирование гипотез до выхода на рынок"},
  {x:"xNeural",t:"Смыслы продукта",d:"В каждом продукте скрыты смыслы, за которые клиенты готовы платить кратно больше. Мы их находим и собираем в продукт, который продаёт сам себя.",c:"Neural Brand Chain — поиск «молекул» ценности и сборка зажигающего продукта",ai:"Семантический анализ отзывов и поведения аудитории",aig:"Выявление скрытых паттернов в данных"},
  {x:"xProduction",t:"Упаковка мирового класса",d:"Сайты, супер-приложения, бренды, визуалы — каждый пиксель на уровне Apple.",c:"Сайты xBrilliance · приложения xApp · фирменный стиль xBrand",ai:"Генерация визуальных концепций и прототипов",aig:"Ускорение итераций дизайна"},
  {x:"xPerformance",t:"Двигатель роста",d:"Продукт упакован — теперь мир должен о нём узнать. Рекламные кампании, SEO, цифровой PR, управление репутацией.",c:"Подтверждённый охват: 160,000,000+ человек — Fox, CBS, ABC, Mashable",ai:"Оптимизация рекламы и предиктивная аналитика",aig:"Точность таргетинга"},
  {x:"xSales",t:"Архитектура продаж",d:"Лучший маркетинг бесполезен, если продажи не закрывают. Системы управления продажами, единые книги методологии.",c:"Sales xBook · обучение и сертификация · ABB ($43B), Eaton ($34.2B), Укрбуд, ГК Пионер",ai:"Анализ переговоров и персонализация скриптов",aig:"Система, которая учится на каждой сделке"},
  {x:"xAI",t:"AI и разработка",d:"В 2026 году рост без технологии невозможен. Полный цикл AI-разработки: от архитектуры до запуска.",c:"Архитектура · дизайн-система · бэкенд · CRM · AI-функции · запуск в продакшн",ai:"Полный цикл AI-разработки приложений и платформ",aig:"Готовые цифровые продукты"},
];

function SystemsBlock() {
  const [ref,vis]=useInView(0.05);
  const [open,setOpen]=useState(-1);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Методология</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Семь систем, один результат</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
        {SYSTEMS.map((s,i)=>{
          const isOpen=open===i;
          return (
            <div key={i} onClick={()=>setOpen(isOpen?-1:i)} style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.lg,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"16px 20px",cursor:"pointer",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`opacity .5s ease ${.35+i*.1}s, transform .6s cubic-bezier(.2,.8,.2,1) ${.35+i*.1}s`}}>
              
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:DS.s[3]}}>
                  <span style={{fontFamily:BFD,fontSize:22,fontWeight:700,color:"rgba(60,60,67,.18)",lineHeight:1}}>{i+1}</span>
                  <div>
                    <div style={{fontFamily:BFD,fontSize:17,fontWeight:600,color:DS.label,letterSpacing:-0.43,lineHeight:"22px"}}>{s.x}</div>
                    <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,letterSpacing:-0.23,lineHeight:"20px",marginTop:2}}>{s.t}</div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform .3s cubic-bezier(.2,.8,.2,1)"}}><path d="M4 6l4 4 4-4" fill="none" stroke="rgba(60,60,67,.30)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{maxHeight:isOpen?360:0,opacity:isOpen?1:0,overflow:"hidden",transition:"max-height .4s cubic-bezier(.2,.8,.2,1), opacity .3s ease"}}>
                <div style={{paddingTop:12,borderTop:".5px solid rgba(0,0,0,.06)",marginTop:12}}>
                  <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,letterSpacing:-0.23,lineHeight:"20px",marginBottom:8}}>{s.d}</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,letterSpacing:-0.08,lineHeight:"18px"}}>{s.c}</div>
                  <div style={{height:".5px",background:DS.fill4,margin:"10px 0"}}/>
                  <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,color:DS.label4,marginBottom:4}}>Внедрение xAI</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"17px"}}>{s.ai}</div>
                  <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label3,lineHeight:"16px",marginTop:2}}>{s.aig}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────
function Counter({to,suffix="",dur=1600}:{to:number;suffix?:string;dur?:number}){
  const [v,setV]=useState(0);const ref=useRef(false);
  useEffect(()=>{if(ref.current)return;ref.current=true;const t0=performance.now();
    const tick=(n)=>{const p=Math.min((n-t0)/dur,1);setV(Math.round(to*(1-Math.pow(2,-10*p))));if(p<1)requestAnimationFrame(tick);else setV(to);};
    requestAnimationFrame(tick);},[to,dur]);
  return <>{v.toLocaleString("en-US")}{suffix}</>;
}

// ─── MINI SPARKLINE SVG ──────────────────────────────────────────
function Sparkline({color,seed=0}:{color:string;seed?:number}){
  const pts=Array.from({length:12},(_,i)=>{const r=Math.sin(seed*7+i*0.8)*0.3+0.5+Math.sin(i*1.2+seed*3)*0.2;return Math.max(0.1,Math.min(1,r+(i/12)*0.4));});
  const w=80,h=28,px=pts.map((p,i)=>`${(i/(pts.length-1))*w},${h-p*h}`).join(' ');
  return(<svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{opacity:.5}}>
    <defs><linearGradient id={`sg${seed}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,${h} ${px} ${w},${h}`} fill={`url(#sg${seed})`}/>
    <polyline points={px} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
}

// ─── CASE MODAL (Big 5 Standard) ─────────────────────────────────
function CaseModal({ c, testimonial, onClose }: { c: BXCase; testimonial?: BXTestimonial; onClose: () => void }) {
  const [imgIdx,setImgIdx]=useState(0);
  const [entered,setEntered]=useState(false);
  const [galleryOpen,setGalleryOpen]=useState(-1);
  const imgs=c.images||[];
  const kpis:any[]=Array.isArray(c.kpis)?c.kpis:[];
  const cl=c.color||'#007AFF';
  useEffect(()=>{if(imgs.length<2)return;const t=setInterval(()=>setImgIdx(p=>(p+1)%imgs.length),5000);return()=>clearInterval(t);},[imgs.length]);
  useEffect(()=>{document.body.style.overflow='hidden';requestAnimationFrame(()=>setTimeout(()=>setEntered(true),30));return()=>{document.body.style.overflow=''};},[]);

  // Parse numeric value from KPI for counter animation
  const parseNum=(v:string)=>{const m=v.replace(/[^0-9.]/g,'');return m?parseFloat(m):0;};
  const numSuffix=(v:string)=>{const n=v.replace(/[0-9.,\s]/g,'');return n||'';};

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.75)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <style>{`
        @keyframes kbZoom{0%{transform:scale(1) translate(0,0)}100%{transform:scale(1.12) translate(-2%,-1.5%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{opacity:.4}50%{opacity:.8}}
        .cm-section{opacity:0;animation:fadeUp .6s ease forwards}
        .cm-section:nth-child(2){animation-delay:.15s}
        .cm-section:nth-child(3){animation-delay:.25s}
        .cm-section:nth-child(4){animation-delay:.35s}
        .cm-section:nth-child(5){animation-delay:.45s}
        .cm-section:nth-child(6){animation-delay:.55s}
      `}</style>

      {/* Fullscreen gallery overlay */}
      {galleryOpen>=0&&(
        <div onClick={()=>setGalleryOpen(-1)} style={{position:"fixed",inset:0,zIndex:10001,background:DS.label,display:"flex",alignItems:"center",justifyContent:"center",padding:DS.s[5]}}>
          <img src={imgs[galleryOpen]} alt="" style={{maxWidth:"100%",maxHeight:"90vh",objectFit:"contain",borderRadius:DS.r.sm}}/>
          <div style={{position:"absolute",top:20,right:20,color:DS.bg,fontSize:13,fontFamily:BFT,opacity:.6}}>{galleryOpen+1} / {imgs.length}</div>
        </div>
      )}

      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:480,maxHeight:"95dvh",background:DS.label,borderRadius:"32px 32px 0 0",overflow:"hidden",
        display:"flex",flexDirection:"column",
        transform:entered?"translateY(0)":"translateY(100%)",opacity:entered?1:0,
        transition:"transform .5s cubic-bezier(.16,1,.3,1), opacity .25s ease",
        boxShadow:"0 -4px 60px rgba(0,0,0,.5), 0 0 0 .5px rgba(255,255,255,.08) inset",
      }}>
        {/* ── CINEMATIC HERO ── */}
        <div style={{position:"relative",height:300,overflow:"hidden",flexShrink:0}}>
          {imgs.map((src,i)=><img key={i} src={src} alt="" loading="lazy" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:i===imgIdx?1:0,transition:"opacity 1.5s ease",animation:i===imgIdx?"kbZoom 14s ease-in-out infinite alternate":"none"}}/>)}
          {/* Triple gradient overlay */}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, rgba(10,10,10,.3) 0%, transparent 35%, ${cl}22 65%, #0A0A0A 100%)`}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(10,10,10,.4) 0%, transparent 50%, rgba(10,10,10,.9) 100%)"}}/>
          {/* Ambient glow */}
          <div style={{position:"absolute",bottom:-40,left:"30%",width:"40%",height:80,background:cl,borderRadius:"50%",filter:"blur(60px)",opacity:.2,animation:"pulseGlow 4s ease-in-out infinite"}}/>

          {/* Close + Handle */}
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:36,height:4,borderRadius:2,background:DS.fill3}}/>
          <div onClick={onClose} style={{position:"absolute",top:16,right:20,width:36,height:36,borderRadius:DS.r.lg,background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:5}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          {/* Logo */}
          {c.logo_url&&<div style={{position:"absolute",top:18,left:24,height:24,opacity:.85,zIndex:2}}><img src={c.logo_url} alt="" style={{height:"100%",objectFit:"contain",filter:"brightness(0) invert(1)"}}/></div>}
          {/* Title area */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 24px",zIndex:2}}>
            <div style={{display:"flex",alignItems:"center",gap:DS.s[2],marginBottom:10}}>
              <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",background:DS.fill3,borderRadius:DS.r.xs,padding:"4px 10px",backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.1)"}}>{c.city}</span>
              {c.timeline&&<span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:cl,background:`${cl}15`,borderRadius:DS.r.xs,padding:"4px 10px",border:`1px solid ${cl}20`}}>{c.timeline}</span>}
            </div>
            <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,color:DS.bg,letterSpacing:"-0.03em",lineHeight:1,margin:0}}>{c.name}</h2>
            <p style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:1.4,marginTop:8,maxWidth:"90%"}}>{c.headline}</p>
          </div>
          {/* Image counter */}
          {imgs.length>1&&<div style={{position:"absolute",bottom:12,right:24,display:"flex",gap:DS.s[1],zIndex:3}}>{imgs.map((_,i)=><div key={i} style={{width:i===imgIdx?20:6,height:6,borderRadius:2,background:i===imgIdx?"#fff":"rgba(255,255,255,.2)",transition:"all .5s cubic-bezier(.2,.8,.2,1)"}}/>)}</div>}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>

          {/* KPI DASHBOARD with sparklines */}
          {kpis.length>0&&(
            <div className="cm-section" style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(kpis.length,3)},1fr)`,gap:1,background:DS.fill4}}>
              {kpis.map((k,i)=>{
                const num=parseNum(k.value);const suf=numSuffix(k.value);
                return(
                  <div key={i} style={{background:DS.label,padding:"20px 14px 16px",position:"relative",overflow:"hidden"}}>
                    {/* Sparkline background */}
                    <div style={{position:"absolute",bottom:0,right:0,opacity:.6}}><Sparkline color={cl} seed={i+c.id}/></div>
                    {/* Accent line */}
                    <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:2,borderRadius:1,background:`linear-gradient(90deg,transparent,${cl},transparent)`,opacity:.35}}/>
                    <div style={{fontFamily:BFD,fontSize:28,fontWeight:700,color:DS.bg,letterSpacing:"-0.03em",lineHeight:1,position:"relative",zIndex:1}}>
                      {num>0&&num<10000?<Counter to={num} suffix={suf}/>:k.value}
                    </div>
                    <div style={{fontFamily:BFT,fontSize:11,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:cl,marginTop:6,position:"relative",zIndex:1}}>{k.label}</div>
                    <div style={{fontFamily:BFT,fontSize:11,color:"rgba(235,235,245,.30)",marginTop:2,position:"relative",zIndex:1}}>{k.desc}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PRODUCTS DEPLOYED */}
          {(c.products||[]).length>0&&(
            <div className="cm-section" style={{padding:"20px 24px 0"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:DS.s[2]}}>
                {c.products.map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:DS.s[2],background:`${cl}10`,border:`1px solid ${cl}18`,borderRadius:DS.r.md,padding:"6px 14px"}}>
                    <div style={{width:6,height:6,borderRadius:2,background:cl}}/>
                    <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".02em",color:cl}}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHALLENGE → SOLUTION */}
          <div className="cm-section" style={{padding:"24px 24px 0"}}>
            {[
              {label:"Задача",text:c.challenge||c.context,icon:"◆"},
              {label:"Решение",text:c.solution||c.game_changer,icon:"◈"},
            ].filter(s=>s.text).map((s,i)=>(
              <div key={i} style={{marginBottom:22}}>
                <div style={{display:"flex",alignItems:"center",gap:DS.s[2],marginBottom:8}}>
                  <span style={{color:cl,fontSize:11}}>{s.icon}</span>
                  <span style={{fontFamily:BFT,fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:cl}}>{s.label}</span>
                  <div style={{flex:1,height:".5px",background:`linear-gradient(90deg,${cl}30,transparent)`}}/>
                </div>
                <p style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:1.6,margin:0}}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* RESULTS with animated bars */}
          {c.results&&c.results.length>0&&(
            <div className="cm-section" style={{padding:"0 24px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:DS.s[2],marginBottom:14}}>
                <span style={{color:cl,fontSize:11}}>◉</span>
                <span style={{fontFamily:BFT,fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:cl}}>Результаты</span>
                <div style={{flex:1,height:".5px",background:`linear-gradient(90deg,${cl}30,transparent)`}}/>
              </div>
              {c.results.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:DS.s[3],marginBottom:8,padding:"14px 16px",background:DS.fill4,borderRadius:DS.r.btn,border:".5px solid rgba(255,255,255,.05)",position:"relative",overflow:"hidden"}}>
                  {/* Animated gradient fill */}
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(95,55+i*12)}%`,background:`linear-gradient(90deg,${cl}0A,${cl}05,transparent)`,borderRadius:DS.r.btn,animation:`fadeUp .6s ease ${.4+i*.1}s both`}}/>
                  <div style={{width:28,height:28,borderRadius:DS.r.btn,background:`${cl}15`,border:`1px solid ${cl}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1}}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5.5" stroke={cl} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:"rgba(255,255,255,.75)",lineHeight:1.35,zIndex:1}}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* PHOTO GALLERY */}
          {imgs.length>2&&(
            <div className="cm-section" style={{padding:"0 0 24px"}}>
              <div style={{paddingLeft:24,marginBottom:10,display:"flex",alignItems:"center",gap:DS.s[2]}}>
                <span style={{fontFamily:BFT,fontSize:11,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(235,235,245,.30)"}}>Портфолио</span>
                <span style={{fontFamily:BFT,fontSize:11,color:"rgba(255,255,255,.2)"}}>{imgs.length} фото</span>
              </div>
              <div style={{display:"flex",gap:DS.s[2],overflowX:"auto",scrollSnapType:"x mandatory",paddingLeft:24,paddingRight:24,scrollbarWidth:"none"}}>
                {imgs.map((src,i)=>(
                  <div key={i} onClick={()=>setGalleryOpen(i)} style={{flex:"0 0 40%",scrollSnapAlign:"center",aspectRatio:"4/3",borderRadius:DS.r.btn,overflow:"hidden",border:"none",cursor:"pointer",position:"relative"}}>
                    <img src={src} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .3s"}}/>
                    <div style={{position:"absolute",inset:0,background:DS.fill,opacity:0,transition:"opacity .2s"}} onMouseEnter={e=>(e.target as HTMLElement).style.opacity="1"} onMouseLeave={e=>(e.target as HTMLElement).style.opacity="0"}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTIMONIAL */}
          {testimonial&&(
            <div className="cm-section" style={{margin:"0 24px 24px",padding:"24px 20px",background:DS.fill4,borderRadius:DS.r.card,border:"none",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-5,left:16,fontFamily:DS.fontText,fontSize:64,lineHeight:1,color:`${cl}15`}}>"</div>
              <div style={{position:"relative",zIndex:1,paddingTop:16}}>
                <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:1.6,fontStyle:"italic"}}>{testimonial.quote}</div>
                <div style={{marginTop:DS.s[4],display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,borderTop:".5px solid rgba(255,255,255,.06)"}}>
                  <div>
                    <div style={{fontFamily:BFD,fontSize:13,fontWeight:700,color:DS.bg}}>{testimonial.author_name}</div>
                    <div style={{fontFamily:BFT,fontSize:11,color:"rgba(235,235,245,.30)",marginTop:1}}>{testimonial.author_role}</div>
                  </div>
                  {testimonial.revenue_impact&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:cl,background:`${cl}12`,borderRadius:DS.r.md,padding:"5px 12px",border:`1px solid ${cl}18`}}>{testimonial.revenue_impact}</div>}
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="cm-section" style={{padding:"0 24px 32px"}}>
            <div onClick={()=>{onClose();setTimeout(()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'}),300);}} style={{width:"100%",height:52,borderRadius:DS.r.btn,background:DS.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:DS.sh[3],position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,transparent 50%)",borderRadius:DS.r.btn}}/>
              <span style={{fontFamily:BFT,fontSize:17,fontWeight:600,color:DS.bg,letterSpacing:"-0.01em",position:"relative",zIndex:1}}>Обсудить свой проект</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TESTIMONIALS BLOCK ──────────────────────────────────────────
function TestimonialsBlock({ testimonials, cases }: { testimonials: BXTestimonial[]; cases: BXCase[] }) {
  const [ref,vis]=useInView();
  const scrollRef=useRef<HTMLDivElement>(null);
  if(!testimonials||testimonials.length===0) return null;
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px 0 80px",overflow:"hidden"}}>
      <div style={{paddingLeft:"clamp(24px,6vw,48px)",marginBottom:DS.s[6]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Отзывы</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Без купюр</h2>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",scrollbarWidth:"none"}}>
        {testimonials.map((t,i)=>{
          const cs = cases.find(c=>c.id===t.case_id);
          return (
            <div key={t.id} style={{flex:"0 0 clamp(280px,75vw,340px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"20px 18px",display:"flex",flexDirection:"column",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:`all .6s ease ${.2+i*.06}s`}}>
              <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",fontStyle:"italic",flex:1}}>«{t.quote}»</div>
              <div style={{marginTop:14,paddingTop:14,borderTop:".5px solid rgba(0,0,0,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:DS.label}}>{t.author_company}</div>
                  <div style={{fontFamily:BFT,fontSize:11,color:DS.label2}}>{t.author_role}</div>
                </div>
                {t.revenue_impact&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:cs?.color||"#007AFF",background:`${cs?.color||"#007AFF"}12`,borderRadius:DS.r.sm,padding:"3px 8px"}}>{t.revenue_impact}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PRODUCT ECOSYSTEM (visual overview from DB) ─────────────────
function ProductEcosystem({ products }: { products: BXProduct[] }) {
  const [ref,vis]=useInView();
  const [open,setOpen]=useState<number|null>(null);
  return (
    <div ref={ref} style={{padding:"80px clamp(24px,6vw,48px) 80px",maxWidth:960,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Что мы строим</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Продуктовая архитектура</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3]}}>
        {products.map((p,i)=>{
          const isOpen = open === i;
          return (
            <div key={p.id} onClick={()=>setOpen(isOpen?null:i)} style={{
              background:isOpen?"rgba(255,255,255,.12)":"rgba(255,255,255,.06)",
              border:".5px solid rgba(60,60,67,0.12)",
              borderRadius:DS.r.lg,padding:"16px 14px",cursor:"pointer",
              gridColumn:isOpen?"1 / -1":"auto",
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",
              transition:`all .35s cubic-bezier(.2,.8,.2,1) ${.15+i*.04}s`,
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:DS.label,letterSpacing:-0.3}}>{p.name}</div>
                  <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,marginTop:2}}>{p.tagline}</div>
                </div>
                {(p.case_count||0)>0&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:600,color:p.color,background:`${p.color}18`,borderRadius:DS.r.sm,padding:"3px 8px",flexShrink:0}}>{p.case_count} {(p.case_count||0)===1?"кейс":(p.case_count||0)<5?"кейса":"кейсов"}</div>}
              </div>
              {isOpen&&p.description&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:".5px solid rgba(255,255,255,.10)"}}>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(255,255,255,.65)",lineHeight:"18px",marginBottom:10}}>{p.description}</div>
                  {p.features&&p.features.length>0&&(
                    <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
                      {p.features.map((f,fi)=>(
                        <div key={fi} style={{display:"flex",alignItems:"baseline",gap:DS.s[2]}}>
                          <div style={{width:4,height:4,borderRadius:2,background:p.color,flexShrink:0,marginTop:6}}/>
                          <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px"}}>{f}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PRODS=[
{nm:"xCore",sub:"Стратегия и аналитика",desc:"Компании с формализованной стратегией растут в 2.5 раза быстрее рынка (Harvard Business Review).",items:[{n:"xScan",d:"Стратегическая диагностика бизнеса за 2 недели: рынок, бренд, продукт, продажи, технологии. Карта точек роста и конкретный план действий с приоритетами.",p:"от $5,000",biz:"$500K+"},{n:"xVision",d:"Стратегический анализ рынка, конкурентного ландшафта и целевой аудитории. Результат — Книга стратегии: единый документ принятия решений для всей компании.",p:"от $37,500",biz:"$3M+"},{n:"xGenetics",d:"Диагностика бренда по 5 ключевым параметрам (Agile, Profit, Hit, Global, Champion). Выявление конкурентного преимущества и зон критического отставания.",p:"от $20,000",biz:"$2M+"},{n:"xNeural",d:"Идентификация ценностных триггеров продукта, за которые рынок готов платить премиум. Технология Neural Brand Chain — от «молекул» ценности до продуктовой архитектуры.",p:"от $25,000",biz:"$2M+"},{n:"xBook",d:"Единый стратегический документ продукта: позиционирование, ценностное предложение, аргументация, визуальный стандарт. Синхронизирует маркетинг, продажи, PR и подрядчиков.",p:"от $25,000",biz:"$3M+"},{n:"xData",d:"BI-дашборды, аналитика рынка, конкурентный мониторинг, data-driven принятие решений. Еженедельные отчёты и стратегические рекомендации.",p:"от $7,500/мес",biz:"$5M+"},{n:"xInvestor",d:"Подготовка к инвестиционным раундам: pitch deck, финансовая модель, investor relations, стратегия коммуникации с фондами. Сопровождение до закрытия раунда.",p:"от $20,000",biz:"$1M+"},{n:"xExpansion",d:"Стратегия выхода на международные рынки: локализация, market entry, адаптация продукта, партнёрская сеть. От анализа до первых продаж в новой стране.",p:"от $50,000",biz:"$5M+"}]},
{nm:"xProduction",sub:"Упаковка мирового класса",desc:"86% потребителей принимают решение о покупке на основании визуального восприятия (Forbes).",items:[{n:"xBrilliance",d:"Конверсионные сайты с архитектурой пользовательского пути, визуальным сторителлингом и UX-стандартами уровня Apple. Средний прирост конверсии — 180-340%.",p:"от $7,500",biz:"$500K+"},{n:"xBrand",d:"Визуальная система идентичности, работающая в любом масштабе и медиа. Логотип, типографика, колористика, носители — единый визуальный язык бренда.",p:"от $12,500",biz:"$1M+"},{n:"xContent",d:"Контент-студия полного цикла: видеопродакшн, фотосъёмка, редакция, подкасты, социальные медиа. Системное производство контента, а не разовые съёмки.",p:"от $7,500/мес",biz:"$2M+"},{n:"xMarket",d:"Проектирование маркетплейсов и e-commerce экосистем с монетизацией транзакционного потока. Архитектура, UX, платёжная инфраструктура, аналитика.",p:"от $100,000",biz:"$5M+"},{n:"xEvent",d:"Стратегическое проектирование мероприятий как инструмента продаж. Упаковка, продвижение, конверсионная механика. Средний ROI — 5:1 от стоимости ивента.",p:"от $15,000",biz:"$1M+"}]},
{nm:"xTech",sub:"Технологии и AI",desc:"К 2027 году 75% компаний, не внедривших AI, потеряют конкурентоспособность (Gartner).",items:[{n:"xApp",d:"Проектирование и разработка AI-платформ полного цикла: от информационной архитектуры до запуска в продакшн. Дизайн-система, бэкенд, CRM, AI-модули.",p:"от $175,000",biz:"$5M+"},{n:"xAI",d:"Проектирование и внедрение AI-модулей: предиктивная аналитика, персонализация, автоматизация решений. Интеграция в существующие бизнес-процессы.",p:"от $50,000",biz:"$3M+"},{n:"xCRM",d:"CRM-система, спроектированная под процессы компании. Полная интеграция с маркетингом, продажами и аналитикой. Сокращение потерь клиентов на 35-40%.",p:"от $75,000",biz:"$5M+"},{n:"xAutomation",d:"Автоматизация операционных процессов: от заявки до отчётности. Высвобождение до 60% времени команды для стратегических задач.",p:"от $40,000",biz:"$3M+"}]},
{nm:"xMedia",sub:"Персональные бренды и продюсирование",desc:"Персональный бренд основателя увеличивает стоимость компании на 44% (Weber Shandwick).",items:[{n:"xPerson",d:"Стратегическое построение персонального бренда: позиционирование, визуальная упаковка, цифровое присутствие, контент-архитектура. Результат — медийный актив с измеримой капитализацией.",p:"от $12,500",biz:"$500K+"},{n:"xPerson Pro",d:"6-месячная программа полного продюсирования: от стратегии до монетизации аудитории. Включает контент-производство, PR, коллаборации и построение воронки.",p:"от $25,000",biz:"$1M+"},{n:"xInfluencer",d:"Стратегические коллаборации с блогерами и лидерами мнений как управляемый канал продаж. Подбор, переговоры, контроль ROI каждой интеграции.",p:"от $10,000/мес",biz:"$2M+"}]},
{nm:"xGrowth",sub:"Рост и удержание",desc:"Стоимость привлечения клиента снижается на 61% при системном подходе к PR и перформансу (McKinsey).",items:[{n:"xPerformance",d:"Интегрированные кампании: платная реклама, SEO, цифровой PR, публикации в Tier-1 СМИ. Подтверждённый совокупный охват проектов Billions X: 160,000,000+ человек.",p:"от $7,500/мес",biz:"$1M+"},{n:"xReputation",d:"Системное управление цифровой репутацией: мониторинг, SERM, PR-реагирование. Компании с управляемой репутацией конвертируют на 270% выше (BrightLocal).",p:"от $7,500/мес",biz:"$2M+"},{n:"xReputation Pro",d:"Полный контроль репутационного поля на всех цифровых платформах. Проактивная стратегия, кризисное управление, защита от конкурентных атак.",p:"от $25,000/мес",biz:"$10M+"},{n:"xRetain",d:"Программы лояльности, оптимизация LTV, снижение оттока. Системы удержания клиентов, которые превращают разовых покупателей в адвокатов бренда.",p:"от $7,500/мес",biz:"$3M+"},{n:"xCrisis",d:"Антикризисный штаб: мониторинг угроз, сценарии реагирования, координация PR, юристов и менеджмента. Первые 24 часа определяют 80% репутационного ущерба.",p:"от $25,000",biz:"$5M+"}]},
{nm:"xSales",sub:"Архитектура продаж и команда",desc:"Компании с формализованной методологией продаж закрывают на 28% больше сделок (CSO Insights).",items:[{n:"Sales xBook",d:"Единая книга методологии продаж: скрипты, аргументация, работа с возражениями, стандарты коммуникации. Каждый менеджер работает по системе, а не по интуиции.",p:"от $25,000",biz:"$3M+"},{n:"xTraining",d:"Программа обучения и сертификации отдела продаж. Средний прирост среднего чека после внедрения — 30-50%. Масштаб клиентов: ABB ($43B), Eaton ($34.2B).",p:"от $15,000",biz:"$2M+"},{n:"xAcademy",d:"Корпоративная образовательная платформа: маркетинг, продажи, бренд, продукт. Онлайн-курсы, воркшопы, сертификации для всей команды клиента.",p:"от $5,000/мес",biz:"$3M+"},{n:"xExclusive",d:"Полный аутсорсинг цикла продаж: от генерации лидов до закрытия сделки. Billions X отвечает за результат как коммерческий партнёр.",p:"10% от оборота",biz:"$5M+"},{n:"xHR",d:"Employer branding: позиционирование компании как работодателя, EVP, карьерный сайт, стратегия привлечения талантов. Компании с сильным HR-брендом нанимают на 50% быстрее (LinkedIn).",p:"от $15,000",biz:"$5M+"},{n:"xCulture",d:"Диагностика и трансформация корпоративной культуры: ценности, ритуалы, коммуникации, onboarding. Сильная культура снижает текучесть на 33% (Gallup).",p:"от $7,500/мес",biz:"$5M+"}]},
{nm:"xPartnership",sub:"Стратегическое партнёрство",desc:"Billions X инвестирует экспертизу как капитал. Вознаграждение — только при измеримом результате.",items:[{n:"xEquity",d:"Модель венчурных студий. Billions X входит в капитал с вестингом 3-4 года. Полная вовлечённость на уровне сооснователя.",p:"5–15% доли",biz:"$1M+"},{n:"xRevenue",d:"Модель revenue-share. Оплата привязана к приросту выручки. Минимальный контракт 12 месяцев. Полная прозрачность метрик.",p:"15–25%",biz:"$3M+"},{n:"xOwnership",d:"Billions X выступает продакт-оунером внутри компании. Модель, которая обеспечила ORBI Group рост в 20 раз за 1.5 года.",p:"от $250,000/год",biz:"$10M+"},{n:"xJoint",d:"Совместное предприятие 50/50. Billions X = маркетинг, продукт, технология. Клиент = отраслевая экспертиза, доступ к рынку.",p:"50/50",biz:"$5M+"},{n:"xBoard",d:"Стратегический advisory board. Billions X как постоянный советник на уровне совета директоров. Ежемесячные стратегические сессии, доступ к экспертизе по запросу.",p:"от $7,500/мес",biz:"$3M+"},{n:"xM&A",d:"Сопровождение сделок M&A: due diligence бренда, оценка маркетинговых активов, стратегия интеграции брендов после слияния. Подготовка компании к продаже.",p:"от $100,000",biz:"$20M+"},{n:"xFranchise",d:"Упаковка бизнес-модели для франчайзинга: стандарты бренда, операционные процедуры, обучающие материалы, маркетинговый kit для партнёров.",p:"от $75,000",biz:"$5M+"}]},
];

const PROD_CTA=["Обсудить стратегию","Запросить портфолио","Обсудить проект","Рассчитать ROI","Запросить методологию","Обсудить внедрение","Обсудить условия"];

function ProductsBlock() {
  const [tab,setTab]=useState(0);
  const [ref,vis]=useInView(0.1);
  const pr=PRODS[tab];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6}}>Линейка продуктов</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px"}}>Каталог решений</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0}}>Измеримый возврат на каждый доллар.</p>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:DS.s[2],overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",marginBottom:20,paddingBottom:2}}>
        {PRODS.map((p,i)=>(
          <div key={i} onClick={()=>setTab(i)} style={{fontFamily:BFT,fontSize:12,fontWeight:tab===i?600:500,color:tab===i?"#fff":"rgba(0,0,0,.50)",background:tab===i?"#1C1C1E":"rgba(0,0,0,.04)",borderRadius:DS.r.md,padding:"8px 14px",cursor:"pointer",flexShrink:0,transition:"all .25s ease",border:tab===i?"none":".5px solid rgba(0,0,0,.06)"}}>{p.nm}</div>
        ))}
      </div>
      {/* Content */}
      <div style={{background:DS.label,borderRadius:DS.r.card,overflow:"hidden"}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:"rgba(235,235,245,1)",letterSpacing:-0.5,lineHeight:"28px"}}>{pr.nm}</div>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(235,235,245,.45)",letterSpacing:-0.08,lineHeight:"18px",marginTop:2}}>{pr.sub}</div>
          <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.55)",letterSpacing:-0.08,lineHeight:"16px",marginTop:8}}>{pr.desc}</div>
        </div>
        <div style={{height:".5px",background:DS.fill4,marginLeft:20,marginRight:20}}/>
        <div style={{padding:"4px 20px 20px"}}>
          {pr.items.map((it,ii)=>(
            <div key={ii} style={{padding:"14px 0",borderBottom:ii<pr.items.length-1?".5px solid rgba(235,235,245,.06)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:"rgba(235,235,245,.85)",letterSpacing:-0.23,lineHeight:"20px"}}>{it.n}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:"rgba(235,235,245,.50)",cursor:"pointer",flexShrink:0,marginLeft:12}}>Обсудить →</div>
              </div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.60)",letterSpacing:-0.08,lineHeight:"16px",marginTop:4}}>{it.d}</div>
              <div style={{display:"flex",gap:DS.s[4],marginTop:6}}>
                {it.biz&&<div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.60)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.30)"}}>При обороте: </span>{it.biz}</div>}
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.70)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.30)"}}>Стоимость: </span>{it.p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COMP_COLS = ["Стратегия","Смыслы","Упаковка","Продвижение","Продажи","AI/Tech","7 законов продукта","Исполнение под ключ","Собственные деньги в игре","Доказанный ROI ($1B+)","Доступно для вашего бренда"];
const COMP_ROWS = [
  {cat:"Мировые гиганты",name:"Apple, Google, Amazon, Tesla",v:["✓","✓","✓","✓","✓","✓","✓","✓","✓","✓","—"]},
  {cat:"AI",name:"ChatGPT, Claude, Gemini",v:["✓*","✓*","✓*","—","—","✓*","—","—","—","—","✓"]},
  {cat:"Консалтинг",name:"McKinsey, BCG, Bain",v:["✓","—","—","—","—","✓*","—","—","—","—","✓"]},
  {cat:"Рекламные холдинги",name:"WPP, Publicis, Omnicom",v:["—","~","✓","✓","—","✓*","—","~","—","—","✓"]},
  {cat:"Системные интеграторы",name:"Accenture, EPAM, Infosys",v:["—","—","—","—","—","✓","—","✓","—","—","✓"]},
  {cat:"Венчурные студии",name:"Rocket Internet, Idealab",v:["~","—","~","~","—","✓","—","~","✓","—","✓"]},
  {cat:"Маркетинговые агентства",name:"BBDO, Ogilvy, Leo Burnett",v:["~","~","✓","✓","—","✓*","—","~","—","—","✓"]},
  {cat:"Дизайн студии",name:"Pentagram, Landor, Wolff Olins",v:["—","~","✓","—","—","✓*","—","—","—","—","✓"]},
  {cat:"",name:"Billions X",v:["✓","✓","✓","✓","✓","✓","✓","✓","✓","✓","✓"]},
];

function UniquenessBlock() {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"80px 0 80px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:DS.s[6],textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Рынок</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>С кем нас сравнивают</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Billions X за 15+ лет и реализацию 300+ проектов собрала редкую компетенцию и стала топовым мировым игроком.</p>
      </div>
      <div style={{padding:"0 clamp(24px,6vw,48px)"}}>
        <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",transition:"opacity .6s ease .5s, transform .8s cubic-bezier(.2,.8,.2,1) .5s"}}>
          
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            <table style={{borderCollapse:"collapse",width:"max-content",minWidth:"100%",fontFamily:BFT}}>
              <thead>
                <tr>{["", ...COMP_COLS].map((c,i)=>(
                  <th key={i} style={{position:i===0?"sticky":"static",left:i===0?0:"auto",zIndex:i===0?3:1,background:i===0?"rgba(255,255,255,.92)":"transparent",backdropFilter:i===0?"blur(20px)":"none",WebkitBackdropFilter:i===0?"blur(20px)":"none",padding:i===0?"10px 14px":"10px 8px",textAlign:i===0?"left":"center",fontSize:11,fontWeight:500,color:DS.label2,borderBottom:".5px solid rgba(0,0,0,.06)",whiteSpace:"pre-line",minWidth:i===0?120:50,letterSpacing:.1,lineHeight:"13px"}}>{c}</th>
                ))}</tr>
              </thead>
              <tbody>
                {COMP_ROWS.map((row,ri)=>(
                  <tr key={ri} style={{background:row.name==="Billions X"?"rgba(0,122,255,.04)":"transparent"}}>
                    <td style={{position:"sticky",left:0,zIndex:2,background:row.name==="Billions X"?"rgba(0,122,255,.06)":"rgba(255,255,255,.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",padding:"8px 14px",borderBottom:".5px solid rgba(0,0,0,.04)"}}>
                      {row.cat&&<div style={{fontSize:11,fontWeight:500,color:DS.label3,letterSpacing:.3,lineHeight:"11px"}}>{row.cat}</div>}
                      <div style={{fontSize:row.name==="Billions X"?12:11,fontWeight:row.name==="Billions X"?700:500,color:row.name==="Billions X"?"#007AFF":"rgba(0,0,0,.60)",lineHeight:"14px"}}>{row.name}</div>
                    </td>
                    {row.v.map((v,vi)=>(
                      <td key={vi} style={{padding:"8px 8px",textAlign:"center",fontSize:13,color:v==="✓"?(row.name==="Billions X"?"#007AFF":"#000"):v==="✓*"?"rgba(0,0,0,.40)":"rgba(0,0,0,.15)",fontWeight:v==="✓"&&row.name==="Billions X"?700:400,borderBottom:".5px solid rgba(0,0,0,.04)"}}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{padding:"10px 14px",borderTop:".5px solid rgba(0,0,0,.06)"}}>
            <div style={{fontFamily:DS.fontText,fontSize:13,fontStyle:"italic",color:DS.label,lineHeight:"14px"}}>✓* — AI генерирует стратегии, тексты, дизайн и код. Но не обладает целостным видением, не управляет командами, не обучает отделы продаж, не проводит переговоры, не выступает продакт-оунером внутри компании, не отвечает за конкретные суммы, которые должны зайти в компанию (как коммерческий партнёр) и не имеет 15-летнего опыта трансформации реальных бизнесов. AI — инструмент внутри Billions X и других команд, но не замена.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const LAWS=[
  {n:"I",t:"Понятность",d:"Самый мощный и нужный продукт проиграет, если клиент не понимает, что покупает."},
  {n:"II",t:"Непрерывность",d:"Каждый продукт самодостаточен, при этом один дополняет другой."},
  {n:"III",t:"Геймификация",d:"Каждое действие клиента создаёт историю и отношения с брендом."},
  {n:"IV",t:"Вдохновение",d:"В мире много проблем и людям нужно вдохновение, чтобы справиться с проблемами."},
  {n:"V",t:"Монетизация",d:"Внедрение систем, как зарабатывать «на каждом квадратном метре» своего бизнеса."},
  {n:"VI",t:"Дашбордность",d:"Глубокая аналитика и показатели всех направлений и слоёв бизнеса для собственников и управленческой команды."},
  {n:"VII",t:"Увеличение",d:"Количество итераций, среднего чека, повторных заказов, время жизни клиента."},
];

function LawsCarousel() {
  const scrollRef = useRef(null);
  const [active, setActive] = useState(0);
  const [ref, vis] = useInView(0.15);
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const fn = () => { const cw = el.firstChild ? el.firstChild.offsetWidth+12 : 280; setActive(Math.min(Math.round(el.scrollLeft/cw),7)); };
    el.addEventListener("scroll", fn, {passive:true});
    return () => el.removeEventListener("scroll", fn);
  }, []);
  const card = {flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:DS.s[5],display:"flex",flexDirection:"column",willChange:"transform,opacity"};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"80px 0 80px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:DS.s[6],textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Принципы</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Законы, по которым растут лидеры</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Крупнейшие компании мира — Apple, Tesla, Amazon, Google, SpaceX — выросли не на продуктах, а на принципах, по которым эти продукты создаются, презентуются и масштабируются в массах.</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {LAWS.map((l,i)=>(
          <div key={i} style={{...card,opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:BFD,fontSize:28,fontWeight:700,color:"rgba(0,0,0,.08)",lineHeight:1,marginBottom:8}}>{l.n}</div>
            <div style={{fontFamily:BFD,fontSize:20,fontWeight:600,color:DS.label,letterSpacing:0.38,lineHeight:"25px",marginBottom:8}}>{l.t}</div>
            <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,letterSpacing:-0.23,lineHeight:"19px"}}>{l.d}</div>
          </div>
        ))}
        <div style={{...card,justifyContent:"center",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:"opacity .6s ease 1s, transform .7s cubic-bezier(.2,.8,.2,1) 1s"}}>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label,letterSpacing:-0.08,lineHeight:"17px",textAlign:"left"}}>Billions X построен на 7 законах продукта. Это фундаментальные законы, которые определяют, вырастет бизнес или нет. Многолетняя практика BX подтверждает: бизнесы, в которых работают все 7 законов, растут экспоненциально. Бизнесы, в которых отсутствует хотя бы один — стагнируют.</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:DS.s[2],marginTop:20}}>
        {Array.from({length:8}).map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
      </div>
    </div>
  );
}

function FormulasBlock() {
  const [ref,vis]=useInView();
  const x = {fontFamily:BFD,fontSize:13,fontWeight:400,color:DS.label4,letterSpacing:1};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.97)",transition:"opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"20px 16px",position:"relative",overflow:"hidden"}}>
        
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:DS.label3,marginBottom:8,textAlign:"center"}}>Уравнение</div>
        <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:DS.label,lineHeight:"18px",letterSpacing:-0.2,textAlign:"center"}}>
          Стратегия<span style={x}> × </span>Смыслы<span style={x}> × </span>Продукт<span style={x}> × </span>Упаковка<span style={x}> × </span>Продвижение<span style={x}> × </span>Продажи<span style={x}> × </span>AI
        </div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,lineHeight:"14px",letterSpacing:0.15,textAlign:"center",marginTop:12}}>Если убрать любой множитель — результат обнуляется.</div>
      </div>
    </div>
  );
}



function FoundersBlock() {
  const [ref,vis]=useInView(0.1);
  const founders=[
    {name:"Евгений Иванов",role:"Управляющий партнёр · Co-Founder",photo:"/bx/ivanov.jpg",
     desc:"Стратегия и позиционирование, визуальная упаковка, рекламные кампании, PR и медиа-охват, персональные бренды, репутация и кризисные коммуникации.",
     achievements:["Полный цикл: от стратегии до продаж","Международные рекламные кампании","Публикации в Tier-1 мировых СМИ","Международные индустриальные премии","Победы на глобальных выставках"],
     expertise:["xVision","xProduction","xBrand","xPerson","xPerformance"]},
    {name:"Борис Прядкин",role:"Управляющий партнёр · Co-Founder",photo:"/bx/priadkin.png",
     desc:"Архитектура и методология продаж, технологии и AI-платформы, стратегические партнёрства и M&A, обучение команд, коммерческое сопровождение девелоперов.",
     achievements:["Системы продаж в $40B+ корпорациях","Закрытые сделки на $1B+ в девелопменте","Масштабирование до 55 офисов в 19 странах","AI-платформы и цифровые продукты","Revenue-share модели с девелоперами"],
     expertise:["xSales","xAI","xChatbot","xTouch","xSocial"]},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4]}}>Кто стоит за Billions X</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px"}}>Два партнёра. Двадцать лет. Одна цель</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0}}>Высшее техническое образование. 20 лет совместной практики на международных рынках. Каждый курирует свои профессиональные команды с подтверждённой экспертизой.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:DS.s[3]}}>
        {founders.map((f,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"opacity .6s ease "+(0.4+i*.15)+"s, transform .7s cubic-bezier(.2,.8,.2,1) "+(0.4+i*.15)+"s"}}>
            
            <div style={{width:"100%",height:220,overflow:"hidden",background:DS.label}}><img src={f.photo} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",opacity:.85}}/></div>
            <div style={{padding:"20px 20px 8px"}}>
              <div style={{fontFamily:BFD,fontSize:20,fontWeight:700,color:DS.label,letterSpacing:-0.5,lineHeight:"24px"}}>{f.name}</div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label2,letterSpacing:-0.08,lineHeight:"16px",marginTop:2}}>{f.role}</div>
              <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,letterSpacing:-0.15,lineHeight:"18px",marginTop:10}}>{f.desc}</div>
            </div>
            {/* Achievements */}
            <div style={{padding:"8px 20px 12px"}}>
              {f.achievements.map((a,ai)=>(
                <div key={ai} style={{display:"flex",alignItems:"baseline",gap:DS.s[2],marginBottom:4}}>
                  <div style={{width:4,height:4,borderRadius:2,background:DS.blue,flexShrink:0,marginTop:5}}/>
                  <span style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px"}}>{a}</span>
                </div>
              ))}
            </div>
            {/* Expertise pills */}
            <div style={{padding:"4px 20px 20px",display:"flex",flexWrap:"wrap",gap:DS.s[2]}}>
              {f.expertise.map((e,ei)=>(
                <span key={ei} style={{fontFamily:BFT,fontSize:11,fontWeight:600,color:DS.blue,background:DS.fill4,border:`1px solid ${DS.blue}15`,borderRadius:DS.r.full,padding:"3px 10px"}}>{e}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ContactBlock() {
  const [ref,vis]=useInView(0.1);
  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [revenue,setRevenue]=useState("");
  const [sent,setSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [picked,setPicked]=useState(new Set());
  const [openCat,setOpenCat]=useState(-1);
  const toggle=(n)=>{const s=new Set(picked);s.has(n)?s.delete(n):s.add(n);setPicked(s);};
  const cats=PRODS.map((p,i)=>({idx:i,nm:p.nm,sub:p.sub,items:p.items}));
  const submit=async()=>{
    if(!name||!phone)return;
    setSending(true);
    try{
      await fetch("https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/bx_leads",{method:"POST",headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg"},body:JSON.stringify({name,phone,revenue,message:Array.from(picked).join(", ")||"Не выбрано"})});
      setSent(true);
    }catch(e){}
    setSending(false);
  };
  const inp={width:"100%",padding:"14px 16px",border:"none",borderBottom:".5px solid rgba(0,0,0,.06)",background:"transparent",fontSize:15,fontFamily:BFT,outline:"none",color:DS.label,boxSizing:"border-box"as const};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4]}}>Начнём разговор</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 16px"}}>Первый шаг — бесплатная стратегическая сессия</h2>
        <p style={{fontFamily:BFT,fontSize:17,fontWeight:400,letterSpacing:0,lineHeight:"28px",color:DS.label2,margin:0}}>Вам назначат экспресс-консультацию с одним из управляющих партнёров Billions X.</p>
      </div>
      {sent?(
        <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"48px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>✓</div>
          <div style={{fontFamily:BFD,fontSize:22,fontWeight:700,color:DS.label,marginBottom:8}}>Заявка отправлена</div>
          <div style={{fontFamily:BFT,fontSize:15,color:DS.label2}}>Свяжемся с вами в ближайшее время.</div>
        </div>
      ):(
        <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",position:"relative"}}>
          
          <input value={name} onChange={(e:any)=>setName(e.target.value)} placeholder="Имя" style={inp}/>
          <input value={phone} onChange={(e:any)=>setPhone(e.target.value)} placeholder="Телефон или email" style={inp}/>
          <select value={revenue} onChange={(e:any)=>setRevenue(e.target.value)} style={{...inp,WebkitAppearance:"none"as const,appearance:"none"as const,color:revenue?"#000":"rgba(60,60,67,.35)"}}>
            <option value="">Годовой оборот</option>
            <option value="<$1M">до $1M</option>
            <option value="$1-5M">$1M — $5M</option>
            <option value="$5-20M">$5M — $20M</option>
            <option value="$20-100M">$20M — $100M</option>
            <option value="$100M+">$100M+</option>
          </select>
          <div style={{borderTop:".5px solid rgba(0,0,0,.06)",padding:"16px 16px 8px"}}>
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.label,marginBottom:12}}>Выберите интересующие продукты</div>
            {cats.map((cat,ci)=>{
              const isOpen=openCat===ci;
              const catPicked=cat.items.filter(it=>picked.has(it.n));
              return(
                <div key={ci} style={{marginBottom:8,borderRadius:DS.r.md,border:isOpen?".5px solid rgba(0,122,255,.15)":".5px solid rgba(0,0,0,.04)",background:isOpen?"rgba(0,122,255,.03)":"rgba(0,0,0,.02)",overflow:"hidden",transition:"all .25s"}}>
                  <div onClick={()=>setOpenCat(isOpen?-1:ci)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}}>
                    <div>
                      <div style={{fontFamily:BFT,fontSize:14,fontWeight:600,color:isOpen||catPicked.length>0?"#007AFF":"#000",lineHeight:"18px"}}>{cat.sub}</div>
                      {catPicked.length>0&&!isOpen&&<div style={{fontFamily:BFT,fontSize:11,color:DS.blue,marginTop:2}}>{catPicked.map(p=>p.n).join(", ")}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:DS.s[2]}}>
                      {catPicked.length>0&&<div style={{background:DS.blue,borderRadius:DS.r.md,padding:"2px 8px",fontFamily:BFT,fontSize:11,fontWeight:600,color:DS.label}}>{catPicked.length}</div>}
                      <div style={{fontSize:12,color:DS.label4,transform:isOpen?"rotate(90deg)":"rotate(0)",transition:"transform .2s"}}>▶</div>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 14px 12px"}}>
                      {cat.items.map((it,ii)=>{
                        const on=picked.has(it.n);
                        return(
                          <div key={ii} onClick={()=>toggle(it.n)} style={{padding:"10px 12px",marginBottom:4,borderRadius:DS.r.md,background:on?"rgba(0,122,255,.06)":"rgba(255,255,255,.5)",border:on?".5px solid rgba(0,122,255,.12)":".5px solid rgba(0,0,0,.03)",cursor:"pointer",transition:"all .15s"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div style={{fontFamily:BFD,fontSize:14,fontWeight:600,color:on?"#007AFF":"#000",letterSpacing:-0.2}}>{it.n}</div>
                              <div style={{width:18,height:18,borderRadius:DS.r.xs,border:on?"none":"1.5px solid rgba(0,0,0,.15)",background:on?"#007AFF":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {on&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                            </div>
                            <div style={{fontFamily:BFT,fontSize:12,color:DS.label2,lineHeight:"16px",marginTop:4}}>{it.d}</div>
                            <div style={{display:"flex",gap:DS.s[4],marginTop:6}}>
                              <div style={{fontFamily:BFT,fontSize:11,color:DS.label2}}>{it.p}</div>
                              {it.biz&&<div style={{fontFamily:BFT,fontSize:11,color:DS.label3}}>от {it.biz}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {picked.size>0&&<div style={{padding:"0 16px 8px",fontFamily:BFT,fontSize:12,color:DS.blue}}>Выбрано {picked.size}: {Array.from(picked).join(", ")}</div>}
          <div style={{padding:"4px 16px 16px"}}>
            <div onClick={submit} className="tap" style={{width:"100%",height:50,borderRadius:DS.r.btn,background:(!name||!phone)?"rgba(0,122,255,.35)":"#007AFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:(!name||!phone)?"default":"pointer",transition:"background .2s"}}>
              <span style={{fontFamily:BFT,fontSize:17,fontWeight:600,color:DS.label}}>{sending?"Отправка...":"Записаться"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── PRESS & MEDIA BLOCK ─────────────────────────────────────────
function PressBlock() {
  const [ref,vis]=useInView();
  const media=[
    {name:"Forbes",cl:"#B5985A"},{name:"Fortune",cl:"#E31937"},{name:"Fox News",cl:"#003366"},{name:"CBS",cl:"#2E67B2"},{name:"ABC",cl:"#000"},
    {name:"Mashable",cl:"#00AAEC"},{name:"Insider",cl:"#07547B"},{name:"CES Awards",cl:"#E4002B"},{name:"FIABCI",cl:"#003DA5"},
    {name:"Prix d'Excellence",cl:DS.blue},{name:"Brand Analytics",cl:"#4A90D9"},{name:"Wedding Awards",cl:DS.blue},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Публикации</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>В фокусе мировых медиа</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Проекты Billions X получают публикации в ведущих мировых медиа и международные награды.</p>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:DS.s[2]}}>
        {media.map((m,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.md,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"8px 16px",display:"flex",alignItems:"center",gap:DS.s[2],
            opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.85)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.04}s`
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",background:m.cl,flexShrink:0,boxShadow:`0 0 8px ${m.cl}40`}}/>
            <span style={{fontFamily:BFD,fontSize:12,fontWeight:600,color:DS.label,letterSpacing:-0.2}}>{m.name}</span>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:20,opacity:vis?1:0,transition:"opacity .5s ease .8s"}}>
        <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label3}}>Проекты BX получают освещение в мировых медиа</span>
      </div>
    </div>
  );
}

// ─── STARS / CELEBRITY TESTIMONIALS ──────────────────────────────
const STARS=[
  {name:"Евгений Чичваркин",role:"Основатель Евросеть, Hedonism Wines",quote:"Billions X понимают масштаб. Они мыслят на уровне, к которому привыкают единицы. Результат виден сразу — в цифрах и в восприятии бренда.",tag:"$ миллионер"},
  {name:"Игорь Рыбаков",role:"Сооснователь ТЕХНОНИКОЛЬ, Forbes",quote:"Работать с Billions X — значит получить команду, которая думает как совладелец. Не подрядчики, а партнёры с кожей в игре.",tag:"$ миллиардер"},
  {name:"Дмитрий Портнягин",role:"Трансформатор, бизнес-блогер #1",quote:"Billions X — это другой уровень. Они не продают услуги, они выстраивают системы, которые продают сами. Точка.",tag:"$ миллионер"},
  {name:"Ицхак Пинтосевич",role:"Коуч #1, автор 14 книг, IPACT",quote:"За 300+ проектов Billions X выработали подход, который невозможно скопировать. Это синтез стратегии, психологии продаж и визуального совершенства.",tag:"100K+ клиентов"},
  {name:"Радислав Гандапас",role:"Эксперт по лидерству, автор 9 книг",quote:"Billions X делают невидимое видимым. Превращают экспертизу в бренд, а бренд — в деньги.",tag:"Спикер #1"},
  {name:"Альфред Форд",role:"Правнук Генри Форда, меценат",quote:"Impressive approach to brand engineering. Billions X combine analytical depth with creative excellence at a global standard.",tag:"Ford dynasty"},
  {name:"Оскар Хартманн",role:"Серийный предприниматель",quote:"Billions X — одни из немногих, кто может упаковать бизнес так, что он начинает выглядеть на порядок дороже. И продаваться соответственно.",tag:"$ миллионер"},
  {name:"Олег Торбосов",role:"Владелец Whitewill, HRscanner",quote:"Скорость, глубина, результат. Billions X не тратят время на лишние согласования — они сразу делают на уровне, который сложно превзойти.",tag:"$ миллионер"},
];

function StarsBlock() {
  const [ref,vis]=useInView();
  const scrollRef=useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px 0 80px",overflow:"hidden"}}>
      <div style={{paddingLeft:"clamp(24px,6vw,48px)",maxWidth:960,margin:"0 auto",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Рекомендации</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Те, кто нам доверяют</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Миллиардеры, медийные личности и лидеры индустрий.</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",scrollbarWidth:"none"}}>
        {STARS.map((s,i)=>(
          <div key={i} style={{
            flex:"0 0 clamp(280px,75vw,320px)",scrollSnapAlign:"center",
            background:DS.bg,
            border:"none",borderRadius:DS.r.card,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"24px 20px",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",
            transition:`all .6s ease ${.2+i*.06}s`
          }}>
            
            {/* Quote icon */}
            <div style={{fontFamily:DS.fontText,fontSize:48,lineHeight:"32px",color:"rgba(0,0,0,.06)",marginBottom:4,userSelect:"none"}}>"</div>
            <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",fontStyle:"italic",flex:1,marginBottom:DS.s[4]}}>«{s.quote}»</div>
            <div style={{paddingTop:14,borderTop:".5px solid rgba(0,0,0,.06)",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
              <div>
                <div style={{fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.label,letterSpacing:-0.3}}>{s.name}</div>
                <div style={{fontFamily:BFT,fontSize:11,color:DS.label2,lineHeight:"14px",marginTop:2}}>{s.role}</div>
              </div>
              <div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:DS.blue,background:DS.fill4,border:`1px solid ${DS.blue}15`,borderRadius:DS.r.sm,padding:"3px 8px",flexShrink:0,letterSpacing:.3}}>{s.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PERSONAL APPROACH BLOCK ─────────────────────────────────────
function PersonalBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.fill4,borderRadius:DS.r.xl,padding:"48px clamp(20px,5vw,40px)",position:"relative",overflow:"hidden"}}>
        
        <div style={{position:"absolute",top:20,right:20,fontFamily:BFD,fontSize:100,fontWeight:900,color:"rgba(0,0,0,.02)",lineHeight:1,userSelect:"none"}}>✦</div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .2s"}}>Подход</div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(32px,7vw,42px)",fontWeight:700,letterSpacing:"-0.025em",lineHeight:1.05,color:DS.label,margin:"0 0 20px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .3s, transform .6s cubic-bezier(.2,.8,.2,1) .3s"}}>Партнёр, а не подрядчик</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"24px",color:DS.label2,margin:"0 0 28px",maxWidth:480,opacity:vis?1:0,transition:"opacity .5s ease .4s"}}>Без брифов. Без шаблонов. С самого начала и до конца проекта вы работаете напрямую с управляющим партнёром Billions X, который лично погружается в ваш продукт и привносит максимальную экспертизу.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:DS.s[3],opacity:vis?1:0,transition:"opacity .5s ease .5s"}}>
          {["Не менеджер — управляющий партнёр","Не бриф — стратегические сессии","Не шаблон — уникальная архитектура","Не отчёт — измеримый результат"].map((t,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"center",gap:DS.s[2],
              background:DS.bg,
              border:"none",borderRadius:DS.r.md,
              boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
              padding:"10px 16px",
            }}>
              <div style={{width:5,height:5,borderRadius:"50%",background:DS.blue,flexShrink:0}}/>
              <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label2,letterSpacing:-0.15}}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── GEOGRAPHY / GLOBAL PRESENCE BLOCK ───────────────────────────
function GeographyBlock() {
  const [ref,vis]=useInView();
  const countries=[
    {flag:"🇮🇩",name:"Индонезия",case:"PARQ Development"},
    {flag:"🇬🇪",name:"Грузия",case:"ORBI Group / инвест. бренд"},
    {flag:"🇺🇸",name:"США",case:"Health Helper / Bite Helper"},
    {flag:"🇷🇺",name:"Россия",case:"ГК Пионер / PF Capital"},
    {flag:"🇺🇦",name:"Украина",case:"Укрбуд / BIS"},
    {flag:"🇮🇱",name:"Израиль",case:"IPACT / 2Space"},
    {flag:"🇨🇭",name:"Швейцария",case:"ABB"},
    {flag:"🇺🇸",name:"Ирландия",case:"Eaton Corporation"},
    {flag:"🇬🇧",name:"Великобритания",case:"MaxboxVR / Google"},
    {flag:"🇩🇪",name:"Германия",case:"Siemens / Bayer"},
    {flag:"🇫🇷",name:"Франция",case:"L'Oréal Group"},
    {flag:"🇦🇪",name:"ОАЭ",case:"Девелопмент-проекты"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>12+ стран</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Три континента. Двенадцать стран</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Проекты и клиенты Billions X на трёх континентах.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:DS.s[2]}}>
        {countries.map((c,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.btn,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"14px 12px",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.95)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.04}s`
          }}>
            
            <div style={{fontSize:24,lineHeight:1,marginBottom:6}}>{c.flag}</div>
            <div style={{fontFamily:BFD,fontSize:13,fontWeight:700,color:DS.label,letterSpacing:-0.2}}>{c.name}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label2,lineHeight:"13px",marginTop:2}}>{c.case}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMOTIONAL VALUE PROPS BLOCK ─────────────────────────────────
function ValuePropsBlock() {
  const [ref,vis]=useInView();
  const props=[
    {icon:"◆",title:"Продавайте дороже",desc:"Технология Neural Brand Chain находит все ценные смыслы продукта и собирает из них дорогой зажигающий продукт. Повышайте ценность вместо конкуренции по цене.",metric:"×2.5",metricLabel:"средний чек"},
    {icon:"◈",title:"Побеждайте",desc:"Технология Genetic Brand Engineering находит суперсилу бренда и наполняет его недостающими «генами» для победы на рынке.",metric:"×20",metricLabel:"рост ORBI Group"},
    {icon:"✦",title:"Восхищайте",desc:"Сайты Brilliance Online показывают упакованный продукт со всех сторон, выстраивая путь знакомства клиента так, как это выгодно бизнесу.",metric:"340%",metricLabel:"прирост конверсии"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Измеримый эффект</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Что получает каждый клиент</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[3]}}>
        {props.map((p,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.card,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"24px 20px",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",
            transition:`all .6s cubic-bezier(.2,.8,.2,1) ${.3+i*.12}s`
          }}>
            
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:DS.s[3]}}>
                <div style={{fontFamily:BFD,fontSize:18,color:"rgba(0,0,0,.10)",lineHeight:1}}>{p.icon}</div>
                <div style={{fontFamily:BFD,fontSize:20,fontWeight:700,color:DS.label,letterSpacing:-0.5}}>{p.title}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:DS.blue,letterSpacing:-0.5,lineHeight:1}}>{p.metric}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,letterSpacing:.2}}>{p.metricLabel}</div>
              </div>
            </div>
            <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",letterSpacing:-0.15}}>{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── STICKY NAV ──────────────────────────────────────────────────
function StickyNav({ onContact }: { onContact: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,zIndex:100,
      transform:show?"translateY(0)":"translateY(-100%)",
      transition:"transform .35s cubic-bezier(.2,.8,.2,1)",
      pointerEvents:show?"auto":"none",
    }}>
      <div style={{
        maxWidth:960,margin:"0 auto",padding:"12px clamp(16px,4vw,24px)",
        display:"flex",alignItems:"center",justifyContent:"space-between",
      }}>
        <div style={{
          background:DS.bg,
          border:"none",borderRadius:DS.r.lg,
          boxShadow:DS.sh[3],
          padding:"10px 20px",display:"flex",alignItems:"center",gap:DS.s[4],flex:1,
        }}>
          <span style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:DS.label,letterSpacing:"-0.02em"}}>Billions X</span>
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:DS.s[2]}}>
            {[{label:"Кейсы",cls:".bx-cases"},{label:"Продукты",cls:".bx-products"}].map((item,i)=>(
              <span key={i} onClick={()=>document.querySelector(item.cls as string)?.scrollIntoView({behavior:"smooth"})} style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label2,cursor:"pointer",padding:"4px 0",transition:"color .2s"}}>{item.label}</span>
            ))}
          </div>
          <span style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label4,cursor:"default",padding:"4px 0"}}>RU</span>
          <div onClick={onContact} style={{
            fontFamily:BFT,fontSize:12,fontWeight:600,color:DS.bg,
            background:DS.blue,borderRadius:DS.r.md,padding:"7px 16px",cursor:"pointer",
            boxShadow:DS.sh[2],flexShrink:0,
          }}>Обсудить</div>
        </div>
      </div>
    </div>
  );
}

// ─── HOW WE WORK / PROCESS BLOCK ─────────────────────────────────
function ProcessBlock() {
  const [ref,vis]=useInView(0.1);
  const steps=[
    {n:"01",t:"Стратегическая сессия",d:"Первый разговор — всегда с управляющим партнёром. Погружаемся в бизнес, рынок, амбиции. Без брифов и анкет.",dur:"1–2 часа",icon:"◎"},
    {n:"02",t:"Диагностика и стратегия",d:"Анализируем рынок, конкурентов, продукт. Выявляем точки роста. Формируем единый стратегический документ.",dur:"2–4 недели",icon:"◉"},
    {n:"03",t:"Упаковка и создание",d:"Смыслы, визуальная система, сайт, контент — всё на уровне Apple. Каждый элемент работает на продажу.",dur:"4–8 недель",icon:"◈"},
    {n:"04",t:"Запуск и рост",d:"Рекламные кампании, PR, SEO, репутация. Системная лидогенерация с прозрачной аналитикой. ROI отслеживается еженедельно.",dur:"Непрерывно",icon:"◆"},
    {n:"05",t:"Масштабирование",d:"Новые рынки, продукты, каналы. Команда Billions X работает как внутренний отдел — с полной ответственностью за результат.",dur:"6–24 мес.",icon:"✦"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Процесс</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>От звонка до результата</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>От первого звонка до измеримого результата.</p>
      </div>
      <div style={{position:"relative"}}>
        {/* Vertical line */}
        <div style={{position:"absolute",left:22,top:0,bottom:0,width:1,background:DS.fill4,zIndex:0}}/>
        <div style={{display:"flex",flexDirection:"column",gap:DS.s[1],position:"relative",zIndex:1}}>
          {steps.map((s,i)=>(
            <div key={i} style={{
              display:"flex",alignItems:"flex-start",gap:DS.s[4],
              padding:"20px 0",
              opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-16px)",
              transition:`all .6s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
            }}>
              {/* Step circle */}
              <div style={{
                width:44,height:44,borderRadius:DS.r.btn,flexShrink:0,
                background:DS.fill4,
                border:".5px solid rgba(60,60,67,0.12)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.blue,
                boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
              }}>{s.icon}</div>
              {/* Content */}
              <div style={{flex:1,paddingTop:2}}>
                <div style={{display:"flex",alignItems:"baseline",gap:DS.s[2],marginBottom:4}}>
                  <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.label4}}>{s.n}</span>
                  <span style={{fontFamily:BFD,fontSize:17,fontWeight:700,color:DS.label,letterSpacing:-0.3}}>{s.t}</span>
                </div>
                <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"18px",marginBottom:6}}>{s.d}</div>
                <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,color:DS.blue,background:DS.fill3,border:`1px solid ${DS.blue}22`,borderRadius:DS.r.xs,padding:"2px 8px"}}>{s.dur}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── CTA BREAKER (reusable mid-page call to action) ─────────────
function CTABreaker({ text, sub, accent }: { text: string; sub?: string; accent?: string }) {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"40px clamp(24px,6vw,48px) 40px",textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .6s ease"}}>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"32px 24px",position:"relative",overflow:"hidden"}}>
        
        {accent&&<div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,marginBottom:8}}>{accent}</div>}
        <div style={{fontFamily:BFD,fontSize:"clamp(20px,4vw,26px)",fontWeight:700,color:DS.label,letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:sub?12:16}}>{text}</div>
        {sub&&<div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"18px",marginBottom:DS.s[4],maxWidth:400,margin:"0 auto 16px"}}>{sub}</div>}
        <div onClick={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} style={{display:"inline-flex",alignItems:"center",gap:DS.s[2],fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.blue,cursor:"pointer",padding:"8px 20px",borderRadius:DS.r.md,background:DS.fill4,border:`1px solid ${DS.blue}15`,transition:"all .2s"}}>
          Обсудить проект <span style={{fontSize:16,lineHeight:1}}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── FLAGSHIP CASE (immersive inline case study) ─────────────────
function FlagshipCaseBlock() {
  const [ref,vis]=useInView(0.05);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.label,borderRadius:DS.r.xl,overflow:"hidden",position:"relative"}}>
        {/* Gradient overlay */}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,.3) 0%,rgba(0,0,0,.85) 100%)",zIndex:1}}/>
        {/* Ambient glow */}
        <div style={{position:"absolute",top:"-30%",left:"-20%",width:"140%",height:"100%",background:"radial-gradient(ellipse,rgba(0,122,255,.08) 0%,transparent 70%)",zIndex:0}}/>
        {/* Content */}
        <div style={{position:"relative",zIndex:2,padding:"clamp(28px,6vw,48px)"}}>
          {/* Badge */}
          <div style={{display:"inline-flex",alignItems:"center",gap:DS.s[2],background:DS.fill4,backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.10)",borderRadius:DS.r.sm,padding:"5px 12px",marginBottom:20,opacity:vis?1:0,transition:"opacity .5s ease .2s"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:DS.green}}/>
            <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.60)"}}>Flagship Case</span>
          </div>
          {/* Title */}
          <div style={{marginBottom:6,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all .6s ease .3s"}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.30)",marginBottom:6}}>Batumi · Georgia · 2022–2024</div>
            <h3 style={{fontFamily:BFD,fontSize:"clamp(28px,6vw,34px)",fontWeight:700,color:DS.bg,letterSpacing:"-0.03em",lineHeight:1,margin:0}}>ORBI Group</h3>
            <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:"20px",marginTop:10,maxWidth:440}}>Самый большой гостиничный комплекс в мире — 12,000+ апартаментов. Billions X выступал продакт-оунером 1.5 года, обеспечив полный контроль над продуктом для всех отделов.</div>
          </div>
          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,margin:"28px 0 24px",background:DS.fill4,borderRadius:DS.r.lg,overflow:"hidden",opacity:vis?1:0,transition:"opacity .6s ease .5s"}}>
            {[{v:"×20",l:"Рост компании",sub:"за 1.5 года"},{v:"55",l:"Офисов в 19 странах",sub:"стандартизировано"},{v:"1.5M",l:"Туристов в год",sub:"в ORBI отелях"}].map((k,i)=>(
              <div key={i} style={{padding:"20px 16px",background:DS.fill4,textAlign:"center"}}>
                <div style={{fontFamily:BFD,fontSize:28,fontWeight:700,color:DS.blue,letterSpacing:-1,lineHeight:1}}>{k.v}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.60)",marginTop:6}}>{k.l}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.30)",marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
          {/* Award badge */}
          <div style={{display:"flex",alignItems:"center",gap:DS.s[3],padding:"14px 16px",background:DS.fill4,borderRadius:DS.r.btn,border:"none",opacity:vis?1:0,transition:"opacity .6s ease .6s"}}>
            <div style={{width:32,height:32,borderRadius:DS.r.md,background:"linear-gradient(135deg,DS.blue,#8B7635)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>🏆</div>
            <div>
              <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:DS.blue,letterSpacing:-0.2}}>FIABCI Prix d'Excellence</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.60)"}}>Жюри из 40 стран признало проект лучшим инвестиционным проектом мира</div>
            </div>
          </div>
          {/* Quote */}
          <div style={{marginTop:20,paddingTop:20,borderTop:".5px solid rgba(255,255,255,.06)",opacity:vis?1:0,transition:"opacity .6s ease .7s"}}>
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,fontStyle:"italic",color:"rgba(255,255,255,.50)",lineHeight:"19px"}}>«Billions X в течение полутора лет выступали в роли продакт-оунера, обеспечивая полный контроль над продуктом для всех отделов: маркетинга, рекламы, PR, продаж и колл-центра.»</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INSIGHTS / THOUGHT LEADERSHIP BLOCK ─────────────────────────
function InsightsBlock() {
  const [ref,vis]=useInView();
  const insights=[
    {tag:"Стратегия",title:"Почему 80% бизнесов теряют деньги на рекламе",desc:"Реклама без стратегии — это сжигание бюджета. Разбираем системный подход к маркетингу, который работает.",read:"5 мин"},
    {tag:"Бренд",title:"Genetic Brand Engineering: как найти суперсилу бренда",desc:"Технология, которая позволяет диагностировать бренд по 5 ключевым параметрам и найти точки кратного роста.",read:"7 мин"},
    {tag:"Продажи",title:"Sales xBook: почему лучшие компании мира продают по системе",desc:"ABB ($43B), Eaton ($34.2B), ORBI Group — как единая книга продаж меняет результаты.",read:"4 мин"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Мышление</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Экспертиза, которую не купишь</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Экспертиза, которую мы накопили за 300+ проектов.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[3]}}>
        {insights.map((ins,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.lg,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"20px",position:"relative",overflow:"hidden",cursor:"pointer",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.98)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
          }}>
            
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:DS.s[4]}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:DS.s[2],marginBottom:8}}>
                  <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,color:DS.blue,background:DS.fill4,border:`1px solid ${DS.blue}15`,borderRadius:DS.r.xs,padding:"2px 8px",letterSpacing:.3}}>{ins.tag}</span>
                  <span style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3}}>{ins.read}</span>
                </div>
                <div style={{fontFamily:BFD,fontSize:17,fontWeight:700,color:DS.label,letterSpacing:-0.3,lineHeight:"22px",marginBottom:4}}>{ins.title}</div>
                <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"18px"}}>{ins.desc}</div>
              </div>
              <div style={{fontFamily:BFD,fontSize:20,color:"rgba(0,0,0,.10)",flexShrink:0,marginTop:4}}>→</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TRUST & COMPLIANCE BLOCK ────────────────────────────────────
function TrustBlock() {
  const [ref,vis]=useInView();
  const items=[
    {icon:"🔒",title:"NDA с первого дня",desc:"Каждый проект начинается с соглашения о неразглашении. Ваши данные, стратегия и метрики защищены."},
    {icon:"⚖️",title:"Юридическое сопровождение",desc:"Договор, SLA, чёткие KPI. Прозрачная структура оплаты с привязкой к результату."},
    {icon:"🛡️",title:"ISO-уровень процессов",desc:"Формализованные методологии, документация, аудит. Стандарты работы, применимые в Fortune 500."},
    {icon:"📊",title:"Прозрачная аналитика",desc:"Еженедельные отчёты. Дашборды в реальном времени. Полный доступ к рекламным кабинетам и метрикам."},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Безопасность</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Стандарты, которые выдерживают проверку</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3]}}>
        {items.map((it,i)=>(
          <div key={i} style={{
            background:DS.fill4,
            border:".5px solid rgba(60,60,67,0.12)",borderRadius:DS.r.lg,
            padding:"20px 16px",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.95)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.08}s`,
          }}>
            <div style={{fontSize:22,lineHeight:1,marginBottom:10}}>{it.icon}</div>
            <div style={{fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.label,letterSpacing:-0.2,marginBottom:4}}>{it.title}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px"}}>{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FAQ BLOCK (glass accordion) ─────────────────────────────────
function FAQBlock() {
  const [ref,vis]=useInView();
  const [open,setOpen]=useState(-1);
  const faqs=[
    {q:"Сколько стоят услуги Billions X?",a:"Стоимость зависит от масштаба проекта. Упаковка бизнеса в смыслы и сайт — от $7,500. Стратегия компании — от $37,500. Полный цикл продажи для девелоперов — 10% от оборота. Первая стратегическая сессия с управляющим партнёром — бесплатная."},
    {q:"Как быстро вы можете начать?",a:"Первая стратегическая сессия — в течение 48 часов. Диагностика и стратегия — 2–4 недели. Упаковка и сайт — 4–8 недель. Полный цикл от первого звонка до работающей рекламы — 8–12 недель."},
    {q:"В чём отличие от обычных маркетинговых агентств?",a:"Billions X — не агентство. Мы выступаем как стратегический партнёр или продакт-оунер внутри компании. Каждый проект курирует управляющий партнёр лично. У нас нет менеджеров-посредников, шаблонных брифов и потоковых решений."},
    {q:"Работаете ли вы с малым бизнесом?",a:"Да. Наша линейка начинается с xScan — стратегической диагностики за $5,000. Для компаний с выручкой от $500K мы предлагаем упаковку в смыслы и сайт. Для крупных компаний — полный стратегический цикл."},
    {q:"Какие гарантии результата?",a:"NDA с первого дня. Прозрачная аналитика с еженедельными отчётами. Для партнёрских моделей (xEquity, xRevenue) — оплата привязана к измеримому результату. Средний ROI проектов Billions X — 5:1."},
    {q:"Работаете ли вы за пределами СНГ?",a:"Да. У нас проекты в 12+ странах: Индонезия, Грузия, США, Великобритания, Германия, ОАЭ и другие. Рабочие языки — русский и английский."},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Ответы</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Прежде чем вы спросите</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
        {faqs.map((f,i)=>{
          const isOpen=open===i;
          return (
            <div key={i} onClick={()=>setOpen(isOpen?-1:i)} style={{
              background:isOpen?DS.bg:"rgba(0,0,0,0.02)",
              border:isOpen?".5px solid rgba(0,0,0,.06)":".5px solid rgba(0,0,0,.03)",borderRadius:DS.r.lg,
              boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
              padding:"16px 20px",cursor:"pointer",position:"relative",overflow:"hidden",
              transition:"all .3s cubic-bezier(.2,.8,.2,1)",
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",
            }}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:DS.s[3]}}>
                <div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:DS.label,letterSpacing:-0.2,lineHeight:"20px",flex:1}}>{f.q}</div>
                <div style={{fontFamily:BFD,fontSize:18,color:DS.label4,flexShrink:0,transform:isOpen?"rotate(45deg)":"rotate(0deg)",transition:"transform .3s cubic-bezier(.2,.8,.2,1)"}}>+</div>
              </div>
              <div style={{maxHeight:isOpen?300:0,overflow:"hidden",transition:"max-height .4s cubic-bezier(.2,.8,.2,1)"}}>
                <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",paddingTop:12}}>{f.a}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── METRICS BAR (Apple-style horizontal stats) ──────────────────
function MetricsBar() {
  const [ref,vis]=useInView();
  const stats=[
    {v:"Сотни",l:"проектов"},{v:"15+",l:"лет"},{v:"12+",l:"стран"},{v:"$77B+",l:"капитализация клиентов"},{v:"160M+",l:"медиа-охват"},
  ];
  return (
    <div ref={ref} style={{overflow:"hidden",padding:"40px 0",opacity:vis?1:0,transition:"opacity .6s ease"}}>
      <div style={{display:"flex",justifyContent:"center",gap:"clamp(20px,5vw,48px)",flexWrap:"wrap",maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)"}}>
        {stats.map((s,i)=>(
          <div key={i} style={{textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:`all .5s ease ${.1+i*.08}s`}}>
            <div style={{fontFamily:BFD,fontSize:"clamp(22px,4vw,30px)",fontWeight:700,color:DS.label,letterSpacing:-1,lineHeight:1}}>{s.v}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,letterSpacing:.2,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── SCROLL PROGRESS BAR ─────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return <div style={{position:"fixed",top:0,left:0,width:`${pct}%`,height:2,background:"linear-gradient(90deg,#007AFF,#5856D6)",zIndex:200,transition:"width .1s linear",pointerEvents:"none",opacity:pct>1?.6:0}}/>;
}

// ─── ROI CALCULATOR ──────────────────────────────────────────────
function ROICalculator() {
  const [ref,vis]=useInView();
  const [rev,setRev]=useState(5);
  const pct = rev < 3 ? 45 : rev < 10 ? 35 : rev < 50 ? 25 : 18;
  const growth = rev * pct / 100;
  const projected = (rev + growth).toFixed(1);
  const invest = rev < 3 ? 50 : rev < 10 ? 120 : rev < 50 ? 350 : rev < 100 ? 800 : 1500;
  const roi = Math.round(growth * 1000 / invest);
  const labels = ["$1M","$3M","$5M","$10M","$25M","$50M","$100M+"];
  const values = [1,3,5,10,25,50,100];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Прогноз</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Посчитайте свой потенциал</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>На основе медианных показателей клиентов Billions X.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.xl,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"clamp(24px,5vw,36px)",position:"relative",overflow:"hidden"}}>
        
        {/* Revenue selector */}
        <div style={{marginBottom:28}}>
          <div style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label2,marginBottom:12}}>Ваша текущая годовая выручка</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:DS.s[2]}}>
            {labels.map((l,i)=>(
              <div key={i} onClick={()=>setRev(values[i])} style={{
                fontFamily:BFT,fontSize:12,fontWeight:rev===values[i]?600:400,
                color:rev===values[i]?"#fff":"rgba(0,0,0,.45)",
                background:rev===values[i]?"#007AFF":"rgba(0,0,0,.04)",
                borderRadius:DS.r.md,padding:"8px 14px",cursor:"pointer",
                border:rev===values[i]?"none":".5px solid rgba(0,0,0,.06)",
                transition:"all .25s cubic-bezier(.2,.8,.2,1)",
                boxShadow:rev===values[i]?"0 2px 8px rgba(0,122,255,.25)":"none",
              }}>{l}</div>
            ))}
          </div>
        </div>
        {/* Results */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:DS.fill4,borderRadius:DS.r.lg,overflow:"hidden",marginBottom:20}}>
          {[
            {label:"Прогноз выручки",value:`$${projected}M`,sub:`+${pct}% за 12–18 мес.`,cl:"#007AFF"},
            {label:"Инвестиция в BX",value:invest>=1000?`$${(invest/1000).toFixed(1)}M`:`$${invest}K`,sub:"стратегия + упаковка + рост",cl:"#000"},
            {label:"ROI",value:`${roi}:1`,sub:"возврат на каждый $1",cl:"#34C759"},
          ].map((r,i)=>(
            <div key={i} style={{padding:"20px 14px",background:DS.bg,textAlign:"center"}}>
              <div style={{fontFamily:BFD,fontSize:"clamp(24px,5vw,32px)",fontWeight:700,color:r.cl,letterSpacing:-1,lineHeight:1,transition:"all .4s ease"}}>{r.value}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:DS.label3,marginTop:8}}>{r.label}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label4,marginTop:2}}>{r.sub}</div>
            </div>
          ))}
        </div>
        {/* Disclaimer */}
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,lineHeight:"15px",textAlign:"center"}}>Прогноз основан на медианных показателях проектов Billions X. Фактические результаты зависят от отрасли, продукта и рынка.</div>
      </div>
    </div>
  );
}

// ─── TIMELINE 2006→2026 ──────────────────────────────────────────
function TimelineBlock() {
  const [ref,vis]=useInView(0.05);
  const scrollRef=useRef<HTMLDivElement>(null);
  const milestones=[
    {y:"2006",t:"Основание",d:"Евгений Иванов и Борис Прядкин запускают Billions X."},
    {y:"2010",t:"Первые $1B-клиенты",d:"ABB ($43B) и Eaton ($34.2B) — внедрение xSales."},
    {y:"2014",t:"MaxboxVR × Google",d:"Эксклюзивный партнёр Google по VR CardBoards. 3000+ B2B-клиентов из 100+ стран."},
    {y:"2016",t:"Health Helper / CES",d:"Bite Helper побеждает на крупнейшей выставке электроники мира."},
    {y:"2018",t:"Государственный уровень",d:"Консалтинг инвестиционного бренда Грузии. Укрбуд — крупнейший застройщик Украины."},
    {y:"2020",t:"PARQ Development",d:"Запуск маркетинга крупнейшего застройщика Бали. Распродан целый район вилл за год."},
    {y:"2022",t:"ORBI Group ×20",d:"1.5 года как продакт-оунер. Компания выросла в 20 раз. FIABCI Prix d'Excellence."},
    {y:"2024",t:"AI-эра",d:"Запуск xAI и xApp. Проектирование AI-платформ полного цикла для клиентов."},
    {y:"2026",t:"Этномир Super App",d:"30M-рублёвый проект. Крупнейший этнопарк России получает цифровую экосистему."},
  ];
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px 0 80px",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:DS.s[8],textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Хронология</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Двадцать лет в одном направлении</h2>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:DS.s[3],overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",scrollbarWidth:"none"}}>
        {milestones.map((m,i)=>(
          <div key={i} style={{
            flex:"0 0 clamp(220px,55vw,260px)",scrollSnapAlign:"center",
            background:DS.fill4,
            border:".5px solid rgba(60,60,67,0.12)",borderRadius:DS.r.lg,
            padding:"20px 18px",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.96)",
            transition:`all .6s cubic-bezier(.2,.8,.2,1) ${.3+i*.06}s`,
          }}>
            <div style={{fontFamily:BFD,fontSize:34,fontWeight:700,color:"rgba(255,255,255,.06)",lineHeight:1,marginBottom:4,userSelect:"none"}}>{m.y}</div>
            <div style={{fontFamily:BFD,fontSize:15,fontWeight:700,color:DS.label,letterSpacing:-0.3,marginBottom:6}}>{m.t}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px",flex:1}}>{m.d}</div>
            <div style={{width:24,height:2,background:DS.blue,borderRadius:1,marginTop:12,opacity:.4}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BEFORE/AFTER TRANSFORMATION ─────────────────────────────────
function TransformBlock() {
  const [ref,vis]=useInView();
  const rows=[
    {dim:"Позиционирование",before:"«Мы делаем качественный продукт»",after:"Чёткое УТП, которое отстраивает от 100% конкурентов"},
    {dim:"Сайт",before:"Шаблонный, не конвертирует",after:"Brilliance Online: +180–340% конверсия"},
    {dim:"Продажи",before:"Каждый менеджер продаёт по-своему",after:"Sales xBook: единая методология, +28% закрытых сделок"},
    {dim:"Реклама",before:"Сливают бюджет без стратегии",after:"Системная лидогенерация с прозрачной unit-экономикой"},
    {dim:"Репутация",before:"Нет контроля над поисковой выдачей",after:"Управляемое репутационное поле, 100% позитив в топ-10"},
    {dim:"Команда",before:"Зависимость от конкретных людей",after:"Формализованные процессы, масштабируемые без потерь"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Результат</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Что меняется после Billions X</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Что меняется, когда за дело берётся Billions X.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",position:"relative"}}>
        
        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr",borderBottom:".5px solid rgba(0,0,0,.06)",padding:"12px 16px"}}>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.label4}}></div>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.red}}>Без Billions X</div>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.blue}}>С Billions X</div>
        </div>
        {rows.map((r,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"120px 1fr 1fr",borderBottom:i<rows.length-1?".5px solid rgba(0,0,0,.04)":"none",padding:"14px 16px",opacity:vis?1:0,transition:`opacity .4s ease ${.4+i*.06}s`}}>
            <div style={{fontFamily:BFD,fontSize:11,fontWeight:600,color:DS.label2,letterSpacing:-0.1}}>{r.dim}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label3,lineHeight:"16px",paddingRight:8}}>{r.before}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label2,lineHeight:"16px"}}>{r.after}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PARTNERSHIP NAVIGATOR ───────────────────────────────────────
function PartnershipNav() {
  const [ref,vis]=useInView();
  const [sel,setSel]=useState(0);
  const models=[
    {title:"Проектная работа",fit:"Компании $500K–$5M",icon:"◎",desc:"Конкретная задача — конкретный результат. Упаковка, сайт, реклама, стратегия. Фиксированный бюджет и сроки.",products:["xScan","xVision","xBrilliance","xBrand","xPerformance"],entry:"от $5,000"},
    {title:"Ретейнер",fit:"Компании $5M–$50M",icon:"◉",desc:"Ежемесячная подписка на экспертизу. Непрерывный маркетинг, контент, реклама, аналитика. Предсказуемый бюджет, растущие результаты.",products:["xContent","xPerformance","xReputation","xData","xRetain"],entry:"от $7,500/мес"},
    {title:"Стратегическое партнёрство",fit:"Компании $10M+",icon:"◈",desc:"Billions X входит в бизнес как партнёр. Revenue share, equity или полный product ownership. Оплата за результат.",products:["xEquity","xRevenue","xOwnership","xJoint","xBoard"],entry:"5–25% или доля"},
    {title:"Эксклюзивная продажа",fit:"Девелоперы $5M+",icon:"◆",desc:"Полный аутсорсинг продаж: от лидогенерации до закрытия сделки и юридического оформления. Вы строите — мы продаём.",products:["xExclusive","xSales","xTraining"],entry:"10% от оборота"},
  ];
  const m = models[sel];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Форматы</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Четыре формата партнёрства</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Четыре модели для разного масштаба бизнеса.</p>
      </div>
      {/* Tab selector */}
      <div style={{display:"flex",gap:DS.s[1],marginBottom:DS.s[4],background:DS.fill4,borderRadius:DS.r.btn,padding:4}}>
        {models.map((mod,i)=>(
          <div key={i} onClick={()=>setSel(i)} style={{
            flex:1,textAlign:"center",padding:"10px 6px",borderRadius:DS.r.md,cursor:"pointer",
            fontFamily:BFT,fontSize:11,fontWeight:sel===i?600:400,
            color:sel===i?"#fff":"rgba(255,255,255,.40)",
            background:sel===i?"rgba(255,255,255,.12)":"transparent",
            transition:"all .25s cubic-bezier(.2,.8,.2,1)",
          }}>{mod.icon}<br/><span style={{fontSize:11}}>{mod.title}</span></div>
        ))}
      </div>
      {/* Selected model card */}
      <div style={{background:DS.fill4,border:".5px solid rgba(60,60,67,0.12)",borderRadius:DS.r.card,padding:"28px 24px",position:"relative",overflow:"hidden",transition:"all .3s ease"}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:6}}>
          <div style={{fontFamily:BFD,fontSize:22,fontWeight:700,color:DS.label,letterSpacing:-0.5}}>{m.title}</div>
          <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:DS.blue,background:DS.fill3,border:`1px solid ${DS.blue}22`,borderRadius:DS.r.sm,padding:"3px 10px",flexShrink:0}}>{m.entry}</div>
        </div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,marginBottom:12}}>{m.fit}</div>
        <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",marginBottom:DS.s[4]}}>{m.desc}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:DS.s[2]}}>
          {m.products.map((p,pi)=>(
            <span key={pi} style={{fontFamily:BFT,fontSize:11,fontWeight:600,color:DS.blue,background:DS.fill4,border:"1px solid rgba(0,122,255,.12)",borderRadius:DS.r.full,padding:"3px 10px"}}>{p}</span>
          ))}
        </div>
        <div onClick={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} style={{marginTop:20,width:"100%",height:44,borderRadius:DS.r.md,background:DS.blue,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:DS.sh[2]}}>
          <span style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.label}}>Обсудить эту модель</span>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────
function BXFooter() {
  return (
    <div style={{maxWidth:960,margin:"0 auto",padding:"64px clamp(24px,6vw,48px) 48px",borderTop:".5px solid rgba(0,0,0,.06)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:DS.s[8],marginBottom:40}}>
        <div>
          <div style={{fontFamily:BFD,fontSize:20,fontWeight:700,color:DS.label,letterSpacing:"-0.02em",marginBottom:6}}>Billions X</div>
          <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px",maxWidth:200}}>Маркетинг богатых и очень богатых. С 2006 года.</div>
        </div>
        <div style={{display:"flex",gap:"clamp(24px,5vw,48px)"}}>
          <div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.label4,marginBottom:10}}>Навигация</div>
            {["Кейсы","Продукты","Процесс","FAQ"].map((l,i)=>(
              <div key={i} onClick={()=>{const cls=[".bx-cases",".bx-products",".bx-process",".bx-faq"][i];if(cls)document.querySelector(cls)?.scrollIntoView({behavior:"smooth"});}} style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,cursor:"pointer",marginBottom:6,transition:"color .2s"}}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.label4,marginBottom:10}}>Компания</div>
            {["Основатели","География","Медиа","Контакт"].map((l,i)=>(
              <div key={i} onClick={()=>{if(i===3)document.querySelector('.bx-contact')?.scrollIntoView({behavior:"smooth"});}} style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,cursor:i===3?"pointer":"default",marginBottom:6}}>{l}</div>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:DS.s[2],paddingTop:20,borderTop:".5px solid rgba(0,0,0,.04)"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label4}}>© {new Date().getFullYear()} Billions X. Все права защищены.</div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label4}}>billionsx.com</div>
      </div>
    </div>
  );
}


// ─── MISSION / PURPOSE BLOCK (WHY we exist) ──────────────────────
function MissionBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Миссия</div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(32px,7vw,44px)",fontWeight:700,letterSpacing:"-0.03em",lineHeight:1.05,color:DS.label,margin:"0 0 20px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Мы верим, что каждый сильный продукт заслуживает стать видимым.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"24px",color:DS.label2,margin:"0 auto",maxWidth:520,opacity:vis?1:0,transition:"opacity .5s ease .4s"}}>Мир полон бизнесов, которые делают важное — но остаются незамеченными. Не потому что продукт слабый, а потому что его никто не упаковал, не объяснил и не показал правильной аудитории. Billions X существует, чтобы это исправить.</p>
        <div style={{display:"flex",justifyContent:"center",gap:DS.s[5],marginTop:DS.s[8],opacity:vis?1:0,transition:"opacity .5s ease .6s"}}>
          {[{n:"Созидание",d:"Строим, а не разрушаем"},{n:"Мастерство",d:"Каждый проект — лучший"},{n:"Партнёрство",d:"Кожа в игре"}].map((v,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.label,letterSpacing:-0.2}}>{v.n}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,marginTop:2}}>{v.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT RESULTS DASHBOARD (aggregate outcomes) ───────────────
function ClientDashboard() {
  const [ref,vis]=useInView();
  const metrics=[
    {label:"Средний рост выручки клиентов",value:"+32%",bar:32,cl:"#007AFF"},
    {label:"Средний прирост конверсии",value:"+240%",bar:68,cl:"#5856D6"},
    {label:"Прирост среднего чека клиентов",value:"+47%",bar:47,cl:"#34C759"},
    {label:"Клиенты, продлившие контракт",value:"87%",bar:87,cl:"#FF9500"},
    {label:"Рост узнаваемости бренда",value:"+4.2×",bar:60,cl:"#FF3B30"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Статистика</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Цифры, которые не нуждаются в комментариях</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Медианные показатели по 300+ проектам за 2018–2026.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.xl,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"clamp(20px,4vw,28px)",position:"relative",overflow:"hidden"}}>
        
        <div style={{display:"flex",flexDirection:"column",gap:18}}>
          {metrics.map((m,i)=>(
            <div key={i} style={{opacity:vis?1:0,transition:`opacity .5s ease ${.4+i*.08}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label2,letterSpacing:-0.1}}>{m.label}</span>
                <span style={{fontFamily:BFD,fontSize:18,fontWeight:700,color:m.cl,letterSpacing:-0.5}}>{m.value}</span>
              </div>
              <div style={{height:4,borderRadius:2,background:DS.fill4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:2,background:m.cl,width:vis?`${m.bar}%`:"0%",transition:`width 1.2s cubic-bezier(.2,.8,.2,1) ${.5+i*.1}s`,opacity:.7}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label4,textAlign:"center",marginTop:DS.s[4]}}>Данные основаны на проектах с подтверждённой аналитикой. Не включают проекты без доступа к метрикам клиента.</div>
      </div>
    </div>
  );
}

// ─── TEAM BENCH (depth beyond founders) ──────────────────────────
function TeamBench() {
  const [ref,vis]=useInView();
  const depts=[
    {name:"Стратегия",count:4,skills:["Рыночная аналитика","Позиционирование","Конкурентная разведка","Продуктовая стратегия"]},
    {name:"Креатив и дизайн",count:6,skills:["UX/UI","Брендинг","Моушн-дизайн","3D и рендеры","Фотопродакшн"]},
    {name:"Технологии",count:5,skills:["AI/ML","Full-stack","DevOps","Архитектура","QA"]},
    {name:"Перформанс",count:4,skills:["Paid Media","SEO","Аналитика","CRO"]},
    {name:"Продажи и PR",count:3,skills:["Sales-методология","Репутация","Медиа-размещения"]},
    {name:"Контент",count:4,skills:["Копирайтинг","Видеопродакшн","Подкасты","SMM"]},
  ];
  const total = depts.reduce((s,d)=>s+d.count,0);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>{total}+ специалистов</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Двадцать шесть специалистов за каждым проектом</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Каждый партнёр курирует профильные команды с подтверждённой экспертизой.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:DS.s[2]}}>
        {depts.map((d,i)=>(
          <div key={i} style={{
            background:DS.fill4,
            border:".5px solid rgba(60,60,67,0.12)",borderRadius:DS.r.lg,
            padding:"16px 14px",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(10px) scale(0.96)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.06}s`,
          }}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.label,letterSpacing:-0.2}}>{d.name}</div>
              <div style={{fontFamily:BFD,fontSize:11,fontWeight:600,color:DS.blue}}>{d.count}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              {d.skills.map((s,si)=>(
                <div key={si} style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,lineHeight:"13px"}}>{s}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── ANTI-PITCH (who we DON'T work with) ─────────────────────────
function AntiPitchBlock() {
  const [ref,vis]=useInView();
  const no=[
    "Бизнесам, которые ищут «подешевле»",
    "Проектам без готовности к изменениям",
    "Компаниям, ожидающим результат без вовлечения",
    "Стартапам без подтверждённого product-market fit",
  ];
  const yes=[
    "Бизнесам, готовым инвестировать в системный рост",
    "Основателям, которые лично участвуют в процессе",
    "Компаниям с амбицией стать лидером рынка",
    "Проектам, где качество важнее скорости",
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Фильтр</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Мы выбираем так же, как выбирают нас</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>И это осознанный выбор. Мы работаем только с теми, кому можем дать максимальный результат.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3]}}>
        {/* NOT for */}
        <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"20px 16px",opacity:vis?1:0,transition:"opacity .5s ease .4s"}}>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.red,marginBottom:14}}>Не наш клиент</div>
          {no.map((n,i)=>(
            <div key={i} style={{display:"flex",alignItems:"baseline",gap:DS.s[2],marginBottom:10}}>
              <span style={{fontFamily:BFD,fontSize:12,color:"rgba(200,60,60,.30)",flexShrink:0}}>✕</span>
              <span style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"17px"}}>{n}</span>
            </div>
          ))}
        </div>
        {/* YES for */}
        <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"20px 16px",opacity:vis?1:0,transition:"opacity .5s ease .5s"}}>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".08em",textTransform:"uppercase",color:DS.blue,marginBottom:14}}>Наш клиент</div>
          {yes.map((y,i)=>(
            <div key={i} style={{display:"flex",alignItems:"baseline",gap:DS.s[2],marginBottom:10}}>
              <span style={{fontFamily:BFD,fontSize:12,color:"rgba(0,122,255,.40)",flexShrink:0}}>✓</span>
              <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label2,lineHeight:"17px"}}>{y}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPETITIVE MOAT (why BX is unreproducible) ─────────────────
function MoatBlock() {
  const [ref,vis]=useInView();
  const layers=[
    {n:"15+",unit:"лет",d:"Время, которое невозможно сжать. Каждый год — это десятки проектов, ошибок, открытий и методологий, отточенных практикой."},
    {n:"300+",unit:"кейсов",d:"Каждый кейс — это новая индустрия, новый рынок, новый набор переменных. Этот объём насмотренности не воспроизвести."},
    {n:"35+",unit:"индустрий",d:"От государственного брендинга до стартапов, от $43B корпораций до персональных брендов. Кросс-индустриальные паттерны, которые видим только мы."},
    {n:"7",unit:"систем",d:"Собственные методологии: xVision, xGenetics, xNeural, xProduction, xPerformance, xSales, xAI — каждая создана на реальных данных."},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Unfair Advantage</div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(32px,7vw,42px)",fontWeight:700,letterSpacing:"-0.025em",lineHeight:1.05,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Нельзя нанять. Нельзя скопировать. Нельзя сгенерировать</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Конкурентное преимущество — это не одно решение. Это слои, которые накапливаются годами.</p>
      </div>
      <div style={{position:"relative"}}>
        {layers.map((l,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"flex-start",gap:DS.s[4],
            padding:"24px 0",borderBottom:i<layers.length-1?".5px solid rgba(255,255,255,.06)":"none",
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-16px)",
            transition:`all .6s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
          }}>
            <div style={{textAlign:"right",minWidth:70,flexShrink:0}}>
              <div style={{fontFamily:BFD,fontSize:32,fontWeight:700,color:DS.blue,letterSpacing:-1,lineHeight:1}}>{l.n}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,marginTop:2}}>{l.unit}</div>
            </div>
            <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",paddingTop:4}}>{l.d}</div>
          </div>
        ))}
        <div style={{marginTop:20,padding:"16px 20px",background:DS.fill4,borderRadius:DS.r.btn,border:".5px solid rgba(0,0,0,.04)",opacity:vis?1:0,transition:"opacity .6s ease .8s"}}>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:500,fontStyle:"italic",color:DS.label3,lineHeight:"18px",textAlign:"center"}}>15 × 300 × 35 × 7 = компетенция, которую нельзя нанять, купить или сгенерировать.</div>
        </div>
      </div>
    </div>
  );
}

// ─── SOCIAL IMPACT ───────────────────────────────────────────────
function ImpactBlock() {
  const [ref,vis]=useInView();
  const items=[
    {icon:"🎓",title:"Образование",desc:"Менторинг и стратегические сессии для стартапов на ранней стадии. Делимся методологиями, которые обычно стоят $25,000+."},
    {icon:"🌍",title:"Государственный консалтинг",desc:"Разработка инвестиционного бренда Грузии — проект, направленный на привлечение международных инвестиций в экономику страны."},
    {icon:"🤝",title:"Pro bono",desc:"Выборочные проекты для социальных инициатив и НКО, где маркетинговая экспертиза может создать измеримый социальный эффект."},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Вклад</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Вклад за пределами контракта</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[3]}}>
        {items.map((it,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"flex-start",gap:DS.s[4],
            background:DS.bg,
            border:"none",borderRadius:DS.r.lg,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"18px 16px",
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
          }}>
            <div style={{fontSize:24,lineHeight:1,flexShrink:0,marginTop:2}}>{it.icon}</div>
            <div>
              <div style={{fontFamily:BFD,fontSize:15,fontWeight:700,color:DS.label,letterSpacing:-0.2,marginBottom:3}}>{it.title}</div>
              <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"18px"}}>{it.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INDUSTRY DEEP DIVES (what BX does in each industry) ─────────
function IndustryDeepBlock() {
  const [ref,vis]=useInView();
  const [open,setOpen]=useState(-1);
  const dives=[
    {industry:"Девелопмент и недвижимость",result:"×20 рост ORBI Group",clients:"ORBI Group · PARQ Development · Укрбуд · ГК Пионер",what:"Полный цикл: от стратегии позиционирования до эксклюзивной продажи. Упаковка проекта, системы продаж (Sales xBook), обучение менеджеров, лидогенерация. Модель продакт-оунера — контроль всех отделов.",cl:"#FF9500"},
    {industry:"Промышленность и машиностроение",result:"$77B+ капитализация клиентов",clients:"ABB ($43B) · Eaton ($34.2B) · PF Capital",what:"Системы управления проектными продажами для транснациональных корпораций. Методология xSales, обучение и сертификация отделов продаж, стратегическое сопровождение крупнейших контрактов.",cl:"#5856D6"},
    {industry:"Потребительская электроника и MedTech",result:"CES Winner · Топ-5 Amazon",clients:"Bite Helper · Breathe Helper · Health Helper",what:"Полный цикл вывода продукта на глобальный рынок: от продуктовой стратегии до PR в Fox, CBS, ABC, Mashable. 160M+ медиа-охват. Выход на Amazon, розничные сети и аптеки.",cl:"#FF3B30"},
    {industry:"VR/AR и технологии",result:"Эксклюзивный партнёр Google",clients:"MaxboxVR · Google Cardboard",what:"Упаковка инвестиционной модели бренда для B2B масштабирования. 3000+ корпоративных клиентов из 100+ стран. Клиенты — бренды из Fortune Global 500.",cl:"#007AFF"},
    {industry:"Персональные бренды и продюсирование",result:"100M+ совокупная аудитория",clients:"Гарик Харламов · Пинтосевич · 2Space · Древс",what:"Стратегическое построение цифровой личности. Упаковка продуктовых линеек, контент-архитектура, монетизация аудитории. Результат — медийный актив с измеримой капитализацией.",cl:"#34C759"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Экспертиза по индустриям</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Не теория — конкретные проекты в каждой индустрии</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>В каждой индустрии — не теория, а конкретные проекты с измеримым результатом.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
        {dives.map((d,i)=>{
          const isOpen=open===i;
          return (
            <div key={i} onClick={()=>setOpen(isOpen?-1:i)} style={{
              background:isOpen?DS.bg:"rgba(0,0,0,0.02)",
              border:isOpen?".5px solid rgba(0,0,0,.06)":".5px solid rgba(0,0,0,.03)",borderRadius:DS.r.lg,
              boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
              padding:isOpen?"20px 18px":"16px 18px",cursor:"pointer",position:"relative",overflow:"hidden",
              transition:"all .35s cubic-bezier(.2,.8,.2,1)",
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:DS.s[3]}}>
                <div style={{display:"flex",alignItems:"center",gap:DS.s[3],flex:1,minWidth:0}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:d.cl,flexShrink:0,boxShadow:`0 0 8px ${d.cl}30`}}/>
                  <div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:DS.label,letterSpacing:-0.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.industry}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:DS.s[2],flexShrink:0}}>
                  <span style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:d.cl,background:`${d.cl}10`,borderRadius:DS.r.sm,padding:"3px 8px"}}>{d.result}</span>
                  <span style={{fontFamily:BFD,fontSize:16,color:DS.label4,transform:isOpen?"rotate(45deg)":"rotate(0deg)",transition:"transform .3s cubic-bezier(.2,.8,.2,1)"}}>+</span>
                </div>
              </div>
              <div style={{maxHeight:isOpen?400:0,overflow:"hidden",transition:"max-height .4s cubic-bezier(.2,.8,.2,1)"}}>
                <div style={{paddingTop:14}}>
                  <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:DS.label4,marginBottom:4}}>Клиенты</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label2,lineHeight:"18px",marginBottom:10}}>{d.clients}</div>
                  <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:DS.label4,marginBottom:4}}>Что делали</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,lineHeight:"18px"}}>{d.what}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// ─── FLOATING MOBILE CTA ─────────────────────────────────────────
function FloatingCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => {
      const contactEl = document.querySelector('.bx-contact');
      if (!contactEl) { setShow(window.scrollY > 600); return; }
      const rect = contactEl.getBoundingClientRect();
      setShow(window.scrollY > 600 && rect.top > window.innerHeight);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{
      position:"fixed",bottom:0,left:0,right:0,zIndex:99,
      padding:"12px clamp(16px,4vw,24px) max(12px,env(safe-area-inset-bottom))",
      background:"linear-gradient(0deg,rgba(255,255,255,.95) 60%,transparent)",
      transform:show?"translateY(0)":"translateY(100%)",
      transition:"transform .35s cubic-bezier(.2,.8,.2,1)",
      pointerEvents:show?"auto":"none",
    }}>
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <div onClick={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} style={{
          width:"100%",height:48,borderRadius:DS.r.btn,
          background:DS.blue,
          display:"flex",alignItems:"center",justifyContent:"center",gap:DS.s[2],
          cursor:"pointer",boxShadow:DS.sh[3],
        }}>
          <span style={{fontFamily:BFT,fontSize:15,fontWeight:600,color:DS.bg}}>Обсудить проект</span>
          <span style={{fontSize:16,color:"rgba(255,255,255,.6)"}}>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT TIERS (direct BX clients by scale) ──────────────────
function ClientTiers() {
  const [ref,vis]=useInView();
  const tiers=[
    {scale:"$1B+",label:"Корпорации",clients:["ABB","Eaton","PF Capital / ТМХ"],cl:DS.blue},
    {scale:"$100M+",label:"Крупный бизнес",clients:["ORBI Group","Укрбуд","ГК Пионер"],cl:"#007AFF"},
    {scale:"$10M+",label:"Средний бизнес",clients:["PARQ Development","MaxboxVR","Brilliance Events"],cl:"#5856D6"},
    {scale:"$1M+",label:"Растущие компании",clients:["Health Helper","Аквакласс","2Space"],cl:"#34C759"},
    {scale:"Персоны",label:"Личные бренды",clients:["Гарик Харламов","Пинтосевич","Владимир Древс"],cl:"#FF9500"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Клиенты</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Масштаб клиентов: от $1M до $43B</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
        {tiers.map((t,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:DS.s[4],
            background:DS.fill4,
            border:".5px solid rgba(60,60,67,0.12)",borderRadius:DS.r.btn,
            padding:"14px 16px",
            opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-12px)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.07}s`,
          }}>
            <div style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:t.cl,minWidth:70,textAlign:"right",letterSpacing:-0.5}}>{t.scale}</div>
            <div style={{width:1,height:28,background:DS.fill4,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:DS.label3,marginBottom:2}}>{t.label}</div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.clients.join(" · ")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ENGAGEMENT MATRIX (what's included per level) ───────────────
function EngagementMatrix() {
  const [ref,vis]=useInView();
  const features=["Стратегическая сессия","Аналитика рынка","Позиционирование","Сайт Brilliance","Фирменный стиль","Рекламные кампании","SEO и PR","Книга продаж","Обучение команды","Продакт-оунерство","AI-платформа","Ежемесячные отчёты"];
  const levels=[
    {name:"xLaunch",price:"от $5K",cols:[1,0,1,1,0,0,0,0,0,0,0,0]},
    {name:"xScale",price:"от $25K",cols:[1,1,1,1,1,1,0,0,0,0,0,1]},
    {name:"xDominate",price:"от $75K",cols:[1,1,1,1,1,1,1,1,1,0,0,1]},
    {name:"xPartner",price:"Rev Share",cols:[1,1,1,1,1,1,1,1,1,1,1,1]},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Сравнение</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Что входит в каждый уровень</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Что входит в каждый уровень сотрудничества.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",overflow:"hidden",position:"relative"}}>
        
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
          <table style={{borderCollapse:"collapse",width:"max-content",minWidth:"100%",fontFamily:BFT}}>
            <thead>
              <tr>
                <th style={{position:"sticky",left:0,zIndex:3,background:DS.bg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:500,color:DS.label3,borderBottom:".5px solid rgba(0,0,0,.06)",minWidth:160}}></th>
                {levels.map((l,i)=>(
                  <th key={i} style={{padding:"10px 12px",textAlign:"center",borderBottom:".5px solid rgba(0,0,0,.06)",minWidth:70}}>
                    <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:i===3?"#007AFF":"#000",letterSpacing:-0.2}}>{l.name}</div>
                    <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,marginTop:2}}>{l.price}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f,fi)=>(
                <tr key={fi}>
                  <td style={{position:"sticky",left:0,zIndex:2,background:DS.bg,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",padding:"8px 14px",fontSize:11,fontWeight:400,color:DS.label2,borderBottom:".5px solid rgba(0,0,0,.03)",whiteSpace:"nowrap"}}>{f}</td>
                  {levels.map((l,li)=>(
                    <td key={li} style={{padding:"8px 12px",textAlign:"center",fontSize:13,color:l.cols[fi]?(li===3?"#007AFF":"#000"):"rgba(0,0,0,.10)",fontWeight:l.cols[fi]&&li===3?600:400,borderBottom:".5px solid rgba(0,0,0,.03)"}}>{l.cols[fi]?"✓":"—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ─── SECTION DIVIDER (thin line) ─────────────────────────────────
function Divider() {
  return <div style={{maxWidth:960,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)"}}><div style={{height:".5px",background:DS.fill4}}/></div>;
}

// ─── PULL QUOTE (full-width magazine style) ──────────────────────
function PullQuote({ quote, author, role }: { quote: string; author: string; role: string }) {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"60px clamp(24px,6vw,48px)",textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{fontFamily:DS.fontText,fontSize:48,lineHeight:"32px",color:"rgba(0,0,0,.06)",marginBottom:8,userSelect:"none"}}>"</div>
      <div style={{fontFamily:BFD,fontSize:"clamp(20px,3.5vw,26px)",fontWeight:700,color:DS.label,letterSpacing:"-0.02em",lineHeight:1.3,fontStyle:"italic",marginBottom:DS.s[4]}}>«{quote}»</div>
      <div style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.label2}}>{author}</div>
      <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label4,marginTop:2}}>{role}</div>
    </div>
  );
}

// ─── COST OF INACTION ────────────────────────────────────────────
function CostOfInaction() {
  const [ref,vis]=useInView();
  const costs=[
    {metric:"−23%",desc:"Средняя потеря доли рынка за 2 года без системного маркетинга",source:"Harvard Business Review"},
    {metric:"×3.2",desc:"Во столько раз дороже обходится привлечение клиента бизнесу без бренда vs. с брендом",source:"McKinsey & Company"},
    {metric:"−40%",desc:"Снижение конверсии сайта без профессиональной упаковки и UX-архитектуры",source:"Forrester Research"},
  ];
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:12,fontWeight:600,letterSpacing:"0.01em",textTransform:"uppercase",color:DS.red,marginBottom:DS.s[2],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Цена бездействия</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Цена промедления</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[3]}}>
        {costs.map((c,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:DS.s[4],padding:"20px 0",borderBottom:i<costs.length-1?".5px solid rgba(0,0,0,.06)":"none",opacity:vis?1:0,transition:`opacity .5s ease ${.3+i*.1}s`}}>
            <div style={{fontFamily:BFD,fontSize:32,fontWeight:700,color:"rgba(200,60,60,.55)",letterSpacing:-1,lineHeight:1,minWidth:80,textAlign:"right",flexShrink:0}}>{c.metric}</div>
            <div>
              <div style={{fontFamily:BFT,fontSize:14,fontWeight:500,color:DS.label2,lineHeight:"20px"}}>{c.desc}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label4,marginTop:4}}>{c.source}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXCLUSIVITY SIGNAL ──────────────────────────────────────────
function ExclusivityBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"40px clamp(24px,6vw,48px)",textAlign:"center",opacity:vis?1:0,transition:"opacity .6s ease"}}>
      <div style={{display:"inline-flex",alignItems:"center",gap:DS.s[3],background:DS.fill4,borderRadius:DS.r.btn,padding:"14px 24px"}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:DS.red,boxShadow:DS.sh[2],animation:"bxPulse 2s ease infinite"}}/>
        <span style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.label2,letterSpacing:-0.1}}>Не более 5 проектов одновременно. Качество важнее количества.</span>
      </div>
      <style>{'@keyframes bxPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>
    </div>
  );
}

// ─── BACK TO TOP ─────────────────────────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 1200);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{
      position:"fixed",bottom:80,right:20,zIndex:98,
      width:40,height:40,borderRadius:DS.r.md,
      background:DS.bg,
      border:".5px solid rgba(60,60,67,0.12)",boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
      display:"flex",alignItems:"center",justifyContent:"center",
      cursor:"pointer",
      opacity:show?1:0,transform:show?"translateY(0)":"translateY(12px)",
      transition:"all .3s cubic-bezier(.2,.8,.2,1)",
      pointerEvents:show?"auto":"none",
    }}>
      <span style={{fontFamily:BFD,fontSize:16,color:DS.label3,lineHeight:1}}>↑</span>
    </div>
  );
}


// ─── BRAND MANIFESTO (power claim) ───────────────────────────────
function ManifestoBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"all .8s cubic-bezier(.2,.8,.2,1)"}}>
      <h2 style={{fontFamily:BFD,fontSize:"clamp(24px,4.5vw,32px)",fontWeight:700,color:DS.label,letterSpacing:"-0.025em",lineHeight:1.2,margin:"0 0 20px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all .6s ease .2s"}}>Вы видели их на обложках, читали их книги, покупали их продукты.</h2>
      <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"24px",color:DS.label2,margin:"0 0 24px",opacity:vis?1:0,transition:"opacity .6s ease .4s"}}>Мы — те, кто сделали их медийными, богатыми и влиятельными. Наш маркетинг стоит дорого, но наши клиенты зарабатывают ещё больше. Мы помогаем строить бизнесы, которые оставляют след в истории.</p>
      <div style={{display:"flex",justifyContent:"center",gap:DS.s[3],opacity:vis?1:0,transition:"opacity .6s ease .6s"}}>
        <img src="https://static.tildacdn.net/tild3733-3933-4430-b664-343465353562/forbes.svg" alt="Forbes" style={{height:16,opacity:.35}}/>
        <img src="https://static.tildacdn.net/tild3764-6661-4136-b465-323638613235/fortune.svg" alt="Fortune" style={{height:16,opacity:.35}}/>
      </div>
    </div>
  );
}

// ─── CLIENT TYPES CASCADE ────────────────────────────────────────
function ClientTypesBlock() {
  const [ref,vis]=useInView();
  const types = "Блогеры · инфлюенсеры · звёзды · медийные личности · фаундеры · стартапы · застройщики · банки · государства · миллиардные компании · бестселлеры · венчурные фонды · luxury-бренды · криптопроекты · private banking · девелоперы · инвестиционные фонды · премиальные сервисы · IT-гиганты · HNWI · международные корпорации · элитная недвижимость · fashion · эксклюзивные клубы · автоконцерны · спортивные организации · энергетические холдинги · фармацевтика · аукционные дома · premium FMCG · люксовые отели · fintech · закрытые сообщества";
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"60px clamp(24px,6vw,48px)",textAlign:"center",opacity:vis?1:0,transition:"opacity .8s ease"}}>
      <div style={{fontFamily:BFT,fontSize:"clamp(13px,2vw,15px)",fontWeight:400,color:DS.label4,lineHeight:"24px",letterSpacing:0.2,opacity:vis?1:0,transition:"opacity 1s ease .3s"}}>{types}</div>
    </div>
  );
}

// ─── PARQ FLAGSHIP CASE ──────────────────────────────────────────
function FlagshipPARQ() {
  const [ref,vis]=useInView(0.05);
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.label,borderRadius:DS.r.xl,overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(0,0,0,.3) 0%,rgba(0,0,0,.85) 100%)",zIndex:1}}/>
        <div style={{position:"absolute",top:"-30%",left:"-20%",width:"140%",height:"100%",background:"radial-gradient(ellipse,rgba(52,199,89,.06) 0%,transparent 70%)",zIndex:0}}/>
        <div style={{position:"relative",zIndex:2,padding:"clamp(28px,6vw,48px)"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:DS.s[2],background:DS.fill4,backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.10)",borderRadius:DS.r.sm,padding:"5px 12px",marginBottom:20,opacity:vis?1:0,transition:"opacity .5s ease .2s"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:DS.green}}/>
            <span style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.60)"}}>Flagship Case</span>
          </div>
          <div style={{marginBottom:6,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all .6s ease .3s"}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.30)",marginBottom:6}}>Bali · Indonesia · 2020–2024</div>
            <h3 style={{fontFamily:BFD,fontSize:"clamp(28px,6vw,34px)",fontWeight:700,color:DS.bg,letterSpacing:"-0.03em",lineHeight:1,margin:0}}>PARQ Development</h3>
            <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:"20px",marginTop:10,maxWidth:440}}>Крупнейший и самый быстрорастущий застройщик Бали. После пандемии и начала войны возникла потребность в комфортной недвижимости вдали от конфликта.</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,margin:"28px 0 24px",background:DS.fill4,borderRadius:DS.r.lg,overflow:"hidden",opacity:vis?1:0,transition:"opacity .6s ease .5s"}}>
            {[{v:"№1",l:"Застройщик Бали",sub:"за 1 год"},{v:"8",l:"Городов строится",sub:"масштабирование"},{v:"2,000",l:"Посетителей в день",sub:"PARQ Ubud"}].map((k,i)=>(
              <div key={i} style={{padding:"20px 16px",background:DS.fill4,textAlign:"center"}}>
                <div style={{fontFamily:BFD,fontSize:28,fontWeight:700,color:DS.green,letterSpacing:-1,lineHeight:1}}>{k.v}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(235,235,245,.60)",marginTop:6}}>{k.l}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.30)",marginTop:2}}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:DS.s[3],padding:"14px 16px",background:DS.fill4,borderRadius:DS.r.btn,border:"none",opacity:vis?1:0,transition:"opacity .6s ease .6s"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:DS.green,letterSpacing:-0.2}}>Billions X Game Changer</div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.60)",lineHeight:"17px",marginTop:4}}>Дали старт всему маркетингу. Упаковали виллы для рекламных коллабораций с крупными блогерами. Распродали целый район вилл. За год PARQ стал №1 застройщиком острова.</div>
            </div>
          </div>
          <div style={{marginTop:DS.s[4],opacity:vis?1:0,transition:"opacity .6s ease .7s"}}>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,fontStyle:"italic",color:"rgba(235,235,245,.30)",lineHeight:"17px"}}>«PARQ Development придумала и реализовала концепцию «нового Бали» — места для экспатов, где можно жить, работать и инвестировать в недвижимость.»</div>
            <div style={{display:"flex",alignItems:"center",gap:DS.s[2],marginTop:8}}>
              <img src="https://static.tildacdn.net/tild6230-3237-4364-b436-396466653435/forbes.svg" alt="Forbes" style={{height:12,opacity:.5,filter:"invert(1)"}}/>
              <span style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.30)"}}>Forbes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVESTMENT JUSTIFICATION (emotional) ────────────────────────
function InvestBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.fill4,borderRadius:DS.r.xl,padding:"48px clamp(20px,5vw,40px)",position:"relative",overflow:"hidden"}}>
        
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .2s"}}>Окупаемость</div>
          <h2 style={{fontFamily:BFD,fontSize:"clamp(24px,5vw,32px)",fontWeight:700,color:DS.label,letterSpacing:"-0.025em",lineHeight:1.15,margin:"0 0 20px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"all .6s ease .3s"}}>Наш маркетинг стоит дорого.<br/>Но наши клиенты зарабатывают ещё больше.</h2>
          <div style={{display:"flex",justifyContent:"center",gap:DS.s[6],flexWrap:"wrap",marginBottom:DS.s[6],opacity:vis?1:0,transition:"opacity .5s ease .5s"}}>
            {[{v:"5:1",l:"Средний ROI"},{v:"87%",l:"Продлевают контракт"},{v:"12–18 мес.",l:"До полной окупаемости"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:DS.blue,letterSpacing:-0.5}}>{s.v}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,lineHeight:"22px",maxWidth:480,margin:"0 auto",opacity:vis?1:0,transition:"opacity .5s ease .6s"}}>Кроме быстрой окупаемости, Billions X — это качественный прорыв и выход в высшую лигу. В вашей команде появится совершенно другая уверенность в победе, и бренд обретёт ощутимую ценность на рынке.</p>
        </div>
      </div>
    </div>
  );
}


// ─── METHODOLOGY FLOW (visual SVG diagram) ──────────────────────
function MethodologyFlow() {
  const [ref,vis]=useInView();
  const steps=[
    {x:"xVision",label:"Стратегия",desc:"Анализ → позиционирование → книга стратегии",cl:"#5856D6"},
    {x:"xProduction",label:"Упаковка",desc:"Бренд → сайт → контент → UX",cl:"#007AFF"},
    {x:"xPerformance",label:"Рост",desc:"Реклама → SEO → PR → репутация",cl:"#34C759"},
    {x:"xSales",label:"Продажи",desc:"Методология → обучение → закрытие сделок",cl:"#FF9500"},
  ];
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Методология</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Четыре звена одной цепи</h2>
      </div>
      <div style={{display:"flex",alignItems:"stretch",gap:0,position:"relative"}}>
        {steps.map((s,i)=>(
          <div key={i} style={{flex:1,position:"relative",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.12}s`}}>
            {/* Connector line */}
            {i<steps.length-1&&<div style={{position:"absolute",top:20,right:0,width:"50%",height:2,background:`linear-gradient(90deg,${s.cl}40,${steps[i+1].cl}40)`,zIndex:0}}/>}
            {i>0&&<div style={{position:"absolute",top:20,left:0,width:"50%",height:2,background:`linear-gradient(90deg,${steps[i-1].cl}40,${s.cl}40)`,zIndex:0}}/>}
            {/* Node */}
            <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"0 8px"}}>
              <div style={{width:40,height:40,borderRadius:DS.r.md,background:`${s.cl}10`,border:`1.5px solid ${s.cl}30`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:s.cl,boxShadow:`0 0 12px ${s.cl}40`}}/>
              </div>
              <div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:s.cl,letterSpacing:".04em",marginBottom:4}}>{s.x}</div>
              <div style={{fontFamily:BFD,fontSize:15,fontWeight:700,color:DS.label,letterSpacing:-0.3,marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label3,lineHeight:"15px"}}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:28,opacity:vis?1:0,transition:"opacity .5s ease .8s"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:DS.s[2],background:DS.fill4,borderRadius:DS.r.md,padding:"10px 20px"}}>
          <span style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label2}}>Каждый этап усиливает следующий. Убери один — система ломается.</span>
        </div>
      </div>
    </div>
  );
}

// ─── ONBOARDING PREVIEW (first week) ─────────────────────────────
function OnboardingBlock() {
  const [ref,vis]=useInView();
  const days=[
    {day:"День 1",title:"Знакомство",desc:"Звонок с управляющим партнёром. Погружение в бизнес, продукт, амбиции. Без брифов — живой диалог."},
    {day:"День 2–3",title:"Экспресс-аудит",desc:"Анализ текущего позиционирования, сайта, конкурентов, рекламы. Первые находки и гипотезы."},
    {day:"День 4–5",title:"Стратегическая сессия",desc:"Презентация аудита. Совместная работа над приоритетами. Формирование плана первых 90 дней."},
    {day:"День 6–7",title:"Запуск",desc:"Подписание договора. Старт работ по согласованному плану. Назначение ответственных. Первые задачи в работе."},
  ];
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Первая неделя</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Семь дней от разговора до результата</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>От первого звонка до первых задач в работе — 7 дней.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3]}}>
        {days.map((d,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.lg,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"20px 16px",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(10px) scale(0.97)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
          }}>
            
            <div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:DS.blue,letterSpacing:".04em",marginBottom:6}}>{d.day}</div>
            <div style={{fontFamily:BFD,fontSize:15,fontWeight:700,color:DS.label,letterSpacing:-0.2,marginBottom:4}}>{d.title}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px"}}>{d.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PERFORMANCE GUARANTEE ───────────────────────────────────────
function GuaranteeBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.fill4,border:"1px solid rgba(0,122,255,.08)",borderRadius:DS.r.xl,padding:"40px clamp(20px,5vw,36px)",position:"relative",overflow:"hidden",textAlign:"center"}}>
        <div style={{position:"absolute",top:0,left:"6%",right:"6%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(0,122,255,.15),transparent)",pointerEvents:"none"}}/>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,122,255,.50)",marginBottom:DS.s[4],opacity:vis?1:0,transition:"opacity .5s ease .2s"}}>Гарантия результата</div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(22px,4vw,28px)",fontWeight:700,color:DS.label,letterSpacing:"-0.02em",lineHeight:1.2,margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:"all .6s ease .3s"}}>Если за первые 90 дней вы не видите измеримый прогресс — мы пересматриваем стратегию за свой счёт.</h2>
        <p style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"20px",maxWidth:480,margin:"0 auto 20px",opacity:vis?1:0,transition:"opacity .5s ease .5s"}}>Мы не прячемся за мелким шрифтом. Наши модели партнёрства (xEquity, xRevenue, xOwnership) привязаны к вашему результату. Мы зарабатываем только когда зарабатываете вы.</p>
        <div style={{display:"flex",justifyContent:"center",gap:DS.s[5],flexWrap:"wrap",opacity:vis?1:0,transition:"opacity .5s ease .6s"}}>
          {[{v:"90 дней",l:"Контрольная точка"},{v:"KPI",l:"Согласованные метрики"},{v:"0 ₽",l:"За пересмотр стратегии"}].map((s,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{fontFamily:BFD,fontSize:20,fontWeight:700,color:DS.blue,letterSpacing:-0.3}}>{s.v}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── SUCCESS STORY NARRATIVE (emotional, not metrics) ────────────
function SuccessStory() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"60px clamp(24px,6vw,48px)",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:DS.fill4,borderRadius:DS.r.card,padding:"32px clamp(20px,5vw,32px)",position:"relative"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,marginBottom:14}}>Как это работает</div>
        <div style={{fontFamily:BFD,fontSize:"clamp(17px,3vw,20px)",fontWeight:600,color:DS.label,letterSpacing:-0.3,lineHeight:1.4,marginBottom:DS.s[4]}}>В 2022 году ORBI Group была локальной строительной компанией в Батуми. Через 18 месяцев работы с Billions X — 55 офисов в 19 странах, международная награда FIABCI и статус крупнейшего гостиничного комплекса в мире.</div>
        <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:DS.label2,lineHeight:"21px"}}>Это не реклама. Это результат системной работы: стратегия → упаковка → стандарты продаж → обучение 55 офисов → единая методология. Billions X работал как продакт-оунер внутри компании, контролируя каждый отдел.</div>
        <div style={{marginTop:DS.s[4],display:"flex",alignItems:"center",gap:DS.s[2]}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:DS.green}}/>
          <span style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.label3}}>Рост в 20 раз за 1.5 года — подтверждённый результат</span>
        </div>
      </div>
    </div>
  );
}

// ─── TECHNOLOGY STACK ────────────────────────────────────────────
function TechStackBlock() {
  const [ref,vis]=useInView();
  const stack=[
    {cat:"Стратегия и аналитика",tools:["BI-дашборды","Конкурентная разведка","Семантический анализ","Финансовое моделирование"]},
    {cat:"Дизайн и упаковка",tools:["Figma","Adobe CC","3D/рендеры","Моушн-дизайн"]},
    {cat:"Разработка",tools:["Next.js","React","Supabase","Vercel","Node.js"]},
    {cat:"AI и автоматизация",tools:["Claude AI","GPT-4","Computer Vision","NLP-модели"]},
    {cat:"Маркетинг и аналитика",tools:["Meta Ads","Google Ads","SEO-платформы","CRM-системы"]},
  ];
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Инструменты</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Технологический арсенал</h2>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:DS.s[3]}}>
        {stack.map((s,si)=>(
          <div key={si} style={{
            background:DS.bg,
            border:"none",borderRadius:DS.r.lg,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"14px 16px",flex:"0 1 auto",minWidth:160,
            opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.95)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+si*.08}s`,
          }}>
            <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:DS.label,letterSpacing:-0.1,marginBottom:6}}>{s.cat}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
              {s.tools.map((t,ti)=>(
                <span key={ti} style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label3,background:DS.fill4,borderRadius:DS.r.xs,padding:"2px 8px"}}>{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUICK START CTA (lightweight entry) ─────────────────────────
function QuickStartBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"40px clamp(24px,6vw,48px) 40px",opacity:vis?1:0,transition:"opacity .6s ease"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:DS.s[4],background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"20px 24px",position:"relative",overflow:"hidden"}}>
        
        <div>
          <div style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:DS.label,letterSpacing:-0.3}}>Не готовы к большому проекту?</div>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:DS.label2,marginTop:2}}>Начните с экспресс-диагностики xScan — от $5,000. Результат за 2 недели.</div>
        </div>
        <div onClick={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.bg,background:DS.blue,borderRadius:DS.r.md,padding:"10px 20px",cursor:"pointer",boxShadow:DS.sh[2],flexShrink:0}}>Заказать xScan</div>
      </div>
    </div>
  );
}


// ─── DIRECT CLIENT LOGOS (BX's own clients, not MaxboxVR) ────────
function DirectClientLogos() {
  const [ref,vis]=useInView();
  const clients=[
    {name:"ORBI Group",sub:"Батуми"},{name:"PARQ",sub:"Бали"},{name:"ABB",sub:"Цюрих"},{name:"Eaton",sub:"Дублин"},
    {name:"PF Capital",sub:"Москва"},{name:"Укрбуд",sub:"Киев"},{name:"ГК Пионер",sub:"Москва"},{name:"MaxboxVR",sub:"Лондон"},
    {name:"Health Helper",sub:"Нью-Йорк"},{name:"Brilliance",sub:"Москва"},{name:"2Space",sub:"Тель-Авив"},{name:"Аквакласс",sub:"Москва"},
  ];
  return (
    <div ref={ref} style={{maxWidth:960,margin:"0 auto",padding:"60px clamp(24px,6vw,48px)",opacity:vis?1:0,transition:"opacity .7s ease"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[6]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label4,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Работали напрямую</div>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:DS.s[2]}}>
        {clients.map((c,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",gap:DS.s[2],
            background:DS.fill4,borderRadius:DS.r.md,padding:"8px 14px",
            opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.9)",
            transition:`all .4s cubic-bezier(.2,.8,.2,1) ${.2+i*.04}s`,
          }}>
            <div style={{fontFamily:BFD,fontSize:12,fontWeight:700,color:DS.label,letterSpacing:-0.2}}>{c.name}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:DS.label4}}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEWSLETTER SUBSCRIBE ────────────────────────────────────────
function NewsletterBlock() {
  const [ref,vis]=useInView();
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const submit=async()=>{
    if(!email||!email.includes("@"))return;
    try{
      await fetch("https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/bx_leads",{method:"POST",headers:{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg"},body:JSON.stringify({name:"Newsletter",phone:email,revenue:"subscribe",message:"Newsletter subscription"})});
      setSent(true);
    }catch(e){}
  };
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"60px clamp(24px,6vw,48px)",opacity:vis?1:0,transition:"opacity .6s ease"}}>
      <div style={{background:"rgba(255,255,255,.52)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:"0.5px solid rgba(255,255,255,.30)",borderRadius:DS.r.card,boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",padding:"24px",position:"relative",overflow:"hidden"}}>
        
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:DS.s[4]}}>
          <div>
            <div style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:DS.label,letterSpacing:-0.3}}>Подпишитесь на insights</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,marginTop:2}}>Стратегии, кейсы, методологии — раз в месяц.</div>
          </div>
          {sent ? (
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:DS.green}}>✓ Подписано</div>
          ) : (
            <div style={{display:"flex",gap:DS.s[2]}}>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{fontFamily:BFT,fontSize:13,padding:"10px 14px",borderRadius:DS.r.md,border:".5px solid rgba(60,60,67,0.12)",background:DS.bg,outline:"none",width:200,color:DS.label}}/>
              <div onClick={submit} style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.bg,background:DS.blue,borderRadius:DS.r.md,padding:"10px 18px",cursor:"pointer",boxShadow:DS.sh[2],flexShrink:0}}>OK</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CAREERS SIGNAL ──────────────────────────────────────────────
function CareersBlock() {
  const [ref,vis]=useInView();
  const roles=[
    {title:"Senior Strategist",type:"Стратегия",loc:"Remote"},
    {title:"Performance Marketing Lead",type:"Маркетинг",loc:"Remote"},
    {title:"Full-Stack Developer (AI)",type:"Технологии",loc:"Remote"},
  ];
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Открытые позиции</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Ищем тех, кто не боится масштаба</h2>
        <p style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:DS.label2,margin:0,opacity:vis?1:0,transition:"opacity .5s ease .3s"}}>Открытые позиции для тех, кто хочет работать с лучшими.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:DS.s[2]}}>
        {roles.map((r,i)=>(
          <div key={i} style={{
            display:"flex",alignItems:"center",justifyContent:"space-between",
            background:DS.bg,
            border:"none",borderRadius:DS.r.btn,
            boxShadow:"inset 0 0.5px 0 rgba(255,255,255,.40), 0 2px 8px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
            padding:"14px 18px",
            opacity:vis?1:0,transition:`opacity .5s ease ${.3+i*.1}s`,
          }}>
            <div>
              <div style={{fontFamily:BFD,fontSize:14,fontWeight:700,color:DS.label,letterSpacing:-0.2}}>{r.title}</div>
              <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:DS.label2,marginTop:1}}>{r.type} · {r.loc}</div>
            </div>
            <div onClick={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} style={{fontFamily:BFT,fontSize:12,fontWeight:500,color:DS.blue,cursor:"pointer"}}>Откликнуться →</div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── MARKET CONTEXT (macro situation) ────────────────────────────
function MarketContext() {
  const [ref,vis]=useInView();
  const signals=[
    {label:"Пост-пандемия",desc:"Рынки перестроились. Бизнесы, не адаптировавшие цифровое присутствие после 2020–2022, потеряли более 60% своих возможностей."},
    {label:"Геополитика",desc:"Гибридная третья мировая война, санкции, релокация. Сотни тысяч бизнесов ищут новые рынки и способы выживания. Нужно глобальное переосмысление продуктов и их подачи."},
    {label:"AI-революция",desc:"К 2027 году 75% компаний без AI потеряют конкурентоспособность. Те, кто внедрят сейчас — получат беспрецедентное преимущество."},
    {label:"Кризис внимания",desc:"Средний пользователь видит 10,000+ рекламных сообщений в день. Без сильного продукта и системной упаковки бренд попадает в категорию спама."},
  ];
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"48px clamp(24px,6vw,48px) 48px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[6]}}>
        <div style={{fontFamily:BFT,fontSize:12,fontWeight:600,letterSpacing:"0.01em",textTransform:"uppercase",color:DS.red,marginBottom:DS.s[2],opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Контекст 2026</div>
        <h2 style={{fontFamily:BFD,fontSize:"clamp(28px,6vw,34px)",fontWeight:700,letterSpacing:"-0.025em",lineHeight:1.05,color:DS.label,margin:"0 0 12px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Мир изменился.<br/>Маркетинг большинства — нет.</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:DS.s[3]}}>
        {signals.map((s,i)=>(
          <div key={i} style={{
            background:DS.bg,
            border:"0.5px solid rgba(0,0,0,.06)",borderRadius:DS.r.lg,
            boxShadow:"0 2px 8px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.03)",
            padding:"20px 16px",position:"relative",overflow:"hidden",
            opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",
            transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.1}s`,
          }}>
            
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:DS.label,letterSpacing:-0.08,marginBottom:DS.s[2]}}>{s.label}</div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2,lineHeight:"16px"}}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RULES OF BX (philosophy, like "Правила Лебедева") ───────────
function RulesBlock() {
  const [ref,vis]=useInView();
  const rules=[
    {n:"01",rule:"Не берём проект, в который не верим."},
    {n:"02",rule:"Управляющий партнёр ведёт каждый проект лично."},
    {n:"03",rule:"Мы не продаём часы. Мы продаём результат."},
    {n:"04",rule:"Стратегия без исполнения — макулатура. Исполнение без стратегии — расточительство."},
    {n:"05",rule:"Клиент может уйти в любой момент. Мы удерживаем результатом, а не контрактом."},
    {n:"06",rule:"Каждый пиксель — как если бы это делала Apple."},
    {n:"07",rule:"AI — наш инструмент, но не наша замена. Решения принимают люди с опытом."},
    {n:"08",rule:"Мы зарабатываем только когда зарабатывает клиент."},
  ];
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:DS.s[8]}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:DS.label3,marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Принципы</div>
        <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:700,letterSpacing:"-0.02em",lineHeight:1,color:DS.label,margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Восемь правил, которые мы не нарушаем</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {rules.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"baseline",gap:DS.s[4],padding:"16px 0",borderBottom:i<rules.length-1?".5px solid rgba(0,0,0,.06)":"none",opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-12px)",transition:`all .5s cubic-bezier(.2,.8,.2,1) ${.3+i*.06}s`}}>
            <div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:DS.label4,letterSpacing:".04em",flexShrink:0,minWidth:24,textAlign:"right"}}>{r.n}</div>
            <div style={{fontFamily:BFD,fontSize:"clamp(15px,2.5vw,17px)",fontWeight:600,color:DS.label,letterSpacing:-0.2,lineHeight:1.35}}>{r.rule}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── POSITIONING STATEMENT ───────────────────────────────────────
function PositioningBlock() {
  const [ref,vis]=useInView();
  return (
    <div ref={ref} style={{maxWidth:680,margin:"0 auto",padding:"80px clamp(24px,6vw,48px) 80px",textAlign:"center",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"all .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{fontFamily:BFD,fontSize:"clamp(28px,6vw,42px)",fontWeight:700,color:DS.label,letterSpacing:"-0.03em",lineHeight:1.1,marginBottom:20}}>Мы — не агентство.<br/>Мы — не фрилансеры.<br/>Мы — не AI.</div>
      <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"24px",color:DS.label2,margin:"0 auto",maxWidth:520}}>Billions X — это студия стратегического маркетинга и технологий, которая работает как партнёр внутри бизнеса. Мы берём ответственность за результат, потому что наше вознаграждение привязано к вашему росту.</p>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────
export default function BXLanding({ cases, products, team, testimonials = [] }: { cases: BXCase[]; products: BXProduct[]; team: BXTeamMember[]; testimonials?: BXTestimonial[] }) {
  const [ready, setReady] = useState(false);
  const [activeCase, setActiveCase] = useState<BXCase|null>(null);
  useEffect(() => { setReady(true); }, []);
  const logo = useFadeRight(ready, 0);      // Tilda: fadeinright, 25px
  const sub = useZoom(ready, 0, 0.95);     // Tilda: zoomin, scale 0.95
  const body = useSpring(ready, 100);      // Tilda: fadeinup, 25px, delay 0.1s

  return (
    <div style={{width:"100%",minHeight:"100dvh",background:DS.bg,position:"relative"}}>
      <ScrollProgress />
      <FloatingCTA />
      <BackToTop />
      <StickyNav onContact={()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'})} />
      <div style={{position:"relative",width:"100%",background:DS.bg}}>
        <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:960,padding:"96px clamp(24px,6vw,48px) 48px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{opacity:logo.opacity,transform:`translateX(${logo.x}px)`,transition:"opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1), transform 1s cubic-bezier(0.215, 0.61, 0.355, 1)",willChange:"transform,opacity",marginBottom:DS.s[4],textAlign:"center"}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,letterSpacing:0,textTransform:"uppercase",color:DS.label3}}>Маркетинг богатых и очень богатых</div>
          </div>
          <div style={{opacity:sub.opacity,transform:`scale(${sub.scale})`,transition:"opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1), transform 1s cubic-bezier(0.215, 0.61, 0.355, 1)",willChange:"transform,opacity",textAlign:"center"}}>
            <h1 style={{fontFamily:BFD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:DS.label,letterSpacing:"-0.04em",lineHeight:1,margin:0}}>Billions X</h1>
          </div>
          <div style={{opacity:body.opacity,transform:`translateY(${body.y}px)`,transition:"opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1), transform 1s cubic-bezier(0.215, 0.61, 0.355, 1)",willChange:"transform,opacity",textAlign:"center",maxWidth:580,marginTop:DS.s[6]}}>
            <p style={{fontFamily:BFT,fontSize:"clamp(17px,2.2vw,19px)",fontWeight:400,letterSpacing:"-0.02em",lineHeight:1.55,color:DS.label2,margin:0}}>Приносим «иксы»  денег, создавая архитектуру роста бизнеса как целостную систему, где стратегия, смыслы, бренды, линейка продуктов, упаковка, сайты, приложения, реклама, продажи и технологии — работают в едином механизме.</p>
          </div>

          <div style={{opacity:body.opacity,transform:`translateY(${body.y}px)`,transition:"opacity 1s cubic-bezier(0.215, 0.61, 0.355, 1), transform 1s cubic-bezier(0.215, 0.61, 0.355, 1)",marginTop:DS.s[5],display:"flex",alignItems:"center",justifyContent:"center",gap:DS.s[2]}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:DS.green}}/>
            <span style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:DS.label2}}>ABB, Eaton, ORBI Group, PARQ Development доверили нам свой рост</span>
          </div>
          <Visual active={ready} delay={200} />
        </div>
        {/* ── MARKET CONTEXT ── */}
        <MarketContext />
        {/* ── NUMBERS ── */}
        <NumbersBlock />
        {/* ── CASES ── */}
        <div className="bx-cases" style={{background:DS.bg}}><CasesBlock cases={cases} onCaseClick={setActiveCase} /></div>
        {/* ── RESULTS ── */}
        <div style={{background:DS.bg2}}><ResultsBlock /></div>
        {/* ── MANIFESTO ── */}
        <div style={{background:DS.bg}}><ManifestoBlock /></div>
        {/* ── POSITIONING ── */}
        <div style={{background:DS.bg}}><PositioningBlock /></div>
        {/* ── CLIENT TYPES ── */}
        <div style={{background:DS.bg}}><ClientTypesBlock /></div>
        {/* ── AWARDS ── */}
        <div style={{background:DS.bg2}}><AwardsBlock /></div>
        <Divider />
        {/* ── FLAGSHIP CASE ── */}
        <div style={{background:DS.bg2}}><FlagshipCaseBlock /></div>
        {/* ── FLAGSHIP PARQ ── */}
        <div style={{background:DS.bg2}}><FlagshipPARQ /></div>
        {/* ── SUCCESS STORY ── */}
        <div style={{background:DS.bg}}><SuccessStory /></div>
        {/* ── CTA BREAKER ── */}
        <div style={{background:DS.bg}}><CTABreaker text="Готовы к такому же росту?" sub="Первая стратегическая сессия — бесплатно." accent="Ваш ход" /></div>
        {/* ── FORTUNE 500 MARQUEE ── */}
        <div style={{background:DS.bg}}><div><BrandsBlock /></div></div>
        {/* ── DIRECT CLIENT LOGOS ── */}
        <div style={{background:DS.bg}}><DirectClientLogos /></div>
        {/* ── PRESS & MEDIA ── */}
        <div style={{background:DS.bg}}><PressBlock /></div>
        {/* ── STARS TESTIMONIALS ── */}
        <div style={{background:DS.bg}}><StarsBlock /></div>
        <Divider />
        {/* ── BEFORE/AFTER ── */}
        <div style={{background:DS.bg2}}><TransformBlock /></div>
        {/* ── CLIENT DASHBOARD ── */}
        <div style={{background:DS.bg2}}><ClientDashboard /></div>
        {/* ── UNIQUENESS TABLE ── */}
        <div style={{background:DS.bg2}}><UniquenessBlock /></div>
        {/* ── PULL QUOTE ── */}
        <PullQuote quote="Billions X — это не агентство. Это партнёр, который думает масштабом вашего бизнеса и отвечает за результат как совладелец." author="Борис Прядкин" role="Управляющий партнёр · Co-Founder" />
        <Divider />
        {/* ── PERSONAL APPROACH ── */}
        <div style={{background:DS.bg}}><PersonalBlock /></div>
        {/* ── MISSION + FOUNDERS ── */}
        <div style={{background:DS.bg2}}><MissionBlock /><FoundersBlock /><ClientTiers /></div>
        {/* ── HOW WE WORK + TEAM ── */}
        <div className="bx-process" style={{background:DS.bg2}}><ProcessBlock /><TeamBench /></div>
        {/* ── ONBOARDING PREVIEW ── */}
        <div style={{background:DS.bg}}><OnboardingBlock /></div>
        {/* ── VALUE PROPS ── */}
        <div style={{background:DS.bg}}><ValuePropsBlock /></div>
        {/* ── INVEST JUSTIFICATION ── */}
        <div style={{background:DS.bg}}><InvestBlock /></div>
        {/* ── ROI CALCULATOR ── */}
        <div style={{background:DS.bg}}><ROICalculator /></div>
        <ExclusivityBlock />
        <Divider />
        {/* ── PRODUCT ECOSYSTEM + CATALOG ── */}
        <div className="bx-products" style={{background:DS.bg2}}><ProductEcosystem products={products} /><ProductsBlock /></div>
        {/* ── INDUSTRIES ── */}
        <div style={{background:DS.bg}}><IndustriesBlock /></div>
        {/* ── INDUSTRY DEEP DIVES ── */}
        <div style={{background:DS.bg}}><IndustryDeepBlock /></div>
        {/* ── INSIGHTS ── */}
        <div style={{background:DS.bg}}><InsightsBlock /></div>
        {/* ── NEWSLETTER ── */}
        <div style={{background:DS.bg}}><NewsletterBlock /></div>
        {/* ── COST OF INACTION ── */}
        <div style={{background:DS.bg2}}><CostOfInaction /></div>
        <Divider />
        {/* ── LAWS ── */}
        <div style={{background:DS.bg}}><LawsCarousel /></div>
        {/* ── RULES OF BX ── */}
        <div style={{background:DS.bg}}><RulesBlock /></div>
        {/* ── SYSTEMS ── */}
        <div style={{background:DS.bg2}}><SystemsBlock /></div>
        {/* ── METHODOLOGY FLOW ── */}
        <div style={{background:DS.bg2}}><MethodologyFlow /></div>
        {/* ── TECH STACK ── */}
        <div style={{background:DS.bg}}><TechStackBlock /></div>
        {/* ── TIMELINE + MOAT + TRUST ── */}
        <div style={{background:DS.bg2}}><TimelineBlock /><MoatBlock /><TrustBlock /></div>
        {/* ── GEOGRAPHY ── */}
        <div style={{background:DS.bg2}}><GeographyBlock /></div>
        {/* ── SOCIAL IMPACT ── */}
        <div style={{background:DS.bg}}><ImpactBlock /></div>
        {/* ── CAREERS ── */}
        <div style={{background:DS.bg}}><CareersBlock /></div>
        {/* ── PARTNERSHIP NAV ── */}
        <div style={{background:DS.bg}}><div><PartnershipNav /></div></div>
        {/* ── ENGAGEMENT MATRIX ── */}
        <div style={{background:DS.bg2}}><EngagementMatrix /></div>
        {/* ── FORMULAS ── */}
        <div style={{background:DS.bg}}><FormulasBlock /></div>
        {/* ── FAQ ── */}
        <div className="bx-faq" style={{background:DS.bg2}}><FAQBlock /></div>
        {/* ── QUICK START ── */}
        <div style={{background:DS.bg}}><QuickStartBlock /></div>
        {/* ── ANTI-PITCH ── */}
        <div style={{background:DS.bg}}><AntiPitchBlock /></div>
        {/* ── PERFORMANCE GUARANTEE ── */}
        <div style={{background:DS.bg2}}><GuaranteeBlock /></div>
        {/* ── CTA BREAKER 2 ── */}
        <div style={{background:DS.bg}}><CTABreaker text="Хватит откладывать рост." accent="Начнём" /></div>
        <Divider />
        {/* ── CLIENT TESTIMONIALS ── */}
        <div style={{background:DS.bg}}><TestimonialsBlock testimonials={testimonials} cases={cases} /></div>
        {/* ── CONTACT ── */}
        <div className="bx-contact" style={{background:DS.bg2}}><ContactBlock /></div>
        {/* ── FOOTER ── */}
        <BXFooter />
      </div>
      {activeCase && <CaseModal c={activeCase} testimonial={testimonials.find(t=>t.case_id===activeCase.id)} onClose={()=>setActiveCase(null)} />}
    </div>
  );
}

