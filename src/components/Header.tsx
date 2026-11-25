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
    <header className="sticky top-0 z-30 border-b border-[#E8E2D9] bg-[#FAF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1360px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Fraunces studio wordmark */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
          className="font-['Fraunces',serif] shrink-0 whitespace-nowrap text-[21px] font-semibold tracking-[-0.015em] text-[#1E1E1C] transition-opacity duration-150 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C4C3B]"
        >
          Paper &amp; Press Studio
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
                className={`relative shrink-0 whitespace-nowrap py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C4C3B] ${
                  isActive
                    ? 'text-[#1E1E1C]'
                    : 'text-[#6A625A] hover:text-[#1E1E1C]'
                }`}
              >
                {cat.navLabel}
                {isActive && (
                  <span
                    className="absolute right-0 -bottom-0.5 left-0 h-[2px] rounded-full bg-[#C85A32]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary Bag action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
            className="inline-flex min-h-[40px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#2C4C3B] px-4.5 py-2 text-sm font-medium text-[#FAF8F5] shadow-[0_2px_6px_rgba(44,76,59,0.2)] transition-colors duration-150 hover:bg-[#223B2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B]"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />
            <span>Bag</span>
            <span className="tabular-nums text-[#FAF8F5]/85">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
