// pages/api/inventory.js
//
// Pulls products from Shopify and returns them as inventory items
// for the dashboard. Reads SHOPIFY_DOMAIN and SHOPIFY_TOKEN from Vercel env.

const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN;
const SHOPIFY_TOKEN = process.env.SHOPIFY_TOKEN;
const API_VERSION = '2025-07';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SHOPIFY_DOMAIN || !SHOPIFY_TOKEN) {
    return res.status(500).json({ error: 'Shopify credentials not configured' });
  }

  try {
    const cleanDomain = SHOPIFY_DOMAIN.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    const url = `https://${cleanDomain}/admin/api/${API_VERSION}/products.json?limit=100`;
    const shopRes = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!shopRes.ok) {
      const errText = await shopRes.text();
      return res.status(shopRes.status).json({
        error: 'Shopify returned an error',
        details: errText.slice(0, 500),
      });
    }

    const data = await shopRes.json();
    const products = data.products || [];

    const items = products.map((p) => {
      const variant = (p.variants && p.variants[0]) || {};
      const image = (p.images && p.images[0]) || {};
      return {
        id: p.id,
        title: p.title || 'Untitled Item',
        price: variant.price ? Number(variant.price) : 0,
        status: p.status, // active | draft | archived
        image: image.src || null,
        category: p.product_type || 'Misc',
        createdAt: p.created_at,
      };
    });

    return res.status(200).json({
      count: items.length,
      items,
    });
  } catch (err) {
    return res.status(500).json({
      error: 'Inventory fetch failed',
      details: err.message,
    });
  }
}
