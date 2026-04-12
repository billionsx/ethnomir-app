const PK = '4k5dp626tzkhedr6kmu8';
const SK = '07247850e28d6bb15dd6';
const API = 'https://api.tildacdn.info/v1';

async function api(method, params = {}) {
  const url = `${API}/${method}/?publickey=${PK}&secretkey=${SK}&${new URLSearchParams(params)}`;
  const r = await fetch(url);
  const j = await r.json();
  return j.result;
}

// 1. Get all projects
const projects = await api('getprojectslist');
console.log(`[tilda] Projects: ${projects.length}`);

const allData = {};

for (const proj of projects) {
  console.log(`[tilda] Project: ${proj.id} - ${proj.title}`);
  
  // 2. Get pages for each project
  const pages = await api('getpageslist', { projectid: proj.id });
  console.log(`[tilda]   Pages: ${pages.length}`);
  
  allData[proj.id] = { title: proj.title, pages: [] };
  
  for (const page of pages) {
    console.log(`[tilda]   Page: ${page.id} - ${page.title}`);
    
    // 3. Get full page export with all blocks
    try {
      const full = await api('getpagefullexport', { pageid: page.id });
      
      // Extract images from page
      const pageImages = (full.images || []).map(img => img.from || img);
      
      // Parse HTML to find block-level image associations
      const html = full.html || '';
      
      allData[proj.id].pages.push({
        id: page.id,
        title: page.title,
        alias: page.alias || '',
        images: pageImages,
        htmlLength: html.length,
      });
    } catch(e) {
      console.log(`[tilda]   Error on page ${page.id}: ${e.message}`);
      allData[proj.id].pages.push({ id: page.id, title: page.title, error: e.message });
    }
  }
}

// Save to Supabase
const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.tilda_full`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_full', value: JSON.stringify(allData) }) });
console.log('[tilda] Full data saved to supabase');
