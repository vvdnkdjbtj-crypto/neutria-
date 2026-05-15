import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  seller: { price: 1299, name: 'Seller Plan' },    // £12.99/month
  pro:    { price: 3900, name: 'Pro Plan' },        // £39/month
  business: { price: 15900, name: 'Business Plan' } // £159/month
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { plan, successUrl, cancelUrl } = req.body;

  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: `Neutria ${PLANS[plan].name}` },
          unit_amount: PLANS[plan].price,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/membership`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
