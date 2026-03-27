import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewnoqkoojobyqqxpvzhj.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg'
);

function m(v: number) { return v.toLocaleString('ru-RU') + ' ₽'; }
function dt(iso: string) { if (!iso) return ''; return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
const cats: any = { housing: 'Жильё', tours: 'Экскурсии', food: 'Питание', masterclass: 'Мастер-класс', services: 'Услуги', shop: 'Магазин', tickets: 'Билеты' };
const pays: any = { card_new: 'Карта', cash: 'Наличные', card: 'Карта', points: 'Баллы', sbp: 'СБП' };
const sts: any = { paid: ['#34C759', 'Оплачен'], completed: ['#34C759', 'Завершён'], confirmed: ['#007AFF', 'Подтверждён'], pending: ['#FF9500', 'Ожидает'], cancelled: ['#FF3B30', 'Отменён'], refunded: ['#FF3B30', 'Возврат'] };

export default async function ReceiptPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: r } = await sb.rpc('public_view_receipt', { p_code: code });
  if (!r || r.error) return <NotFound />;
  const sc = sts[r.status] || ['#8E8E93', r.status];
  const items = r.items || [];
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <title>Чек {r.receipt_code} — Этномир</title>
      </head>
      <body style={{ margin: 0, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif", background: '#F2F2F7', minHeight: '100vh', padding: '20px 16px 40px', WebkitFontSmoothing: 'antialiased' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>

          {/* Header */}
          <Card style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#FFC107,#FF9800)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0010 10" /><path d="M2 12h20" /></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#000', letterSpacing: '-0.5px' }}>Этномир</div>
            <div style={{ fontSize: 14, color: 'rgba(60,60,67,.5)', marginTop: 4 }}>Электронный чек</div>
            <div style={{ marginTop: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 12px', borderRadius: 13, background: sc[0] + '14', color: sc[0], fontSize: 13, fontWeight: 600 }}>{sc[1]}</span>
            </div>
          </Card>

          {/* Info */}
          <Card>
            <SectionTitle>ИНФОРМАЦИЯ</SectionTitle>
            <Row label="№" value={r.receipt_code} mono />
            {r.guest_name && <Row label="Гость" value={r.guest_name} />}
            <Row label="Категория" value={cats[r.category] || r.category} />
            <Row label="Оплата" value={pays[r.payment_method] || r.payment_method} />
            <Row label="Дата" value={dt(r.created_at)} />
          </Card>

          {/* Items */}
          <Card>
            <SectionTitle>СОСТАВ ЧЕКА</SectionTitle>
            {items.map((it: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '0.33px solid rgba(60,60,67,.06)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#000' }}>{it.emoji} {it.item_name}</div>
                  {it.country_visited && <div style={{ fontSize: 12, color: 'rgba(60,60,67,.5)', marginTop: 2 }}>{it.country_visited}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{m(it.line_total || 0)}</div>
                  {it.quantity > 1 && <div style={{ fontSize: 12, color: 'rgba(60,60,67,.5)' }}>{it.quantity} × {m(it.unit_price || 0)}</div>}
                </div>
              </div>
            ))}
            <Divider />
            {r.discount > 0 && <>
              <Row label="Подитог" value={m(r.subtotal || 0)} />
              <Row label="Скидка" value={'−' + m(r.discount)} red />
              <Divider />
            </>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
              <span style={{ fontSize: 17, fontWeight: 600, color: '#000' }}>Итого</span>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#000', letterSpacing: '-0.5px' }}>{m(r.total || 0)}</span>
            </div>
          </Card>

          {/* Points */}
          {r.points_earned > 0 && (
            <Card style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.92),rgba(248,248,255,.92))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'linear-gradient(135deg,#5856D6,#AF52DE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: '#5856D6' }}>+{r.points_earned} баллов</div>
                  <div style={{ fontSize: 13, color: 'rgba(60,60,67,.5)' }}>Начислено за покупку</div>
                </div>
              </div>
            </Card>
          )}

          {/* Verified */}
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: 10, borderRadius: 14, background: 'rgba(52,199,89,.06)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#34C759' }}>Верифицирован</span>
              <span style={{ fontSize: 11, color: 'rgba(60,60,67,.35)', marginLeft: 4 }}>{r.hmac_signature}</span>
            </div>
          </Card>

          <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 12, color: 'rgba(60,60,67,.35)' }}>
            Этномир · Калужская обл., Боровский р-н<br />ООО «ЭТНОМИР»
          </div>
        </div>
      </body>
    </html>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', borderRadius: 20, border: '0.5px solid rgba(255,255,255,.7)', boxShadow: '0 0.5px 0 rgba(255,255,255,.9) inset, 0 2px 16px rgba(0,0,0,.06)', padding: 20, marginBottom: 12, position: 'relative' as const, overflow: 'hidden' as const, ...style }}>
      {children}
    </div>
  );
}
function SectionTitle({ children }: { children: string }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(60,60,67,.4)', letterSpacing: '.5px', marginBottom: 10 }}>{children}</div>;
}
function Row({ label, value, mono, red }: { label: string; value: string; mono?: boolean; red?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
      <span style={{ fontSize: 14, color: 'rgba(60,60,67,.6)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: red ? '#FF3B30' : '#000', textAlign: 'right', ...(mono ? { fontFamily: 'monospace', fontSize: 13, color: '#007AFF' } : {}) }}>{value}</span>
    </div>
  );
}
function Divider() { return <div style={{ height: '0.33px', background: 'rgba(60,60,67,.12)', margin: '14px 0' }} />; }
function NotFound() {
  return (
    <html lang="ru">
      <head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Чек не найден</title></head>
      <body style={{ margin: 0, fontFamily: "-apple-system,sans-serif", background: '#F2F2F7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#000', marginBottom: 8 }}>Чек не найден</div>
          <div style={{ fontSize: 15, color: 'rgba(60,60,67,.6)' }}>Проверьте QR-код</div>
        </div>
      </body>
    </html>
  );
}
