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

/**
 * CHECKOUT CONFIGURATION
 * ---------------------------------------------------------------------------
 * Insert your live Stripe Payment Link, PayPal.me / PayPal Checkout URL, or
 * backend checkout endpoint below when you are ready to accept live payments.
 *
 * Examples:
 *   STRIPE_PAYMENT_LINK: 'https://buy.stripe.com/your_payment_link_id'
 *   PAYPAL_CHECKOUT_URL: 'https://www.paypal.com/paypalme/yourhandle'
 */
export const CHECKOUT_CONFIG = {
  STRIPE_PAYMENT_LINK: '',
  PAYPAL_CHECKOUT_URL: '',
  SHOP_CONTACT_EMAIL: 'studio@paperandpress.example',
};

/**
 * Placeholder Checkout Handler
 * ---------------------------------------------------------------------------
 * Replace or extend this function with your Stripe Checkout Session API call,
 * Stripe Payment Link redirect, or PayPal Smart Buttons integration.
 */
export async function handleCheckout(
  items: CartItem[],
  subtotal: number,
  currencyCode: string,
): Promise<CheckoutResult> {
  const orderReference = `PP-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  // 1. If a Stripe Payment Link is configured, pass it back for redirect
  if (CHECKOUT_CONFIG.STRIPE_PAYMENT_LINK.trim()) {
    return {
      mode: 'redirect',
      orderReference,
      paymentUrl: CHECKOUT_CONFIG.STRIPE_PAYMENT_LINK.trim(),
      message: 'Redirecting to Stripe Checkout…',
    };
  }

  // 2. If a PayPal link is configured, append the order total and currency
  if (CHECKOUT_CONFIG.PAYPAL_CHECKOUT_URL.trim()) {
    const base = CHECKOUT_CONFIG.PAYPAL_CHECKOUT_URL.trim().replace(/\/$/, '');
    const paymentUrl = `${base}/${subtotal.toFixed(2)}${currencyCode}`;
    return {
      mode: 'redirect',
      orderReference,
      paymentUrl,
      message: 'Redirecting to PayPal…',
    };
  }

  // 3. Example backend Stripe Checkout Session call (uncomment when wired):
  // const response = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     items: items.map((item) => ({
  //       id: item.product.id,
  //       title: item.product.TITLE,
  //       unitAmount: Math.round(item.product.PRICE * 100),
  //       currency: item.product.CURRENCY_CODE.toLowerCase(),
  //       quantity: item.quantity,
  //     })),
  //   }),
  // });
  // const data = await response.json();
  // window.location.assign(data.url);

  // Default placeholder state so you can test the complete bag flow locally
  void items;
  return {
    mode: 'placeholder',
    orderReference,
    message:
      'Checkout is ready for your payment provider. Add your Stripe Payment Link or PayPal URL in src/checkout.ts to activate live payments.',
  };
}
