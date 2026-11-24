import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // 1. Verify payment & return download links on the Success screen
  if (req.method === 'GET' && req.query.session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
      if (session.payment_status !== 'paid') {
        return res.status(403).json({ error: 'Payment not completed' });
      }

      const purchasedIds = JSON.parse(session.metadata.productIds || '[]');
      const filePath = path.join(process.cwd(), 'src/data/products.json');
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const allProducts = Array.isArray(raw) ? raw : raw.items;

      const downloads = allProducts
        .filter((p) => purchasedIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          TITLE: p.TITLE,
          DOWNLOAD_LINK: p.DOWNLOAD_LINK || '',
        }));

      return res.status(200).json({ paid: true, downloads });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. Create a new Stripe Checkout session from the shopping bag
  if (req.method === 'POST') {
    try {
      const { items } = req.body;

      const lineItems = items.map((item) => ({
        price_data: {
          currency: (item.CURRENCY_CODE || 'GBP').toLowerCase(),
          product_data: {
            name: item.TITLE,
            images: item.IMAGES && item.IMAGES.startsWith('http') ? [item.IMAGES] : [],
          },
          unit_amount: Math.round(parseFloat(item.PRICE) * 100),
        },
        quantity: item.quantity || 1,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        metadata: {
          productIds: JSON.stringify(items.map((i) => i.id)),
        },
        success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
