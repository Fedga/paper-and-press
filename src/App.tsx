import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
    <div className="flex min-h-screen flex-col bg-[#F8F9FA] text-[#141619]">
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
              {/* Search & Sort Toolbar */}
              <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-medium tracking-tight text-[#141619] sm:text-3xl">
                    {activeCategoryObj?.label || 'All Editions'}
                  </h2>
                  <p className="tabular-nums mt-1 text-xs text-[#5C6370]">
                    Showing {filteredProducts.length} of {PRODUCTS.length} digital editions
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
                  {/* Live Search Bar */}
                  <div className="relative flex-1 sm:w-[290px] sm:flex-none">
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6C757D]"
                      strokeWidth={1.8}
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search titles, tags, formats…"
                      aria-label="Search products"
                      className="min-h-[42px] w-full rounded-lg border border-[#D8DCE2] bg-white py-2 pr-9 pl-10 text-sm text-[#141619] placeholder:text-[#868E96] transition-colors focus:border-[#1E4D3B] focus:outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                        className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-[#6C757D] hover:text-[#141619]"
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
                      className="inline-flex min-h-[42px] items-center gap-2 whitespace-nowrap rounded-lg border border-[#D8DCE2] bg-white px-3.5 py-2 text-sm font-medium text-[#141619] hover:border-[#1E4D3B] lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                      <span>Filters</span>
                      {selectedTags.length > 0 && (
                        <span className="tabular-nums text-xs text-[#1E4D3B]">
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
                      className="min-h-[42px] rounded-lg border border-[#D8DCE2] bg-white px-3.5 py-2 text-sm text-[#141619] focus:border-[#1E4D3B] focus:outline-none"
                    >
                      <option value="featured">Sort: Featured</option>
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
                    <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
                      <p className="font-display text-xl font-medium text-[#141619]">
                        No editions match your current filters
                      </p>
                      <p className="mt-2 max-w-[38ch] text-sm text-[#5C6370]">
                        Try clearing a selected tag or searching for broader terms like
                        “Christmas”, “SVG”, “Planner”, or “Sublimation”.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-6 min-h-[42px] rounded-lg bg-[#1E4D3B] px-5 py-2 text-sm font-medium text-white hover:bg-[#163B2D]"
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
