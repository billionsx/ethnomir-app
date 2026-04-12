// Scrape text content from each case page on billionsx.com
const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Accept-Profile': 'bx' };

// Get all cases with tilda_alias  
const casesRes = await fetch(`${SB}/cases?select=id,slug,name,tilda_alias&tilda_alias=not.is.null&order=id`, { headers: H });
const cases = await casesRes.json();
console.log(`[scrape] ${cases.length} cases with tilda_alias`);

const results = {};
let count = 0;

for (const c of cases) {
  const url = `https://billionsx.com/${c.tilda_alias}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
    if (!r.ok) { console.log(`[scrape] ${c.slug}: HTTP ${r.status}`); continue; }
    const html = await r.text();
    
    // Extract meaningful text blocks (skip CSS/JS)
    const textBlocks = [];
    // Find all div text content
    for (const m of html.matchAll(/<div[^>]*class="[^"]*tn-atom[^"]*"[^>]*>([^<]+)<\/div>/g)) {
      const t = m[1].trim();
      if (t.length > 10 && t.length < 500 && !t.includes('{') && !t.includes('function')) {
        textBlocks.push(t);
      }
    }
    
    // Extract title (t-title elements)
    const titles = [];
    for (const m of html.matchAll(/<div[^>]*field="title"[^>]*>([^<]+)<\/div>/g)) {
      titles.push(m[1].trim());
    }
    
    // Extract numbers/stats
    const stats = [];
    for (const m of html.matchAll(/<div[^>]*>(\d[\d,.\s]*[+%$€₽MBКМмлн]*)<\/div>/g)) {
      const s = m[1].trim();
      if (s.length > 1 && s.length < 30) stats.push(s);
    }

    results[c.slug] = {
      id: c.id,
      name: c.name,
      url,
      titles: titles.slice(0, 10),
      stats: stats.slice(0, 15),
      textBlocks: textBlocks.slice(0, 20),
      htmlLen: html.length,
    };
    
    count++;
    console.log(`[scrape] ${c.slug}: ${titles.length} titles, ${stats.length} stats, ${textBlocks.length} texts (${html.length} bytes)`);
    
    // Rate limit
    if (count % 5 === 0) await new Promise(r => setTimeout(r, 1000));
  } catch(e) {
    console.log(`[scrape] ${c.slug}: ERROR ${e.message}`);
  }
}

// Save to Supabase
const saveH = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}/_deploy_store?key=eq.bx_case_content`, { method: 'DELETE', headers: saveH });
await fetch(`${SB}/_deploy_store`, { method: 'POST', headers: { ...saveH, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_case_content', value: JSON.stringify(results) }) });
console.log(`[scrape] Done. ${count} cases scraped.`);
