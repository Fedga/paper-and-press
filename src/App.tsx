import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  Scissors,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { PRODUCTS, type Product } from './data/products';
import type { CartItem } from './checkout';
import {
  buildAutoCategories,
  extractTagIndex,
  formatPrice,
  formatTagLabel,
  splitProductTitle,
} from './utils/catalog';
import { CartDrawer } from './components/CartDrawer';
import { FilterSidebar } from './components/FilterSidebar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'title-asc';
type QuickCategoryId =
  | 'all'
  | 'popup-cards'
  | 'christmas'
  | 'planners-calendars'
  | 'clipart-svg';

const CART_STORAGE_KEY = 'paper_press_bag_v1';

interface QuickCategoryPill {
  id: QuickCategoryId;
  label: string;
  matches: (product: Product) => boolean;
}

const QUICK_CATEGORY_PILLS: QuickCategoryPill[] = [
  {
    id: 'all',
    label: 'All Designs',
    matches: () => true,
  },
  {
    id: 'popup-cards',
    label: '3D Pop-Up Cards',
    matches: (p) => {
      const text = `${p.TITLE} ${p.TAGS.join(' ')}`.toLowerCase();
      return (
        text.includes('pop up') ||
        text.includes('pop_up') ||
        text.includes('popup') ||
        text.includes('kirigami') ||
        text.includes('3d christmas village')
      );
    },
  },
  {
    id: 'christmas',
    label: 'Christmas',
    matches: (p) => {
      const text = `${p.TITLE} ${p.TAGS.join(' ')}`.toLowerCase();
      return (
        text.includes('christmas') ||
        text.includes('xmas') ||
        text.includes('holiday') ||
        text.includes('winter')
      );
    },
  },
  {
    id: 'planners-calendars',
    label: 'Planners & Calendars',
    matches: (p) => {
      const text = `${p.TITLE} ${p.TAGS.join(' ')}`.toLowerCase();
      return (
        text.includes('planner') ||
        text.includes('calendar') ||
        text.includes('resume') ||
        text.includes('coloring')
      );
    },
  },
  {
    id: 'clipart-svg',
    label: 'Clipart & SVG',
    matches: (p) => {
      const text = `${p.TITLE} ${p.TAGS.join(' ')}`.toLowerCase();
      return (
        text.includes('clipart') ||
        text.includes('sublimation') ||
        text.includes('svg') ||
        text.includes('kinusaiga')
      );
    },
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '1',
    title: 'Pick Your Design',
    description:
      'Browse Cricut SVGs, 3D pop-up templates, laser kits, sublimation packs, and calm printable planners.',
    icon: ShoppingBag,
  },
  {
    step: '2',
    title: 'Instant Checkout',
    description:
      'Complete quick, secure checkout with transparent GBP pricing—no postage fees or shipping delays.',
    icon: CreditCard,
  },
  {
    step: '3',
    title: 'Download, Print & Craft',
    description:
      'Unzip your organized SVG, PNG, DXF & PDF files immediately and upload straight to your cutting machine or printer.',
    icon: Scissors,
  },
];

const CUSTOMER_REVIEWS = [
  {
    quote:
      'The magenta score layer uploaded straight into Cricut Design Space with zero fussing. I crafted twelve Golden Retriever 3D pop-up cards in one evening and every single one folded completely flat into an A7 envelope.',
    author: 'Hannah Whitaker',
    location: 'Bath, UK',
    edition: '3D Pop Up Christmas Card SVG',
  },
  {
    quote:
      'I tried three complex planners before switching to the 2027 ADHD Reset bundle. Having both hyperlinked GoodNotes tabs and a calm Today-Only Notion inbox with Safe-to-Spend math made payday budgeting genuinely peaceful.',
    author: 'Claire Donnelly',
    location: 'Bristol, UK',
    edition: '2027 ADHD Digital Planner & Notion Bundle',
  },
  {
    quote:
      'Every gingerbread house in the laser village kit included hex colour swatches and a 1-page stacking blueprint. All ten houses cut cleanly on 3mm birch plywood and sold out at our winter craft market.',
    author: 'Martin Gallagher',
    location: 'Hearth & Pine Laser Co.',
    edition: '3D Christmas Village Laser Cut Bundle',
  },
];

function readProductIdFromHash(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/^#\/product\/(.+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function loadInitialCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{ id: string; quantity: number }>;
    if (!Array.isArray(parsed)) return [];
    const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
    return parsed
      .map((entry) => {
        const product = byId.get(entry.id);
        if (!product || !entry.quantity || entry.quantity < 1) return null;
        return { product, quantity: Math.floor(entry.quantity) };
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export default function App() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() =>
    readProductIdFromHash(),
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeQuickPill, setActiveQuickPill] = useState<QuickCategoryId>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadInitialCart());
  const [cartOpen, setCartOpen] = useState(false);

  const catalogRef = useRef<HTMLElement | null>(null);

  // Persist shopping bag in localStorage
  useEffect(() => {
    try {
      const compact = cartItems.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
      }));
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  // Sync browser Back/Forward with hash route
  useEffect(() => {
    const onHashChange = () => {
      setSelectedProductId(readProductIdFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Derived auto-categories and complete tag index from CSV TAGS column
  const categories = useMemo(() => buildAutoCategories(PRODUCTS), []);
  const tagIndex = useMemo(() => extractTagIndex(PRODUCTS), []);

  // Curated hero picks (1st, 5th, and 6th listings showcase varied crafts)
  const featuredProducts = useMemo(() => {
    const indices = [0, 4, 5];
    const picked = indices
      .map((i) => PRODUCTS[i])
      .filter((p): p is Product => Boolean(p));
    return picked.length >= 3 ? picked : PRODUCTS.slice(0, 3);
  }, []);

  const selectedProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === selectedProductId) || null,
    [selectedProductId],
  );

  // Filtered and sorted catalog
  const filteredProducts = useMemo(() => {
    const categoryObj = categories.find((c) => c.id === activeCategory);
    const quickPillObj = QUICK_CATEGORY_PILLS.find((q) => q.id === activeQuickPill);
    const query = searchQuery.trim().toLowerCase();

    const list = PRODUCTS.filter((product) => {
      if (categoryObj && !categoryObj.matches(product)) {
        return false;
      }

      if (quickPillObj && !quickPillObj.matches(product)) {
        return false;
      }

      if (selectedTags.length > 0) {
        const productTags = new Set(product.TAGS.map((t) => t.trim().toLowerCase()));
        const matchesAllSelected = selectedTags.every((t) => productTags.has(t));
        if (!matchesAllSelected) return false;
      }

      if (query) {
        const haystack = [
          product.TITLE,
          product.DESCRIPTION,
          product.TAGS.join(' '),
          product.TAGS.map(formatTagLabel).join(' '),
          product.MATERIALS.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.PRICE - b.PRICE);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.PRICE - a.PRICE);
    }
    if (sortBy === 'title-asc') {
      return [...list].sort((a, b) => a.TITLE.localeCompare(b.TITLE));
    }
    return list;
  }, [categories, activeCategory, activeQuickPill, selectedTags, searchQuery, sortBy]);

  const navigateToProduct = useCallback((product: Product) => {
    window.location.hash = `#/product/${encodeURIComponent(product.id)}`;
    setSelectedProductId(product.id);
  }, []);

  const navigateHome = useCallback(() => {
    if (window.location.hash) {
      window.location.hash = '#/';
    }
    setSelectedProductId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectNavCategory = useCallback(
    (categoryId: string) => {
      setActiveCategory(categoryId);
      setActiveQuickPill('all');
      setSelectedTags([]);
      if (selectedProductId) {
        window.location.hash = '#/';
        setSelectedProductId(null);
        window.setTimeout(() => {
          catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      } else {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [selectedProductId],
  );

  const handleSelectQuickPill = useCallback((pillId: QuickCategoryId) => {
    setActiveQuickPill(pillId);
    setActiveCategory('all');
    setSelectedTags([]);
  }, []);

  const handleSelectSidebarCategory = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveQuickPill('all');
  }, []);

  const handleSelectTagFromDetail = useCallback((normalizedTag: string) => {
    setActiveCategory('all');
    setActiveQuickPill('all');
    setSearchQuery('');
    setSelectedTags([normalizedTag]);
    window.location.hash = '#/';
    setSelectedProductId(null);
    window.setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const handleToggleTag = useCallback((normalizedTag: string) => {
    setSelectedTags((prev) =>
      prev.includes(normalizedTag)
        ? prev.filter((t) => t !== normalizedTag)
        : [...prev, normalizedTag],
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveQuickPill('all');
    setSelectedTags([]);
  }, []);

  const handleAddToCart = useCallback((product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const hasActiveFilters =
    activeCategory !== 'all' ||
    activeQuickPill !== 'all' ||
    selectedTags.length > 0 ||
    searchQuery.trim().length > 0;

  const activeHeading = useMemo(() => {
    if (activeQuickPill !== 'all') {
      return (
        QUICK_CATEGORY_PILLS.find((q) => q.id === activeQuickPill)?.label ||
        'All Designs'
      );
    }
    return categories.find((c) => c.id === activeCategory)?.label || 'All Designs';
  }, [activeQuickPill, activeCategory, categories]);

  const leadHeroProduct = featuredProducts[0];
  const secondaryHeroProducts = featuredProducts.slice(1, 3);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] font-['Plus_Jakarta_Sans',sans-serif] text-[#1E1E1C]">
      <Header
        navCategories={categories}
        activeCategory={activeCategory}
        isDetailView={Boolean(selectedProduct)}
        cartCount={cartCount}
        onSelectCategory={handleSelectNavCategory}
        onGoHome={navigateHome}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        {selectedProduct ? (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={PRODUCTS}
            quantityInCart={
              cartItems.find((i) => i.product.id === selectedProduct.id)?.quantity || 0
            }
            onBack={navigateHome}
            onSelectProduct={navigateToProduct}
            onSelectTag={handleSelectTagFromDetail}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setCartOpen(true)}
          />
        ) : (
          <>
            {/* Boutique Hero Banner */}
            <section className="border-b border-[#E8E2D9] bg-[#FAF8F5]">
              <div className="mx-auto grid max-w-[1360px] grid-cols-1 items-stretch gap-8 px-5 py-9 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:py-13">
                {/* Left Editorial Copy */}
                <div className="flex flex-col justify-between lg:col-span-6">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.06em] text-[#C85A32]">
                      Paper &amp; Press Studio · paperpressprintables.com
                    </p>

                    <h1
                      className="font-['Fraunces',serif] mt-3.5 text-[clamp(2.15rem,3.6vw,3.35rem)] leading-[1.08] font-medium tracking-[-0.02em] text-[#1E1E1C]"
                      style={{ textWrap: 'balance' }}
                    >
                      Heirloom Paper Crafts, Cricut SVGs &amp; Printable Editions
                    </h1>

                    <p className="mt-4 max-w-[48ch] text-[15px] leading-[1.7] text-[#5B554D]">
                      Thoughtfully engineered 3D pop-up cards, laser-cut holiday villages,
                      300 DPI sublimation clipart, and calm 2027 planners—crafted for
                      effortless cutting, printing, and handmade gifting.
                    </p>

                    {/* Trust Pills */}
                    <div className="mt-6 flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D9] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#2C4C3B]">
                        <Download className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={2} />
                        <span>Instant Digital Download</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D9] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#2C4C3B]">
                        <Scissors className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={2} />
                        <span>Cricut &amp; Silhouette Ready</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E2D9] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#2C4C3B]">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#C85A32]" strokeWidth={2} />
                        <span>Commercial Use Included</span>
                      </span>
                    </div>

                    {/* Primary CTA */}
                    <div className="mt-7 flex flex-wrap items-center gap-5">
                      <button
                        type="button"
                        onClick={() =>
                          catalogRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          })
                        }
                        className="inline-flex min-h-[46px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-[#2C4C3B] px-6 py-2.5 text-sm font-semibold text-[#FAF8F5] shadow-[0_4px_14px_rgba(44,76,59,0.2)] transition-colors duration-150 hover:bg-[#223B2E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B]"
                      >
                        <span>Explore All {PRODUCTS.length} Editions</span>
                        <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
                      </button>

                      <a
                        href="#how-it-works"
                        className="text-sm font-medium text-[#4E4A44] underline decoration-[#D4C9BA] underline-offset-4 transition-colors hover:text-[#C85A32] hover:decoration-[#C85A32]"
                      >
                        How digital downloads work
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Curated Boutique Preview Cards */}
                {leadHeroProduct && (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12 lg:col-span-6">
                    <button
                      type="button"
                      onClick={() => navigateToProduct(leadHeroProduct)}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-2 text-left shadow-[0_12px_30px_-20px_rgba(30,30,28,0.2)] transition-transform duration-200 hover:-translate-y-0.5 sm:col-span-7"
                    >
                      <div className="aspect-[4/3] w-full flex-1 overflow-hidden rounded-xl bg-[#F4EFE7] sm:aspect-auto sm:h-full sm:min-h-[290px]">
                        <img
                          src={leadHeroProduct.IMAGES[0]}
                          alt={leadHeroProduct.TITLE}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="flex items-baseline justify-between gap-3 px-2 pt-2.5 pb-1">
                        <span className="font-['Fraunces',serif] truncate text-[15px] font-medium text-[#1E1E1C] group-hover:text-[#2C4C3B]">
                          {splitProductTitle(leadHeroProduct.TITLE).primary}
                        </span>
                        <span className="tabular-nums shrink-0 text-sm font-bold text-[#2C4C3B]">
                          {formatPrice(
                            leadHeroProduct.PRICE,
                            leadHeroProduct.CURRENCY_CODE,
                          )}
                        </span>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-3.5 sm:col-span-5 sm:grid-cols-1">
                      {secondaryHeroProducts.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToProduct(item)}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-2 text-left shadow-[0_10px_26px_-18px_rgba(30,30,28,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
                        >
                          <div className="aspect-[4/3] w-full flex-1 overflow-hidden rounded-xl bg-[#F4EFE7] sm:aspect-[16/10]">
                            <img
                              src={item.IMAGES[0]}
                              alt={item.TITLE}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="flex items-baseline justify-between gap-2 px-1.5 pt-2 pb-0.5">
                            <span className="font-['Fraunces',serif] truncate text-xs font-medium text-[#1E1E1C] group-hover:text-[#2C4C3B]">
                              {splitProductTitle(item.TITLE).primary}
                            </span>
                            <span className="tabular-nums shrink-0 text-xs font-bold text-[#2C4C3B]">
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

            {/* Main Catalog Section */}
            <section
              ref={catalogRef}
              id="catalog"
              className="mx-auto max-w-[1360px] scroll-mt-20 px-5 pt-10 sm:px-8 lg:pt-12"
            >
              {/* Search & Sort Toolbar */}
              <div className="flex flex-col gap-4 border-b border-[#E8E2D9] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-['Fraunces',serif] text-2xl font-medium tracking-tight text-[#1E1E1C] sm:text-3xl">
                    {activeHeading}
                  </h2>
                  <p className="tabular-nums mt-1 text-xs text-[#6B635A]">
                    Showing {filteredProducts.length} of {PRODUCTS.length} digital editions
                    {selectedTags.length > 0 && (
                      <>
                        {' '}
                        · Filtered by{' '}
                        {selectedTags.map((t) => formatTagLabel(t)).join(', ')}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {/* Live Search Bar */}
                  <div className="relative flex-1 sm:w-[290px] sm:flex-none">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#766D64]"
                      strokeWidth={1.8}
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search SVGs, cards, planners…"
                      aria-label="Search products"
                      className="min-h-[42px] w-full rounded-full border border-[#E8E2D9] bg-[#FFFFFF] py-2 pr-9 pl-10 text-sm text-[#1E1E1C] placeholder:text-[#968C81] transition-colors focus:border-[#2C4C3B] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#766D64] hover:text-[#1E1E1C]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Mobile Filters Drawer Button */}
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-full border border-[#E8E2D9] bg-[#FFFFFF] px-4 py-2 text-sm font-medium text-[#1E1E1C] hover:border-[#2C4C3B] lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                      <span>Filters</span>
                      {selectedTags.length > 0 && (
                        <span className="tabular-nums text-xs text-[#C85A32]">
                          ({selectedTags.length})
                        </span>
                      )}
                    </button>

                    {/* Sort Select */}
                    <label className="sr-only" htmlFor="catalog-sort">
                      Sort products
                    </label>
                    <select
                      id="catalog-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="min-h-[42px] rounded-full border border-[#E8E2D9] bg-[#FFFFFF] px-4 py-2 text-sm text-[#1E1E1C] focus:border-[#2C4C3B] focus:outline-none"
                    >
                      <option value="featured">Sort: Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="title-asc">Title: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Category Pills */}
              <div
                role="group"
                aria-label="Quick category filters"
                className="mt-5 flex flex-wrap items-center gap-2.5"
              >
                {QUICK_CATEGORY_PILLS.map((pill) => {
                  const isActive =
                    activeQuickPill === pill.id && activeCategory === 'all';
                  const count = PRODUCTS.filter(pill.matches).length;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => handleSelectQuickPill(pill.id)}
                      className={`inline-flex min-h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C4C3B] ${
                        isActive
                          ? 'bg-[#2C4C3B] text-[#FAF8F5] shadow-[0_2px_8px_rgba(44,76,59,0.22)]'
                          : 'border border-[#E8E2D9] bg-[#FFFFFF] text-[#4E4A44] hover:border-[#C85A32]/60 hover:text-[#1E1E1C]'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span
                        className={`tabular-nums text-[11px] font-medium ${
                          isActive ? 'text-[#FAF8F5]/80' : 'text-[#8C8277]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sidebar + Responsive Product Grid */}
              <div className="mt-8 flex items-start gap-10">
                <FilterSidebar
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectSidebarCategory}
                  tags={tagIndex}
                  selectedTags={selectedTags}
                  onToggleTag={handleToggleTag}
                  onClearAll={handleClearFilters}
                  hasActiveFilters={hasActiveFilters}
                  mobileOpen={mobileFiltersOpen}
                  onCloseMobile={() => setMobileFiltersOpen(false)}
                />

                <div className="min-w-0 flex-1">
                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 py-16 text-center">
                      <p className="font-['Fraunces',serif] text-xl font-medium text-[#1E1E1C]">
                        No editions match your current filters
                      </p>
                      <p className="mt-2 max-w-[38ch] text-sm text-[#6B635A]">
                        Try clearing a selected tag or searching for broader terms like
                        “Christmas”, “SVG”, “Planner”, or “Sublimation”.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-6 min-h-[42px] rounded-full bg-[#2C4C3B] px-5 py-2 text-sm font-medium text-[#FAF8F5] hover:bg-[#223B2E]"
                      >
                        Reset all filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={navigateToProduct}
                          onAddToCart={(p) => handleAddToCart(p, 1)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3-Step "How It Works" Visual Strip */}
            <section
              id="how-it-works"
              className="mt-20 border-y border-[#E8E2D9] bg-[#F3EEE6]/70"
            >
              <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:py-20">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.06em] text-[#C85A32]">
                      Simple Digital Craft Delivery
                    </p>
                    <h2 className="font-['Fraunces',serif] mt-2 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.15] font-medium tracking-tight text-[#1E1E1C]">
                      From Studio to Craft Table in 3 Steps
                    </h2>
                  </div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2C4C3B]">
                    <CheckCircle2 className="h-4 w-4 text-[#C85A32]" strokeWidth={2} />
                    <span>Zero shipping wait · Re-download anytime</span>
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                  {HOW_IT_WORKS_STEPS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.step}
                        className="relative flex flex-col rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 sm:p-7"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-['Fraunces',serif] tabular-nums text-2xl font-semibold text-[#C85A32]">
                            0{item.step}
                          </span>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E2D9] bg-[#FAF8F5] text-[#2C4C3B]">
                            <Icon className="h-4 w-4" strokeWidth={1.85} />
                          </div>
                        </div>

                        <h3 className="font-['Fraunces',serif] mt-5 text-lg font-medium text-[#1E1E1C]">
                          {item.step}. {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-[1.68] text-[#5B554D]">
                          {item.description}
                        </p>

                        {idx < HOW_IT_WORKS_STEPS.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none hidden md:flex absolute top-1/2 -right-5 z-10 h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E2D9] bg-[#FAF8F5] text-[#C85A32]"
                          >
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3-Card Customer Review Showcase */}
            <section
              aria-labelledby="reviews-heading"
              className="mx-auto max-w-[1360px] px-5 pt-16 sm:px-8 lg:pt-20"
            >
              <div className="flex flex-col justify-between gap-3 border-b border-[#E8E2D9] pb-6 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-semibold tracking-[0.06em] text-[#C85A32]">
                    Maker Reviews
                  </p>
                  <h2
                    id="reviews-heading"
                    className="font-['Fraunces',serif] mt-2 text-[clamp(1.75rem,3vw,2.4rem)] leading-[1.15] font-medium tracking-tight text-[#1E1E1C]"
                  >
                    Trusted by Crafters &amp; Small Shops
                  </h2>
                </div>
                <p className="text-sm text-[#6B635A]">
                  Verified feedback across Cricut, Glowforge &amp; GoodNotes editions
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                {CUSTOMER_REVIEWS.map((review) => (
                  <figure
                    key={review.author}
                    className="flex flex-col justify-between rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 sm:p-7"
                  >
                    <div>
                      <div
                        className="flex items-center gap-0.5 text-[#C85A32]"
                        aria-label="5 out of 5 stars"
                      >
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="h-3.5 w-3.5 fill-current"
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <blockquote className="mt-4 text-[14.5px] leading-[1.72] text-[#3B3732]">
                        “{review.quote}”
                      </blockquote>
                    </div>

                    <figcaption className="mt-6 border-t border-[#F1ECE4] pt-4">
                      <p className="font-['Fraunces',serif] text-[15px] font-medium text-[#1E1E1C]">
                        {review.author}
                      </p>
                      <p className="mt-0.5 text-xs text-[#766D64]">
                        {review.location}
                      </p>
                      <p className="mt-2 text-[11px] font-semibold text-[#2C4C3B]">
                        {review.edition}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer
        categories={categories}
        onSelectCategory={handleSelectNavCategory}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onInspectProduct={(productId) => {
          const found = PRODUCTS.find((p) => p.id === productId);
          if (found) navigateToProduct(found);
        }}
      />
    </div>
  );
}
