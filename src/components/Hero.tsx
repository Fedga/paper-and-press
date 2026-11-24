import { ArrowDownRight } from 'lucide-react';
import type { Product } from '../data/products';
import { formatPrice, splitProductTitle } from '../utils/catalog';
import { ResilientImage } from './ResilientImage';

interface HeroProps {
  featuredProducts: Product[];
  totalCount: number;
  onSelectProduct: (product: Product) => void;
  onBrowseCatalog: () => void;
}

export function Hero({
  featuredProducts,
  totalCount,
  onSelectProduct,
  onBrowseCatalog,
}: HeroProps) {
  const lead = featuredProducts[0];
  const secondary = featuredProducts.slice(1, 3);

  return (
    <section className="border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-stretch gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:py-14">
        {/* Left editorial copy column */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <p className="text-xs font-medium tracking-[0.06em] text-[#5C6370]">
              Digital Craft &amp; Print Studio · {totalCount} Editions
            </p>
            <h1
              className="font-display mt-4 text-[clamp(2.15rem,3.6vw,3.35rem)] leading-[1.08] font-medium tracking-tight text-[#141619]"
              style={{ textWrap: 'balance' }}
            >
              Crafted digital editions for makers and planners.
            </h1>
            <p className="mt-5 max-w-[44ch] text-[15px] leading-relaxed text-[#4B525E]">
              Instant-download SVG cut files, 3D paper engineering templates, laser-ready kits,
              sublimation artwork, and printable stationery — ready for Cricut, Silhouette,
              Glowforge, and home printers.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1E4D3B] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#163B2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
              >
                <span>Browse the catalog</span>
                <ArrowDownRight className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#ECEEF1] pt-5 text-xs text-[#5C6370]">
            <span>Instant digital ZIP &amp; PDF</span>
            <span aria-hidden="true">·</span>
            <span>300 DPI &amp; vector formats</span>
            <span aria-hidden="true">·</span>
            <span>Cricut, Silhouette &amp; laser ready</span>
          </div>
        </div>

        {/* Right visual showcase pulling directly from real CSV catalog images */}
        {lead && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 lg:col-span-7">
            <button
              type="button"
              onClick={() => onSelectProduct(lead)}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F1F3F5] text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B] sm:col-span-7"
            >
              <div className="aspect-[4/3] w-full flex-1 sm:aspect-auto sm:h-full sm:min-h-[340px]">
                <ResilientImage
                  src={lead.IMAGES[0]}
                  alt={lead.TITLE}
                  fallbackTitle={splitProductTitle(lead.TITLE).primary}
                  loading="eager"
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-[#E5E7EB] bg-white px-4 py-3">
                <span className="truncate text-sm font-medium text-[#141619]">
                  {splitProductTitle(lead.TITLE).primary}
                </span>
                <span className="tabular-nums shrink-0 text-sm font-semibold text-[#141619]">
                  {formatPrice(lead.PRICE, lead.CURRENCY_CODE)}
                </span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4 sm:col-span-5 sm:grid-cols-1">
              {secondary.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectProduct(item)}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F1F3F5] text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
                >
                  <div className="aspect-[4/3] w-full flex-1 sm:aspect-[16/10]">
                    <ResilientImage
                      src={item.IMAGES[0]}
                      alt={item.TITLE}
                      fallbackTitle={splitProductTitle(item.TITLE).primary}
                      loading="eager"
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-[#E5E7EB] bg-white px-3.5 py-2.5">
                    <span className="truncate text-xs font-medium text-[#141619]">
                      {splitProductTitle(item.TITLE).primary}
                    </span>
                    <span className="tabular-nums shrink-0 text-xs font-semibold text-[#141619]">
                      {formatPrice(item.PRICE, item.CURRENCY_CODE)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
