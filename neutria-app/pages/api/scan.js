// pages/api/scan.js
// Proxies scan requests from neutria.co.uk to the HF Phase 28 scanner Space.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const HF_SPACE_URL = 'https://cate-333-neutria-smart-scanner.hf.space/scan';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, createShopify } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('photo', blob, 'scan.jpg');
    if (createShopify) {
      formData.append('create_shopify', '1');
    }

    const hfResponse = await fetch(HF_SPACE_URL, {
      method: 'POST',
      body: formData,
    });

    const text = await hfResponse.text();

    const match = text.match(/<pre>([\s\S]*?)<\/pre>/);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(
          match[1]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
        );
        return res.status(200).json(parsed);
      } catch (parseErr) {
        return res.status(200).json({
          raw_html: text.slice(0, 2000),
          parse_error: parseErr.message,
        });
      }
    }

    return res.status(hfResponse.status).json({
      error: 'No JSON found in HF response',
      status: hfResponse.status,
      raw: text.slice(0, 1000),
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Scan proxy failed',
      details: err.message,
    });
  }
}
