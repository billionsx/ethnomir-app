const PK = '4k5dp626tzkhedr6kmu8';
const SK = '07247850e28d6bb15dd6';
const API = 'https://api.tildacdn.info/v1';

try {
  // Step 1: Get projects
  const pr = await fetch(`${API}/getprojectslist/?publickey=${PK}&secretkey=${SK}`);
  const prText = await pr.text();
  console.log('[tilda] Projects response:', prText.slice(0, 500));
  
  const prJson = JSON.parse(prText);
  if (prJson.status !== 'FOUND') {
    throw new Error('Projects not found: ' + prText.slice(0, 200));
  }
  
  const projects = prJson.result;
  const result = { projects: [] };
  
  for (const p of projects) {
    console.log(`[tilda] Project ${p.id}: ${p.title}`);
    
    // Step 2: Get pages
    const pg = await fetch(`${API}/getpageslist/?publickey=${PK}&secretkey=${SK}&projectid=${p.id}`);
    const pgJson = await pg.json();
    const pages = pgJson.result || [];
    
    const pageData = [];
    for (const page of pages) {
      console.log(`[tilda]   Page ${page.id}: ${page.title} (${page.alias || 'no alias'})`);
      
      // Step 3: Get page full data
      const fd = await fetch(`${API}/getpagefullexport/?publickey=${PK}&secretkey=${SK}&pageid=${page.id}`);
      const fdJson = await fd.json();
      const full = fdJson.result || {};
      
      // Extract image URLs from the page
      const imgs = (full.images || []).map(i => typeof i === 'string' ? i : i.from);
      
      pageData.push({
        id: page.id,
        title: page.title,
        alias: page.alias,
        imgCount: imgs.length,
        imgs: imgs.filter(u => u && !u.endsWith('.svg') && !u.includes('/js/')),
      });
    }
    
    result.projects.push({ id: p.id, title: p.title, pages: pageData });
  }
  
  // Save
  const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
  const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
  await fetch(`${SB}?key=eq.tilda_full`, { method: 'DELETE', headers: H });
  const saveRes = await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_full', value: JSON.stringify(result) }) });
  console.log(`[tilda] Save status: ${saveRes.status}`);
} catch(e) {
  // Save error info
  const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
  const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
  await fetch(`${SB}?key=eq.tilda_full`, { method: 'DELETE', headers: H });
  await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_full', value: JSON.stringify({ error: e.message, stack: e.stack }) }) });
  console.error('[tilda] Error:', e);
}
