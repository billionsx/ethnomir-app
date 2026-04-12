const PK = '4k5dp626tzkhedr6kmu8';
const SK = '07247850e28d6bb15dd6';
const API = 'https://api.tildacdn.info/v1';

// Get projects first
const pr = await fetch(`${API}/getprojectslist/?publickey=${PK}&secretkey=${SK}`);
const prJson = await pr.json();
const projId = prJson.result?.[0]?.id;

// Get pages for this project
const pg = await fetch(`${API}/getpageslist/?publickey=${PK}&secretkey=${SK}&projectid=${projId}`);
const pgJson = await pg.json();
const firstPage = pgJson.result?.[0];

// Try to export the FIRST page (should definitely work)
const ex = await fetch(`${API}/getpagefullexport/?publickey=${PK}&secretkey=${SK}&pageid=${firstPage?.id}`);
const exText = await ex.text();

// Try Bite Helper page
const bh = await fetch(`${API}/getpagefullexport/?publickey=${PK}&secretkey=${SK}&pageid=20601894`);
const bhText = await bh.text();

const result = {
  projectId: projId,
  projectTitle: prJson.result?.[0]?.title,
  totalPages: pgJson.result?.length,
  firstPage: { id: firstPage?.id, title: firstPage?.title },
  firstPageExport: exText.slice(0, 500),
  biteHelperExport: bhText.slice(0, 500),
};

const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
await fetch(`${SB}?key=eq.tilda_debug`, { method: 'DELETE', headers: H });
await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'tilda_debug', value: JSON.stringify(result) }) });
console.log('[tilda] Debug saved');
