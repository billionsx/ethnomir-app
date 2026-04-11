// @ts-nocheck
// Static page — executes at BUILD TIME on Vercel, saves image URLs to Supabase
const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

async function scrape() {
  const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const imgs = new Set();
  const pats = [/data-original="([^"]+)"/g, /data-src="([^"]+)"/g, /data-img-zoom-url="([^"]+)"/g, /data-slide-img="([^"]+)"/g, /data-bgimage="([^"]+)"/g, /data-img-popup="([^"]+)"/g, /src="(https?:\/\/[^"]*tildacdn[^"]+)"/g, /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g];
  for (const p of pats) for (const m of html.matchAll(p)) imgs.add(m[1]);
  return [...imgs].filter(u => u.includes('tildacdn') && !u.endsWith('.svg')).sort();
}

export default async function ScrapeBXPage() {
  const all = await scrape();
  try {
    await fetch(`${SB}?key=eq.bx_images`, { method: 'DELETE', headers: H });
    await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_images', value: JSON.stringify(all) }) });
  } catch(e) {}
  return <pre>{JSON.stringify(all,null,2)}</pre>;
}
