import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
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

export function ProductCard({ product, onSelect, onAddToCart }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const { primary, secondary } = splitProductTitle(product.TITLE);
  const categoryLabel = getPrimaryCategoryLabel(product);
  const primaryImage = product.IMAGES[0];
  const hoverImage = product.IMAGES[1];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(20,22,25,0.18)]">
      {/* Image Stage: IMAGE1 main thumbnail with gentle IMAGE2 hover peek */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`View ${primary}`}
        className="relative aspect-square w-full overflow-hidden bg-[#F1F3F5] text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1E4D3B]"
      >
        <ResilientImage
          src={primaryImage}
          alt={product.TITLE}
          fallbackTitle={primary}
          className="h-full w-full"
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
      </button>

      {/* Card Body: consistent vertical rhythm and aligned price baseline */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-xs text-[#6C757D]">
          <span className="truncate">{categoryLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums shrink-0">
            {product.IMAGES.length} {product.IMAGES.length === 1 ? 'photo' : 'photos'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onSelect(product)}
          className="mt-1.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
        >
          <h3 className="font-sans line-clamp-2 text-[15px] leading-snug font-semibold text-[#141619] transition-colors group-hover:text-[#1E4D3B]">
            {primary}
          </h3>
          {secondary && (
            <p className="mt-1 line-clamp-1 text-xs text-[#6C757D]">{secondary}</p>
          )}
        </button>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#F1F3F5] pt-3.5">
          <span className="tabular-nums text-[15px] font-semibold text-[#141619]">
            {formatPrice(product.PRICE, product.CURRENCY_CODE)}
          </span>

          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B] ${
              justAdded
                ? 'bg-[#1E4D3B] text-white'
                : 'border border-[#D8DCE2] bg-white text-[#141619] hover:border-[#1E4D3B] hover:bg-[#1E4D3B] hover:text-white'
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
