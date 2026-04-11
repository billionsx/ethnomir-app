const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await r.text();

// Split HTML into Tilda record blocks (each case is a t-rec block)
const blocks = html.split(/(?=<div id="rec\d+)/);
const cases = [];

for (const block of blocks) {
  // Find case-identifying text
  const textMatch = block.match(/(?:PARQ|ORBI|Metaverse Bank|MaxboxVR|Bite Helper|Breathe Helper|Health Helper|Brilliance|Укрбуд|Пионер|PF Capital|Eaton|ABB|Грузи|Georgia|2Space|Харламов|Пинтосевич|Древс|Бриус|Аквакласс|Invest Summit|aquaclass)/i);
  if (!textMatch) continue;
  
  const caseName = textMatch[0];
  const imgs = new Set();
  
  // Get all image URLs from this block
  for (const m of block.matchAll(/data-original="([^"]+)"/g)) imgs.add(m[1]);
  for (const m of block.matchAll(/data-src="([^"]+)"/g)) imgs.add(m[1]);
  for (const m of block.matchAll(/src="(https?:\/\/[^"]*tildacdn[^"]+)"/g)) imgs.add(m[1]);
  for (const m of block.matchAll(/data-img-zoom-url="([^"]+)"/g)) imgs.add(m[1]);
  for (const m of block.matchAll(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g)) imgs.add(m[1]);
  
  const filtered = [...imgs]
    .filter(u => u.includes('tildacdn') && !u.endsWith('.svg') && !u.includes('/js/'))
    .map(u => {
      // Convert thumbnail to full-size
      if (u.includes('/-/resize')) return u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/-\/resize[^/]*\/[^/]*\//, 'https://static.tildacdn.net/$1/');
      if (u.includes('/-/resizeb')) return u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/-\/resizeb[^/]*\/[^/]*\//, 'https://static.tildacdn.net/$1/');
      if (u.includes('/-/empty/')) return u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/-\/empty\//, 'https://static.tildacdn.net/$1/');
      return u;
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort();
  
  if (filtered.length > 0) {
    cases.push({ case: caseName, count: filtered.length, images: filtered });
  }
}

// Deduplicate by case name (merge blocks with same case)
const merged = {};
for (const c of cases) {
  const key = c.case.toLowerCase();
  if (!merged[key]) merged[key] = { case: c.case, images: [] };
  for (const img of c.images) {
    if (!merged[key].images.includes(img)) merged[key].images.push(img);
  }
}

const result = Object.values(merged).map(c => ({ ...c, count: c.images.length }));
console.log(`[scrape-bx] Found ${result.length} cases with images`);

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.bx_cases`, { method: 'DELETE', headers: H });
const res = await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_cases', value: JSON.stringify(result) }) });
console.log(`[scrape-bx] Saved to supabase: ${res.status}`);
