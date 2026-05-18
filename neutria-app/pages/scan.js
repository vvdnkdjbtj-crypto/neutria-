export default async function handler(req, res) {
if (req.method !== 'POST') return res.status(405).end();
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!backendUrl) return res.status(500).json({ error: 'No backend URL' });
try {
const r = await fetch(`${backendUrl}/api/scan`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify(req.body)
});
const data = await r.json();
res.status(r.status).json(data);
} catch(err) { res.status(500).json({ error: err.message }); }
}
export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
