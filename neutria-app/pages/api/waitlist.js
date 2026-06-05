// pages/api/waitlist.js
// Receives waitlist email from the homepage and forwards it to Formspree.

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xdavkvwo';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const fsRes = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        source: 'neutria.co.uk waitlist',
      }),
    });

    if (!fsRes.ok) {
      const txt = await fsRes.text();
      return res.status(502).json({ error: 'Formspree rejected', details: txt.slice(0, 300) });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Waitlist forward failed', details: err.message });
  }
}
