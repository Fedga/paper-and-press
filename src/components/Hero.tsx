import { ArrowDownRight, Download, Scissors, ShieldCheck } from 'lucide-react';
import type { Product } from '../data/products';
import {
  extractFileFormats,
  formatPrice,
  splitProductTitle,
} from '../utils/catalog';
import { ResilientImage } from './ResilientImage';

interface HeroProps {
  featuredProducts: Product[];
  totalCount: number;
  onSelectProduct: (product: Product) => void;
  onBrowseCatalog: () => void;
  onViewHowItWorks: () => void;
}

export function Hero({
  featuredProducts,
  totalCount,
  onSelectProduct,
  onBrowseCatalog,
  onViewHowItWorks,
}: HeroProps) {
  const lead = featuredProducts[0];
  const secondary = featuredProducts.slice(1, 3);

  return (
    <section className="border-b border-[#E8E0D5] bg-[#FAF8F5]">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-stretch gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:py-16">
        {/* Left Editorial Boutique Copy */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            {/* Boutique Trust Strip */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-[#2C4A3E]">
              <span className="inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" strokeWidth={1.9} />
                <span>Instant Digital Download</span>
              </span>
              <span aria-hidden="true" className="text-[#C7BCAE]">
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5" strokeWidth={1.9} />
                <span>Cricut &amp; Silhouette Ready</span>
              </span>
            </div>

            <h1
              className="font-display mt-5 text-[clamp(2.25rem,3.8vw,3.5rem)] leading-[1.09] font-medium tracking-[-0.015em] text-[#1F1B18]"
              style={{ textWrap: 'balance' }}
            >
              Thoughtful digital craft &amp;{' '}
              <span className="italic text-[#2C4A3E]">fine printables</span> for
              modern makers.
            </h1>

            <p className="mt-5 max-w-[44ch] text-[15px] leading-[1.7] text-[#5C534A]">
              Explore {totalCount} original studio editions — from heirloom 3D
              pop-up holiday cards and laser-cut villages to calm 2027 planners
              and 300 DPI sublimation art. Ready to download and craft in
              minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onBrowseCatalog}
                className="inline-flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#2C4A3E] px-6 py-2.5 text-sm font-medium text-[#FAF8F5] shadow-[0_2px_8px_rgba(44,74,62,0.18)] transition-colors duration-150 hover:bg-[#21392F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4A3E]"
              >
                <span>Shop the Collection</span>
                <ArrowDownRight className="h-4 w-4" strokeWidth={1.8} />
              </button>

              <button
                type="button"
                onClick={onViewHowItWorks}
                className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap text-sm font-medium text-[#3D352E] underline decoration-[#C7BCAE] underline-offset-4 transition-colors duration-150 hover:text-[#2C4A3E] hover:decoration-[#2C4A3E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C4A3E]"
              >
                How downloads work
              </button>
            </div>
          </div>

          {/* Boutique Studio Assurances */}
          <div className="mt-10 grid grid-cols-1 gap-3 border-t border-[#E8E0D5] pt-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-[#1F1B18]">
                Instant ZIP &amp; PDF
              </p>
              <p className="mt-0.5 text-xs text-[#6B6259]">
                Files arrive immediately after checkout
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1F1B18]">
                Tested Cut Lines
              </p>
              <p className="mt-0.5 text-xs text-[#6B6259]">
                Cricut, Silhouette &amp; Glowforge
              </p>
            </div>
            <div className="flex items-start gap-1.5">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F1B18]">
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-[#2C4A3E]"
                    strokeWidth={1.9}
                  />
                  <span>300 DPI Quality</span>
                </p>
                <p className="mt-0.5 text-xs text-[#6B6259]">
                  Crisp print &amp; transparent PNGs
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Editorial Print-Mat Showcase */}
        {lead && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 lg:col-span-7">
            <button
              type="button"
              onClick={() => onSelectProduct(lead)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E6DDD1] bg-white p-2.5 text-left shadow-[0_12px_32px_-20px_rgba(31,27,24,0.22)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4A3E] sm:col-span-7"
            >
              <div className="aspect-[4/3] w-full flex-1 overflow-hidden rounded-xl bg-[#F3EEE6] sm:aspect-auto sm:h-full sm:min-h-[340px]">
                <ResilientImage
                  src={lead.IMAGES[0]}
                  alt={lead.TITLE}
                  fallbackTitle={splitProductTitle(lead.TITLE).primary}
                  loading="eager"
                  className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-3 px-2 pt-3 pb-1">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#7A6F64]">
                    Featured Edition ·{' '}
                    {extractFileFormats(lead, 3).join(' / ')}
                  </p>
                  <p className="font-display mt-0.5 truncate text-[15px] font-medium text-[#1F1B18] group-hover:text-[#2C4A3E]">
                    {splitProductTitle(lead.TITLE).primary}
                  </p>
                </div>
                <span className="tabular-nums shrink-0 text-sm font-semibold text-[#1F1B18]">
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
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E6DDD1] bg-white p-2 text-left shadow-[0_10px_28px_-20px_rgba(31,27,24,0.18)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4A3E]"
                >
                  <div className="aspect-[4/3] w-full flex-1 overflow-hidden rounded-xl bg-[#F3EEE6] sm:aspect-[16/10]">
                    <ResilientImage
                      src={item.IMAGES[0]}
                      alt={item.TITLE}
                      fallbackTitle={splitProductTitle(item.TITLE).primary}
                      loading="eager"
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="flex items-baseline justify-between gap-2 px-1.5 pt-2.5 pb-1">
                    <span className="font-display truncate text-[13.5px] font-medium text-[#1F1B18] group-hover:text-[#2C4A3E]">
                      {splitProductTitle(item.TITLE).primary}
                    </span>
                    <span className="tabular-nums shrink-0 text-xs font-semibold text-[#1F1B18]">
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
