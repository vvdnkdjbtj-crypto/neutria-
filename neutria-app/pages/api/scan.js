export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { image_b64, user_title, user_notes } = req.body;
  const key = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_KEY;

  if (!key) return res.status(500).json({ error: 'No API key configured' });
  if (!image_b64) return res.status(400).json({ error: 'No image provided' });

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1200,
        system: `You are Neutria's AI Visual Intelligence Engine. Analyse this product photo. Return ONLY valid JSON:
{
  "title": "Full product name",
  "brand": "Brand or null",
  "model": "Model or null", 
  "category": "Clothing|Shoes|Electronics|Furniture|Home & Kitchen|Books & Media|Sports & Outdoors|Toys & Games|Collectibles|Beauty & Health|Tools & Hardware|Jewellery & Watches|Art|Other",
  "condition": "New with Tags|Like New|Excellent|Very Good|Good|Fair|Poor",
  "condition_notes": "observations",
  "colour": "colour",
  "description": "2-3 sentence listing description",
  "suggested_price": number,
  "retail_price": number,
  "price_rationale": "one sentence",
  "tags": ["tag1","tag2","tag3"],
  "shipping_estimate": "Small Parcel|Medium Box|Large Box|Freight",
  "weight_kg": number,
  "luxury": false,
  "demand": "High|Medium|Low",
  "confidence": number
}`,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image_b64 } },
            { type: 'text', text: `Scan this item.${user_title ? ` User says: ${user_title}` : ''}${user_notes ? ` Notes: ${user_notes}` : ''}` }
          ]
        }]
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.error?.message || 'Claude API error' });

    const raw = data.content[0].text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(raw);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };
