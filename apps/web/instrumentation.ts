export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await r.text();
      const imgs = new Set<string>();
      const pats = [/data-original="([^"]+)"/g, /data-src="([^"]+)"/g, /data-img-zoom-url="([^"]+)"/g, /data-slide-img="([^"]+)"/g, /data-bgimage="([^"]+)"/g, /data-img-popup="([^"]+)"/g, /src="(https?:\/\/[^"]*tildacdn[^"]+)"/g, /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g];
      for (const p of pats) for (const m of html.matchAll(p)) imgs.add(m[1]);
      const all = [...imgs].filter((u: string) => u.includes('tildacdn') && !u.endsWith('.svg')).sort();
      const SB = 'https://ewnoqkoojobyqqxpvzhj.supabase.co/rest/v1/_deploy_store';
      const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg';
      const H: Record<string,string> = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };
      await fetch(`${SB}?key=eq.bx_images`, { method: 'DELETE', headers: H });
      await fetch(SB, { method: 'POST', headers: { ...H, 'Prefer': 'return=minimal' }, body: JSON.stringify({ key: 'bx_images', value: JSON.stringify(all) }) });
      console.log(`[scrape-bx] saved ${all.length} images to supabase`);
    } catch(e) { console.error('[scrape-bx] error:', e); }
  }
}
