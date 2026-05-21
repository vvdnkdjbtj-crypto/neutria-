// pages/api/scan.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const HF_SPACE_URL = 'https://cate-333-neutria-smart-scanner.hf.space/scan';

function estimatePrice(categoryLabel, ocrText) {
  const ocr = (ocrText || '').toLowerCase();
  const luxury = ['chanel', 'gucci', 'prada', 'dior', 'louis vuitton', 'hermes', 'burberry'];
  if (luxury.some(b => ocr.includes(b))) return 250;

  const cat = (categoryLabel || '').toLowerCase();
  if (/chair|table|desk|sofa|couch|cabinet|shelf/.test(cat)) return 85;
  if (/camera|laptop|phone|computer|tablet|monitor/.test(cat)) return 120;
  if (/jersey|sweater|coat|dress|jacket|shirt|hoodie/.test(cat)) return 35;
  if (/book|magazine|notebook/.test(cat)) return 8;
  if (/bottle|jar|cup|mug|glass/.test(cat)) return 12;
  return 35;
}

function tidyTitle(caption, category) {
  if (!caption) return category ? category.split(',')[0].replace(/\b\w/g, c => c.toUpperCase()) : 'Secondhand Item';
  let t = caption.trim();
  t = t.replace(/^a /i, '').replace(/^an /i, '').replace(/ sitting on a table$/i, '').replace(/ on a table$/i, '');
  t = t.charAt(0).toUpperCase() + t.slice(1);
  if (t.length > 70) t = t.slice(0, 67) + '...';
  return t;
}

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
    if (!match || !match[1]) {
      return res.status(hfResponse.status).json({
        error: 'No JSON in HF response',
        title: 'Unknown Item',
        price: 0,
        suggested_price: 0,
        category: 'Misc',
        condition: 'Good',
      });
    }

    let hf;
    try {
      hf = JSON.parse(
        match[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
      );
    } catch (parseErr) {
      return res.status(200).json({
        error: 'JSON parse failed',
        title: 'Unknown Item',
        price: 0,
        suggested_price: 0,
        category: 'Misc',
        condition: 'Good',
      });
    }

    const caption = hf?.recognized?.blip_caption || '';
    const topLabel = hf?.recognized?.top_label || '';
    const ocrLines = hf?.recognized?.ocr_text || [];
    const ocrJoined = Array.isArray(ocrLines) ? ocrLines.join(' ') : '';
    const hfPrice = hf?.pricing?.resale_price;

    const title = tidyTitle(caption, topLabel);
    const category = topLabel ? topLabel.split(',')[0].replace(/\b\w/g, c => c.toUpperCase()) : 'Misc';
    const price = (typeof hfPrice === 'number' && hfPrice > 0) ? hfPrice : estimatePrice(topLabel, ocrJoined);
    const condition = 'Good';
    const description = caption || `Secondhand ${category.toLowerCase()}.`;
    const brandText = ocrJoined.trim();

    return res.status(200).json({
      title,
      price,
      suggested_price: price,
      category,
      condition,
      description,
      brand_text: brandText,
      shopify: hf?.shopify || null,
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
