import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react';
import type { AutoCategory, TagCount } from '../utils/catalog';

interface FilterSidebarProps {
  categories: AutoCategory[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
  tags: TagCount[];
  selectedTags: string[];
  onToggleTag: (normalizedTag: string) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const DEFAULT_VISIBLE_TAGS = 18;

export function FilterSidebar({
  categories,
  activeCategory,
  onSelectCategory,
  tags,
  selectedTags,
  onToggleTag,
  onClearAll,
  hasActiveFilters,
  mobileOpen,
  onCloseMobile,
}: FilterSidebarProps) {
  const [tagSearch, setTagSearch] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);

  const filteredTags = useMemo(() => {
    const query = tagSearch.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter(
      (t) =>
        t.label.toLowerCase().includes(query) ||
        t.normalized.includes(query),
    );
  }, [tags, tagSearch]);

  const displayedTags = useMemo(() => {
    if (tagSearch.trim() || showAllTags) return filteredTags;
    return filteredTags.slice(0, DEFAULT_VISIBLE_TAGS);
  }, [filteredTags, tagSearch, showAllTags]);

  const content = (
    <div className="space-y-8">
      {/* Reset header when filters active */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <span className="text-xs font-medium text-[#5C6370]">Active filters</span>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1E4D3B] transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset all</span>
          </button>
        </div>
      )}

      {/* Auto-grouped Collections from TAGS */}
      <div>
        <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
          Collections
        </h2>
        <ul className="mt-3 space-y-0.5" role="list">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onCloseMobile();
                  }}
                  className={`flex min-h-[36px] w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#1E4D3B] ${
                    isActive
                      ? 'bg-[#1E4D3B]/10 font-semibold text-[#1E4D3B]'
                      : 'text-[#343A40] hover:bg-[#ECEFF2] hover:text-[#141619]'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  <span
                    className={`tabular-nums shrink-0 text-xs ${
                      isActive ? 'text-[#1E4D3B]' : 'text-[#6C757D]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Auto-generated Tags from CSV TAGS column */}
      <div className="border-t border-[#E5E7EB] pt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
            Tags
          </h2>
          <span className="tabular-nums text-[11px] text-[#6C757D]">
            {tags.length} total
          </span>
        </div>

        {/* Inline tag finder */}
        <div className="relative mt-3">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#6C757D]"
            strokeWidth={1.8}
          />
          <input
            type="text"
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            placeholder="Filter tags…"
            aria-label="Filter tag list"
            className="w-full rounded-md border border-[#D8DCE2] bg-white py-1.5 pr-7 pl-8 text-xs text-[#141619] placeholder:text-[#868E96] focus:border-[#1E4D3B] focus:outline-none"
          />
          {tagSearch && (
            <button
              type="button"
              onClick={() => setTagSearch('')}
              aria-label="Clear tag filter"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-[#6C757D] hover:text-[#141619]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Selected tags summary if any */}
        {selectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#ECEEF1] pb-3 text-xs">
            <span className="text-[#5C6370]">Selected:</span>
            {selectedTags.map((norm) => {
              const found = tags.find((t) => t.normalized === norm);
              return (
                <button
                  key={norm}
                  type="button"
                  onClick={() => onToggleTag(norm)}
                  className="inline-flex items-center gap-1 font-medium text-[#1E4D3B] underline decoration-[#1E4D3B]/40 underline-offset-2 hover:decoration-[#1E4D3B]"
                >
                  <span>{found?.label || norm}</span>
                  <X className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        )}

        {/* Tag list */}
        {displayedTags.length === 0 ? (
          <p className="mt-4 text-xs text-[#6C757D]">No tags match “{tagSearch}”.</p>
        ) : (
          <ul className="mt-3 max-h-[340px] space-y-0.5 overflow-y-auto pr-1" role="list">
            {displayedTags.map((tag) => {
              const isChecked = selectedTags.includes(tag.normalized);
              return (
                <li key={tag.normalized}>
                  <button
                    type="button"
                    onClick={() => onToggleTag(tag.normalized)}
                    aria-pressed={isChecked}
                    className={`flex min-h-[34px] w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[#1E4D3B] ${
                      isChecked
                        ? 'bg-[#1E4D3B]/10 font-medium text-[#1E4D3B]'
                        : 'text-[#343A40] hover:bg-[#ECEFF2] hover:text-[#141619]'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
                          isChecked
                            ? 'border-[#1E4D3B] bg-[#1E4D3B] text-white'
                            : 'border-[#C5CBD3] bg-white'
                        }`}
                        aria-hidden="true"
                      >
                        {isChecked && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                      </span>
                      <span className="truncate">{tag.label}</span>
                    </span>
                    <span className="tabular-nums shrink-0 text-[11px] text-[#6C757D]">
                      {tag.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Expand / Collapse */}
        {!tagSearch.trim() && filteredTags.length > DEFAULT_VISIBLE_TAGS && (
          <button
            type="button"
            onClick={() => setShowAllTags((prev) => !prev)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#1E4D3B] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D3B]"
          >
            {showAllTags ? (
              <>
                <span>Show fewer tags</span>
                <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <span>Show all {filteredTags.length} tags</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        aria-label="Product filters"
        className="hidden w-[250px] shrink-0 lg:block"
      >
        <div className="sticky top-24">{content}</div>
      </aside>

      {/* Mobile Slide-Over Filter Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
        >
          <div
            className="fixed inset-0 bg-[#141619]/40 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-[320px] flex-col bg-[#F8F9FA] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <span className="font-display text-lg font-medium text-[#141619]">
                Filter Editions
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filters"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#5C6370] hover:bg-[#ECEFF2] hover:text-[#141619]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{content}</div>
            <div className="border-t border-[#E5E7EB] bg-white p-4">
              <button
                type="button"
                onClick={onCloseMobile}
                className="min-h-[44px] w-full rounded-lg bg-[#1E4D3B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#163B2D]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
