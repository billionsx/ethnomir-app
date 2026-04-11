export const dynamic = 'force-dynamic';
export async function GET() {
  const r = await fetch('https://billionsx.com', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await r.text();
  const imgs = new Set<string>();
  const patterns = [
    /data-original="([^"]+)"/g,
    /data-src="([^"]+)"/g,
    /data-img-zoom-url="([^"]+)"/g,
    /data-slide-img="([^"]+)"/g,
    /data-bgimage="([^"]+)"/g,
    /data-img-popup="([^"]+)"/g,
    /src="(https?:\/\/[^"]*tildacdn[^"]+)"/g,
    /background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/g,
  ];
  for (const p of patterns) for (const m of html.matchAll(p)) imgs.add(m[1]);
  const all = [...imgs].filter(u => u.includes('tildacdn') && !u.endsWith('.svg')).sort();
  return Response.json({ total: all.length, images: all });
}
