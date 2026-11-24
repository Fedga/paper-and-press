import type { Product } from './data/products';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CheckoutResult {
  mode: 'redirect' | 'placeholder';
  orderReference: string;
  message: string;
  paymentUrl?: string;
}

export const CHECKOUT_CONFIG = {
  STRIPE_PAYMENT_LINK: '',
  PAYPAL_CHECKOUT_URL: '',
  SHOP_CONTACT_EMAIL: 'hello@paperpressprintables.com',
};

export async function handleCheckout(
  items: CartItem[],
  subtotal: number,
  currencyCode: string,
): Promise<CheckoutResult> {
  const orderReference = `PP-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  void subtotal;
  void currencyCode;

  // Call our Vercel Stripe Checkout Session API
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.product.id,
        TITLE: item.product.TITLE,
        PRICE: item.product.PRICE,
        CURRENCY_CODE: item.product.CURRENCY_CODE || 'GBP',
        IMAGES: item.product.IMAGES || [],
        quantity: item.quantity,
      })),
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Could not start Stripe Checkout');
  }

  // Redirect directly to Stripe's hosted payment page
  window.location.assign(data.url);

  return {
    mode: 'redirect',
    orderReference,
    paymentUrl: data.url,
    message: 'Redirecting to Stripe Checkout…',
  };
}
