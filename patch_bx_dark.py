#!/usr/bin/env python3
"""Replace BillionsXApp with dark luxury + iOS 26 Glass + real billionsx.com photos"""
path = 'apps/web/app/page.tsx'
with open(path,'r') as f: code = f.read()

start_marker = "function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {"
end_marker = "\n\n\n// ─── TAB BAR ──"
start_idx = code.index(start_marker)
end_idx = code.index(end_marker, start_idx)

new_code = r'''function BillionsXApp({ onClose, mode = 'embedded' }: { onClose?: () => void; mode?: string }) {
  const [bxView,setBxView]=useState<string>('landing');
  const scrollRef=useRef<HTMLDivElement>(null);
  const G='#C8A44E';const GG='linear-gradient(135deg,#C8A44E,#F4D675)';

  // Real photos from billionsx.com
  const P:any={
    xp1:'https://static.tildacdn.net/tild6366-6531-4138-a565-613864366262/xProduction-02-min-m.png',
    xp2:'https://static.tildacdn.net/tild6234-3135-4535-a338-643234656139/xProduction-013-min.png',
    xp3:'https://static.tildacdn.net/tild3434-3261-4238-b963-323534383238/xProduction-04-min-m.png',
    astro:'https://static.tildacdn.net/tild6663-6536-4763-b563-643364306366/Astronaut_Brenson_2-.png',
    ceo:'https://static.tildacdn.net/tild3632-6639-4131-b036-313335323639/billions-x-leads-ceo.png',
    leads:'https://static.tildacdn.net/tild6536-3336-4739-a537-633437316463/billions-x-leads-bag.png',
    mac:'https://static.tildacdn.net/tild3335-3935-4862-a631-303033306436/mac-min-min.png',
    book:'https://static.tildacdn.net/tild6562-6465-4662-b564-343864643537/upakovka-biznesa-i-b.jpg',
    bite:'https://static.tildacdn.net/tild3733-6338-4232-b331-636365623264/2white.jpg',
    breathe:'https://static.tildacdn.net/tild6564-3534-4634-b532-396665326636/breathe-helper-mask-.png',
    press:'https://static.tildacdn.net/tild3664-3230-4765-a337-316636336532/press-min-2.png',
    bx:'https://static.tildacdn.net/tild3638-3434-4466-b666-663738363034/billionsx.svg',
    fortune:'https://static.tildacdn.net/tild3764-6661-4136-b465-323638613235/fortune.svg',
    forbes:'https://static.tildacdn.net/tild3733-3933-4430-b664-343465353562/forbes.svg',
    award:'https://static.tildacdn.net/tild6432-6165-4331-a237-353863663131/billionsx-award.svg',
    parq:'https://static.tildacdn.net/tild3136-3737-4630-a662-653761313836/parq.svg',
    orbi:'https://static.tildacdn.net/tild3534-3835-4861-b639-383661306633/kompaniya-po-upakovk.svg',
    abb:'https://static.tildacdn.net/tild3237-3966-4333-b931-343033663266/abb-3.svg',
    eaton:'https://static.tildacdn.net/tild3635-3239-4365-a662-653633616466/eaton-6.svg',
    maxbox:'https://static.tildacdn.net/tild3231-6166-4531-a132-396464323565/maxboxvr-for-white.svg',
    bulldog:'https://static.tildacdn.net/tild3361-6564-4238-a465-376166336431/bulldog-gold.svg',
    biteLogo:'https://static.tildacdn.net/tild6238-6565-4238-a232-613361366430/bite.svg',
    georgia:'https://static.tildacdn.net/tild6339-6262-4264-a662-333036313765/georgia.svg',
    ryb:'https://static.tildacdn.net/tild3830-6238-4239-b730-363235313065/ribakov-min-2-min.png',
    cher:'https://static.tildacdn.net/tild6366-3736-4331-b734-623165613636/chernyak-min-2-min.png',
    hart:'https://static.tildacdn.net/tild3230-6532-4665-b737-316638356565/hartmann-min-2-min.png',
  };

  // Client logos (60+)
  const cLogos=[
    'https://static.tildacdn.net/tild3036-3734-4566-b161-316136326262/google-1-1.svg',
    'https://static.tildacdn.net/tild6133-3264-4833-b836-353230626635/microsoft.svg',
    'https://static.tildacdn.net/tild6331-3966-4235-a639-386634343662/nasa-3.svg',
    'https://static.tildacdn.net/tild6439-6434-4266-b764-323530343464/bmw.svg',
    'https://static.tildacdn.net/tild6438-3733-4233-a566-376363663739/nike-4.svg',
    'https://static.tildacdn.net/tild3966-3935-4734-b836-663833633034/disney.svg',
    'https://static.tildacdn.net/tild3464-3039-4639-a562-386563396262/visa.svg',
    'https://static.tildacdn.net/tild3437-6565-4336-a135-646133633838/rolls-royce-por-hern.svg',
    'https://static.tildacdn.net/tild3437-6134-4461-a532-313266353239/jp-morgan.svg',
    'https://static.tildacdn.net/tild3162-3562-4136-b437-633333386434/mercedes-benz-4.svg',
    'https://static.tildacdn.net/tild3531-6261-4239-a634-316532383639/mastercard-2.svg',
    'https://static.tildacdn.net/tild6135-6361-4866-b137-613131623131/ibm.svg',
    'https://static.tildacdn.net/tild3339-3762-4162-a332-646332323361/sony-2.svg',
    'https://static.tildacdn.net/tild3865-3363-4435-b563-613065323162/coca-cola.svg',
    'https://static.tildacdn.net/tild3539-3162-4338-a438-623062613561/deloitte-2.svg',
    'https://static.tildacdn.net/tild3865-3936-4538-b736-353232633737/pwc.svg',
    'https://static.tildacdn.net/tild3835-6230-4336-a131-373562633536/siemens-3.svg',
    'https://static.tildacdn.net/tild3435-6164-4330-a465-396331313630/hilton-2.svg',
    'https://static.tildacdn.net/tild6136-6532-4838-b531-313732343866/adidas-9.svg',
    'https://static.tildacdn.net/tild3261-6332-4433-b262-613964336265/oracle-2.svg',
  ];

  const scrollTo=(id:string)=>{const el=document.getElementById(id);el?.scrollIntoView({behavior:'smooth'});};

  // iOS 26 Glass (dark variant)
  const dg=(x:any={})=>({background:'rgba(255,255,255,.06)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',borderRadius:20,border:'.5px solid rgba(255,255,255,.08)',boxShadow:'0 .5px 0 rgba(255,255,255,.12) inset, 0 2px 12px rgba(0,0,0,.15)',overflow:'hidden' as const,...x});

  // ── CASE DETAIL ──
  if(bxView==='parq'||bxView==='orbi'){
    const isP=bxView==='parq';
    return(<div style={{position:'fixed',inset:0,zIndex:9998,background:'#000',color:'#fff',display:'flex',flexDirection:'column'}}>
      {/* Glass nav */}
      <div style={{position:'sticky',top:0,zIndex:10,padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(0,0,0,.6)',backdropFilter:'blur(30px) saturate(180%)',WebkitBackdropFilter:'blur(30px) saturate(180%)',borderBottom:'.5px solid rgba(255,255,255,.06)'}}>
        <span className="tap" onClick={()=>{setBxView('landing');if(scrollRef.current)scrollRef.current.scrollTop=0;}} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:G,cursor:'pointer'}}>‹ Назад</span>
        <span style={{fontSize:12,fontWeight:700,letterSpacing:3,fontFamily:FD,color:'rgba(255,255,255,.25)'}}>BILLIONS X</span>
        {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:15,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>Закрыть</span>:<div style={{width:50}}/>}
      </div>
      <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
        <img src={isP?P.xp1:P.leads} alt="" style={{width:'100%',height:300,objectFit:'cover'}}/>
        <div style={{padding:'28px 24px 80px',maxWidth:600,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <img src={isP?P.parq:P.orbi} alt="" style={{height:28,filter:'brightness(0) invert(1)',opacity:.7}}/>
            <img src={P.award} alt="" style={{height:20,filter:'brightness(0) invert(1)',opacity:.3}}/>
          </div>
          <h1 style={{fontSize:32,fontWeight:800,fontFamily:FD,margin:'0 0 4px'}}>{isP?'PARQ Development':'ORBI Group'}</h1>
          <p style={{fontSize:14,color:'rgba(255,255,255,.35)',fontFamily:FT,margin:'0 0 20px',letterSpacing:1}}>{isP?'BALI | INDONESIA':'BATUMI | GEORGIA'}</p>
          <div style={{...dg({borderRadius:14,background:'rgba(200,164,78,.08)',border:'.5px solid rgba(200,164,78,.12)'}),padding:'14px 18px',marginBottom:28}}>
            <p style={{fontSize:15,fontWeight:700,fontFamily:FD,color:G,margin:0,lineHeight:1.45}}>{isP?'№1 застройщик Бали за 1 год. Распродан целый район вилл. До 2,000 посетителей ежедневно.':'Рост в 20 раз. 55 офисов в 19 странах. Самый большой гостиничный комплекс в мире — 12,000+ апартаментов.'}</p>
          </div>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:10}}>Контекст рынка</p>
          <p style={{fontSize:16,color:'rgba(255,255,255,.55)',fontFamily:FT,lineHeight:1.7,margin:'0 0 28px'}}>{isP?'После пандемии началась полномасштабная война между РФ и Украиной. Многие жители обеих стран начали искать возможность жить вдали от конфликта. Возникла потребность в комфортной недвижимости, которая бы обеспечивала непрерывную деловую, творческую и семейную коммуникацию.':'Батуми — единственный город в мире с населением менее 200,000 человек, в котором расположено самое большое количество международных гостиничных брендов. Три года подряд Батуми бьёт рекорды (+20% ежегодно) как новый туристический тренд, по версии большинства всемирно известных изданий. Крупнейший застройщик Европы ORBI Group застраивает первую линию у моря небоскрёбами, создавая из Батуми мировой феномен «Второго Дубая».'}</p>
          {!isP&&<><p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:10}}>Контекст компании</p><p style={{fontSize:16,color:'rgba(255,255,255,.55)',fontFamily:FT,lineHeight:1.7,margin:'0 0 28px'}}>ORBI Group начинает застройку самого масштабного гостиничного комплекса в мире на первой линии в 50м от пляжа в туристическом центре Батуми. Это настоящий «город в городе» — 200,000 кв.м. только инфраструктуры.</p></>}
          <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:10}}>Billions X Game Changer</p>
          <p style={{fontSize:16,color:'rgba(255,255,255,.55)',fontFamily:FT,lineHeight:1.7,margin:'0 0 28px'}}>{isP?'Мы дали старт всему маркетингу PARQ Development, упаковав виллы и комплекс PARQ Ubud для рекламных коллабораций с крупными блогерами. Высокая конверсия из рекламы в продажи позволила распродать целый район вилл. За год PARQ Development стал самым быстрорастущим и крупнейшим застройщиком на острове.':'Для ORBI Group был принят стратегически важный план быстрого роста. Мы в течение полутора лет выступали в роли продакт-оунера, обеспечивая полный контроль над продуктом для всех отделов компании: маркетинга, рекламы, PR, продаж, колл-центра. Разработали и внедрили единые стандарты продукта и методологии продаж, обучая всех менеджеров. В результате компания выросла в 20 раз, увеличив количество офисов до 55 в 19 странах.'}</p>
          {isP&&<div style={{padding:20,borderLeft:'2px solid '+G,marginBottom:28}}><p style={{fontSize:16,fontStyle:'italic',color:'rgba(255,255,255,.45)',fontFamily:FT,lineHeight:1.65,margin:0}}>«Parq Development придумала и реализовала концепцию «нового Бали» — места для экспатов, где можно жить, работать и инвестировать в недвижимость, не уезжая с острова с райской природой.»</p><p style={{fontSize:12,color:'rgba(255,255,255,.2)',fontFamily:FD,fontWeight:600,marginTop:10}}>Forbes</p></div>}
          {/* Awards */}
          {(isP?['До 2,000 человек посещают PARQ Ubud ежедневно','Сейчас строится 8 городов с масштабной инфраструктурой','16 лет опыта на рынке девелопмента на Бали']:['Награда Prix d\'Excellence FIABCI — «оскар» в сфере недвижимости','Жюри из 40 стран признало проект лучшим инвестиционным проектом мира','1,500,000 туристов ежегодно отдыхают в отелях ORBI Group','25 лет на рынке · 3,000,000 кв.м. построено']).map((a:string,i:number)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'12px 0',borderBottom:'.5px solid rgba(255,255,255,.06)'}}>
              <img src={P.award} alt="" style={{height:14,filter:'brightness(0) invert(1)',opacity:.25,marginTop:3,flexShrink:0}}/>
              <p style={{fontSize:14,fontWeight:500,fontFamily:FD,color:'rgba(255,255,255,.55)',margin:0,lineHeight:1.5}}>{a}</p>
            </div>
          ))}
          <div style={{height:32}}/>
          <button className="tap" onClick={()=>scrollTo('bx-form')} style={{width:'100%',padding:17,borderRadius:50,background:GG,color:'#000',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 30px rgba(200,164,78,.2)'}}>Обсудить ваш проект</button>
        </div>
      </div>
    </div>);
  }

  // ── LANDING ──
  return(
    <div style={{position:'fixed',inset:0,zIndex:9998,background:'#000',color:'#fff',display:'flex',flexDirection:'column'}}>
      {/* iOS 26 Glass Navigation */}
      <nav style={{position:'sticky',top:0,zIndex:10,padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(0,0,0,.6)',backdropFilter:'blur(30px) saturate(180%)',WebkitBackdropFilter:'blur(30px) saturate(180%)',borderBottom:'.5px solid rgba(255,255,255,.06)'}}>
        <img src={P.bx} alt="" style={{height:16,filter:'brightness(0) invert(1)',opacity:.4}}/>
        <div style={{display:'flex',gap:20}}>
          <span className="tap" onClick={()=>scrollTo('bx-cases')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>Кейсы</span>
          <span className="tap" onClick={()=>scrollTo('bx-prices')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>Цены</span>
          <span className="tap" onClick={()=>scrollTo('bx-form')} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>Обсудить</span>
        </div>
        {mode==='embedded'&&onClose?<span className="tap" onClick={onClose} style={{fontSize:13,fontWeight:600,fontFamily:FD,color:'#007AFF',cursor:'pointer'}}>✕</span>:<div style={{width:20}}/>}
      </nav>

      <div ref={scrollRef} style={{flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch'}}>

        {/* ═══ HERO — full bleed photo ═══ */}
        <section style={{position:'relative',minHeight:'85vh',display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'0 24px 48px'}}>
          <img src={P.xp2} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.3}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, #000 0%, rgba(0,0,0,.3) 50%, rgba(0,0,0,.6) 100%)'}}/>
          <div style={{position:'relative',zIndex:1,maxWidth:600}}>
            {/* Fortune/Forbes */}
            <div style={{display:'flex',gap:16,marginBottom:24,opacity:.25}}>
              <img src={P.fortune} alt="" style={{height:12,filter:'brightness(0) invert(1)'}}/>
              <img src={P.forbes} alt="" style={{height:12,filter:'brightness(0) invert(1)'}}/>
            </div>
            <h1 style={{fontSize:52,fontWeight:800,fontFamily:FD,lineHeight:1.02,margin:'0 0 20px',letterSpacing:-1}}>Упаковка<br/>бизнеса<br/>под ключ.</h1>
            <p style={{fontSize:18,fontFamily:FT,color:'rgba(255,255,255,.45)',lineHeight:1.55,margin:'0 0 12px',maxWidth:400}}>Продвигаем там, где конкуренты сливают бюджеты. Создаём высокий спрос на ваш продукт. Продаём дорого.</p>
            <p style={{fontSize:14,fontFamily:FT,color:'rgba(255,255,255,.25)',margin:'0 0 32px'}}>Полный цикл: стратегия, контент, реклама, лиды.</p>
            <div style={{display:'flex',gap:28,marginBottom:36}}>
              {[['$80B+','Капитализация'],['100+','Стран'],['60+','Fortune 500'],['10+','Лет']].map(([v,l]:any,i:number)=>(
                <div key={i}><div style={{fontSize:26,fontWeight:800,fontFamily:FD,color:G}}>{v}</div><div style={{fontSize:10,color:'rgba(255,255,255,.2)',fontFamily:FT,marginTop:3}}>{l}</div></div>
              ))}
            </div>
            <button className="tap" onClick={()=>scrollTo('bx-form')} style={{padding:'16px 40px',borderRadius:50,background:GG,color:'#000',fontSize:16,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',boxShadow:'0 4px 30px rgba(200,164,78,.3)'}}>Обсудить проект</button>
          </div>
        </section>

        {/* ═══ MANIFESTO ═══ */}
        <section style={{padding:'72px 24px',maxWidth:600,margin:'0 auto'}}>
          <p style={{fontSize:22,fontWeight:600,fontFamily:FD,color:'#fff',lineHeight:1.5,margin:'0 0 20px'}}>Приносим больше денег, круто упаковывая, стильно рекламируя и эффективно продвигая бизнесы, продукты, бренды, цифровые личности.</p>
          <p style={{fontSize:15,fontFamily:FT,color:'rgba(255,255,255,.3)',lineHeight:1.65,margin:0}}>Вы видели их на обложках, читали их книги, покупали их продукты. Мы — те, кто сделали их медийными, богатыми и влиятельными. Наш маркетинг стоит дорого, но наши клиенты зарабатывают ещё больше. Мы помогаем строить бизнесы, которые оставляют след в истории.</p>
        </section>

        {/* ═══ PRODUCT VISUAL — Mac ═══ */}
        <section style={{padding:'0 24px 48px',maxWidth:600,margin:'0 auto'}}>
          <div style={{...dg({borderRadius:24})}}>
            <img src={P.mac} alt="" style={{width:'100%',borderRadius:24,display:'block'}}/>
          </div>
        </section>

        {/* ═══ LOGO TICKER ═══ */}
        <div style={{padding:'20px 0',overflow:'hidden',borderTop:'.5px solid rgba(255,255,255,.04)',borderBottom:'.5px solid rgba(255,255,255,.04)'}}>
          <style>{`@keyframes bxTK{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
          <div style={{display:'flex',gap:32,alignItems:'center',animation:'bxTK 20s linear infinite',width:'max-content'}}>
            {[...cLogos,...cLogos].map((u:string,i:number)=>(<img key={i} src={u} alt="" style={{height:15,opacity:.15,filter:'brightness(0) invert(1)',flexShrink:0}}/>))}
          </div>
        </div>

        {/* ═══ CASES ═══ */}
        <section id="bx-cases" style={{padding:'56px 0 24px'}}>
          <div style={{padding:'0 24px',maxWidth:600,margin:'0 auto'}}>
            <p style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Кейсы</p>
            <h2 style={{fontSize:38,fontWeight:800,fontFamily:FD,lineHeight:1.05,margin:'0 0 6px'}}>Сильнейшие<br/>в кейсах.</h2>
            <p style={{fontSize:15,color:'rgba(255,255,255,.25)',fontFamily:FT,margin:'0 0 32px'}}>От малого бизнеса до корпораций. Бренды из Forbes и Fortune 500.</p>
          </div>

          {/* PARQ — full bleed */}
          <div className="tap" onClick={()=>{setBxView('parq');if(scrollRef.current)scrollRef.current.scrollTop=0;}} style={{position:'relative',cursor:'pointer',marginBottom:2}}>
            <img src={P.xp1} alt="" style={{width:'100%',height:380,objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 60%)'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 24px 24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',margin:0}}>Billions X Case</p>
                <img src={P.award} alt="" style={{height:14,filter:'brightness(0) invert(1)',opacity:.2}}/>
              </div>
              <img src={P.parq} alt="" style={{height:22,filter:'brightness(0) invert(1)',opacity:.6,marginBottom:6}}/>
              <h3 style={{fontSize:26,fontWeight:800,fontFamily:FD,margin:'0 0 4px'}}>PARQ Development</h3>
              <p style={{fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:FT,margin:'0 0 8px',letterSpacing:1}}>BALI | INDONESIA</p>
              <p style={{fontSize:14,fontWeight:600,fontFamily:FD,color:G,margin:0}}>№1 застройщик Бали за 1 год →</p>
            </div>
          </div>

          {/* ORBI — full bleed */}
          <div className="tap" onClick={()=>{setBxView('orbi');if(scrollRef.current)scrollRef.current.scrollTop=0;}} style={{position:'relative',cursor:'pointer',marginBottom:2}}>
            <img src={P.leads} alt="" style={{width:'100%',height:380,objectFit:'cover'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 60%)'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 24px 24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',margin:0}}>Billions X Case</p>
                <img src={P.award} alt="" style={{height:14,filter:'brightness(0) invert(1)',opacity:.2}}/>
              </div>
              <img src={P.orbi} alt="" style={{height:22,filter:'brightness(0) invert(1)',opacity:.6,marginBottom:6}}/>
              <h3 style={{fontSize:26,fontWeight:800,fontFamily:FD,margin:'0 0 4px'}}>ORBI Group</h3>
              <p style={{fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:FT,margin:'0 0 8px',letterSpacing:1}}>BATUMI | GEORGIA</p>
              <p style={{fontSize:14,fontWeight:600,fontFamily:FD,color:G,margin:0}}>Рост в 20 раз · 12,000+ апартаментов →</p>
            </div>
          </div>

          {/* 2Space — full bleed with astronaut */}
          <div style={{position:'relative',marginBottom:2}}>
            <img src={P.astro} alt="" style={{width:'100%',height:360,objectFit:'contain',objectPosition:'center',background:'linear-gradient(180deg,#0c0c1d,#1a1a3e)'}}/>
            <div style={{position:'absolute',inset:0,background:'linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 60%)'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0 24px 24px'}}>
              <p style={{fontSize:11,fontWeight:700,letterSpacing:3,color:G,fontFamily:FD,textTransform:'uppercase',margin:'0 0 8px'}}>Billions X Case</p>
              <h3 style={{fontSize:26,fontWeight:800,fontFamily:FD,margin:'0 0 4px'}}>2Space</h3>
              <p style={{fontSize:14,fontWeight:600,fontFamily:FD,color:G,margin:0}}>$100M+ · Richard Branson · 37 стран · 150+ спикеров</p>
            </div>
          </div>

          {/* Product visual — xProduction */}
          <div style={{padding:'24px 24px 0',maxWidth:600,margin:'0 auto'}}>
            <div style={{...dg({borderRadius:20,marginBottom:24})}}>
              <img src={P.xp3} alt="" style={{width:'100%',borderRadius:20,display:'block'}}/>
            </div>
          </div>

          {/* More cases — list */}
          <div style={{padding:'0 24px',maxWidth:600,margin:'0 auto'}}>
            {([
              [P.abb,'ABB','$43,000,000,000 капитализация · 105,000 сотрудников'],
              [P.eaton,'Eaton Corporation','$34,200,000,000 · 100+ стран · 130 лет'],
              [null,'PF Capital / Трансмашхолдинг','Оборот $1,986,450,000/год'],
              [P.maxbox,'MaxboxVR','Google Partner · 3,000+ клиентов Fortune 500'],
              [P.bulldog,'Гарик Харламов','9,200,000+ подписчиков · ТОП-3 Forbes'],
              [P.biteLogo,'Bite Helper','Победитель CES · ТОП-5 Amazon · NASA'],
              [P.georgia,'Инвестиционный бренд Грузии','Бренд целой страны'],
              [null,'Metaverse Bank','≈1,000 экранов приложения'],
            ] as any[]).map(([logo,n,r]:any,i:number)=>(
              <div key={i} style={{padding:'14px 0',borderBottom:'.5px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:14}}>
                {logo&&<img src={logo} alt="" style={{height:24,filter:'brightness(0) invert(1)',opacity:.4,flexShrink:0}}/>}
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:600,fontFamily:FD}}>{n}</div>
                  <div style={{fontSize:12,color:G,fontFamily:FD,fontWeight:600,marginTop:3}}>{r}</div>
                </div>
                <span style={{color:'rgba(255,255,255,.12)',fontSize:18}}>›</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section style={{padding:'56px 24px',borderTop:'.5px solid rgba(255,255,255,.06)',maxWidth:600,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:28}}>Рекомендации</p>
          {[{n:'Игорь Рыбаков',t:'Долларовый миллиардер',q:'BillionsX — команда, которая понимает масштаб и мыслит категориями роста. Когда нужен результат, а не процесс.',p:P.ryb},
            {n:'Евгений Черняк',t:'Долларовый мультимиллионер',q:'Профессионалы, которые умеют упаковать бизнес так, чтобы он продавал. Не обещания — результат.',p:P.cher},
            {n:'Оскар Хартманн',t:'Долларовый мультимиллионер',q:'Системный подход к маркетингу и брендингу на самом высоком уровне. Рекомендую как стратегических партнёров.',p:P.hart}
          ].map((t:any,i:number)=>(
            <div key={i} style={{marginBottom:28}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <img src={t.p} alt="" style={{width:44,height:44,borderRadius:22,objectFit:'cover',border:'1.5px solid rgba(200,164,78,.15)'}}/>
                <div><div style={{fontSize:15,fontWeight:700,fontFamily:FD}}>{t.n}</div><div style={{fontSize:11,color:'rgba(255,255,255,.25)',fontFamily:FT}}>{t.t}</div></div>
              </div>
              <p style={{fontSize:17,fontFamily:FT,fontStyle:'italic',color:'rgba(255,255,255,.45)',lineHeight:1.55,margin:0}}>«{t.q}»</p>
            </div>
          ))}
        </section>

        {/* ═══ SYSTEM ═══ */}
        <section style={{padding:'56px 24px',borderTop:'.5px solid rgba(255,255,255,.06)',maxWidth:600,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Полный цикл</p>
          <h2 style={{fontSize:38,fontWeight:800,fontFamily:FD,lineHeight:1.05,margin:'0 0 32px'}}>Один партнёр.<br/>Семь систем.</h2>
          {[['xVision™','Стратегия','Глубокий анализ рынка, конкурентов и аудитории','#FF9500'],['xGenetics™','ДНК бренда','Суперсила бренда и недостающие «гены» для победы','#AF52DE'],['xNeural™','Смыслы','То, за что клиенты готовы платить в 3 раза больше','#FF2D55'],['xProduction™','Упаковка','Сайты, бренды, визуалы на уровне Apple','#007AFF'],['xPerformance™','Продвижение','Реклама, SEO, PR — поток клиентов','#34C759'],['xSales™','Продажи','Книги продукта, обучение отделов, системы','#FF9500'],['xAI™','AI','Искусственный интеллект на каждом этапе','#5856D6']].map(([n,l,d,c]:any,i:number)=>(
            <div key={i} style={{padding:'14px 0',borderBottom:'.5px solid rgba(255,255,255,.06)',display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:14,fontWeight:800,fontFamily:FD,color:c,width:18,textAlign:'right',flexShrink:0}}>{i+1}</span>
              <div style={{flex:1}}>
                <span style={{fontSize:16,fontWeight:600,fontFamily:FD}}>{l}</span>
                <div style={{fontSize:12,color:'rgba(255,255,255,.3)',fontFamily:FT,marginTop:2}}>{d}</div>
              </div>
              <span style={{fontSize:11,fontWeight:600,fontFamily:FD,color:'rgba(255,255,255,.15)'}}>{n}</span>
            </div>
          ))}
        </section>

        {/* ═══ PRICES ═══ */}
        <section id="bx-prices" style={{padding:'56px 24px',borderTop:'.5px solid rgba(255,255,255,.06)',maxWidth:600,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Стоимость</p>
          <h2 style={{fontSize:38,fontWeight:800,fontFamily:FD,lineHeight:1.05,margin:'0 0 32px'}}>Три уровня.</h2>
          {[{n:'LAUNCH',r:'$15K – $50K',d:'Стартапы, новые продукты, персональные бренды',it:[['Brand Essence','$15,000'],['Personal Brand','$25,000'],['Campaign Launch','$15,000'],['Personal Producing','$50,000']]},
            {n:'SCALE',r:'$50K – $500K',d:'Компании с оборотом $1M – $50M',it:[['Space Vision','$75,000'],['Product Book','$50,000'],['SEO продвижение','от $15K/мес'],['Super App Dev','от $150K']]},
            {n:'DOMINATE',r:'$250K – $1M+',d:'Корпорации $50M+, девелоперы, государства',it:[['Full Transformation','от $250K'],['Product Ownership','от $500K/год'],['Nation Branding','от $500K'],['AI Platform','от $1M']]}
          ].map((tier:any,ti:number)=>(
            <div key={ti} style={{marginBottom:28}}>
              <div style={{display:'flex',alignItems:'baseline',gap:10,marginBottom:4}}>
                <span style={{fontSize:22,fontWeight:800,fontFamily:FD,color:G}}>{tier.n}</span>
                <span style={{fontSize:13,color:'rgba(255,255,255,.2)',fontFamily:FD}}>{tier.r}</span>
              </div>
              <p style={{fontSize:12,color:'rgba(255,255,255,.2)',fontFamily:FT,margin:'0 0 12px'}}>{tier.d}</p>
              {tier.it.map(([n,p]:any,i:number)=>(
                <div key={i} style={{padding:'12px 0',borderBottom:'.5px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:15,fontWeight:500,fontFamily:FD}}>{n}</span>
                  <span style={{fontSize:15,fontWeight:700,fontFamily:FD,color:G}}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </section>

        {/* ═══ FORM ═══ */}
        <section id="bx-form" style={{padding:'56px 24px 80px',borderTop:'.5px solid rgba(255,255,255,.06)',maxWidth:500,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:4,color:G,fontFamily:FD,textTransform:'uppercase',marginBottom:8}}>Заявка</p>
          <h2 style={{fontSize:38,fontWeight:800,fontFamily:FD,lineHeight:1.05,margin:'0 0 6px'}}>Обсудить проект.</h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,.2)',fontFamily:FT,margin:'0 0 28px'}}>12 проектов в год. Ответ в течение 48 часов.</p>
          {['Имя','Email','Телефон','Компания','О проекте'].map((ph:string)=>(
            <input key={ph} placeholder={ph} style={{width:'100%',boxSizing:'border-box' as const,padding:'16px 0',background:'transparent',border:'none',borderBottom:'.5px solid rgba(255,255,255,.1)',fontSize:16,fontFamily:FT,color:'#fff',outline:'none',marginBottom:4,display:'block'}}/>
          ))}
          <button className="tap" style={{width:'100%',padding:17,borderRadius:50,background:GG,color:'#000',fontSize:17,fontWeight:700,fontFamily:FD,border:'none',cursor:'pointer',marginTop:24,boxShadow:'0 4px 30px rgba(200,164,78,.2)'}}>Отправить</button>
        </section>

        <footer style={{padding:'32px 24px 60px',textAlign:'center',borderTop:'.5px solid rgba(255,255,255,.06)'}}>
          <img src={P.bx} alt="" style={{height:16,filter:'brightness(0) invert(1)',opacity:.15,marginBottom:8}}/>
          <p style={{fontSize:11,color:'rgba(255,255,255,.1)',fontFamily:FT,margin:0}}>Маркетинг богатых и очень богатых.</p>
        </footer>

      </div>
      <style>{`input::placeholder{color:rgba(255,255,255,.2)!important}`}</style>
    </div>
  );
}
'''

code = code[:start_idx] + new_code + code[end_idx+1:]
with open(path,'w') as f: f.write(code)
print(f"✅ Dark luxury + Glass + real photos. Size: {len(code):,}")
