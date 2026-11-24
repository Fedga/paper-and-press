import { ShoppingBag } from 'lucide-react';

interface NavCategory {
  id: string;
  navLabel: string;
}

interface HeaderProps {
  navCategories: NavCategory[];
  activeCategory: string;
  isDetailView: boolean;
  cartCount: number;
  onSelectCategory: (categoryId: string) => void;
  onGoHome: () => void;
  onOpenCart: () => void;
}

export function Header({
  navCategories,
  activeCategory,
  isDetailView,
  cartCount,
  onSelectCategory,
  onGoHome,
  onOpenCart,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-[#F8F9FA]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="font-display shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight text-[#141619] transition-opacity duration-150 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E4D3B]"
        >
          Paper &amp; Press
        </a>

        {/* Zone 2: Concise single-line collection links */}
        <nav
          aria-label="Shop collections"
          className="hidden items-center gap-7 md:flex"
        >
          {navCategories.slice(0, 4).map((cat) => {
            const isActive = !isDetailView && activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`relative shrink-0 whitespace-nowrap py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E4D3B] ${
                  isActive
                    ? 'text-[#141619]'
                    : 'text-[#5C6370] hover:text-[#141619]'
                }`}
              >
                {cat.navLabel}
                {isActive && (
                  <span
                    className="absolute right-0 -bottom-0.5 left-0 h-[1.5px] bg-[#1E4D3B]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#1E4D3B] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#163B2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
            <span>Bag</span>
            <span className="tabular-nums text-white/85">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
