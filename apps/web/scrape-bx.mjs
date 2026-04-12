const PK = '4k5dp626tzkhedr6kmu8';
const SK = '07247850e28d6bb15dd6';
const API = 'https://api.tildacdn.info/v1';

// Try different API methods on one page to see what works
const testPage = '20601894'; // Bite Helper
const methods = ['getpageexport', 'getpagefullexport', 'getpagefull', 'getpage'];
const result = {};

for (const method of methods) {
  try {
    const r = await fetch(`${API}/${method}/?publickey=${PK}&secretkey=${SK}&pageid=${testPage}`);
    const text = await r.text();
    const j = JSON.parse(text);
    const page = j.result || {};
    const keys = Object.keys(page);
    const imgField = page.images;
    result[method] = {
      status: j.status,
      keys: keys,
      title: page.title,
      hasImages: !!imgField,
      imagesSample: Array.isArray(imgField) ? imgField.slice(0, 3) : typeof imgField,
      htmlLen: (page.html || '').length,
    };
    console.log(`[tilda] ${method}: status=${j.status}, keys=[${keys.join(',')}], title="${page.title}", images=${Array.isArray(imgField) ? imgField.length : 'N/A'}, html=${(page.html||'').length}`);
  } catch(e) {
    result[method] = { error: e.message };
    console.log(`[tilda] ${method}: ERROR ${e.message}`);
  }
}

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.tilda_debug`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_debug', value: JSON.stringify(result) }) });
console.log('[tilda] Debug saved');
