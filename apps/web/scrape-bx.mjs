const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await r.text();

// Case markers in ORDER they appear on billionsx.com
const MARKERS = [
  { id: "PARQ", re: /PARQ\s*Development/i },
  { id: "ORBI", re: /orbi\s*group/i },
  { id: "MetaverseBank", re: /Metaverse\s*Bank/i },
  { id: "MaxboxVR", re: /MaxboxVR|VR\s*CardBoards/i },
  { id: "Brilliance", re: /Brilliance|brilliance-event|brilliance-logo-gold/i },
  { id: "Ukrbud", re: /Укрбуд|ukrbud/i },
  { id: "Pioneer", re: /Пионер|pioneer/i },
  { id: "2Space", re: /2Space|2space/i },
  { id: "Kharlamov", re: /Харламов|kharlamov/i },
  { id: "ABB", re: /\bABB\b/ },
  { id: "PFCapital", re: /PF\s*Capital|Трансмашхолдинг/i },
  { id: "HealthHelper", re: /Health\s*Helper/i },
  { id: "BiteHelper", re: /Bite\s*Helper/i },
  { id: "BreatheHelper", re: /Breathe\s*Helper/i },
  { id: "Pintosevich", re: /Пинтосевич|pintosevich/i },
  { id: "Georgia", re: /инвестиционн\w+\s+бренд\w*\s+стран|Грузи/i },
  { id: "BIS", re: /Invest\w*\s*Summit|инвестиционн\w+\s+саммит/i },
  { id: "Aquaclass", re: /Аквакласс|aquaclass/i },
  { id: "Drevs", re: /Древс|drevs/i },
  { id: "Brius", re: /Бриус|brius/i },
  { id: "Eaton", re: /\bEaton\b/ },
];

// Find all image URLs with their position in HTML
function extractImgs(text) {
  const imgs = [];
  const patterns = [
    /data-original="([^"]+)"/g,
    /data-src="([^"]+)"/g, 
    /data-img-zoom-url="([^"]+)"/g,
    /src="(https?:\/\/[^"]*tildacdn[^"]+)"/g,
  ];
  for (const p of patterns) {
    for (const m of text.matchAll(p)) {
      const u = m[1];
      if (!u.includes('tildacdn') || u.endsWith('.svg') || u.includes('/js/')) continue;
      // Normalize to full-size
      let full = u;
      if (u.includes('thb.tildacdn.net')) {
        full = u.replace(/https:\/\/thb\.tildacdn\.net\/([^/]+)\/[^/]+\/(?:[^/]+\/)?/, 'https://static.tildacdn.net/$1/');
      }
      imgs.push({ pos: m.index, url: full });
    }
  }
  return imgs;
}

// Find positions of case markers
const casePositions = [];
for (const marker of MARKERS) {
  let match;
  const re = new RegExp(marker.re.source, marker.re.flags + 'g');
  while ((match = re.exec(html)) !== null) {
    // Only take first occurrence
    casePositions.push({ id: marker.id, pos: match.index });
    break;
  }
}
casePositions.sort((a, b) => a.pos - b.pos);

// Get all images
const allImgs = extractImgs(html);

// Assign images to cases by position
const result = {};
for (let i = 0; i < casePositions.length; i++) {
  const start = casePositions[i].pos;
  const end = i < casePositions.length - 1 ? casePositions[i + 1].pos : html.length;
  const id = casePositions[i].id;
  
  const caseImgs = allImgs
    .filter(img => img.pos >= start - 2000 && img.pos < end) // look 2000 chars before marker too (for headers above)
    .map(img => img.url)
    .filter((v, i, a) => a.indexOf(v) === i); // dedupe
  
  if (caseImgs.length > 0) {
    result[id] = caseImgs;
  }
}

console.log(`[scrape-bx] Cases found: ${Object.keys(result).length}`);
for (const [k, v] of Object.entries(result)) {
  console.log(`  ${k}: ${v.length} images`);
}

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.bx_map`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_map', value: JSON.stringify(result) }) });
console.log('[scrape-bx] Saved to supabase');
