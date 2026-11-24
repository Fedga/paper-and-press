import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  handleCheckout,
  type CartItem,
  type CheckoutResult,
} from '../checkout';
import { formatPrice, splitProductTitle } from '../utils/catalog';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onInspectProduct: (productId: string) => void;
}

export function CartDrawer({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onInspectProduct,
}: CartDrawerProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);

  const currencyCode = items[0]?.product.CURRENCY_CODE || 'GBP';
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.PRICE * item.quantity,
    0,
  );
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) {
      setCheckoutResult(null);
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const onProceedCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const result = await handleCheckout(items, subtotal, currencyCode);
      setCheckoutResult(result);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#141619]/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl font-medium text-[#141619]">
              Shopping Bag
            </h2>
            <span className="tabular-nums text-xs text-[#6C757D]">
              ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#5C6370] transition-colors hover:bg-[#F1F3F5] hover:text-[#141619]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {checkoutResult ? (
            <div className="space-y-5 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-6 w-6 shrink-0 text-[#1E4D3B]"
                  strokeWidth={1.8}
                />
                <div>
                  <h3 className="font-display text-lg font-medium text-[#141619]">
                    {checkoutResult.mode === 'redirect'
                      ? 'Payment Link Ready'
                      : 'Order Ready for Checkout'}
                  </h3>
                  <p className="tabular-nums mt-1 text-xs text-[#5C6370]">
                    Reference {checkoutResult.orderReference} · Total{' '}
                    {formatPrice(subtotal, currencyCode)} ({currencyCode})
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#4B525E]">
                {checkoutResult.message}
              </p>

              {/* Itemized Receipt Summary */}
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] p-4">
                <p className="text-xs font-semibold text-[#5C6370]">Order summary</p>
                <ul className="mt-3 space-y-2 text-xs text-[#343A40]">
                  {items.map((item) => (
                    <li
                      key={item.product.id}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="truncate">
                        {item.quantity} × {splitProductTitle(item.product.TITLE).primary}
                      </span>
                      <span className="tabular-nums shrink-0 font-medium text-[#141619]">
                        {formatPrice(
                          item.product.PRICE * item.quantity,
                          item.product.CURRENCY_CODE,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-[#E5E7EB] pt-3 text-sm font-semibold text-[#141619]">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatPrice(subtotal, currencyCode)}
                  </span>
                </div>
              </div>

              {checkoutResult.paymentUrl && (
                <a
                  href={checkoutResult.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#1E4D3B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#163B2D]"
                >
                  <span>Continue to Payment</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCheckoutResult(null)}
                  className="min-h-[42px] flex-1 rounded-lg border border-[#D8DCE2] bg-white px-4 py-2 text-sm font-medium text-[#141619] hover:bg-[#F8F9FA]"
                >
                  Back to bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearCart();
                    setCheckoutResult(null);
                    onClose();
                  }}
                  className="min-h-[42px] flex-1 rounded-lg bg-[#141619] px-4 py-2 text-sm font-medium text-white hover:bg-[#2B3036]"
                >
                  Clear &amp; finish
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F1F3F5] text-[#5C6370]">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <p className="font-display mt-4 text-lg font-medium text-[#141619]">
                Your bag is empty
              </p>
              <p className="mt-1.5 max-w-[28ch] text-sm text-[#5C6370]">
                Add SVG bundles, laser patterns, or printable planners to get started.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 min-h-[42px] rounded-lg border border-[#D8DCE2] bg-white px-5 py-2 text-sm font-medium text-[#141619] transition-colors hover:border-[#1E4D3B] hover:text-[#1E4D3B]"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#ECEEF1]" role="list">
              {items.map(({ product, quantity }) => {
                const { primary } = splitProductTitle(product.TITLE);
                return (
                  <li key={product.id} className="flex gap-4 py-4 first:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        onInspectProduct(product.id);
                        onClose();
                      }}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F1F3F5]"
                    >
                      <ResilientImage
                        src={product.IMAGES[0]}
                        alt={primary}
                        compact
                        className="h-full w-full"
                      />
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onInspectProduct(product.id);
                            onClose();
                          }}
                          className="line-clamp-2 text-left text-sm font-medium text-[#141619] hover:text-[#1E4D3B]"
                        >
                          {primary}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`Remove ${primary}`}
                          className="shrink-0 p-1 text-[#868E96] transition-colors hover:text-[#141619]"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-md border border-[#D8DCE2] bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            aria-label={`Decrease quantity of ${primary}`}
                            className="flex h-8 w-8 items-center justify-center text-[#343A40] hover:text-[#141619]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="tabular-nums min-w-[1.75rem] text-center text-xs font-medium text-[#141619]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            aria-label={`Increase quantity of ${primary}`}
                            className="flex h-8 w-8 items-center justify-center text-[#343A40] hover:text-[#141619]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="tabular-nums text-sm font-semibold text-[#141619]">
                          {formatPrice(product.PRICE * quantity, product.CURRENCY_CODE)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer with Total & Checkout CTA */}
        {items.length > 0 && !checkoutResult && (
          <div className="border-t border-[#E5E7EB] bg-[#F8F9FA] px-6 py-5">
            <div className="flex items-baseline justify-between text-sm text-[#4B525E]">
              <span>Digital delivery</span>
              <span>Instant · Free</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-semibold text-[#141619]">
                Subtotal ({currencyCode})
              </span>
              <span className="tabular-nums text-lg font-semibold text-[#141619]">
                {formatPrice(subtotal, currencyCode)}
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedCheckout}
              disabled={isCheckingOut}
              className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#1E4D3B] px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#163B2D] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
            >
              <span>{isCheckingOut ? 'Preparing checkout…' : 'Checkout'}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <div className="mt-3 flex items-center justify-between text-xs text-[#6C757D]">
              <span>Stripe &amp; PayPal ready</span>
              <button
                type="button"
                onClick={onClearCart}
                className="underline decoration-[#CBD2D9] underline-offset-2 hover:text-[#141619]"
              >
                Clear bag
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
