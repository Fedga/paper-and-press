import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Download, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Product } from '../data/products';
import {
  formatDescriptionBlocks,
  formatPrice,
  formatTagLabel,
  getPrimaryCategoryLabel,
  getRelatedProducts,
  splitProductTitle,
} from '../utils/catalog';
import { ProductCard } from './ProductCard';
import { ProductGallery } from './ProductGallery';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  quantityInCart: number;
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectTag: (normalizedTag: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenCart: () => void;
}

export function ProductDetailPage({
  product,
  allProducts,
  quantityInCart,
  onBack,
  onSelectProduct,
  onSelectTag,
  onAddToCart,
  onOpenCart,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setJustAdded(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [product.id]);

  const { primary, secondary } = useMemo(
    () => splitProductTitle(product.TITLE),
    [product.TITLE],
  );
  const categoryLabel = useMemo(() => getPrimaryCategoryLabel(product), [product]);
  const descriptionBlocks = useMemo(
    () => formatDescriptionBlocks(product.DESCRIPTION),
    [product.DESCRIPTION],
  );
  const related = useMemo(
    () => getRelatedProducts(product, allProducts, 3),
    [product, allProducts],
  );

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="pb-24 lg:pb-16">
      {/* Breadcrumb bar */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-[36px] items-center gap-2 text-sm font-medium text-[#4B525E] transition-colors hover:text-[#141619] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            <span>Back to all editions</span>
          </button>

          <div className="hidden items-center gap-2 text-xs text-[#6C757D] sm:flex">
            <span>{categoryLabel}</span>
            <span aria-hidden="true">/</span>
            <span className="max-w-[300px] truncate text-[#343A40]">{primary}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Product Detail Grid */}
      <div className="mx-auto max-w-[1360px] px-5 pt-8 sm:px-8 lg:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Sticky Interactive Photo + Video Gallery */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <ProductGallery product={product} />
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module + Structured Details */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Quiet metadata line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5C6370]">
                <span>{categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span>Instant Digital Download</span>
                {product.SKU && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">SKU {product.SKU}</span>
                  </>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1
                  className="font-display text-[clamp(1.65rem,2.6vw,2.25rem)] leading-[1.16] font-medium tracking-tight text-[#141619]"
                  style={{ textWrap: 'balance' }}
                >
                  {primary}
                </h1>
                {secondary && (
                  <p className="mt-2.5 text-sm leading-relaxed text-[#5C6370]">
                    {secondary}
                  </p>
                )}
              </div>

              {/* Price & Availability */}
              <div className="flex items-baseline justify-between border-y border-[#E5E7EB] py-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="tabular-nums text-2xl font-semibold text-[#141619]">
                    {formatPrice(product.PRICE, product.CURRENCY_CODE)}
                  </span>
                  <span className="text-xs text-[#6C757D]">
                    {product.CURRENCY_CODE}
                  </span>
                </div>
                <span className="text-xs font-medium text-[#1E4D3B]">
                  Available immediately
                </span>
              </div>

              {/* Purchase Controls */}
              <div className="space-y-3">
                <div className="flex items-stretch gap-3">
                  {/* Quantity stepper */}
                  <div
                    className="inline-flex items-center rounded-lg border border-[#D8DCE2] bg-white"
                    aria-label="Quantity"
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="flex h-11 w-10 items-center justify-center text-[#343A40] transition-colors hover:text-[#141619] disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="tabular-nums min-w-[2.25rem] text-center text-sm font-medium text-[#141619]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="flex h-11 w-10 items-center justify-center text-[#343A40] transition-colors hover:text-[#141619]"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Primary Add to Bag CTA */}
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#1E4D3B] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#163B2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
                  >
                    {justAdded ? (
                      <>
                        <Check className="h-4 w-4" strokeWidth={2.4} />
                        <span>Added to bag</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
                        <span>
                          Add to bag ·{' '}
                          <span className="tabular-nums">
                            {formatPrice(product.PRICE * quantity, product.CURRENCY_CODE)}
                          </span>
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {quantityInCart > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-[#F1F3F5] px-3.5 py-2.5 text-xs text-[#343A40]">
                    <span className="tabular-nums">
                      {quantityInCart} {quantityInCart === 1 ? 'copy' : 'copies'} currently in your bag
                    </span>
                    <button
                      type="button"
                      onClick={onOpenCart}
                      className="font-semibold text-[#1E4D3B] hover:underline"
                    >
                      View bag
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-2.5 pt-1 text-xs leading-relaxed text-[#5C6370]">
                  <Download className="mt-0.5 h-4 w-4 shrink-0 text-[#5C6370]" strokeWidth={1.7} />
                  <span>
                    Digital download only. Files are delivered immediately after checkout—no physical item is shipped.
                  </span>
                </div>
              </div>

              {/* Materials (mapped from CSV MATERIALS column if present) */}
              {product.MATERIALS.length > 0 && (
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
                    Materials &amp; Formats
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#343A40]">
                    {product.MATERIALS.join(' · ')}
                  </p>
                </div>
              )}

              {/* Structured Description (mapped from CSV DESCRIPTION column) */}
              <div className="border-t border-[#E5E7EB] pt-6">
                <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
                  Edition Details
                </h2>
                <div className="mt-4 space-y-3.5 text-[14.5px] leading-[1.68] text-[#343A40]">
                  {descriptionBlocks.map((block, idx) => {
                    if (block.type === 'heading') {
                      return (
                        <h3
                          key={idx}
                          className="font-sans pt-2 text-[13px] font-semibold tracking-[0.02em] text-[#141619]"
                        >
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === 'list' && block.items) {
                      return (
                        <ul key={idx} className="space-y-1.5 pl-4 text-[14px] leading-relaxed">
                          {block.items.map((item, itemIdx) => (
                            <li
                              key={itemIdx}
                              className="list-disc marker:text-[#868E96]"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx}>{block.text}</p>;
                  })}
                </div>
              </div>

              {/* Unboxed clickable Tags Metadata (mapped from CSV TAGS column) */}
              {product.TAGS.length > 0 && (
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
                    Filed Under
                  </h2>
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-[#5C6370]">
                    {product.TAGS.map((rawTag, idx) => {
                      const norm = rawTag.trim().toLowerCase();
                      return (
                        <span key={`${norm}-${idx}`} className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectTag(norm)}
                            className="text-left text-[#4B525E] underline decoration-[#D0D5DD] underline-offset-2 transition-colors hover:text-[#1E4D3B] hover:decoration-[#1E4D3B]"
                          >
                            {formatTagLabel(rawTag)}
                          </button>
                          {idx < product.TAGS.length - 1 && (
                            <span aria-hidden="true" className="text-[#ADB5BD]">
                              ·
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Editions */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-[#E5E7EB] pt-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-medium tracking-tight text-[#141619]">
                Related Editions
              </h2>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-medium text-[#1E4D3B] hover:underline"
              >
                View all {allProducts.length}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onSelect={onSelectProduct}
                  onAddToCart={(p) => onAddToCart(p, 1)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Compact Sticky Mobile Purchase Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-20 flex items-center justify-between gap-4 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[#5C6370]">{primary}</p>
          <p className="tabular-nums text-base font-semibold text-[#141619]">
            {formatPrice(product.PRICE * quantity, product.CURRENCY_CODE)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1E4D3B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#163B2D]"
        >
          {justAdded ? 'Added' : 'Add to bag'}
        </button>
      </div>
    </div>
  );
}
