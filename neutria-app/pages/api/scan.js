// pages/api/scan.js
//
// Vercel proxy → HuggingFace Space JSON endpoint.
// Forwards the base64 image to https://cate-333-neutria-smart-scanner.hf.space/api/scan
// which runs BLIP + ResNet + Tesseract + Claude Vision and returns proper structured data.

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const HF_API_URL = 'https://cate-333-neutria-smart-scanner.hf.space/api/scan';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, createShopify } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    // Strip any data:image prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Forward to HuggingFace as JSON
    const hfResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: cleanBase64,
        create_shopify: !!createShopify,
      }),
    });

    if (!hfResponse.ok) {
      const errText = await hfResponse.text();
      return res.status(hfResponse.status).json({
        error: 'HF scanner returned an error',
        details: errText.slice(0, 500),
        title: 'Unknown Item',
        price: 0,
        suggested_price: 0,
        category: 'Misc',
        condition: 'Good',
      });
    }

    const hf = await hfResponse.json();

    // The HF /api/scan endpoint already returns the proper structured shape.
    // Just pass it through, ensuring the fields the frontend needs are present.
    return res.status(200).json({
      title: hf.title || 'Secondhand Item',
      price: hf.price ?? hf.suggested_price ?? 0,
      suggested_price: hf.suggested_price ?? hf.price ?? 0,
      category: hf.category || 'Misc',
      condition: hf.condition || 'Good',
      description: hf.body_html || hf.blip_caption || '',
      brand_text: Array.isArray(hf.ocr_text) ? hf.ocr_text.join(' ') : '',
      shopify: hf.shopify || null,
      vision: hf.vision || null,
      _raw: hf,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Scan proxy failed',
      details: err.message,
      title: 'Unknown Item',
      price: 0,
      suggested_price: 0,
      category: 'Misc',
      condition: 'Good',
    });
  }
}
