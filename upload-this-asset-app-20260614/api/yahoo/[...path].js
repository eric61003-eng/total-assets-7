export default async function handler(req, res) {
  const rawPath = req.query.path;
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  const target = new URL(`https://query1.finance.yahoo.com/${path || ''}`);

  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    const values = Array.isArray(value) ? value : [value];
    values.forEach(v => target.searchParams.append(key, v));
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        accept: 'application/json,text/plain,*/*',
        'user-agent': 'Mozilla/5.0 (compatible; TotalAssets/1.0)'
      }
    });

    const text = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(upstream.status).send(text);
  } catch (error) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({ error: error.message || 'Yahoo proxy failed' });
  }
}
