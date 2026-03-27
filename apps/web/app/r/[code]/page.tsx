'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY0MzIsImV4cCI6MjA1NjU4MjQzMn0.SE6JE3GPIq5Ij7lVeCfMoLLjjN_pAViV3K3Qnt14_Yk';
const sb = createClient(SB_URL, SB_KEY);

function m(v: number) { return v?.toLocaleString('ru-RU') + ' \u20BD'; }
function dt(iso: string) { if (!iso) return ''; return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
const cats: any = { housing: '\u0416\u0438\u043B\u044C\u0451', tours: '\u042D\u043A\u0441\u043A\u0443\u0440\u0441\u0438\u0438', food: '\u041F\u0438\u0442\u0430\u043D\u0438\u0435', masterclass: '\u041C\u0430\u0441\u0442\u0435\u0440-\u043A\u043B\u0430\u0441\u0441', services: '\u0423\u0441\u043B\u0443\u0433\u0438', shop: '\u041C\u0430\u0433\u0430\u0437\u0438\u043D', tickets: '\u0411\u0438\u043B\u0435\u0442\u044B' };
const pays: any = { card_new: '\u041A\u0430\u0440\u0442\u0430', cash: '\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435', card: '\u041A\u0430\u0440\u0442\u0430', points: '\u0411\u0430\u043B\u043B\u044B', sbp: '\u0421\u0411\u041F', online: '\u041E\u043D\u043B\u0430\u0439\u043D' };
const sts: any = { paid: ['#34C759', '\u041E\u043F\u043B\u0430\u0447\u0435\u043D'], completed: ['#34C759', '\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D'], confirmed: ['#007AFF', '\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D'], pending: ['#FF9500', '\u041E\u0436\u0438\u0434\u0430\u0435\u0442'], cancelled: ['#FF3B30', '\u041E\u0442\u043C\u0435\u043D\u0451\u043D'], refunded: ['#FF3B30', '\u0412\u043E\u0437\u0432\u0440\u0430\u0442'] };

const G = {background:'rgba(255,255,255,.92)',backdropFilter:'blur(40px) saturate(180%)',WebkitBackdropFilter:'blur(40px) saturate(180%)',borderRadius:20,border:'0.5px solid rgba(255,255,255,.7)',boxShadow:'0 0.5px 0 rgba(255,255,255,.9) inset, 0 2px 16px rgba(0,0,0,.06)',padding:20,marginBottom:12,position:'relative' as const,overflow:'hidden' as const};

export default function ReceiptPage({ params }: any) {
  const [r, setR] = useState<any>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>('');

  useEffect(() => {
    params.then((p: any) => setCode(p.code));
  }, [params]);

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const { data, error } = await sb.rpc('public_view_receipt', { p_code: code });
        if (error || !data || data.error) { setErr(true); } else { setR(data); }
      } catch { setErr(true); }
      setLoading(false);
    })();
  }, [code]);

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F2F2F7',fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,border:'3px solid rgba(0,122,255,.15)',borderTop:'3px solid #007AFF',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}/>
        <div style={{fontSize:15,color:'rgba(60,60,67,.5)'}}>Загрузка чека...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (err || !r) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F2F2F7',fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif",padding:20}}>
      <div style={{...G,maxWidth:380,textAlign:'center',padding:'40px 30px'}}>
        <div style={{width:56,height:56,borderRadius:28,background:'rgba(255,59,48,.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div style={{fontSize:20,fontWeight:700,color:'#1C1C1E',marginBottom:8}}>Чек не найден</div>
        <div style={{fontSize:15,color:'rgba(60,60,67,.6)'}}>Проверьте QR-код и попробуйте снова</div>
      </div>
    </div>
  );

  const sc = sts[r.status] || ['#8E8E93', r.status];
  const items = r.items || [];

  return (
    <div style={{margin:0,fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',sans-serif",background:'#F2F2F7',minHeight:'100vh',padding:'20px 16px 40px',WebkitFontSmoothing:'antialiased'}}>
      <div style={{maxWidth:420,margin:'0 auto'}}>

        {/* Header */}
        <div style={{...G,textAlign:'center',padding:'28px 24px 20px'}}>
          <div style={{fontSize:24,fontWeight:800,background:'linear-gradient(135deg,#FFC107,#FF9800)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'-0.5px',marginBottom:4}}>Этномир</div>
          <div style={{fontSize:14,color:'rgba(60,60,67,.45)',marginTop:4}}>Электронный чек</div>
          <div style={{marginTop:12}}>
            <span style={{display:'inline-flex',alignItems:'center',gap:5,height:28,padding:'0 14px',borderRadius:14,background:sc[0]+'14',color:sc[0],fontSize:13,fontWeight:600}}>
              {r.status==='paid'||r.status==='completed'?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/></svg>}
              {sc[1]}
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={G}>
          <div style={{fontSize:12,fontWeight:600,color:'rgba(60,60,67,.4)',letterSpacing:'.5px',marginBottom:10}}>ИНФОРМАЦИЯ</div>
          <Row label="№" value={r.receipt_code} mono />
          {r.guest_name && <Row label="Гость" value={r.guest_name} />}
          <Row label="Категория" value={cats[r.category]||r.category} />
          <Row label="Оплата" value={pays[r.payment_method]||r.payment_method} />
          <Row label="Дата" value={dt(r.created_at)} />
        </div>

        {/* Items */}
        <div style={G}>
          <div style={{fontSize:12,fontWeight:600,color:'rgba(60,60,67,.4)',letterSpacing:'.5px',marginBottom:10}}>СОСТАВ ЧЕКА</div>
          {items.map((it: any, i: number) => (
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',borderBottom:'0.33px solid rgba(60,60,67,.06)'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:500,color:'#000'}}>{it.emoji} {it.item_name}</div>
                {it.country_visited&&<div style={{fontSize:12,color:'rgba(60,60,67,.5)',marginTop:2}}>{it.country_visited}</div>}
              </div>
              <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                <div style={{fontSize:15,fontWeight:600,color:'#000'}}>{m(it.line_total||0)}</div>
                {it.quantity>1&&<div style={{fontSize:12,color:'rgba(60,60,67,.5)'}}>{it.quantity} × {m(it.unit_price||0)}</div>}
              </div>
            </div>
          ))}
          <div style={{height:'0.33px',background:'rgba(60,60,67,.12)',margin:'14px 0'}}/>
          {r.discount>0&&<>
            <Row label="Подитог" value={m(r.subtotal||0)} />
            <Row label="Скидка" value={'\u2212'+m(r.discount)} red />
            <div style={{height:'0.33px',background:'rgba(60,60,67,.12)',margin:'14px 0'}}/>
          </>}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0'}}>
            <span style={{fontSize:17,fontWeight:600,color:'#000'}}>Итого</span>
            <span style={{fontSize:22,fontWeight:700,color:'#000',letterSpacing:'-0.5px'}}>{m(r.total||0)}</span>
          </div>
        </div>

        {/* Points */}
        {r.points_earned>0&&(
          <div style={{...G,background:'linear-gradient(135deg,rgba(255,255,255,.92),rgba(248,248,255,.92))'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:20,background:'linear-gradient(135deg,#5856D6,#AF52DE)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:'#5856D6'}}>+{r.points_earned} баллов</div>
                <div style={{fontSize:13,color:'rgba(60,60,67,.5)'}}>Начислено за покупку</div>
              </div>
            </div>
          </div>
        )}

        {/* Verified */}
        <div style={G}>
          <div style={{display:'flex',alignItems:'center',gap:6,justifyContent:'center',padding:10,borderRadius:14,background:'rgba(52,199,89,.06)'}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span style={{fontSize:13,fontWeight:600,color:'#34C759'}}>Верифицирован</span>
            <span style={{fontSize:11,color:'rgba(60,60,67,.35)',marginLeft:4}}>{r.hmac_signature}</span>
          </div>
        </div>

        <div style={{textAlign:'center',padding:'16px 0',fontSize:12,color:'rgba(60,60,67,.35)'}}>
          Этномир · Калужская обл., Боровский р-н<br/>ООО «ЭТНОМИР»
        </div>
      </div>
    </div>
  );
}

function Row({label,value,mono,red}:{label:string;value:string;mono?:boolean;red?:boolean}) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0'}}>
      <span style={{fontSize:14,color:'rgba(60,60,67,.6)'}}>{label}</span>
      <span style={{fontSize:14,fontWeight:500,color:red?'#FF3B30':'#000',textAlign:'right',...(mono?{fontFamily:'monospace',fontSize:13,color:'#007AFF'}:{})}}>{value}</span>
    </div>
  );
}
