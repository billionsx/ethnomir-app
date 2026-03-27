import { NextRequest, NextResponse } from 'next/server';

const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || '';
  
  if (!code) {
    return new NextResponse(errorPage('Код чека не указан'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/public_view_receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SB_KEY,
        'Authorization': `Bearer ${SB_KEY}`,
      },
      body: JSON.stringify({ p_code: code }),
    });

    if (!res.ok) {
      return new NextResponse(errorPage('Ошибка загрузки чека'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    const data = await res.json();
    
    if (!data || data.error) {
      return new NextResponse(errorPage(`Чек не найден: ${code}`), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new NextResponse(receiptPage(data), {
      status: 200,
      headers: { 
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (e) {
    return new NextResponse(errorPage('Ошибка сервера'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function esc(s: string): string {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtPrice(v: number): string {
  return (v || 0).toLocaleString('ru-RU') + ' ₽';
}

function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ru-RU', { 
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
}

function statusLabel(s: string): string {
  const m: Record<string, string> = {
    pending: 'Ожидает оплаты', paid: 'Оплачен', confirmed: 'Подтверждён',
    completed: 'Завершён', cancelled: 'Отменён', refunded: 'Возврат'
  };
  return m[s] || s;
}

function statusColor(s: string): string {
  const m: Record<string, string> = {
    pending: '#FF9500', paid: '#34C759', confirmed: '#007AFF',
    completed: '#34C759', cancelled: '#FF3B30', refunded: '#FF3B30'
  };
  return m[s] || '#8E8E93';
}

function catLabel(c: string): string {
  const m: Record<string, string> = {
    housing: 'Жильё', tour: 'Экскурсия', restaurant: 'Ресторан',
    masterclass: 'Мастер-класс', ticket: 'Билет', shop: 'Магазин', other: 'Прочее'
  };
  return m[c] || c;
}

function payLabel(p: string): string {
  const m: Record<string, string> = {
    cash: 'Наличные', card: 'Карта', request: 'Заявка', 
    online: 'Онлайн', transfer: 'Перевод'
  };
  return m[p] || p || '—';
}

function receiptPage(r: any): string {
  const items: any[] = r.items || [];
  const sc = statusColor(r.status);
  
  const itemsHtml = items.map((it: any) =>
    `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:.33px solid rgba(60,60,67,.08)">
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;font-weight:500;color:#000">${esc(it.item_name)}</div>
        ${it.quantity > 1 ? `<div style="font-size:12px;color:rgba(60,60,67,.45);margin-top:2px">${it.quantity} × ${fmtPrice(it.unit_price)}</div>` : ''}
        ${it.country_visited ? `<div style="font-size:12px;color:rgba(60,60,67,.45);margin-top:2px">📍 ${esc(it.country_visited)}</div>` : ''}
      </div>
      <div style="font-size:15px;font-weight:600;color:#000;flex-shrink:0;margin-left:12px">${fmtPrice(it.line_total)}</div>
    </div>`
  ).join('');

  const qrUrl = `https://ethnomir.app/api/receipt?code=${encodeURIComponent(r.receipt_code)}`;

  return `<!DOCTYPE html><html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Чек ${esc(r.receipt_code)} — Этномир</title>
<meta name="robots" content="noindex">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Helvetica Neue',sans-serif;background:linear-gradient(180deg,#E8E3F3 0%,#F2F2F7 30%);color:#000;min-height:100vh;padding:16px 16px 40px;-webkit-font-smoothing:antialiased}
.card{max-width:400px;margin:0 auto;background:rgba(255,255,255,.82);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border-radius:24px;border:.5px solid rgba(255,255,255,.7);box-shadow:0 .5px 0 rgba(255,255,255,.9) inset,0 1px 0 rgba(255,255,255,.4) inset,0 4px 24px rgba(0,0,0,.06);overflow:hidden;position:relative}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(255,255,255,.95) 50%,transparent 95%);z-index:1}
.hdr{padding:28px 20px 18px;text-align:center;background:linear-gradient(180deg,rgba(255,255,255,.3) 0%,transparent 100%)}
.logo{font-size:24px;font-weight:700;letter-spacing:-.5px;background:linear-gradient(135deg,#FFC107,#FF9800);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.code{font-size:13px;color:rgba(60,60,67,.45);font-weight:500;letter-spacing:.8px;margin-bottom:12px;font-family:'SF Mono',Menlo,monospace}
.badge{display:inline-flex;align-items:center;height:30px;padding:0 16px;border-radius:15px;font-size:14px;font-weight:600;color:#fff}
.sep{height:.33px;background:rgba(60,60,67,.1);margin:0 20px}
.meta{padding:16px 20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mc{padding:10px 12px;border-radius:14px;background:rgba(118,118,128,.03)}
.ml{font-size:11px;color:rgba(60,60,67,.35);font-weight:600;letter-spacing:.3px;text-transform:uppercase;margin-bottom:3px}
.mv{font-size:15px;font-weight:500;color:#000}
.items{padding:16px 20px}
.it{font-size:13px;font-weight:600;color:rgba(60,60,67,.4);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
.totals{padding:16px 20px 20px;background:rgba(118,118,128,.02)}
.tr{display:flex;justify-content:space-between;padding:4px 0}
.tl{font-size:15px;color:rgba(60,60,67,.55)}
.tv{font-size:15px;font-weight:500}
.main{padding-top:12px;margin-top:8px;border-top:.33px solid rgba(60,60,67,.1)}
.main .tl,.main .tv{font-size:22px;font-weight:700;color:#000}
.ft{padding:16px 20px 24px;text-align:center}
.pts{display:inline-flex;align-items:center;gap:4px;padding:7px 16px;border-radius:15px;background:rgba(255,149,0,.08);font-size:14px;font-weight:600;color:#FF9500;margin-bottom:8px}
.hmac{font-size:11px;color:rgba(60,60,67,.2);font-family:'SF Mono',Menlo,monospace;letter-spacing:.3px}
.br{text-align:center;padding:20px;font-size:12px;color:rgba(60,60,67,.2)}
</style></head><body>
<div class="card">
  <div class="hdr">
    <div class="logo">Этномир</div>
    <div class="code">${esc(r.receipt_code)}</div>
    <div class="badge" style="background:${sc}">${statusLabel(r.status)}</div>
  </div>
  <div class="sep"></div>
  <div class="meta">
    <div class="mc"><div class="ml">Гость</div><div class="mv">${esc(r.guest_name || '—')}</div></div>
    <div class="mc"><div class="ml">Категория</div><div class="mv">${catLabel(r.category)}</div></div>
    <div class="mc"><div class="ml">Оплата</div><div class="mv">${payLabel(r.payment_method)}</div></div>
    <div class="mc"><div class="ml">Дата</div><div class="mv">${fmtDate(r.created_at)}</div></div>
  </div>
  <div class="sep"></div>
  <div class="items">
    <div class="it">Состав чека</div>
    ${itemsHtml || '<div style="color:rgba(60,60,67,.25);font-size:14px;padding:12px 0">Нет позиций</div>'}
  </div>
  <div class="totals">
    ${r.subtotal !== r.total ? `<div class="tr"><span class="tl">Подитог</span><span class="tv">${fmtPrice(r.subtotal)}</span></div>` : ''}
    ${r.discount > 0 ? `<div class="tr"><span class="tl">Скидка</span><span class="tv" style="color:#34C759">−${fmtPrice(r.discount)}</span></div>` : ''}
    <div class="tr main"><span class="tl">Итого</span><span class="tv">${fmtPrice(r.total)}</span></div>
  </div>
  <div class="sep"></div>
  <div class="ft">
    ${r.points_earned > 0 ? `<div class="pts">⭐ +${r.points_earned} баллов Этномир</div>` : ''}
    <div class="hmac">Подпись: ${esc(r.hmac_signature || '—')}</div>
  </div>
</div>
<div class="br">Этномир · Крупнейший этнографический парк России</div>
</body></html>`;
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html><html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Чек — Этномир</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#F2F2F7;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.c{max-width:340px;padding:40px;text-align:center;background:rgba(255,255,255,.82);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border-radius:24px;border:.5px solid rgba(255,255,255,.7);box-shadow:0 4px 24px rgba(0,0,0,.06)}.i{font-size:48px;margin-bottom:16px}.m{font-size:17px;font-weight:600;color:#000;margin-bottom:8px}.s{font-size:14px;color:rgba(60,60,67,.45);line-height:1.4}</style></head><body>
<div class="c"><div class="i">📄</div><div class="m">${esc(msg)}</div><div class="s">Проверьте QR-код и попробуйте снова</div></div></body></html>`;
}
