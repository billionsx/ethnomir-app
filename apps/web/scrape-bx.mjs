const PK = '4k5dp626tzkhedr6kmu8';
const SK = '07247850e28d6bb15dd6';
const API = 'https://api.tildacdn.info/v1';

const CASE_PAGES = [
  '20601894', // Bite Helper
  '20602075', // Breathe Helper  
  '20601920', // Health Helper
  '17920827', // Аквакласс
  '22150552', // Isaac Pintosevich
  '19392772', // Гарик Харламов
  '66791321', // Артём Бриус
  '26381304', // 2Space
  '20755006', // Big Invest Summit
  '33683595', // Brilliance Event
  '29206386', // PARQ Ubud
  '26381346', // MaxboxVR
  '42565456', // skasska (main cases page)
  '26102118', // Main BillionsX page
];

const result = {};

for (const pid of CASE_PAGES) {
  try {
    const r = await fetch(`${API}/getpageexport/?publickey=${PK}&secretkey=${SK}&pageid=${pid}`);
    const j = await r.json();
    const page = j.result || {};
    
    // Collect images from the page export
    const images = (page.images || []).map(img => typeof img === 'object' ? img.from : img).filter(u => u && !u.endsWith('.svg'));
    
    result[pid] = {
      title: page.title || 'unknown',
      alias: page.alias || '',
      imageCount: images.length,
      images: images.slice(0, 30), // max 30 per page
    };
    
    console.log(`[tilda] ${pid} "${page.title}": ${images.length} images`);
  } catch(e) {
    result[pid] = { error: e.message };
    console.log(`[tilda] ${pid} error: ${e.message}`);
  }
}

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.tilda_cases`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_cases', value: JSON.stringify(result) }) });
console.log('[tilda] Case images saved');
