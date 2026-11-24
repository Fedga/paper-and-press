import type { AutoCategory } from '../utils/catalog';

interface FooterProps {
  categories: AutoCategory[];
  onSelectCategory: (categoryId: string) => void;
}

export function Footer({ categories, onSelectCategory }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#E5E7EB] bg-white">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-5 py-12 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-display text-lg font-semibold tracking-tight text-[#141619]">
            Paper &amp; Press
          </p>
          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-[#5C6370]">
            Independent digital studio for 3D pop-up card templates, laser-ready SVG cut files,
            sublimation bundles, and calm printable planners.
          </p>
        </div>

        <div className="md:col-span-4">
          <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
            Collections
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#343A40]">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-left transition-colors hover:text-[#1E4D3B]"
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-sans text-xs font-semibold tracking-[0.06em] text-[#5C6370]">
            Digital Delivery
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C6370]">
            All listings are instant digital downloads in print-ready 300 DPI PNG, PDF, SVG, or DXF
            formats. No physical items are shipped.
          </p>
        </div>
      </div>

      <div className="border-t border-[#ECEEF1]">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-[#6C757D] sm:flex-row sm:items-center sm:px-8">
          <p>© {new Date().getFullYear()} Paper &amp; Press Studio. All rights reserved.</p>
          <p>Catalog priced in GBP</p>
        </div>
      </div>
    </footer>
  );
}
