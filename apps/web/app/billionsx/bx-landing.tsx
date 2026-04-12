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

const BFD = "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif";
const BFT = "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif";

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
  const [st, setSt] = useState({ opacity: 0, y: 40 });
  const ran = useRef(false);
  useEffect(() => {
    if (!active || ran.current) return;
    const t = setTimeout(() => {
      ran.current = true;
      let vel = 0, cur = 40, op = 0;
      const t0 = performance.now();
      const tick = () => {
        vel += (-120 * cur - 14 * vel) / 60;
        cur += vel / 60;
        op = Math.min((performance.now() - t0) / 400, 1);
        setSt({ opacity: op, y: cur });
        if (Math.abs(cur) > 0.05 || op < 1) requestAnimationFrame(tick);
        else setSt({ opacity: 1, y: 0 });
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [active, delay]);
  return st;
}

function Visual({ active, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { if (!active) return; const t=setTimeout(()=>setShow(true),delay); return ()=>clearTimeout(t); }, [active,delay]);
  return (
    <div style={{width:"100%",maxWidth:680,marginTop:48,opacity:show?1:0,transform:show?"scale(1) translateY(0)":"scale(0.96) translateY(12px)",transition:"opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{width:"100%",borderRadius:16,overflow:"hidden",background:"#1a1a1a",aspectRatio:"16/10",position:"relative"}}>
        <div style={{position:"absolute",inset:8,borderRadius:8,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          <div style={{width:"85%",height:"80%",position:"relative"}}>
            <div style={{height:24,background:"rgba(255,255,255,.06)",borderRadius:4,marginBottom:12,display:"flex",alignItems:"center",padding:"0 10px",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#FF5F56"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"#FFBD2E"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"#27C93F"}} />
              <div style={{flex:1}} /><div style={{width:80,height:10,borderRadius:5,background:"rgba(255,255,255,.08)"}} /><div style={{flex:1}} />
            </div>
            <div style={{height:"35%",background:"transparent",borderRadius:6,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{textAlign:"center"}}><div style={{width:60,height:8,borderRadius:4,background:"rgba(255,255,255,.2)",margin:"0 auto 6px"}} /><div style={{width:100,height:5,borderRadius:3,background:"rgba(255,255,255,.08)",margin:"0 auto"}} /></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,height:"40%"}}>
              {[0,1,2].map(i=>(<div key={i} style={{background:"rgba(255,255,255,.04)",borderRadius:4,padding:6}}><div style={{width:"60%",height:4,borderRadius:2,background:"rgba(255,255,255,.12)",marginBottom:4}} /><div style={{width:"80%",height:3,borderRadius:2,background:"rgba(255,255,255,.06)"}} /></div>))}
            </div>
          </div>
        </div>
      </div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Впечатляет</div>
        <div style={{fontFamily:BFD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:"#000",letterSpacing:"-0.02em",lineHeight:1,opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.85)",transition:"opacity .6s ease .4s, transform .8s cubic-bezier(.2,.8,.2,1) .4s"}}><AnimNum to={80} prefix="$" suffix="B+" go={vis} dur={2000}/></div>
        <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"16px",marginTop:16,opacity:vis?1:0,transition:"opacity .5s ease .7s"}}>Совокупная капитализация клиентов Billions X</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,textAlign:"center",marginBottom:32}}>
        {[{n:1,p:"$",s:"B+",l:"Продажи недвижимости"},{n:100,s:"+",l:"Стран присутствия"},{n:300,s:"+",l:"Проектов"},{n:15,s:"+",l:"Лет на рынке"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 12px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.92)",transition:`opacity .5s ease ${.8+i*.15}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.8+i*.15}s`}}>
            <div style={{fontFamily:BFD,fontSize:"clamp(26px,5.5vw,36px)",fontWeight:700,color:"#000",letterSpacing:"-0.02em",lineHeight:1.1}}><AnimNum to={m.n} prefix={m.p||""} suffix={m.s||""} go={vis} dur={1500}/></div>
            <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"15px",marginTop:4}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
        {[{v:"x50-120",l:"ROI недвижимость"},{v:"x20",l:"Рост за 1.5 года"},{v:"160M+",l:"Медиа-охват"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"14px 10px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.92)",transition:`opacity .5s ease ${1.4+i*.12}s, transform .7s cubic-bezier(.2,.8,.2,1) ${1.4+i*.12}s`}}>
            <div style={{fontFamily:BFD,fontSize:20,fontWeight:600,color:"#000",letterSpacing:-0.6,lineHeight:"25px"}}>{m.v}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.30)",lineHeight:"14px",marginTop:3}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .6s ease 1.7s, transform .7s cubic-bezier(.2,.8,.2,1) 1.7s"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}} />
        <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"16px",letterSpacing:-0.2,marginBottom:6}}>$80,000,000,000+ капитализация клиентов Billions X</div>
        <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"16px",marginBottom:12}}>ABB ($43B), Eaton ($34.2B), PF Capital / Трансмашхолдинг, ORBI Group, PARQ Development, ГК Пионер, Укрбуд, MaxboxVR, Health Helper, Metaverse Bank, 2Space, Brilliance Events и ещё 300+ компаний</div>
        <div style={{height:".5px",background:"rgba(0,0,0,.06)",margin:"0 0 12px"}} />
        <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"16px",letterSpacing:-0.2,marginBottom:6}}>$1,000,000,000+ сумма, на которую Billions X продали недвижимости</div>
        <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"16px"}}>Грузия, Бали, РФ, Украина, Кипр, Таиланд, Испания, Мальдивы, Дубай. ORBI Group (12,000+ апартаментов, 55 офисов в 19 странах), PARQ Development (8 городов, распроданный район вилл), ГК Пионер ($246M, 30 проектов), Укрбуд (63 дома в 24 ЖК)</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"96px 0 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Результаты</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Это не сгенерирует AI.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Большая тройка использует «правило ×10» при обосновании стоимости проектов и ROI маркетинговых инвестиций. Результаты Billions X превышают эти показатели:</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {RESULTS.map((r,i)=>(
          <div key={i} style={{flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:20,display:"flex",flexDirection:"column",willChange:"transform,opacity",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:"rgba(0,0,0,.30)",letterSpacing:.5,lineHeight:"14px",marginBottom:8}}>{r.metric}</div>
            <div style={{fontFamily:BFD,fontSize:32,fontWeight:700,color:"#000",letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:10}}>{r.val}</div>
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.45)",lineHeight:"17px",letterSpacing:-0.1}}>{r.ctx}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}>
        {RESULTS.map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
      </div>
    </div>
  );
}

function AwardsBlock() {
  const [ref,vis]=useInView(0.15);
  const aw=[
    {n:"FIABCI\nPrix d'Excellence",d:"«Оскар» недвижимости. Жюри из 40 стран признало проект клиента лучшим инвестиционным проектом мира (ORBI Group)"},
    {n:"CES\nWinner",d:"Победитель крупнейшей выставки потребительской электроники в мире. Продукт клиента в ТОП-5 Amazon (Bite Helper)"},
    {n:"Google Exclusive\nPartner",d:"Единственный в мире эксклюзивный партнёр Google Maps и ТОП-3 партнёр Google Street View (MaxboxVR)"},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Победы</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Награды за качество.</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
        {aw.map((a,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"20px 12px 16px",textAlign:"center",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.94)",transition:`opacity .6s ease ${.35+i*.12}s, transform .8s cubic-bezier(.2,.8,.2,1) ${.35+i*.12}s`}}>
            <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
            <div style={{fontFamily:BFD,fontSize:14,fontWeight:600,color:"#000",letterSpacing:-0.3,lineHeight:"18px",marginBottom:6,whiteSpace:"pre-line"}}>{a.n}</div>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"15px"}}>{a.d}</div>
          </div>
        ))}
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
      {logo&&<div style={{position:"absolute",top:12,right:12,zIndex:2,width:32,height:32,borderRadius:8,background:"rgba(255,255,255,.18)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:5,border:".5px solid rgba(255,255,255,.25)"}}><img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"contain",filter:"brightness(0) invert(1)",opacity:.9}} /></div>}
      <div style={{position:"absolute",top:12,left:16,zIndex:1}}><span style={{fontFamily:BFT,fontSize:10,fontWeight:500,color:"#fff",background:"rgba(255,255,255,.20)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:6,padding:"3px 8px",letterSpacing:.3}}>{loc}</span></div>
      <div style={{position:"absolute",bottom:12,left:16,right:52,zIndex:1}}><div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:"#fff",letterSpacing:-0.5,lineHeight:"28px",textShadow:"0 1px 4px rgba(0,0,0,.3)"}}>{name}</div></div>
      {len>1&&<div style={{position:"absolute",bottom:14,right:16,zIndex:2,display:"flex",gap:4}}>{imgs!.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:3,background:i===idx?"#fff":"rgba(255,255,255,.4)",transition:"background .3s"}} />)}</div>}
    </div>
  );
}

// ─── CASES BLOCK (reads from props) ──────────────────────────────
function CasesBlock({ cases, onCaseClick }: { cases: BXCase[]; onCaseClick?: (c: BXCase) => void }) {
  const [ref,vis]=useInView();
  const scrollRef=useRef(null);
  const [active,setActive]=useState(0);
  useEffect(()=>{const el=scrollRef.current;if(!el)return;const h=()=>{const w=el.scrollLeft;const cw=el.firstChild?.offsetWidth||300;setActive(Math.round(w/(cw+12)));};el.addEventListener('scroll',h,{passive:true});return()=>el.removeEventListener('scroll',h);},[]);
  return (
    <div ref={ref} style={{padding:"clamp(40px,8vw,64px) 0",overflow:"hidden"}}>
      <div style={{paddingLeft:"clamp(24px,6vw,48px)",marginBottom:28}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Влияем на влиятельных</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Сильнейшие в кейсах.</h2>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {cases.map((s,i)=>(
          <div key={s.id} onClick={()=>onCaseClick?.(s)} style={{flex:"0 0 clamp(280px,75vw,400px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",display:"flex",flexDirection:"column",cursor:"pointer",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.3+i*.06}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.3+i*.06}s`}}>
            <CaseSlider imgs={s.images} cl={s.color} logo={s.logo_url||undefined} loc={s.city} name={s.name} />
            <div style={{padding:"14px 20px 0"}}><div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:"#000",letterSpacing:-0.3,lineHeight:"19px"}}>{s.headline}</div></div>
            <div style={{padding:"12px 20px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontFamily:BFT,fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.25)",marginBottom:3}}>Контекст</div><div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.50)",lineHeight:"17px"}}>{s.context}</div></div>
              <div><div style={{fontFamily:BFT,fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.25)",marginBottom:3}}>Game Changer</div><div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.50)",lineHeight:"17px"}}>{s.game_changer}</div></div>
              <div style={{marginTop:"auto",display:"flex",flexWrap:"wrap",gap:6}}>{(s.products||[]).map((b,bi)=>(<span key={bi} style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:"#FF3B30",background:"rgba(255,59,48,.08)",border:"1px solid rgba(255,59,48,.12)",borderRadius:100,padding:"3px 10px"}}>{b}</span>))}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:20,flexWrap:"wrap",maxWidth:300,margin:"20px auto 0"}}>
        {cases.map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
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
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>35+ индустрий</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Forbes & Fortune.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Бренды, которые обслуживают клиенты Billions X.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",transition:"opacity .6s ease .4s, transform .8s cubic-bezier(.2,.8,.2,1) .4s"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px 0"}}>
          {CATS.map((c,i)=>(
            <div key={i} style={{width:"100%",display:"flex",alignItems:"baseline",gap:8,padding:"4px 0",borderBottom:i<CATS.length-1?".5px solid rgba(0,0,0,.04)":"none"}}>
              <span style={{fontFamily:BFT,fontSize:10,fontWeight:600,color:"#C8A44E",letterSpacing:.5,textTransform:"uppercase",flexShrink:0,width:90,display:"inline-block"}}>{c.l}</span>
              <span style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"17px"}}>{c.b}</span>
            </div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>35+ индустрий</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Глубокая насмотренность.</h2>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
        {INDUSTRIES.map((t,i)=>(
          <span key={i} style={{display:"inline-block",padding:"6px 14px",borderRadius:100,fontFamily:BFT,fontSize:12,fontWeight:600,lineHeight:"15px",letterSpacing:-0.1,background:"#000",border:"none",color:"#fff",opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.8)",transition:`opacity .4s ease ${.35+i*.025}s, transform .5s cubic-bezier(.2,.8,.2,1) ${.35+i*.025}s`}}>{t}</span>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Методология</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>7 систем Billions X.</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {SYSTEMS.map((s,i)=>{
          const isOpen=open===i;
          return (
            <div key={i} onClick={()=>setOpen(isOpen?-1:i)} style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:16,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",cursor:"pointer",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`opacity .5s ease ${.35+i*.1}s, transform .6s cubic-bezier(.2,.8,.2,1) ${.35+i*.1}s`}}>
              <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:BFD,fontSize:22,fontWeight:700,color:"rgba(60,60,67,.18)",lineHeight:1}}>{i+1}</span>
                  <div>
                    <div style={{fontFamily:BFD,fontSize:17,fontWeight:600,color:"#000",letterSpacing:-0.43,lineHeight:"22px"}}>{s.x}</div>
                    <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.60)",letterSpacing:-0.23,lineHeight:"20px",marginTop:2}}>{s.t}</div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform .3s cubic-bezier(.2,.8,.2,1)"}}><path d="M4 6l4 4 4-4" fill="none" stroke="rgba(60,60,67,.30)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{maxHeight:isOpen?360:0,opacity:isOpen?1:0,overflow:"hidden",transition:"max-height .4s cubic-bezier(.2,.8,.2,1), opacity .3s ease"}}>
                <div style={{paddingTop:12,borderTop:".5px solid rgba(0,0,0,.06)",marginTop:12}}>
                  <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.60)",letterSpacing:-0.23,lineHeight:"20px",marginBottom:8}}>{s.d}</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(60,60,67,.40)",letterSpacing:-0.08,lineHeight:"18px"}}>{s.c}</div>
                  <div style={{height:".5px",background:"rgba(0,0,0,.06)",margin:"10px 0"}}/>
                  <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,color:"rgba(0,0,0,.25)",marginBottom:4}}>Внедрение xAI</div>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(60,60,67,.50)",lineHeight:"17px"}}>{s.ai}</div>
                  <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(60,60,67,.35)",lineHeight:"16px",marginTop:2}}>{s.aig}</div>
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
        <div onClick={()=>setGalleryOpen(-1)} style={{position:"fixed",inset:0,zIndex:10001,background:"rgba(0,0,0,.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <img src={imgs[galleryOpen]} alt="" style={{maxWidth:"100%",maxHeight:"90vh",objectFit:"contain",borderRadius:8}}/>
          <div style={{position:"absolute",top:20,right:20,color:"#fff",fontSize:13,fontFamily:BFT,opacity:.6}}>{galleryOpen+1} / {imgs.length}</div>
        </div>
      )}

      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:480,maxHeight:"95dvh",background:"#0A0A0A",borderRadius:"32px 32px 0 0",overflow:"hidden",
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
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",width:36,height:4,borderRadius:2,background:"rgba(255,255,255,.25)"}}/>
          <div onClick={onClose} style={{position:"absolute",top:16,right:20,width:36,height:36,borderRadius:18,background:"rgba(255,255,255,.08)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:".5px solid rgba(255,255,255,.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",zIndex:5}}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="rgba(255,255,255,.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          {/* Logo */}
          {c.logo_url&&<div style={{position:"absolute",top:18,left:24,height:24,opacity:.85,zIndex:2}}><img src={c.logo_url} alt="" style={{height:"100%",objectFit:"contain",filter:"brightness(0) invert(1)"}}/></div>}
          {/* Title area */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 24px 24px",zIndex:2}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontFamily:BFT,fontSize:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:"rgba(255,255,255,.5)",background:"rgba(255,255,255,.08)",borderRadius:6,padding:"4px 10px",backdropFilter:"blur(12px)",border:".5px solid rgba(255,255,255,.1)"}}>{c.city}</span>
              {c.timeline&&<span style={{fontFamily:BFT,fontSize:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",color:cl,background:`${cl}15`,borderRadius:6,padding:"4px 10px",border:`1px solid ${cl}20`}}>{c.timeline}</span>}
            </div>
            <h2 style={{fontFamily:BFD,fontSize:34,fontWeight:800,color:"#fff",letterSpacing:"-0.03em",lineHeight:1,margin:0}}>{c.name}</h2>
            <p style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(255,255,255,.45)",lineHeight:1.4,marginTop:8,maxWidth:"90%"}}>{c.headline}</p>
          </div>
          {/* Image counter */}
          {imgs.length>1&&<div style={{position:"absolute",bottom:12,right:24,display:"flex",gap:4,zIndex:3}}>{imgs.map((_,i)=><div key={i} style={{width:i===imgIdx?20:6,height:6,borderRadius:3,background:i===imgIdx?"#fff":"rgba(255,255,255,.2)",transition:"all .5s cubic-bezier(.2,.8,.2,1)"}}/>)}</div>}
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch"}}>

          {/* KPI DASHBOARD with sparklines */}
          {kpis.length>0&&(
            <div className="cm-section" style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(kpis.length,3)},1fr)`,gap:1,background:"rgba(255,255,255,.04)"}}>
              {kpis.map((k,i)=>{
                const num=parseNum(k.value);const suf=numSuffix(k.value);
                return(
                  <div key={i} style={{background:"#0A0A0A",padding:"20px 14px 16px",position:"relative",overflow:"hidden"}}>
                    {/* Sparkline background */}
                    <div style={{position:"absolute",bottom:0,right:0,opacity:.6}}><Sparkline color={cl} seed={i+c.id}/></div>
                    {/* Accent line */}
                    <div style={{position:"absolute",top:0,left:"15%",right:"15%",height:2,borderRadius:1,background:`linear-gradient(90deg,transparent,${cl},transparent)`,opacity:.35}}/>
                    <div style={{fontFamily:BFD,fontSize:30,fontWeight:800,color:"#fff",letterSpacing:"-0.03em",lineHeight:1,position:"relative",zIndex:1}}>
                      {num>0&&num<10000?<Counter to={num} suffix={suf}/>:k.value}
                    </div>
                    <div style={{fontFamily:BFT,fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:cl,marginTop:6,position:"relative",zIndex:1}}>{k.label}</div>
                    <div style={{fontFamily:BFT,fontSize:10,color:"rgba(255,255,255,.3)",marginTop:2,position:"relative",zIndex:1}}>{k.desc}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PRODUCTS DEPLOYED */}
          {(c.products||[]).length>0&&(
            <div className="cm-section" style={{padding:"20px 24px 0"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {c.products.map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:`${cl}10`,border:`1px solid ${cl}18`,borderRadius:10,padding:"6px 14px"}}>
                    <div style={{width:6,height:6,borderRadius:3,background:cl}}/>
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
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{color:cl,fontSize:9}}>{s.icon}</span>
                  <span style={{fontFamily:BFT,fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:cl}}>{s.label}</span>
                  <div style={{flex:1,height:".5px",background:`linear-gradient(90deg,${cl}30,transparent)`}}/>
                </div>
                <p style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(255,255,255,.55)",lineHeight:1.6,margin:0}}>{s.text}</p>
              </div>
            ))}
          </div>

          {/* RESULTS with animated bars */}
          {c.results&&c.results.length>0&&(
            <div className="cm-section" style={{padding:"0 24px 24px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <span style={{color:cl,fontSize:9}}>◉</span>
                <span style={{fontFamily:BFT,fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:cl}}>Результаты</span>
                <div style={{flex:1,height:".5px",background:`linear-gradient(90deg,${cl}30,transparent)`}}/>
              </div>
              {c.results.map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,marginBottom:8,padding:"14px 16px",background:"rgba(255,255,255,.03)",borderRadius:14,border:".5px solid rgba(255,255,255,.05)",position:"relative",overflow:"hidden"}}>
                  {/* Animated gradient fill */}
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${Math.min(95,55+i*12)}%`,background:`linear-gradient(90deg,${cl}0A,${cl}05,transparent)`,borderRadius:14,animation:`fadeUp .6s ease ${.4+i*.1}s both`}}/>
                  <div style={{width:28,height:28,borderRadius:14,background:`${cl}15`,border:`1px solid ${cl}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1}}>
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
              <div style={{paddingLeft:24,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:BFT,fontSize:10,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"rgba(255,255,255,.3)"}}>Портфолио</span>
                <span style={{fontFamily:BFT,fontSize:10,color:"rgba(255,255,255,.2)"}}>{imgs.length} фото</span>
              </div>
              <div style={{display:"flex",gap:8,overflowX:"auto",scrollSnapType:"x mandatory",paddingLeft:24,paddingRight:24,scrollbarWidth:"none"}}>
                {imgs.map((src,i)=>(
                  <div key={i} onClick={()=>setGalleryOpen(i)} style={{flex:"0 0 40%",scrollSnapAlign:"center",aspectRatio:"4/3",borderRadius:14,overflow:"hidden",border:".5px solid rgba(255,255,255,.06)",cursor:"pointer",position:"relative"}}>
                    <img src={src} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .3s"}}/>
                    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.1)",opacity:0,transition:"opacity .2s"}} onMouseEnter={e=>(e.target as HTMLElement).style.opacity="1"} onMouseLeave={e=>(e.target as HTMLElement).style.opacity="0"}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TESTIMONIAL */}
          {testimonial&&(
            <div className="cm-section" style={{margin:"0 24px 24px",padding:"24px 20px",background:"rgba(255,255,255,.03)",borderRadius:20,border:".5px solid rgba(255,255,255,.06)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-5,left:16,fontFamily:"Georgia,serif",fontSize:64,lineHeight:1,color:`${cl}15`}}>"</div>
              <div style={{position:"relative",zIndex:1,paddingTop:16}}>
                <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:"rgba(255,255,255,.55)",lineHeight:1.6,fontStyle:"italic"}}>{testimonial.quote}</div>
                <div style={{marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16,borderTop:".5px solid rgba(255,255,255,.06)"}}>
                  <div>
                    <div style={{fontFamily:BFD,fontSize:13,fontWeight:700,color:"#fff"}}>{testimonial.author_name}</div>
                    <div style={{fontFamily:BFT,fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{testimonial.author_role}</div>
                  </div>
                  {testimonial.revenue_impact&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:cl,background:`${cl}12`,borderRadius:10,padding:"5px 12px",border:`1px solid ${cl}18`}}>{testimonial.revenue_impact}</div>}
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="cm-section" style={{padding:"0 24px 32px"}}>
            <div onClick={()=>{onClose();setTimeout(()=>document.querySelector('.bx-contact')?.scrollIntoView({behavior:'smooth'}),300);}} style={{width:"100%",height:52,borderRadius:14,background:"#007AFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 20px rgba(0,122,255,.25)",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,transparent 50%)",borderRadius:14}}/>
              <span style={{fontFamily:BFT,fontSize:17,fontWeight:600,color:"#fff",letterSpacing:"-0.01em",position:"relative",zIndex:1}}>Хочу такой же результат</span>
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
    <div ref={ref} style={{padding:"clamp(40px,8vw,64px) 0",overflow:"hidden"}}>
      <div style={{paddingLeft:"clamp(24px,6vw,48px)",marginBottom:24}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Слово клиентам</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Доверие.</h2>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",scrollbarWidth:"none"}}>
        {testimonials.map((t,i)=>{
          const cs = cases.find(c=>c.id===t.case_id);
          return (
            <div key={t.id} style={{flex:"0 0 clamp(280px,75vw,340px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"20px 18px",display:"flex",flexDirection:"column",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:`all .6s ease ${.2+i*.06}s`}}>
              <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(0,0,0,.55)",lineHeight:"20px",fontStyle:"italic",flex:1}}>«{t.quote}»</div>
              <div style={{marginTop:14,paddingTop:14,borderTop:".5px solid rgba(0,0,0,.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:"#000"}}>{t.author_company}</div>
                  <div style={{fontFamily:BFT,fontSize:11,color:"rgba(60,60,67,.45)"}}>{t.author_role}</div>
                </div>
                {t.revenue_impact&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:700,color:cs?.color||"#007AFF",background:`${cs?.color||"#007AFF"}12`,borderRadius:8,padding:"3px 8px"}}>{t.revenue_impact}</div>}
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
    <div ref={ref} style={{padding:"clamp(48px,10vw,96px) clamp(24px,6vw,48px)",maxWidth:680,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(255,255,255,.40)",marginBottom:6,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>10 продуктов × 60 кейсов</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#fff",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Экосистема.</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {products.map((p,i)=>{
          const isOpen = open === i;
          return (
            <div key={p.id} onClick={()=>setOpen(isOpen?null:i)} style={{
              background:isOpen?"rgba(255,255,255,.12)":"rgba(255,255,255,.06)",
              backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
              border:".5px solid rgba(255,255,255,.12)",
              borderRadius:16,padding:"16px 14px",cursor:"pointer",
              gridColumn:isOpen?"1 / -1":"auto",
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",
              transition:`all .35s cubic-bezier(.2,.8,.2,1) ${.15+i*.04}s`,
            }}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:BFD,fontSize:16,fontWeight:700,color:"#fff",letterSpacing:-0.3}}>{p.name}</div>
                  <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(255,255,255,.50)",marginTop:2}}>{p.tagline}</div>
                </div>
                {(p.case_count||0)>0&&<div style={{fontFamily:BFD,fontSize:11,fontWeight:600,color:p.color,background:`${p.color}18`,borderRadius:8,padding:"3px 8px",flexShrink:0}}>{p.case_count} {(p.case_count||0)===1?"кейс":(p.case_count||0)<5?"кейса":"кейсов"}</div>}
              </div>
              {isOpen&&p.description&&(
                <div style={{marginTop:12,paddingTop:12,borderTop:".5px solid rgba(255,255,255,.10)"}}>
                  <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(255,255,255,.65)",lineHeight:"18px",marginBottom:10}}>{p.description}</div>
                  {p.features&&p.features.length>0&&(
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {p.features.map((f,fi)=>(
                        <div key={fi} style={{display:"flex",alignItems:"baseline",gap:8}}>
                          <div style={{width:4,height:4,borderRadius:2,background:p.color,flexShrink:0,marginTop:6}}/>
                          <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(255,255,255,.55)",lineHeight:"16px"}}>{f}</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:6}}>45+ продуктов</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px"}}>Высшая лига.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Измеримый возврат на каждый доллар.</p>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",marginBottom:20,paddingBottom:2}}>
        {PRODS.map((p,i)=>(
          <div key={i} onClick={()=>setTab(i)} style={{fontFamily:BFT,fontSize:12,fontWeight:tab===i?600:500,color:tab===i?"#fff":"rgba(0,0,0,.50)",background:tab===i?"#1C1C1E":"rgba(0,0,0,.04)",borderRadius:10,padding:"8px 14px",cursor:"pointer",flexShrink:0,transition:"all .25s ease",border:tab===i?"none":".5px solid rgba(0,0,0,.06)"}}>{p.nm}</div>
        ))}
      </div>
      {/* Content */}
      <div style={{background:"#1C1C1E",borderRadius:20,overflow:"hidden"}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{fontFamily:BFD,fontSize:24,fontWeight:700,color:"rgba(235,235,245,1)",letterSpacing:-0.5,lineHeight:"28px"}}>{pr.nm}</div>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"rgba(235,235,245,.45)",letterSpacing:-0.08,lineHeight:"18px",marginTop:2}}>{pr.sub}</div>
          <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.55)",letterSpacing:-0.08,lineHeight:"16px",marginTop:8}}>{pr.desc}</div>
        </div>
        <div style={{height:".5px",background:"rgba(235,235,245,.08)",marginLeft:20,marginRight:20}}/>
        <div style={{padding:"4px 20px 20px"}}>
          {pr.items.map((it,ii)=>(
            <div key={ii} style={{padding:"14px 0",borderBottom:ii<pr.items.length-1?".5px solid rgba(235,235,245,.06)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <div style={{fontFamily:BFD,fontSize:15,fontWeight:600,color:"rgba(235,235,245,.85)",letterSpacing:-0.23,lineHeight:"20px"}}>{it.n}</div>
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:500,color:"rgba(235,235,245,.50)",cursor:"pointer",flexShrink:0,marginLeft:12}}>Обсудить →</div>
              </div>
              <div style={{fontFamily:BFT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.65)",letterSpacing:-0.08,lineHeight:"16px",marginTop:4}}>{it.d}</div>
              <div style={{display:"flex",gap:16,marginTop:6}}>
                {it.biz&&<div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.65)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.40)"}}>При обороте: </span>{it.biz}</div>}
                <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.70)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.40)"}}>Стоимость: </span>{it.p}</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"96px 0 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Позиция на рынке</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Уникальность.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Billions X за 15+ лет и реализацию 300+ проектов собрала редкую компетенцию и стала топовым мировым игроком.</p>
      </div>
      <div style={{padding:"0 clamp(24px,6vw,48px)"}}>
        <div style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",transition:"opacity .6s ease .5s, transform .8s cubic-bezier(.2,.8,.2,1) .5s"}}>
          <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none",zIndex:1}} />
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            <table style={{borderCollapse:"collapse",width:"max-content",minWidth:"100%",fontFamily:BFT}}>
              <thead>
                <tr>{["", ...COMP_COLS].map((c,i)=>(
                  <th key={i} style={{position:i===0?"sticky":"static",left:i===0?0:"auto",zIndex:i===0?3:1,background:i===0?"rgba(255,255,255,.92)":"transparent",backdropFilter:i===0?"blur(20px)":"none",WebkitBackdropFilter:i===0?"blur(20px)":"none",padding:i===0?"10px 14px":"10px 8px",textAlign:i===0?"left":"center",fontSize:10,fontWeight:500,color:"rgba(0,0,0,.50)",borderBottom:".5px solid rgba(0,0,0,.06)",whiteSpace:"pre-line",minWidth:i===0?120:50,letterSpacing:.1,lineHeight:"13px"}}>{c}</th>
                ))}</tr>
              </thead>
              <tbody>
                {COMP_ROWS.map((row,ri)=>(
                  <tr key={ri} style={{background:row.name==="Billions X"?"rgba(0,122,255,.04)":"transparent"}}>
                    <td style={{position:"sticky",left:0,zIndex:2,background:row.name==="Billions X"?"rgba(0,122,255,.06)":"rgba(255,255,255,.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",padding:"8px 14px",borderBottom:".5px solid rgba(0,0,0,.04)"}}>
                      {row.cat&&<div style={{fontSize:9,fontWeight:500,color:"rgba(0,0,0,.30)",letterSpacing:.3,lineHeight:"11px"}}>{row.cat}</div>}
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
            <div style={{fontFamily:"Georgia,serif",fontSize:13,fontStyle:"italic",color:"#000",lineHeight:"14px"}}>✓* — AI генерирует стратегии, тексты, дизайн и код. Но не обладает целостным видением, не управляет командами, не обучает отделы продаж, не проводит переговоры, не выступает продакт-оунером внутри компании, не отвечает за конкретные суммы, которые должны зайти в компанию (как коммерческий партнёр) и не имеет 15-летнего опыта трансформации реальных бизнесов. AI — инструмент внутри Billions X и других команд, но не замена.</div>
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
  const card = {flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"center",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:20,display:"flex",flexDirection:"column",willChange:"transform,opacity"};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"96px 0 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(60,60,67,.35)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>7 законов продукта</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Основа успеха.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Крупнейшие компании мира — Apple, Tesla, Amazon, Google, SpaceX — выросли не на продуктах, а на принципах, по которым эти продукты создаются, презентуются и масштабируются в массах.</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {LAWS.map((l,i)=>(
          <div key={i} style={{...card,opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:BFD,fontSize:28,fontWeight:700,color:"rgba(0,0,0,.08)",lineHeight:1,marginBottom:8}}>{l.n}</div>
            <div style={{fontFamily:BFD,fontSize:20,fontWeight:600,color:"#000",letterSpacing:-0.6,lineHeight:"25px",marginBottom:8}}>{l.t}</div>
            <div style={{fontFamily:BFT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.55)",letterSpacing:-0.23,lineHeight:"19px"}}>{l.d}</div>
          </div>
        ))}
        <div style={{...card,justifyContent:"center",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:"opacity .6s ease 1s, transform .7s cubic-bezier(.2,.8,.2,1) 1s"}}>
          <div style={{fontFamily:BFT,fontSize:13,fontWeight:400,color:"#000",letterSpacing:-0.08,lineHeight:"17px",textAlign:"left"}}>Billions X построен на 7 законах продукта. Это фундаментальные законы, которые определяют, вырастет бизнес или нет. Каждый из 300+ проектов Billions X за 15+ лет подтверждает: бизнесы, в которых работают все 7 законов, растут экспоненциально. Бизнесы, в которых отсутствует хотя бы один — стагнируют.</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:20}}>
        {Array.from({length:8}).map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
      </div>
    </div>
  );
}

function FormulasBlock() {
  const [ref,vis]=useInView();
  const x = {fontFamily:BFD,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.20)",letterSpacing:1};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.97)",transition:"opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"20px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}} />
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(0,0,0,.35)",marginBottom:8,textAlign:"center"}}>Формула мирового бренда</div>
        <div style={{fontFamily:BFD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"18px",letterSpacing:-0.2,textAlign:"center"}}>
          Стратегия<span style={x}> × </span>Смыслы<span style={x}> × </span>Продукт<span style={x}> × </span>Упаковка<span style={x}> × </span>Продвижение<span style={x}> × </span>Продажи<span style={x}> × </span>AI
        </div>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.30)",lineHeight:"14px",letterSpacing:0.15,textAlign:"center",marginTop:12}}>Если убрать любой множитель — результат обнуляется.</div>
      </div>
    </div>
  );
}


function GradBG() {
  const ref = useRef(null);
  const t = useRef(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d", { alpha: false });
    const pal = [[131,58,180],[193,53,132],[253,29,29],[247,119,55],[252,175,69],[255,220,100],[72,191,227],[88,86,214],[214,41,118],[165,55,253]];
    const blobs = [
      {x:.1,y:.15,r:.55,fx:.08,fy:.05,a:.7},{x:.85,y:.1,r:.5,fx:-.06,fy:.07,a:.65},
      {x:.5,y:.55,r:.55,fx:.05,fy:-.06,a:.6},{x:.8,y:.8,r:.48,fx:-.04,fy:.04,a:.65},
      {x:.2,y:.5,r:.5,fx:.07,fy:-.05,a:.6},{x:.65,y:.3,r:.42,fx:-.05,fy:.06,a:.55},
      {x:.35,y:.85,r:.45,fx:.06,fy:.04,a:.5},{x:.9,y:.5,r:.4,fx:-.07,fy:-.04,a:.6},
      {x:.05,y:.75,r:.38,fx:.04,fy:.07,a:.5},{x:.45,y:.1,r:.35,fx:-.06,fy:-.05,a:.45},
    ];
    const lerp = (a, b, t) => [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)];
    let raf=0,on=false;
    const pp=c.parentElement;
    const resize = () => { if(!pp)return;const d = Math.min((devicePixelRatio||1)*.5,1); c.width=pp.offsetWidth*d; c.height=pp.offsetHeight*d; c.style.width="100%"; c.style.height="100%"; };
    resize(); window.addEventListener("resize", resize);
    const io=new IntersectionObserver(([e])=>{on=e.isIntersecting;if(on&&!raf)draw();},{threshold:0});
    if(pp)io.observe(pp);
    const draw = () => {
      if(!on){raf=0;return;}
      t.current += .003;
      const w=c.width, h=c.height, T=t.current;
      ctx.fillStyle="#FAFAFA"; ctx.fillRect(0,0,w,h);
      for (let i=0;i<blobs.length;i++) {
        const b=blobs[i], p=i*.9;
        const cp=(T*3.2+i*.7)%pal.length, ci=Math.floor(cp)%pal.length;
        const col=lerp(pal[ci],pal[(ci+1)%pal.length],cp-Math.floor(cp));
        const bx=(b.x+Math.sin(T*b.fx*12+p)*.14+Math.sin(T*b.fy*6+p*2.2)*.07)*w;
        const by=(b.y+Math.cos(T*b.fy*12+p)*.12+Math.cos(T*b.fx*8+p*1.7)*.06)*h;
        const br=(b.r+Math.sin(T*2+p*1.4)*.06)*Math.min(w,h);
        const aa=b.a+Math.sin(T*1.5+p*2)*.1;
        const g=ctx.createRadialGradient(bx,by,0,bx,by,br);
        g.addColorStop(0,`rgba(${col},${aa})`); g.addColorStop(.25,`rgba(${col},${aa*.55})`);
        g.addColorStop(.7,`rgba(${col},${aa*.15})`); g.addColorStop(1,`rgba(${col},0)`);
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      }
      raf=requestAnimationFrame(draw);
    };
    return () => { on=false;cancelAnimationFrame(raf); window.removeEventListener("resize",resize);io.disconnect(); };
  }, []);
  return (<canvas ref={ref} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",zIndex:0,pointerEvents:"none",filter:"blur(80px) saturate(140%)",WebkitFilter:"blur(80px) saturate(140%)",transform:"scale(1.2)"}} />);
}
function FoundersBlock() {
  const [ref,vis]=useInView(0.1);
  const founders=[
    {name:"Евгений Иванов",role:"Управляющий партнёр",photo:"/bx/ivanov.jpg",desc:"Стратегия и позиционирование, визуальная упаковка, рекламные кампании, PR и медиа-охват, персональные бренды, репутация и кризисные коммуникации."},
    {name:"Борис Прядкин",role:"Управляющий партнёр",photo:"/bx/priadkin.png",desc:"Архитектура и методология продаж, технологии и AI-платформы, стратегические партнёрства и M&A, обучение команд, коммерческое сопровождение девелоперов."},
  ];
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16}}>Основатели</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px"}}>С 2006 года вместе.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Высшее техническое образование. 20 лет совместной практики на международных рынках. Каждый курирует свои профессиональные команды с подтверждённой экспертизой.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12}}>
        {founders.map((f,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:"opacity .6s ease "+(0.4+i*.15)+"s, transform .7s cubic-bezier(.2,.8,.2,1) "+(0.4+i*.15)+"s"}}>
            <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none",zIndex:1}}/>
            <div style={{width:"100%",height:220,overflow:"hidden",background:"#000"}}><img src={f.photo} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",opacity:.85}}/></div>
            <div style={{padding:"20px 20px 24px"}}>
              <div style={{fontFamily:BFD,fontSize:20,fontWeight:700,color:"#000",letterSpacing:-0.5,lineHeight:"24px"}}>{f.name}</div>
              <div style={{fontFamily:BFT,fontSize:13,fontWeight:500,color:"rgba(60,60,67,.40)",letterSpacing:-0.08,lineHeight:"18px",marginTop:2}}>{f.role}</div>
              <div style={{fontFamily:BFT,fontSize:14,fontWeight:400,color:"rgba(60,60,67,.65)",letterSpacing:-0.15,lineHeight:"20px",marginTop:12}}>{f.desc}</div>
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
  const inp={width:"100%",padding:"14px 16px",border:"none",borderBottom:".5px solid rgba(0,0,0,.06)",background:"transparent",fontSize:15,fontFamily:BFT,outline:"none",color:"#000",boxSizing:"border-box"as const};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"96px clamp(24px,6vw,48px) 96px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16}}>Бесплатная сессия</div>
        <h2 style={{fontFamily:BFD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px"}}>Запись на онлайн-звонок.</h2>
        <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Вам назначат экспресс-консультацию с одним из управляющих партнёров Billions X.</p>
      </div>
      {sent?(
        <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"48px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:12}}>✓</div>
          <div style={{fontFamily:BFD,fontSize:22,fontWeight:700,color:"#000",marginBottom:8}}>Заявка отправлена</div>
          <div style={{fontFamily:BFT,fontSize:15,color:"rgba(60,60,67,.55)"}}>Свяжемся с вами в ближайшее время.</div>
        </div>
      ):(
        <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
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
            <div style={{fontFamily:BFT,fontSize:13,fontWeight:600,color:"#000",marginBottom:12}}>Выберите интересующие продукты</div>
            {cats.map((cat,ci)=>{
              const isOpen=openCat===ci;
              const catPicked=cat.items.filter(it=>picked.has(it.n));
              return(
                <div key={ci} style={{marginBottom:8,borderRadius:12,border:isOpen?".5px solid rgba(0,122,255,.15)":".5px solid rgba(0,0,0,.04)",background:isOpen?"rgba(0,122,255,.03)":"rgba(0,0,0,.02)",overflow:"hidden",transition:"all .25s"}}>
                  <div onClick={()=>setOpenCat(isOpen?-1:ci)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}}>
                    <div>
                      <div style={{fontFamily:BFT,fontSize:14,fontWeight:600,color:isOpen||catPicked.length>0?"#007AFF":"#000",lineHeight:"18px"}}>{cat.sub}</div>
                      {catPicked.length>0&&!isOpen&&<div style={{fontFamily:BFT,fontSize:11,color:"rgba(0,122,255,.60)",marginTop:2}}>{catPicked.map(p=>p.n).join(", ")}</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      {catPicked.length>0&&<div style={{background:"#007AFF",borderRadius:10,padding:"2px 8px",fontFamily:BFT,fontSize:11,fontWeight:600,color:"#fff"}}>{catPicked.length}</div>}
                      <div style={{fontSize:12,color:"rgba(0,0,0,.25)",transform:isOpen?"rotate(90deg)":"rotate(0)",transition:"transform .2s"}}>▶</div>
                    </div>
                  </div>
                  {isOpen&&(
                    <div style={{padding:"0 14px 12px"}}>
                      {cat.items.map((it,ii)=>{
                        const on=picked.has(it.n);
                        return(
                          <div key={ii} onClick={()=>toggle(it.n)} style={{padding:"10px 12px",marginBottom:4,borderRadius:10,background:on?"rgba(0,122,255,.06)":"rgba(255,255,255,.5)",border:on?".5px solid rgba(0,122,255,.12)":".5px solid rgba(0,0,0,.03)",cursor:"pointer",transition:"all .15s"}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                              <div style={{fontFamily:BFD,fontSize:14,fontWeight:600,color:on?"#007AFF":"#000",letterSpacing:-0.2}}>{it.n}</div>
                              <div style={{width:18,height:18,borderRadius:5,border:on?"none":"1.5px solid rgba(0,0,0,.15)",background:on?"#007AFF":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                {on&&<svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                            </div>
                            <div style={{fontFamily:BFT,fontSize:12,color:"rgba(60,60,67,.55)",lineHeight:"16px",marginTop:4}}>{it.d}</div>
                            <div style={{display:"flex",gap:16,marginTop:6}}>
                              <div style={{fontFamily:BFT,fontSize:11,color:"rgba(60,60,67,.40)"}}>{it.p}</div>
                              {it.biz&&<div style={{fontFamily:BFT,fontSize:11,color:"rgba(60,60,67,.30)"}}>от {it.biz}</div>}
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
          {picked.size>0&&<div style={{padding:"0 16px 8px",fontFamily:BFT,fontSize:12,color:"#007AFF"}}>Выбрано {picked.size}: {Array.from(picked).join(", ")}</div>}
          <div style={{padding:"4px 16px 16px"}}>
            <div onClick={submit} className="tap" style={{width:"100%",height:50,borderRadius:14,background:(!name||!phone)?"rgba(0,122,255,.35)":"#007AFF",display:"flex",alignItems:"center",justifyContent:"center",cursor:(!name||!phone)?"default":"pointer",transition:"background .2s"}}>
              <span style={{fontFamily:BFT,fontSize:17,fontWeight:600,color:"#fff"}}>{sending?"Отправка...":"Записаться"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────
export default function BXLanding({ cases, products, team, testimonials = [] }: { cases: BXCase[]; products: BXProduct[]; team: BXTeamMember[]; testimonials?: BXTestimonial[] }) {
  const [ready, setReady] = useState(false);
  const [activeCase, setActiveCase] = useState<BXCase|null>(null);
  useEffect(() => { const t=setTimeout(()=>setReady(true),300); return ()=>clearTimeout(t); }, []);
  const logo = useSpring(ready, 0);
  const sub = useSpring(ready, 400);
  const body = useSpring(ready, 800);

  return (
    <div style={{width:"100%",minHeight:"100dvh",background:"#FFFFFF",position:"relative"}}>
      <div style={{position:"relative",width:"100%",background:"#FFFFFF"}}>
        <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:680,padding:"96px clamp(24px,6vw,48px) 96px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{opacity:logo.opacity,transform:`translateY(${logo.y}px)`,willChange:"transform,opacity",marginBottom:16,textAlign:"center"}}>
            <div style={{fontFamily:BFT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)"}}>Маркетинг богатых и очень богатых</div>
          </div>
          <div style={{opacity:sub.opacity,transform:`translateY(${sub.y}px)`,willChange:"transform,opacity",textAlign:"center"}}>
            <h1 style={{fontFamily:BFD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:"#000",letterSpacing:"-0.02em",lineHeight:1,margin:0}}>Billions X</h1>
          </div>
          <div style={{opacity:body.opacity,transform:`translateY(${body.y}px)`,willChange:"transform,opacity",textAlign:"center",maxWidth:520,marginTop:16}}>
            <p style={{fontFamily:BFT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Приносим «иксы»  денег, создавая архитектуру роста бизнеса как целостную систему, где стратегия, смыслы, бренды, линейка продуктов, упаковка, сайты, приложения, реклама, продажи и технологии — работают в едином механизме.</p>
          </div>
          <Visual active={ready} delay={1100} />
        </div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><NumbersBlock /></div></div>
        <div style={{background:"#FFFFFF"}}><CasesBlock cases={cases} onCaseClick={setActiveCase} /></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><ResultsBlock /></div></div>
        <div style={{background:"#FFFFFF"}}><TestimonialsBlock testimonials={testimonials} cases={cases} /></div>
        <div style={{background:"#FFFFFF"}}><AwardsBlock /></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><BrandsBlock /></div></div>
        <div style={{background:"#FFFFFF"}}><UniquenessBlock /></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><FoundersBlock /></div></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><ProductEcosystem products={products} /></div></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><ProductsBlock /></div></div>
        <div style={{background:"#FFFFFF"}}><LawsCarousel /></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><SystemsBlock /></div></div>
        <div style={{background:"#FFFFFF"}}><FormulasBlock /></div>
        <div style={{position:"relative",overflow:"hidden"}}><GradBG/><div style={{position:"relative",zIndex:1}}><ContactBlock /></div></div>
      </div>
      {activeCase && <CaseModal c={activeCase} testimonial={testimonials.find(t=>t.case_id===activeCase.id)} onClose={()=>setActiveCase(null)} />}
    </div>
  );
}
