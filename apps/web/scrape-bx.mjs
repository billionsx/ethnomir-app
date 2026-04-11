const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await r.text();

// Split into Tilda record blocks
const recRegex = /<div\s+id="rec(\d+)"/g;
const positions = [];
let m;
while ((m = recRegex.exec(html)) !== null) positions.push({ id: m[1], pos: m.index });

const blocks = [];
for (let i = 0; i < positions.length; i++) {
  const start = positions[i].pos;
  const end = i + 1 < positions.length ? positions[i + 1].pos : html.length;
  const chunk = html.slice(start, end);
  
  // Extract text (strip HTML tags)
  const text = chunk.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  
  // Extract images
  const imgs = [];
  for (const im of chunk.matchAll(/data-original="([^"]+)"/g)) {
    let u = im[1];
    if (!u.includes('tildacdn') || u.endsWith('.svg') || u.includes('/js/')) continue;
    if (u.includes('thb.tildacdn.net')) u = u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/[^/]+\/(?:[^/]+\/)?/, 'https://static.tildacdn.net/$1/');
    imgs.push(u);
  }
  // Also src for non-lazy images
  for (const im of chunk.matchAll(/src="(https?:\/\/[^"]*tildacdn[^"]+\.(?:jpg|jpeg|png|gif|JPG|JPEG|PNG))"/g)) {
    let u = im[1];
    if (u.includes('thb.tildacdn.net')) u = u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/[^/]+\/(?:[^/]+\/)?/, 'https://static.tildacdn.net/$1/');
    if (!imgs.includes(u)) imgs.push(u);
  }
  
  if (imgs.length > 0) {
    blocks.push({ rec: positions[i].id, text: text.slice(0, 200), imgs });
  }
}

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.bx_blocks`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_blocks', value: JSON.stringify(blocks) }) });
console.log(`[scrape-bx] ${blocks.length} blocks with images saved`);
