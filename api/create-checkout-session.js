import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items } = req.body;

    const lineItems = items.map((item) => ({
      price_data: {
        currency: (item.CURRENCY_CODE || 'GBP').toLowerCase(),
        product_data: {
          name: item.TITLE,
          images: item.IMAGES && item.IMAGES[0]?.startsWith('http') ? [item.IMAGES[0]] : [],
        },
        unit_amount: Math.round(parseFloat(item.PRICE) * 100),
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
