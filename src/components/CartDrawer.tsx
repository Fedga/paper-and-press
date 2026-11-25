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
        className="fixed inset-0 bg-[#1F1B18]/40 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-[#FAF8F5] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D5] bg-white px-6 py-4">
          <div className="flex items-baseline gap-2">
            <h2 className="font-display text-xl font-medium text-[#1F1B18]">
              Shopping Bag
            </h2>
            <span className="tabular-nums text-xs text-[#7A6F64]">
              ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#6B6259] transition-colors hover:bg-[#F3EEE6] hover:text-[#1F1B18]"
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
                  className="mt-0.5 h-6 w-6 shrink-0 text-[#2C4C3B]"
                  strokeWidth={1.8}
                />
                <div>
                  <h3 className="font-display text-lg font-medium text-[#1F1B18]">
                    {checkoutResult.mode === 'redirect'
                      ? 'Payment Link Ready'
                      : 'Order Ready for Checkout'}
                  </h3>
                  <p className="tabular-nums mt-1 text-xs text-[#6B6259]">
                    Reference {checkoutResult.orderReference} · Total{' '}
                    {formatPrice(subtotal, currencyCode)} ({currencyCode})
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-[#4E463F]">
                {checkoutResult.message}
              </p>

              <div className="rounded-xl border border-[#E6DDD1] bg-white p-4">
                <p className="text-xs font-semibold text-[#6B6259]">Order summary</p>
                <ul className="mt-3 space-y-2 text-xs text-[#3D352E]">
                  {items.map((item) => (
                    <li
                      key={item.product.id}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="truncate">
                        {item.quantity} × {splitProductTitle(item.product.TITLE).primary}
                      </span>
                      <span className="tabular-nums shrink-0 font-medium text-[#1F1B18]">
                        {formatPrice(
                          item.product.PRICE * item.quantity,
                          item.product.CURRENCY_CODE,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-[#EFE8DD] pt-3 text-sm font-semibold text-[#1F1B18]">
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
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#2C4C3B] px-4 py-2.5 text-sm font-medium text-[#FAF8F5] hover:bg-[#21392F]"
                >
                  <span>Continue to Payment</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setCheckoutResult(null)}
                  className="min-h-[42px] flex-1 rounded-full border border-[#D8CEC0] bg-white px-4 py-2 text-sm font-medium text-[#1F1B18] hover:bg-[#F3EEE6]"
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
                  className="min-h-[42px] flex-1 rounded-full bg-[#1F1B18] px-4 py-2 text-sm font-medium text-[#FAF8F5] hover:bg-[#352F2A]"
                >
                  Clear &amp; finish
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E6DDD1] bg-white text-[#6B6259]">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.7} />
              </div>
              <p className="font-display mt-4 text-lg font-medium text-[#1F1B18]">
                Your bag is empty
              </p>
              <p className="mt-1.5 max-w-[28ch] text-sm text-[#6B6259]">
                Add SVG cut files, laser kits, or printable stationery to get started.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 min-h-[42px] rounded-full border border-[#D8CEC0] bg-white px-5 py-2 text-sm font-medium text-[#1F1B18] transition-colors hover:border-[#2C4C3B] hover:text-[#2C4C3B]"
              >
                Continue browsing
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[#E8E0D5]" role="list">
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
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#E6DDD1] bg-white p-1"
                    >
                      <div className="h-full w-full overflow-hidden rounded-lg">
                        <ResilientImage
                          src={product.IMAGES[0]}
                          alt={primary}
                          compact
                          className="h-full w-full"
                        />
                      </div>
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onInspectProduct(product.id);
                            onClose();
                          }}
                          className="font-display line-clamp-2 text-left text-[15px] leading-snug font-medium text-[#1F1B18] hover:text-[#2C4C3B]"
                        >
                          {primary}
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label={`Remove ${primary}`}
                          className="shrink-0 p-1 text-[#968B7F] transition-colors hover:text-[#1F1B18]"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-[#DED5C8] bg-white px-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            aria-label={`Decrease quantity of ${primary}`}
                            className="flex h-7 w-7 items-center justify-center text-[#3D352E] hover:text-[#1F1B18]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="tabular-nums min-w-[1.6rem] text-center text-xs font-medium text-[#1F1B18]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            aria-label={`Increase quantity of ${primary}`}
                            className="flex h-7 w-7 items-center justify-center text-[#3D352E] hover:text-[#1F1B18]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="tabular-nums text-sm font-semibold text-[#1F1B18]">
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
          <div className="border-t border-[#E8E0D5] bg-white px-6 py-5">
            <div className="flex items-baseline justify-between text-sm text-[#5C534A]">
              <span>Digital delivery</span>
              <span>Instant · Free</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-base font-semibold text-[#1F1B18]">
                Subtotal ({currencyCode})
              </span>
              <span className="tabular-nums text-lg font-semibold text-[#1F1B18]">
                {formatPrice(subtotal, currencyCode)}
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedCheckout}
              disabled={isCheckingOut}
              className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-[#2C4C3B] px-5 py-3 text-sm font-medium text-[#FAF8F5] shadow-[0_2px_8px_rgba(44,74,62,0.18)] transition-colors duration-150 hover:bg-[#21392F] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B]"
            >
              <span>{isCheckingOut ? 'Preparing checkout…' : 'Checkout'}</span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </button>

            <div className="mt-3 flex items-center justify-between text-xs text-[#7A6F64]">
              <span>Stripe &amp; PayPal ready</span>
              <button
                type="button"
                onClick={onClearCart}
                className="underline decoration-[#D8CEC0] underline-offset-2 hover:text-[#1F1B18]"
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
