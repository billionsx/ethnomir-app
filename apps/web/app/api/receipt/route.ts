import { NextRequest, NextResponse } from 'next/server';

const SB_URL = 'https://ewnoqkoojobyqqxpvzhj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code') || '';
  if (!code) {
    return new NextResponse(errorPage('Код чека не указан'), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  try {
    const res = await fetch(`${SB_URL}/rest/v1/rpc/public_view_receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}` },
      body: JSON.stringify({ p_code: code }),
    });
    if (!res.ok) return new NextResponse(errorPage('Ошибка загрузки чека'), { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    const data = await res.json();
    if (!data || data.error) return new NextResponse(errorPage('Чек не найден: ' + code), { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    return new NextResponse(receiptPage(data), { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=60' } });
  } catch (e) {
    return new NextResponse(errorPage('Ошибка сервера'), { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

function esc(s: string): string { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtPrice(v: number): string { return (v || 0).toLocaleString('ru-RU') + ' \u20BD'; }
function fmtDate(iso: string): string { if (!iso) return '\u2014'; return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
function fmtTime(iso: string): string { if (!iso) return ''; return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }); }

function statusLabel(s: string): string {
  const m: Record<string, string> = { pending: '\u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u043E\u043F\u043B\u0430\u0442\u044B', paid: '\u041E\u043F\u043B\u0430\u0447\u0435\u043D', confirmed: '\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D', completed: '\u0417\u0430\u0432\u0435\u0440\u0448\u0451\u043D', cancelled: '\u041E\u0442\u043C\u0435\u043D\u0451\u043D', refunded: '\u0412\u043E\u0437\u0432\u0440\u0430\u0442' };
  return m[s] || s;
}
function statusColor(s: string): string {
  const m: Record<string, string> = { pending: '#FF9F0A', paid: '#34C759', confirmed: '#007AFF', completed: '#34C759', cancelled: '#FF3B30', refunded: '#FF3B30' };
  return m[s] || '#8E8E93';
}
function typeIcon(cat: string): string {
  const m: Record<string, string> = { housing: '\uD83C\uDFE8', tour: '\uD83E\uDDED', restaurant: '\uD83C\uDF7D', masterclass: '\uD83C\uDFA8', tickets: '\uD83C\uDF9F', ticket: '\uD83C\uDF9F', food: '\uD83C\uDF7D', shop: '\uD83D\uDECD', services: '\uD83E\uDDFE', service: '\uD83E\uDDFE', other: '\uD83E\uDDFE' };
  return m[cat] || '\uD83E\uDDFE';
}
function typeLabel(cat: string): string {
  const m: Record<string, string> = { housing: '\u041F\u0440\u043E\u0436\u0438\u0432\u0430\u043D\u0438\u0435', tour: '\u042D\u043A\u0441\u043A\u0443\u0440\u0441\u0438\u044F', restaurant: '\u0420\u0435\u0441\u0442\u043E\u0440\u0430\u043D', masterclass: '\u041C\u0430\u0441\u0442\u0435\u0440-\u043A\u043B\u0430\u0441\u0441', tickets: '\u0412\u0445\u043E\u0434\u043D\u043E\u0439 \u0431\u0438\u043B\u0435\u0442', ticket: '\u0412\u0445\u043E\u0434\u043D\u043E\u0439 \u0431\u0438\u043B\u0435\u0442', food: '\u0417\u0430\u043A\u0430\u0437 \u0435\u0434\u044B', shop: '\u041C\u0430\u0433\u0430\u0437\u0438\u043D', services: '\u0423\u0441\u043B\u0443\u0433\u0430', service: '\u0423\u0441\u043B\u0443\u0433\u0430', other: '\u0423\u0441\u043B\u0443\u0433\u0438' };
  return m[cat] || '\u0423\u0441\u043B\u0443\u0433\u0438';
}
function payLabel(p: string): string {
  const m: Record<string, string> = { cash: '\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435 \u043D\u0430 \u043C\u0435\u0441\u0442\u0435', card: '\u0411\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0430\u044F \u043A\u0430\u0440\u0442\u0430', request: '\u0417\u0430\u044F\u0432\u043A\u0430 (\u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u043F\u0435\u0440\u0435\u0437\u0432\u043E\u043D\u0438\u0442)', online: '\u041E\u043D\u043B\u0430\u0439\u043D-\u043E\u043F\u043B\u0430\u0442\u0430', transfer: '\u0411\u0430\u043D\u043A\u043E\u0432\u0441\u043A\u0438\u0439 \u043F\u0435\u0440\u0435\u0432\u043E\u0434' };
  return m[p] || p || '\u2014';
}

function receiptPage(r: any): string {
  const items: any[] = r.items || [];
  const sc = statusColor(r.status);
  const icon = typeIcon(r.category);
  const label = typeLabel(r.category);
  const date = fmtDate(r.created_at);
  const time = fmtTime(r.created_at);
  const qrUrl = 'https://ethnomir.app/api/receipt?code=' + encodeURIComponent(r.receipt_code);
  const qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(qrUrl);

  const itemsHtml = items.map((it: any) => {
    const qty = it.quantity || 1;
    const price = it.unit_price || 0;
    const total = it.line_total || (price * qty);
    return '<div class="item"><div class="item-left"><div class="item-name">' + esc(it.item_name) + '</div>'
      + (qty > 1 ? '<div class="item-qty">' + qty + ' \u00D7 ' + fmtPrice(price) + '</div>' : '')
      + (it.country_visited ? '<div class="item-qty">\uD83D\uDCCD ' + esc(it.country_visited) + '</div>' : '')
      + '</div><div class="item-price">' + fmtPrice(total) + '</div></div>';
  }).join('');

  let impactHtml = '';
  if (r.points_earned > 0) {
    impactHtml += '<div class="impact-row"><div class="impact-icon" style="background:rgba(52,199,89,.12)">\uD83C\uDFAF</div><div><div class="impact-title">+' + r.points_earned + ' \u0431\u0430\u043B\u043B\u043E\u0432</div><div class="impact-sub" style="color:#34C759">\u041D\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u043E \u043D\u0430 \u0441\u0447\u0451\u0442</div></div></div>';
  }

  const payRows = [
    '<div class="detail-row"><span class="dk">\u0421\u043F\u043E\u0441\u043E\u0431 \u043E\u043F\u043B\u0430\u0442\u044B</span><span class="dv">' + payLabel(r.payment_method) + '</span></div>',
    r.guest_name ? '<div class="detail-row"><span class="dk">\u041A\u043B\u0438\u0435\u043D\u0442</span><span class="dv">' + esc(r.guest_name) + '</span></div>' : '',
    '<div class="detail-row"><span class="dk">\u0422\u0438\u043F</span><span class="dv">' + label + '</span></div>',
  ].filter(Boolean).join('');

  return '<!DOCTYPE html><html lang="ru"><head>' +
'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">' +
'<title>\u0427\u0435\u043A ' + esc(r.receipt_code) + ' \u2014 \u042D\u0442\u043D\u043E\u043C\u0438\u0440</title>' +
'<meta name="robots" content="noindex">' +
'<style>' +
'*{margin:0;padding:0;box-sizing:border-box}' +
'body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Helvetica Neue",sans-serif;background:#F2F2F7;color:#000;min-height:100vh;-webkit-font-smoothing:antialiased;overflow-x:hidden;max-width:100vw}' +
'.header{background:linear-gradient(180deg,#1a1a2e 0%,#16213e 100%);padding:32px 24px 32px;text-align:center}' +
'.header-sub{font-size:14px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px}' +
'.header-title{font-size:13px;color:rgba(255,255,255,.6);margin-bottom:16px}' +
'.status-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:50px;font-size:14px;font-weight:600}' +
'.status-dot{width:8px;height:8px;border-radius:4px}' +
'.receipt-body{margin:-16px 16px 0;position:relative;z-index:1;padding-bottom:24px;overflow:hidden}' +
'.card{background:#fff;border-radius:20px;box-shadow:0 1px 8px rgba(0,0,0,.05);margin-bottom:12px;overflow:hidden}' +
'.card-inner{padding:16px 20px}' +
'.card-title{font-size:12px;font-weight:700;color:rgba(60,60,67,.4);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px}' +
'.order-num{padding:24px;text-align:center}' +
'.order-label{font-size:11px;font-weight:600;color:rgba(60,60,67,.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px}' +
'.order-code{font-size:28px;font-weight:800;color:#000;letter-spacing:1px;font-variant-numeric:tabular-nums}' +
'.order-date{font-size:13px;color:rgba(60,60,67,.6);margin-top:6px}' +
'.qr-section{padding:24px;text-align:center}' +
'.qr-label{font-size:12px;font-weight:700;color:rgba(60,60,67,.4);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px}' +
'.qr-img{border-radius:16px;border:8px solid #fff;box-shadow:0 2px 16px rgba(0,0,0,.06);display:block;margin:0 auto}' +
'.qr-code-text{font-size:12px;color:rgba(60,60,67,.3);font-family:"SF Mono",Menlo,monospace;margin-top:10px;letter-spacing:.5px}' +
'.qr-hint{font-size:11px;color:rgba(60,60,67,.25);margin-top:4px}' +
'.perforation{position:relative;margin:0 -16px 12px;height:20px}' +
'.perforation-line{border-top:2px dashed rgba(60,60,67,.12);position:absolute;left:0;right:0;top:50%}' +
'.perforation-circle-l{position:absolute;left:-8px;top:50%;transform:translateY(-50%);width:16px;height:16px;border-radius:50%;background:#F2F2F7}' +
'.perforation-circle-r{position:absolute;right:-8px;top:50%;transform:translateY(-50%);width:16px;height:16px;border-radius:50%;background:#F2F2F7}' +
'.item{padding:10px 20px;border-top:.5px solid rgba(60,60,67,.08);display:flex;justify-content:space-between;align-items:center}' +
'.item:first-child{border-top:none}' +
'.item-left{flex:1;min-width:0}' +
'.item-name{font-size:15px;font-weight:500;color:#000}' +
'.item-qty{font-size:12px;color:rgba(60,60,67,.4);margin-top:1px}' +
'.item-price{font-size:15px;font-weight:600;color:#000;flex-shrink:0;margin-left:12px;font-variant-numeric:tabular-nums}' +
'.total-row{padding:14px 20px;background:#F8F8FA;display:flex;justify-content:space-between;border-top:.5px solid rgba(60,60,67,.08)}' +
'.total-label,.total-value{font-size:17px;font-weight:700;color:#000;font-variant-numeric:tabular-nums}' +
'.impact-row{display:flex;align-items:center;gap:10px;padding:8px 0}' +
'.impact-icon{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px}' +
'.impact-title{font-size:14px;font-weight:500;color:#000}' +
'.impact-sub{font-size:12px}' +
'.detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:.5px solid rgba(60,60,67,.06)}' +
'.detail-row:last-child{border-bottom:none}' +
'.dk{font-size:14px;color:rgba(60,60,67,.6)}' +
'.dv{font-size:14px;font-weight:500;color:#000;text-align:right;max-width:60%}' +
'.actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}' +
'.act-btn{height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;cursor:pointer;position:relative;overflow:hidden;' +
'background:rgba(255,255,255,.72);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border:.5px solid rgba(255,255,255,.6);box-shadow:0 .5px 0 rgba(255,255,255,.9) inset,0 2px 8px rgba(0,0,0,.04)}' +
'.act-btn::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 5%,rgba(255,255,255,.9) 50%,transparent 95%)}' +
'.act-btn:active{transform:scale(.97);opacity:.9}' +
'.act-label{font-size:15px;font-weight:600}' +
'.legal{padding:16px 4px 32px;text-align:center}' +
'.legal-text{font-size:11px;color:rgba(60,60,67,.3);line-height:1.8}' +
'.legal-text a{color:rgba(60,60,67,.3);text-decoration:none;border-bottom:.5px solid rgba(60,60,67,.15)}' +
'.legal-text a:hover{color:rgba(60,60,67,.5)}' +
'.legal-auto{font-size:10px;color:rgba(60,60,67,.2);margin-top:8px}' +
'.legal-auto a{color:rgba(60,60,67,.2);text-decoration:none;border-bottom:.5px solid rgba(60,60,67,.1)}' +
'@page{margin:5mm}@media print{body{background:#fff!important}.card{box-shadow:none!important;border:1px solid #eee}.actions{display:none!important}}' +
'</style></head><body>' +

'<div class="header">' +
'<div class="header-sub">\u042D\u0442\u043D\u043E\u043C\u0438\u0440</div>' +
'<div class="header-title">\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u044B\u0439 \u0431\u0438\u043B\u0435\u0442</div>' +
'<div class="status-badge" style="background:' + sc + '25;border:1px solid ' + sc + '40"><div class="status-dot" style="background:' + sc + '"></div><span style="color:' + sc + '">' + statusLabel(r.status) + '</span></div>' +
'</div>' +

'<div class="receipt-body">' +

'<div class="card"><div class="order-num">' +
'<div class="order-label">\u041D\u043E\u043C\u0435\u0440 \u0447\u0435\u043A\u0430</div>' +
'<div class="order-code">' + esc(r.receipt_code) + '</div>' +
'<div class="order-date">' + date + ' \u0432 ' + time + '</div>' +
'</div></div>' +

'<div class="card"><div class="qr-section">' +
'<div class="qr-label">QR-\u043A\u043E\u0434 \u0434\u043B\u044F \u043A\u0430\u0441\u0441\u044B</div>' +
'<img src="' + qrImg + '" width="180" height="180" alt="QR" class="qr-img"/>' +
'<div class="qr-code-text">' + esc(r.receipt_code) + '</div>' +
'<div class="qr-hint">\u041F\u043E\u043A\u0430\u0436\u0438\u0442\u0435 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A\u0443 \u043F\u0430\u0440\u043A\u0430</div>' +
'</div></div>' +

'<div class="perforation"><div class="perforation-line"></div><div class="perforation-circle-l"></div><div class="perforation-circle-r"></div></div>' +

'<div class="card"><div class="card-inner" style="padding-bottom:0"><div class="card-title">' + icon + ' ' + label + '</div></div>' +
(itemsHtml || '<div style="padding:12px 20px;color:rgba(60,60,67,.25);font-size:14px">\u041D\u0435\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0439</div>') +
'<div class="total-row"><span class="total-label">\u0418\u0442\u043E\u0433\u043E</span><span class="total-value">' + fmtPrice(r.total) + '</span></div></div>' +

(impactHtml ? '<div class="card"><div class="card-inner"><div class="card-title">\uD83C\uDFC6 \u041F\u0430\u0441\u043F\u043E\u0440\u0442 \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0438\u043A\u0430</div>' + impactHtml + '</div></div>' : '') +

'<div class="card"><div class="card-inner"><div class="card-title">\u0414\u0435\u0442\u0430\u043B\u0438 \u043E\u043F\u043B\u0430\u0442\u044B</div>' + payRows + '</div></div>' +

// Glass action buttons
'<div class="actions">' +
'<div class="act-btn" onclick="if(navigator.share){navigator.share({title:\'\\u0427\\u0435\\u043A ' + esc(r.receipt_code) + '\',url:window.location.href}).catch(function(){});}else{navigator.clipboard.writeText(window.location.href);alert(\'\\u0421\\u0441\\u044B\\u043B\\u043A\\u0430 \\u0441\\u043A\\u043E\\u043F\\u0438\\u0440\\u043E\\u0432\\u0430\\u043D\\u0430\');}">' +
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2" stroke-linecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>' +
'<span class="act-label" style="color:#007AFF">\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C</span></div>' +
'<div class="act-btn" onclick="window.print();">' +
'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" stroke-width="2" stroke-linecap="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>' +
'<span class="act-label" style="color:#34C759">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</span></div>' +
'</div>' +

// Legal footer with gray links
'<div class="legal"><div class="legal-text">' +
'<a href="https://ethnomir.ru" target="_blank">\u041E\u041E\u041E \u00AB\u042D\u0422\u041D\u041E\u041C\u0418\u0420\u00BB</a><br>' +
'<a href="https://yandex.ru/maps/-/CDaZnV~P" target="_blank">\u041A\u0430\u043B\u0443\u0436\u0441\u043A\u0430\u044F \u043E\u0431\u043B., \u0411\u043E\u0440\u043E\u0432\u0441\u043A\u0438\u0439 \u0440-\u043D, \u0434. \u041F\u0435\u0442\u0440\u043E\u0432\u043E</a><br>' +
'\u0418\u041D\u041D 4003032840 / \u041A\u041F\u041F 400301001 / \u041E\u0413\u0420\u041D 1084025001094<br>' +
'<a href="tel:+74950234349">+7 (495) 023-43-49</a> | <a href="mailto:info@ethnomir.ru">info@ethnomir.ru</a>' +
'</div>' +
'<div class="legal-auto">\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0441\u0444\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0435 <a href="https://ethnomir.app">ethnomir.app</a></div></div>' +

'</div></body></html>';
}

function errorPage(msg: string): string {
  return '<!DOCTYPE html><html lang="ru"><head>' +
'<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>\u0427\u0435\u043A \u2014 \u042D\u0442\u043D\u043E\u043C\u0438\u0440</title>' +
'<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#F2F2F7;min-height:100vh;-webkit-font-smoothing:antialiased}' +
'.header{background:linear-gradient(180deg,#1a1a2e,#16213e);padding:32px 24px;text-align:center}' +
'.header-sub{font-size:14px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:3px;text-transform:uppercase}' +
'.wrap{display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 80px);padding:20px}' +
'.c{max-width:340px;padding:40px;text-align:center;background:#fff;border-radius:20px;box-shadow:0 1px 8px rgba(0,0,0,.05)}' +
'.i{font-size:48px;margin-bottom:16px}' +
'.m{font-size:17px;font-weight:600;color:#000;margin-bottom:8px}' +
'.s{font-size:14px;color:rgba(60,60,67,.45);line-height:1.4}' +
'.btn{display:inline-block;margin-top:20px;padding:14px 32px;border-radius:14px;background:#007AFF;color:#fff;text-decoration:none;font-size:17px;font-weight:600}' +
'</style></head><body>' +
'<div class="header"><div class="header-sub">\u042D\u0442\u043D\u043E\u043C\u0438\u0440</div></div>' +
'<div class="wrap"><div class="c"><div class="i">\uD83D\uDD0D</div><div class="m">' + esc(msg) + '</div><div class="s">\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 QR-\u043A\u043E\u0434 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430</div><a href="https://ethnomir.app" class="btn">\u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E</a></div></div>' +
'</body></html>';
}
