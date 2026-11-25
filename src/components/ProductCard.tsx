import { useMemo, useState } from 'react';
import { Check, Download, Plus } from 'lucide-react';
import type { Product } from '../data/products';
import {
  formatPrice,
  getPrimaryCategoryLabel,
  splitProductTitle,
} from '../utils/catalog';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const FILE_FORMAT_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'SVG', regex: /\bsvg\b/i },
  { label: 'PNG', regex: /\bpng\b/i },
  { label: 'PDF', regex: /\bpdf\b/i },
  { label: 'DXF', regex: /\bdxf\b/i },
  { label: 'EPS', regex: /\beps\b/i },
  { label: 'Canva', regex: /\bcanva\b/i },
  { label: 'Notion', regex: /\bnotion\b/i },
];

function extractFormatsFromProduct(product: Product): string[] {
  const source = `${product.TITLE} ${product.MATERIALS.join(' ')} ${product.TAGS.join(' ')} ${product.DESCRIPTION}`;
  const found: string[] = [];
  for (const item of FILE_FORMAT_PATTERNS) {
    if (item.regex.test(source)) {
      found.push(item.label);
      if (found.length >= 3) break;
    }
  }
  return found.length > 0 ? found : ['PDF'];
}

export function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const { primary, secondary } = splitProductTitle(product.TITLE);
  const categoryLabel = getPrimaryCategoryLabel(product);
  const formats = useMemo(() => extractFormatsFromProduct(product), [product]);
  const primaryImage = product.IMAGES[0];
  const hoverImage = product.IMAGES[1];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] transition-all duration-200 hover:-translate-y-1 hover:border-[#D6CCBE] hover:shadow-[0_18px_36px_-20px_rgba(30,30,28,0.22)]">
      {/* Image Stage: IMAGE1 main thumbnail with gentle IMAGE2 hover peek + Instant Download badge */}
      <div className="p-2.5 pb-0">
        <button
          type="button"
          onClick={() => onSelect(product)}
          aria-label={`View ${primary}`}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F4EFE7] text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B]"
        >
          <ResilientImage
            src={primaryImage}
            alt={product.TITLE}
            fallbackTitle={primary}
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {hoverImage && (
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden="true"
            >
              <ResilientImage
                src={hoverImage}
                alt=""
                fallbackTitle={primary}
                className="h-full w-full"
              />
            </div>
          )}

          {/* Subtle Instant Download Badge */}
          <span className="pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full border border-[#E8E2D9] bg-[#FAF8F5]/95 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.01em] text-[#2C4C3B] shadow-xs backdrop-blur-xs">
            <Download className="h-3 w-3 text-[#C85A32]" strokeWidth={2.1} />
            <span>Instant Download</span>
          </span>
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        {/* Category + Clean File-Format Tags */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11.5px] font-medium text-[#766D64]">
            {categoryLabel}
          </span>
          <div
            className="flex shrink-0 items-center gap-1"
            aria-label={`File formats: ${formats.join(', ')}`}
          >
            {formats.map((fmt) => (
              <span
                key={fmt}
                className="rounded-md border border-[#E8E2D9] bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-[#4E4A44]"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelect(product)}
          className="mt-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B]"
        >
          <h3 className="font-['Fraunces',serif] line-clamp-2 text-[17px] leading-[1.3] font-medium text-[#1E1E1C] transition-colors group-hover:text-[#2C4C3B]">
            {primary}
          </h3>
          {secondary && (
            <p className="mt-1 line-clamp-1 text-xs text-[#766D64]">{secondary}</p>
          )}
        </button>

        {/* Highlighted GBP Price & Quick Add */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#F1ECE4] pt-3.5">
          <div className="flex items-baseline gap-1.5">
            <span className="tabular-nums text-[17px] font-bold tracking-tight text-[#2C4C3B]">
              {formatPrice(product.PRICE, product.CURRENCY_CODE)}
            </span>
            <span className="text-[10.5px] font-medium text-[#8C8277]">
              {product.CURRENCY_CODE}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B] ${
              justAdded
                ? 'bg-[#C85A32] text-[#FAF8F5]'
                : 'border border-[#2C4C3B]/25 bg-[#2C4C3B]/8 text-[#2C4C3B] hover:border-[#2C4C3B] hover:bg-[#2C4C3B] hover:text-[#FAF8F5]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                <span>Add to bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
