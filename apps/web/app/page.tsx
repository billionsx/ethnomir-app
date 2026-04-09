'use client';
// @ts-nocheck
import { useState, useEffect, useRef } from "react";

const FD = "-apple-system,'SF Pro Display','Helvetica Neue',sans-serif";
const FT = "-apple-system,'SF Pro Text','Helvetica Neue',sans-serif";

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

function CanvasBG() { return null; }

function Visual({ active, delay }) {
  const [show, setShow] = useState(false);
  useEffect(() => { if (!active) return; const t=setTimeout(()=>setShow(true),delay); return ()=>clearTimeout(t); }, [active,delay]);
  return (
    <div style={{width:"100%",maxWidth:680,marginTop:48,opacity:show?1:0,transform:show?"scale(1) translateY(0)":"scale(0.96) translateY(12px)",transition:"opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{width:"100%",borderRadius:16,overflow:"hidden",background:"#1a1a1a",aspectRatio:"16/10",position:"relative"}}>
        <div style={{position:"absolute",inset:8,borderRadius:8,background:"linear-gradient(135deg,#1c1c1e,#2c2c2e,#1c1c1e)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
          <div style={{width:"85%",height:"80%",position:"relative"}}>
            <div style={{height:24,background:"rgba(255,255,255,.06)",borderRadius:4,marginBottom:12,display:"flex",alignItems:"center",padding:"0 10px",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#FF5F56"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"#FFBD2E"}} />
              <div style={{width:6,height:6,borderRadius:"50%",background:"#27C93F"}} />
              <div style={{flex:1}} /><div style={{width:80,height:10,borderRadius:5,background:"rgba(255,255,255,.08)"}} /><div style={{flex:1}} />
            </div>
            <div style={{height:"35%",background:"linear-gradient(135deg,rgba(200,164,78,.15),rgba(200,164,78,.05))",borderRadius:6,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Впечатляет</div>
        <div style={{fontFamily:FD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:"#000",letterSpacing:"-0.02em",lineHeight:1,opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.85)",transition:"opacity .6s ease .4s, transform .8s cubic-bezier(.2,.8,.2,1) .4s"}}><AnimNum to={80} prefix="$" suffix="B+" go={vis} dur={2000}/></div>
        <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"16px",marginTop:16,opacity:vis?1:0,transition:"opacity .5s ease .7s"}}>Совокупная капитализация клиентов Billions X</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,textAlign:"center",marginBottom:32}}>
        {[{n:1,p:"$",s:"B+",l:"Продажи недвижимости"},{n:100,s:"+",l:"Стран присутствия"},{n:300,s:"+",l:"Проектов"},{n:15,s:"+",l:"Лет на рынке"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 12px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.92)",transition:`opacity .5s ease ${.8+i*.15}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.8+i*.15}s`}}>
            <div style={{fontFamily:FD,fontSize:"clamp(26px,5.5vw,36px)",fontWeight:700,color:"#000",letterSpacing:"-0.02em",lineHeight:1.1}}><AnimNum to={m.n} prefix={m.p||""} suffix={m.s||""} go={vis} dur={1500}/></div>
            <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"15px",marginTop:4}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
        {[{v:"x50-120",l:"ROI недвижимость"},{v:"x20",l:"Рост за 1.5 года"},{v:"160M+",l:"Медиа-охват"}].map((m,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"14px 10px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(12px) scale(0.92)",transition:`opacity .5s ease ${1.4+i*.12}s, transform .7s cubic-bezier(.2,.8,.2,1) ${1.4+i*.12}s`}}>
            <div style={{fontFamily:FD,fontSize:20,fontWeight:600,color:"#000",letterSpacing:-0.6,lineHeight:"25px"}}>{m.v}</div>
            <div style={{fontFamily:FT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.30)",lineHeight:"14px",marginTop:3}}>{m.l}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:24,background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .6s ease 1.7s, transform .7s cubic-bezier(.2,.8,.2,1) 1.7s"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}} />
        <div style={{fontFamily:FD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"16px",letterSpacing:-0.2,marginBottom:6}}>$80,000,000,000+ капитализация клиентов Billions X</div>
        <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"16px",marginBottom:12}}>ABB ($43B), Eaton ($34.2B), PF Capital / Трансмашхолдинг, ORBI Group, PARQ Development, ГК Пионер, Укрбуд, MaxboxVR, Health Helper, Metaverse Bank, 2Space, Brilliance Events и ещё 300+ компаний</div>
        <div style={{height:".5px",background:"rgba(0,0,0,.06)",margin:"0 0 12px"}} />
        <div style={{fontFamily:FD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"16px",letterSpacing:-0.2,marginBottom:6}}>$1,000,000,000+ сумма, на которую Billions X продали недвижимости</div>
        <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"16px"}}>Грузия, Бали, РФ, Украина, Кипр, Таиланд, Испания, Мальдивы, Дубай. ORBI Group (12,000+ апартаментов, 55 офисов в 19 странах), PARQ Development (8 городов, распроданный район вилл), ГК Пионер ($246M, 30 проектов), Укрбуд (63 дома в 24 ЖК)</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"72px 0 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Результаты</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>То, что невозможно сгенерировать.</h2>
        <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Среднерыночный ROI маркетинговых инвестиций — 10:1. Отраслевой стандарт брендинга — ×20-35 за 3 года. Большая тройка использует «правило ×10» при обосновании стоимости проектов. При этом, результаты Billions X:</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {RESULTS.map((r,i)=>(
          <div key={i} style={{flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"start",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:20,display:"flex",flexDirection:"column",willChange:"transform,opacity",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:FT,fontSize:11,fontWeight:500,color:"rgba(0,0,0,.30)",letterSpacing:.5,lineHeight:"14px",marginBottom:8}}>{r.metric}</div>
            <div style={{fontFamily:FD,fontSize:32,fontWeight:700,color:"#000",letterSpacing:"-0.02em",lineHeight:1.1,marginBottom:10}}>{r.val}</div>
            <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.45)",lineHeight:"17px",letterSpacing:-0.1}}>{r.ctx}</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Победы</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Награды за качество.</h2>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {aw.map((a,i)=>(
          <div key={i} style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"20px 12px 16px",textAlign:"center",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.94)",transition:`opacity .6s ease ${.35+i*.12}s, transform .8s cubic-bezier(.2,.8,.2,1) ${.35+i*.12}s`}}>
            <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
            <div style={{fontFamily:FD,fontSize:14,fontWeight:600,color:"#000",letterSpacing:-0.3,lineHeight:"18px",marginBottom:6,whiteSpace:"pre-line"}}>{a.n}</div>
            <div style={{fontFamily:FT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.40)",lineHeight:"15px"}}>{a.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const CS=[
{c:"Бали",n:"PARQ Development",p:"№1 застройщик Бали за 1 год.",ctx:"Потребность в комфортной недвижимости после пандемии и начала войны.",gc:"Дали старт всему маркетингу. Упаковали виллы для коллабораций с блогерами. Распродали район вилл.",bx:["xProduction","xPerformance"],cl:"#2D6A4F"},
{c:"Батуми",n:"ORBI Group",p:"12,000+ апартаментов. Самый большой комплекс в мире.",ctx:"Батуми — рекордное количество международных гостиничных брендов, +20% ежегодно.",gc:"1.5 года продакт-оунер. Единые стандарты для 55 офисов. Рост в 20 раз.",bx:["xVision","xProduction","xSales"],cl:"#1B4965"},
{c:"Цюрих",n:"ABB",p:"$43B. 105,000 сотрудников. 100+ стран.",ctx:"Мировой лидер промышленной автоматизации и энергетики.",gc:"Внедрение xSales на корпоративном уровне. Единая книга продаж.",bx:["xSales"],cl:"#FF000F"},
{c:"Дублин",n:"Eaton",p:"$34.2B. 96,000 сотрудников. 100+ стран.",ctx:"Глобальная корпорация управления электроэнергией.",gc:"Методология xSales, адаптированная под каждую вертикаль бизнеса.",bx:["xSales"],cl:"#005EB8"},
{c:"Глобально",n:"MaxboxVR",p:"Эксклюзивный партнёр Google Maps. ТОП-3 Google Street View.",ctx:"3,000+ корпоративных клиентов из 100+ стран. Fortune 500.",gc:"Упаковка инвестиционной модели бренда для корпоративного рынка.",bx:["xProduction","xBrand"],cl:"#4285F4"},
{c:"США",n:"Bite Helper",p:"Победитель CES. ТОП-5 Amazon.",ctx:"Рынок медицинских девайсов на $3B.",gc:"Упаковка и продвижение. Медиа-охват 160M+ — Fox, CBS, ABC, Mashable.",bx:["xProduction","xPerformance"],cl:"#FF6B35"},
{c:"Москва",n:"ГК Пионер",p:"$246M оборот. 30 проектов. 52 награды.",ctx:"Крупнейший застройщик премиальных ЖК в Москве.",gc:"Sales xBook. Стандартизация работы менеджеров по продажам.",bx:["xSales"],cl:"#8B5CF6"},
{c:"Глобально",n:"Metaverse Bank",p:"Банковская метавселенная нового поколения.",ctx:"Стартап на стыке финтеха и метавселенной.",gc:"Полный продакт-менеджмент. ~1,000 экранов от архитектуры до пикселя.",bx:["xVision","xProduction","xAI"],cl:"#6366F1"},
{c:"Киев",n:"Укрбуд",p:"Госкорпорация. 63 дома. Саркофаг ЧАЭС.",ctx:"Самый дорогой строительный бренд Украины.",gc:"Единая книга методологии продаж Sales xBook совместно с Billion Estate.",bx:["xSales"],cl:"#1D3557"},
{c:"Москва",n:"PF Capital",p:"$2B/год. Трансмашхолдинг — ТОП-10 мирового машиностроения.",ctx:"100,000+ сотрудников. Крупнейший производитель подвижного состава.",gc:"xVision для корпорации мирового уровня.",bx:["xVision"],cl:"#2B2D42"},
{c:"Глобально",n:"Brilliance Events",p:"Ивент-шедевры для Forbes-предпринимателей и селебрити.",ctx:"Победители главных ивент-премий. Мероприятия для правительств и брендов.",gc:"Полная упаковка бренда и фирменный стиль мирового уровня.",bx:["xProduction","xBrand"],cl:"#C9A44E"},
{c:"Тбилиси",n:"Грузия",p:"Инвестиционный бренд страны. ТОП-10 безопасность.",ctx:"ТОП-5 по недвижимости, ТОП-10 по бизнесу. Нужен единый инвестиционный бренд.",gc:"xVision для целой страны. Стратегия инвестиционного бренда.",bx:["xVision"],cl:"#D62828"},
{c:"США",n:"Breathe Helper",p:"160,000,000+ медиа-охват. Fox, CBS, ABC.",ctx:"Медицинский девайс для массового рынка США.",gc:"Публикации Fox, CBS, ABC, Mashable, Insider. Рекордная конверсия.",bx:["xPerformance"],cl:"#48BFE3"},
{c:"Глобально",n:"2Space",p:"150+ спикеров: Тайсон, Бренсон, Шварценеггер.",ctx:"Образовательная платформа с крупнейшими спикерами мира.",gc:"Упаковка, продвижение, воронка продаж для premium-аудитории.",bx:["xProduction","xPerformance","xSales"],cl:"#F77F00"},
{c:"Россия",n:"Гарик Харламов",p:"9,200,000+ подписчиков. Comedy Club.",ctx:"Самый узнаваемый комик России. Монетизация персонального бренда.",gc:"xPerson. Стратегия монетизации аудитории и бизнес-экосистема.",bx:["xVision","xProduction","xPerformance"],cl:"#E63946"},
{c:"США",n:"Health Helper",p:"3 продукта на рынке $3B. Основатель — 25 лет в Pfizer.",ctx:"Линейка медицинских девайсов для массового рынка.",gc:"Полная упаковка линейки продуктов для выхода на рынок США.",bx:["xProduction","xPerformance"],cl:"#06D6A0"},
{c:"Глобально",n:"Ицхак Пинтосевич",p:"14 книг. ~1M тираж. 1,750,000+ подписчиков.",ctx:"Автор бестселлеров, международный спикер и бизнес-тренер.",gc:"Персональный брендинг. Бестселлер «В Рай на S-class'е» — АСТ, отзыв правнука Генри Форда.",bx:["xVision","xProduction"],cl:"#7209B7"},
{c:"Глобально",n:"Big Invest Summit",p:"23 мировых спикера. 1,500 участников.",ctx:"Крупнейший инвестиционный саммит с международными спикерами.",gc:"Полная упаковка и продвижение саммита.",bx:["xProduction","xPerformance"],cl:"#3A0CA3"},
{c:"Украина",n:"Аквакласс",p:"2,344 ребёнка/мес. 7 студий.",ctx:"Детское развитие через плавание. Forbes Woman Mercury Awards шорт-лист.",gc:"Упаковка бренда. Выход в шорт-лист Forbes Woman Mercury Awards.",bx:["xProduction","xBrand"],cl:"#4CC9F0"},
{c:"Россия",n:"Владимир Древс",p:"1,500,000+ подписчиков. 50,000+ выпускников.",ctx:"Образовательные продукты и персональный бренд.",gc:"xPerson. Упаковка продуктов и воронки продаж.",bx:["xProduction","xPerformance","xSales"],cl:"#560BAD"},
{c:"Россия",n:"Артём Бриус",p:"1,000,000+ подписчиков.",ctx:"Растущий персональный бренд.",gc:"xPerson. Стратегия роста и монетизации аудитории.",bx:["xVision","xProduction"],cl:"#F72585"},
];

function CasesBlock() {
  const scrollRef=useRef(null);
  const [active,setActive]=useState(0);
  const [galIdx,setGalIdx]=useState(0);
  const [ref,vis]=useInView(0.15);
  useEffect(()=>{const iv=setInterval(()=>setGalIdx(p=>p+1),3000);return ()=>clearInterval(iv);},[]);
  useEffect(()=>{
    const el=scrollRef.current;if(!el)return;
    const fn=()=>{const cw=el.firstChild?el.firstChild.offsetWidth+12:340;setActive(Math.min(Math.round(el.scrollLeft/cw),CS.length-1));};
    el.addEventListener("scroll",fn,{passive:true});
    return ()=>el.removeEventListener("scroll",fn);
  },[]);
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"72px 0 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Бренды из Forbes и Fortune 500</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Сильнейшие в кейсах.</h2>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {CS.map((s,i)=>(
          <div key={i} style={{flex:"0 0 clamp(300px,80vw,360px)",scrollSnapAlign:"start",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",display:"flex",flexDirection:"column",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.3+i*.06}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.3+i*.06}s`}}>
            <div style={{height:160,position:"relative",overflow:"hidden",background:s.cl}}>
              {[0,1,2].map(si=>{const shapes=[[{x:"10%",y:"20%",w:"50%",h:"60%",r:"40%",o:.15},{x:"60%",y:"-10%",w:"45%",h:"70%",r:"50%",o:.1},{x:"30%",y:"50%",w:"30%",h:"40%",r:"50%",o:.08}],[{x:"-5%",y:"30%",w:"40%",h:"80%",r:"50%",o:.12},{x:"50%",y:"10%",w:"55%",h:"50%",r:"40%",o:.15},{x:"70%",y:"50%",w:"35%",h:"45%",r:"50%",o:.1}],[{x:"40%",y:"-10%",w:"60%",h:"65%",r:"50%",o:.14},{x:"-10%",y:"40%",w:"35%",h:"70%",r:"50%",o:.1},{x:"60%",y:"50%",w:"40%",h:"50%",r:"45%",o:.12}]];return (
                <div key={si} style={{position:"absolute",inset:0,opacity:galIdx%3===si?1:0,transition:"opacity 1s ease"}}>
                  {shapes[si].map((sh,shi)=>(<div key={shi} style={{position:"absolute",left:sh.x,top:sh.y,width:sh.w,height:sh.h,borderRadius:sh.r,background:`rgba(255,255,255,${sh.o})`}}/>))}
                </div>);
              })}
              <div style={{position:"absolute",top:12,left:16}}><span style={{fontFamily:FT,fontSize:10,fontWeight:500,color:"#fff",background:"rgba(255,255,255,.20)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:6,padding:"3px 8px",letterSpacing:.3}}>{s.c}</span></div>
              <div style={{position:"absolute",bottom:12,left:16,right:16}}><div style={{fontFamily:FD,fontSize:24,fontWeight:700,color:"#fff",letterSpacing:-0.5,lineHeight:"28px"}}>{s.n}</div></div>
              <div style={{position:"absolute",bottom:12,right:16,display:"flex",gap:4}}>{[0,1,2].map(di=>(<div key={di} style={{width:5,height:5,borderRadius:"50%",background:galIdx%3===di?"#fff":"rgba(255,255,255,.35)",transition:"background .3s"}}/>))}</div>
            </div>
            <div style={{padding:"14px 20px 0"}}><div style={{fontFamily:FD,fontSize:15,fontWeight:600,color:"#000",letterSpacing:-0.3,lineHeight:"19px"}}>{s.p}</div></div>
            <div style={{padding:"12px 20px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
              <div><div style={{fontFamily:FT,fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.25)",marginBottom:3}}>Контекст</div><div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.50)",lineHeight:"17px"}}>{s.ctx}</div></div>
              <div><div style={{fontFamily:FT,fontSize:10,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.25)",marginBottom:3}}>Game Changer</div><div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.50)",lineHeight:"17px"}}>{s.gc}</div></div>
              <div style={{marginTop:"auto",display:"flex",flexWrap:"wrap",gap:6}}>{s.bx.map((b,bi)=>(<span key={bi} style={{fontFamily:FT,fontSize:11,fontWeight:500,color:s.cl,background:`${s.cl}10`,border:`1px solid ${s.cl}20`,borderRadius:100,padding:"3px 10px"}}>{b}</span>))}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:20,flexWrap:"wrap",maxWidth:300,margin:"20px auto 0"}}>
        {CS.map((_,i)=>(<div key={i} style={{width:7,height:7,borderRadius:"50%",background:active===i?"rgba(0,0,0,.30)":"rgba(0,0,0,.10)",transition:"background .3s"}} />))}
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Рукой подать</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>60+ из Fortune 500.</h2>
        <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Усиливаем тех, кто обслуживает лучших в мире.</p>
      </div>
      <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",transition:"opacity .6s ease .4s, transform .8s cubic-bezier(.2,.8,.2,1) .4s"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
        <div style={{display:"flex",flexWrap:"wrap",gap:"8px 0"}}>
          {CATS.map((c,i)=>(
            <div key={i} style={{width:"100%",display:"flex",alignItems:"baseline",gap:8,padding:"4px 0",borderBottom:i<CATS.length-1?".5px solid rgba(0,0,0,.04)":"none"}}>
              <span style={{fontFamily:FT,fontSize:10,fontWeight:600,color:"#C8A44E",letterSpacing:.5,textTransform:"uppercase",flexShrink:0,width:90,display:"inline-block"}}>{c.l}</span>
              <span style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.35)",lineHeight:"17px"}}>{c.b}</span>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>35+ индустрий</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Глубокая насмотренность.</h2>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
        {INDUSTRIES.map((t,i)=>(
          <span key={i} style={{display:"inline-block",padding:"6px 14px",borderRadius:100,fontFamily:FT,fontSize:12,fontWeight:600,lineHeight:"15px",letterSpacing:-0.1,background:"#000",border:"none",color:"#fff",opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.8)",transition:`opacity .4s ease ${.35+i*.025}s, transform .5s cubic-bezier(.2,.8,.2,1) ${.35+i*.025}s`}}>{t}</span>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Методология</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:0,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>7 систем Billions X.</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {SYSTEMS.map((s,i)=>{
          const isOpen=open===i;
          return (
            <div key={i} onClick={()=>setOpen(isOpen?-1:i)} style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:16,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"16px 20px",cursor:"pointer",position:"relative",overflow:"hidden",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`opacity .5s ease ${.35+i*.1}s, transform .6s cubic-bezier(.2,.8,.2,1) ${.35+i*.1}s`}}>
              <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:FD,fontSize:22,fontWeight:700,color:"rgba(60,60,67,.18)",lineHeight:1}}>{i+1}</span>
                  <div>
                    <div style={{fontFamily:FD,fontSize:17,fontWeight:600,color:"#000",letterSpacing:-0.43,lineHeight:"22px"}}>{s.x}</div>
                    <div style={{fontFamily:FT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.60)",letterSpacing:-0.23,lineHeight:"20px",marginTop:2}}>{s.t}</div>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{flexShrink:0,transform:isOpen?"rotate(180deg)":"rotate(0)",transition:"transform .3s cubic-bezier(.2,.8,.2,1)"}}><path d="M4 6l4 4 4-4" fill="none" stroke="rgba(60,60,67,.30)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{maxHeight:isOpen?360:0,opacity:isOpen?1:0,overflow:"hidden",transition:"max-height .4s cubic-bezier(.2,.8,.2,1), opacity .3s ease"}}>
                <div style={{paddingTop:12,borderTop:".5px solid rgba(0,0,0,.06)",marginTop:12}}>
                  <div style={{fontFamily:FT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.60)",letterSpacing:-0.23,lineHeight:"20px",marginBottom:8}}>{s.d}</div>
                  <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(60,60,67,.40)",letterSpacing:-0.08,lineHeight:"18px"}}>{s.c}</div>
                  <div style={{height:".5px",background:"rgba(0,0,0,.06)",margin:"10px 0"}}/>
                  <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,color:"rgba(0,0,0,.25)",marginBottom:4}}>Внедрение xAI</div>
                  <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(60,60,67,.50)",lineHeight:"17px"}}>{s.ai}</div>
                  <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(60,60,67,.35)",lineHeight:"16px",marginTop:2}}>{s.aig}</div>
                </div>
              </div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:6}}>45+ продуктов</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px"}}>Всё, что нужно для мирового игрока.</h2>
        <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Измеримый возврат на каждый доллар. От стартапов до лидеров отраслей.</p>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",marginBottom:20,paddingBottom:2}}>
        {PRODS.map((p,i)=>(
          <div key={i} onClick={()=>setTab(i)} style={{fontFamily:FT,fontSize:12,fontWeight:tab===i?600:500,color:tab===i?"#fff":"rgba(0,0,0,.50)",background:tab===i?"#1C1C1E":"rgba(0,0,0,.04)",borderRadius:10,padding:"8px 14px",cursor:"pointer",flexShrink:0,transition:"all .25s ease",border:tab===i?"none":".5px solid rgba(0,0,0,.06)"}}>{p.nm}</div>
        ))}
      </div>
      {/* Content */}
      <div style={{background:"#1C1C1E",borderRadius:20,overflow:"hidden"}}>
        <div style={{padding:"24px 20px 16px"}}>
          <div style={{fontFamily:FD,fontSize:24,fontWeight:700,color:"rgba(235,235,245,1)",letterSpacing:-0.5,lineHeight:"28px"}}>{pr.nm}</div>
          <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"rgba(235,235,245,.45)",letterSpacing:-0.08,lineHeight:"18px",marginTop:2}}>{pr.sub}</div>
          <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.55)",letterSpacing:-0.08,lineHeight:"16px",marginTop:8}}>{pr.desc}</div>
        </div>
        <div style={{height:".5px",background:"rgba(235,235,245,.08)",marginLeft:20,marginRight:20}}/>
        <div style={{padding:"4px 20px 20px"}}>
          {pr.items.map((it,ii)=>(
            <div key={ii} style={{padding:"14px 0",borderBottom:ii<pr.items.length-1?".5px solid rgba(235,235,245,.06)":"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                <div style={{fontFamily:FD,fontSize:15,fontWeight:600,color:"rgba(235,235,245,.85)",letterSpacing:-0.23,lineHeight:"20px"}}>{it.n}</div>
                <div style={{fontFamily:FT,fontSize:11,fontWeight:500,color:"rgba(235,235,245,.50)",cursor:"pointer",flexShrink:0,marginLeft:12}}>Обсудить →</div>
              </div>
              <div style={{fontFamily:FT,fontSize:12,fontWeight:400,color:"rgba(235,235,245,.65)",letterSpacing:-0.08,lineHeight:"16px",marginTop:4}}>{it.d}</div>
              <div style={{display:"flex",gap:16,marginTop:6}}>
                {it.biz&&<div style={{fontFamily:FT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.65)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.40)"}}>При обороте: </span>{it.biz}</div>}
                <div style={{fontFamily:FT,fontSize:11,fontWeight:400,color:"rgba(235,235,245,.70)",letterSpacing:0.07}}><span style={{color:"rgba(235,235,245,.40)"}}>Стоимость: </span>{it.p}</div>
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
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"72px 0 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>Позиция на рынке</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Уникальность.</h2>
        <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Billions X за 15+ лет и реализацию 300+ проектов собрала редкую компетенцию и стала топовым мировым игроком.</p>
      </div>
      <div style={{padding:"0 clamp(24px,6vw,48px)"}}>
        <div style={{background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",overflow:"hidden",position:"relative",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(16px) scale(0.97)",transition:"opacity .6s ease .5s, transform .8s cubic-bezier(.2,.8,.2,1) .5s"}}>
          <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none",zIndex:1}} />
          <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            <table style={{borderCollapse:"collapse",width:"max-content",minWidth:"100%",fontFamily:FT}}>
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
            <div style={{fontFamily:"Georgia,serif",fontSize:13,fontStyle:"italic",color:"rgba(0,0,0,.25)",lineHeight:"14px"}}>✓* — AI генерирует стратегии, тексты, дизайн и код. Но не обладает целостным видением, не управляет командами, не обучает отделы продаж, не проводит переговоры, не выступает продакт-оунером внутри компании, не отвечает за конкретные суммы, которые должны зайти в компанию (как коммерческий партнёр) и не имеет 15-летнего опыта трансформации реальных бизнесов. AI — инструмент внутри Billions X и других команд, но не замена.</div>
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
  const card = {flex:"0 0 clamp(260px,70vw,300px)",scrollSnapAlign:"start",background:"rgba(255,255,255,.55)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:20,display:"flex",flexDirection:"column",willChange:"transform,opacity"};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,width:"100%",padding:"72px 0 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(28px) scale(0.97)",transition:"opacity .7s ease, transform .8s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 clamp(24px,6vw,48px)",marginBottom:24,textAlign:"center"}}>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(60,60,67,.35)",marginBottom:16,opacity:vis?1:0,transition:"opacity .5s ease .1s"}}>7 законов продукта</div>
        <h2 style={{fontFamily:FD,fontSize:38,fontWeight:800,letterSpacing:"-0.02em",lineHeight:1,color:"#000",margin:"0 0 16px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(12px)",transition:"opacity .5s ease .2s, transform .6s cubic-bezier(.2,.8,.2,1) .2s"}}>Основа каждого решения Billions{"\u00A0"}X.</h2>
        <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0,opacity:vis?1:0,transition:"opacity .5s ease .35s"}}>Крупнейшие компании мира — Apple, Tesla, Amazon, Google, SpaceX — выросли не на продуктах, а на принципах, по которым эти продукты создаются, презентуются и масштабируются в массах.</p>
      </div>
      <div ref={scrollRef} style={{display:"flex",gap:12,overflowX:"auto",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",paddingLeft:"clamp(24px,6vw,48px)",paddingRight:"clamp(24px,6vw,48px)",paddingBottom:4,scrollbarWidth:"none"}}>
        {LAWS.map((l,i)=>(
          <div key={i} style={{...card,opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:`opacity .6s ease ${.5+i*.07}s, transform .7s cubic-bezier(.2,.8,.2,1) ${.5+i*.07}s`}}>
            <div style={{fontFamily:FD,fontSize:28,fontWeight:700,color:"rgba(0,0,0,.08)",lineHeight:1,marginBottom:8}}>{l.n}</div>
            <div style={{fontFamily:FD,fontSize:20,fontWeight:600,color:"#000",letterSpacing:-0.6,lineHeight:"25px",marginBottom:8}}>{l.t}</div>
            <div style={{fontFamily:FT,fontSize:15,fontWeight:400,color:"rgba(60,60,67,.55)",letterSpacing:-0.23,lineHeight:"19px"}}>{l.d}</div>
          </div>
        ))}
        <div style={{...card,justifyContent:"center",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(24px) scale(0.96)",transition:"opacity .6s ease 1s, transform .7s cubic-bezier(.2,.8,.2,1) 1s"}}>
          <div style={{fontFamily:FT,fontSize:13,fontWeight:400,color:"#000",letterSpacing:-0.08,lineHeight:"17px",textAlign:"left"}}>Billions X построен на 7 законах продукта. Это фундаментальные законы, которые определяют, вырастет бизнес или нет. Каждый из 300+ проектов Billions X за 15+ лет подтверждает: бизнесы, в которых работают все 7 законов, растут экспоненциально. Бизнесы, в которых отсутствует хотя бы один — стагнируют.</div>
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
  const x = {fontFamily:FD,fontSize:13,fontWeight:400,color:"rgba(0,0,0,.20)",letterSpacing:1};
  return (
    <div ref={ref} style={{position:"relative",zIndex:1,maxWidth:680,margin:"0 auto",padding:"72px clamp(24px,6vw,48px) 72px",opacity:vis?1:0,transform:vis?"translateY(0) scale(1)":"translateY(20px) scale(0.97)",transition:"opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1)"}}>
      <div style={{background:"rgba(255,255,255,.42)",backdropFilter:"blur(40px) saturate(180%)",WebkitBackdropFilter:"blur(40px) saturate(180%)",border:".5px solid rgba(255,255,255,.45)",borderRadius:20,boxShadow:"0 .5px 0 rgba(255,255,255,.9) inset, 0 4px 16px rgba(0,0,0,.06)",padding:"20px 16px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:"4%",right:"4%",height:".5px",background:"linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent)",pointerEvents:"none"}} />
        <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",color:"rgba(0,0,0,.35)",marginBottom:8,textAlign:"center"}}>Формула мирового бренда</div>
        <div style={{fontFamily:FD,fontSize:13,fontWeight:600,color:"#000",lineHeight:"18px",letterSpacing:-0.2,textAlign:"center"}}>
          Стратегия<span style={x}> × </span>Смыслы<span style={x}> × </span>Продукт<span style={x}> × </span>Упаковка<span style={x}> × </span>Продвижение<span style={x}> × </span>Продажи<span style={x}> × </span>AI
        </div>
        <div style={{fontFamily:FT,fontSize:11,fontWeight:400,color:"rgba(0,0,0,.30)",lineHeight:"14px",letterSpacing:0.15,textAlign:"center",marginTop:12}}>Если убрать любой множитель — результат обнуляется.</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t=setTimeout(()=>setReady(true),300); return ()=>clearTimeout(t); }, []);
  const logo = useSpring(ready, 0);
  const sub = useSpring(ready, 400);
  const body = useSpring(ready, 800);

  return (
    <div style={{position:"relative",width:"100%",minHeight:"100dvh",background:"#FFFFFF",overflowX:"hidden"}}>
      <CanvasBG />
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:680,padding:"clamp(80px,15vh,140px) clamp(24px,6vw,48px) 48px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{opacity:logo.opacity,transform:`translateY(${logo.y}px)`,willChange:"transform,opacity",marginBottom:16,textAlign:"center"}}>
          <div style={{fontFamily:FT,fontSize:11,fontWeight:600,letterSpacing:.5,textTransform:"uppercase",color:"rgba(0,0,0,.30)"}}>Маркетинг богатых и очень богатых</div>
        </div>
        <div style={{opacity:sub.opacity,transform:`translateY(${sub.y}px)`,willChange:"transform,opacity",textAlign:"center"}}>
          <h1 style={{fontFamily:FD,fontSize:"clamp(52px,11vw,76px)",fontWeight:800,color:"#000",letterSpacing:"-0.02em",lineHeight:1,margin:0}}>Billions X</h1>
        </div>
        <div style={{opacity:body.opacity,transform:`translateY(${body.y}px)`,willChange:"transform,opacity",textAlign:"center",maxWidth:520,marginTop:16}}>
          <p style={{fontFamily:FT,fontSize:"clamp(15px,2.2vw,17px)",fontWeight:400,letterSpacing:-0.43,lineHeight:"22px",color:"rgba(60,60,67,.55)",margin:0}}>Приносим «иксы»  денег, создавая архитектуру роста бизнеса как целостную систему, где стратегия, смыслы, бренды, линейка продуктов, упаковка, сайты, приложения, реклама, продажи и технологии — работают в едином механизме.</p>
        </div>
        <Visual active={ready} delay={1100} />
      </div>
      <div style={{background:"linear-gradient(135deg,rgba(131,58,180,.08),rgba(252,175,69,.08),rgba(72,191,227,.08),rgba(88,86,214,.08))"}}><NumbersBlock /></div>
      <div style={{background:"#FFFFFF"}}><ResultsBlock /></div>
      <div style={{background:"linear-gradient(135deg,rgba(88,86,214,.08),rgba(214,41,118,.08),rgba(253,29,29,.06),rgba(131,58,180,.08))"}}><AwardsBlock /></div>
      <div style={{background:"#FFFFFF"}}><CasesBlock /></div>
      <div style={{background:"linear-gradient(135deg,rgba(247,119,55,.08),rgba(255,220,100,.06),rgba(131,58,180,.08),rgba(72,191,227,.06))"}}><BrandsBlock /></div>
      <div style={{background:"#FFFFFF"}}><IndustriesBlock /></div>
      <div style={{background:"linear-gradient(135deg,rgba(72,191,227,.08),rgba(88,86,214,.08),rgba(252,175,69,.06),rgba(214,41,118,.06))"}}><SystemsBlock /></div>
      <div style={{background:"#FFFFFF"}}><ProductsBlock /></div>
      <div style={{background:"linear-gradient(135deg,rgba(131,58,180,.08),rgba(252,175,69,.08),rgba(72,191,227,.08),rgba(88,86,214,.08))"}}><UniquenessBlock /></div>
      <div style={{background:"linear-gradient(135deg,rgba(165,55,253,.08),rgba(193,53,132,.06),rgba(255,220,100,.08),rgba(72,191,227,.06))"}}><LawsCarousel /></div>
      <div style={{background:"#FFFFFF"}}><FormulasBlock /></div>
      <style>{`*{margin:0;padding:0;box-sizing:border-box}html,body{background:#FFFFFF;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden;-webkit-text-size-adjust:100%;text-size-adjust:100%}::-webkit-scrollbar{display:none}@supports(-webkit-touch-callout:none){body{-webkit-overflow-scrolling:touch}}@media(prefers-reduced-motion:reduce){*{transition-duration:0.01ms!important;animation-duration:0.01ms!important}}@keyframes bxGrad{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}@keyframes bxGrad{0%{background-position:0% 50%}25%{background-position:100% 25%}50%{background-position:50% 100%}75%{background-position:0% 75%}100%{background-position:0% 50%}}`}</style>
    </div>
  );
}
