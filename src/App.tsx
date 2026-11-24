import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { PRODUCTS, type Product } from './data/products';
import type { CartItem } from './checkout';
import {
  buildAutoCategories,
  extractTagIndex,
  formatTagLabel,
} from './utils/catalog';
import { CartDrawer } from './components/CartDrawer';
import { FilterSidebar } from './components/FilterSidebar';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'title-asc';

const CART_STORAGE_KEY = 'paper_press_bag_v1';

const STUDIO_REVIEWS = [
  {
    name: 'Sarah M.',
    badge: 'Verified Cricut Crafter',
    quote:
      'The 3D pop-up card cut cleanly on the very first try! The magenta score lines and illustrated assembly guide made it effortless.',
  },
  {
    name: 'Hannah W.',
    badge: 'Verified Buyer',
    quote:
      'Instant download worked straight away and the 300 DPI PNGs printed with gorgeous, crisp colours for my holiday sweatshirts.',
  },
  {
    name: 'Claire T.',
    badge: 'Verified GoodNotes User',
    quote:
      'Finally a 2027 planner that feels calm and uncluttered. The hyperlinks are super fast on my iPad and the paycheck tracker is a lifesaver.',
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadInitialCart());
  const [cartOpen, setCartOpen] = useState(false);

  const catalogRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const onHashChange = () => {
      setSelectedProductId(readProductIdFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const categories = useMemo(() => buildAutoCategories(PRODUCTS), []);
  const tagIndex = useMemo(() => extractTagIndex(PRODUCTS), []);

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

  const filteredProducts = useMemo(() => {
    const categoryObj = categories.find((c) => c.id === activeCategory);
    const query = searchQuery.trim().toLowerCase();

    const list = PRODUCTS.filter((product) => {
      if (categoryObj && !categoryObj.matches(product)) {
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
  }, [categories, activeCategory, selectedTags, searchQuery, sortBy]);

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

  const handleSelectTagFromDetail = useCallback((normalizedTag: string) => {
    setActiveCategory('all');
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
    selectedTags.length > 0 ||
    searchQuery.trim().length > 0;

  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#1C1B18] selection:bg-[#1E4D3B] selection:text-white">
      {/* Top Studio Trust Strip */}
      <div className="border-b border-[#E6DFD3] bg-[#1E4D3B] px-4 py-2 text-center text-xs font-medium tracking-wide text-[#F7F4EE]">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-[#D4B483]" />
            Instant Digital Downloads
          </span>
          <span className="hidden opacity-40 sm:inline">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#D4B483]" />
            Cricut, Silhouette &amp; GoodNotes Ready
          </span>
          <span className="hidden opacity-40 md:inline">•</span>
          <span className="hidden items-center gap-1.5 md:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D4B483]" />
            Small Business Commercial Use Included
          </span>
        </span>
      </div>

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
            <Hero
              featuredProducts={featuredProducts}
              totalCount={PRODUCTS.length}
              onSelectProduct={navigateToProduct}
              onBrowseCatalog={() =>
                catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            />

            {/* Main Catalog Section */}
            <section
              ref={catalogRef}
              id="catalog"
              className="mx-auto max-w-[1360px] scroll-mt-20 px-5 pt-10 sm:px-8 lg:pt-12"
            >
              {/* Quick Category Pills */}
              <div className="mb-7 flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setSelectedTags([]);
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-[#1E4D3B] text-white shadow-sm'
                          : 'border border-[#E2DAD0] bg-white text-[#3D3A34] hover:border-[#1E4D3B] hover:text-[#1E4D3B]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Search & Sort Toolbar */}
              <div className="flex flex-col gap-4 border-b border-[#E5DEC9] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1B18] sm:text-3xl">
                    {activeCategoryObj?.label || 'All Printable Editions'}
                  </h2>
                  <p className="tabular-nums mt-1 text-xs text-[#666157]">
                    Showing {filteredProducts.length} of {PRODUCTS.length} studio editions
                    {selectedTags.length > 0 && (
                      <>
                        {' '}
                        · Filtered by{' '}
                        {selectedTags
                          .map((t) => formatTagLabel(t))
                          .join(', ')}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1 sm:w-[290px] sm:flex-none">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#7A7469]"
                      strokeWidth={1.8}
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search SVGs, planners, cards…"
                      aria-label="Search products"
                      className="min-h-[42px] w-full rounded-xl border border-[#DDD5C7] bg-white py-2 pr-9 pl-10 text-sm text-[#1C1B18] shadow-2xs placeholder:text-[#968F82] transition-colors focus:border-[#1E4D3B] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[#7A7469] hover:text-[#1C1B18]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-xl border border-[#DDD5C7] bg-white px-3.5 py-2 text-sm font-medium text-[#1C1B18] hover:border-[#1E4D3B] lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                      <span>Filters</span>
                      {selectedTags.length > 0 && (
                        <span className="tabular-nums text-xs text-[#1E4D3B]">
                          ({selectedTags.length})
                        </span>
                      )}
                    </button>

                    <label className="sr-only" htmlFor="catalog-sort">
                      Sort products
                    </label>
                    <select
                      id="catalog-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="min-h-[42px] rounded-xl border border-[#DDD5C7] bg-white px-3.5 py-2 text-sm text-[#1C1B18] shadow-2xs focus:border-[#1E4D3B] focus:outline-none"
                    >
                      <option value="featured">Sort: Studio Picks</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="title-asc">Title: A to Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sidebar + Responsive Product Grid */}
              <div className="mt-8 flex items-start gap-10">
                <FilterSidebar
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
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
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5DEC9] bg-white px-6 py-16 text-center shadow-2xs">
                      <p className="font-display text-xl font-medium text-[#1C1B18]">
                        No editions match your current filters
                      </p>
                      <p className="mt-2 max-w-[38ch] text-sm text-[#666157]">
                        Try clearing a selected tag or searching for broader terms like
                        “Christmas”, “SVG”, “Planner”, or “Sublimation”.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-6 min-h-[42px] rounded-xl bg-[#1E4D3B] px-5 py-2 text-sm font-medium text-white hover:bg-[#163B2D]"
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

            {/* How Digital Downloads Work + Crafter Reviews */}
            <section className="mx-auto mt-20 max-w-[1360px] px-5 pb-16 sm:px-8">
              <div className="rounded-3xl border border-[#E5DEC9] bg-white p-8 shadow-2xs sm:p-12">
                <div className="mx-auto max-w-2xl text-center">
                  <span className="inline-block rounded-full bg-[#F2ECE1] px-3.5 py-1 text-xs font-semibold tracking-wider text-[#1E4D3B] uppercase">
                    How It Works
                  </span>
                  <h2 className="font-display mt-3 text-2xl font-semibold text-[#1C1B18] sm:text-3xl">
                    From Download to Craft Table in Minutes
                  </h2>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                  <div className="rounded-2xl bg-[#FAF7F2] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4D3B] text-sm font-bold text-white">
                      1
                    </div>
                    <h3 className="mt-4 font-semibold text-[#1C1B18]">
                      Choose Your Edition
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#666157]">
                      Browse precision-tested 3D pop-up cards, 300 DPI sublimation clipart, and hyperlinked GoodNotes planners.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF7F2] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4D3B] text-sm font-bold text-white">
                      2
                    </div>
                    <h3 className="mt-4 font-semibold text-[#1C1B18]">
                      Instant Secure Checkout
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#666157]">
                      Check out in seconds with Card, Apple Pay, or Google Pay—no waiting for shipping or physical post.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#FAF7F2] p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4D3B] text-sm font-bold text-white">
                      3
                    </div>
                    <h3 className="mt-4 font-semibold text-[#1C1B18]">
                      Print, Cut &amp; Create
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#666157]">
                      Unzip your organised folders with step-by-step PDF guides ready for Cricut, Silhouette, or home printing.
                    </p>
                  </div>
                </div>

                {/* Crafter Reviews */}
                <div className="mt-12 border-t border-[#ECE5D8] pt-10">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {STUDIO_REVIEWS.map((review) => (
                      <div
                        key={review.name}
                        className="flex flex-col justify-between rounded-2xl border border-[#ECE5D8] bg-[#FAF7F2]/60 p-6"
                      >
                        <div>
                          <div className="flex items-center gap-1 text-[#C87D32]">
                            {[...Array(5)].map((_, idx) => (
                              <Star key={idx} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-[#3D3A34]">
                            “{review.quote}”
                          </p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-[#1C1B18]">{review.name}</span>
                          <span className="inline-flex items-center gap-1 text-[#1E4D3B]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {review.badge}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
