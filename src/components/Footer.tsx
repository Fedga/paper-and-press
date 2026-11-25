import type { AutoCategory } from '../utils/catalog';

interface FooterProps {
  categories: AutoCategory[];
  onSelectCategory: (categoryId: string) => void;
}

export function Footer({ categories, onSelectCategory }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-[#E8E2D9] bg-[#F3EEE6]/70">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 px-5 py-12 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-['Fraunces',serif] text-xl font-semibold tracking-[-0.015em] text-[#1E1E1C]">
            Paper &amp; Press Studio
          </p>
          <p className="mt-1 text-xs font-medium text-[#C85A32]">
            paperpressprintables.com
          </p>
          <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-[#5D564E]">
            An independent stationery, Cricut SVG, and digital craft studio creating heirloom 3D
            pop-up cards, laser-cut villages, sublimation art, and calm printable planners.
          </p>
        </div>

        <div className="md:col-span-4">
          <h2 className="font-['Fraunces',serif] text-base font-medium text-[#1E1E1C]">
            Collections
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-[#4E4A44]">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className="text-left transition-colors hover:text-[#2C4C3B]"
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h2 className="font-['Fraunces',serif] text-base font-medium text-[#1E1E1C]">
            Digital Delivery
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5D564E]">
            All listings are instant digital downloads in 300 DPI PNG, PDF, SVG, or DXF formats.
            Personal &amp; small-business commercial use included on craft bundles.
          </p>
        </div>
      </div>

      <div className="border-t border-[#E8E2D9]">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-2 px-5 py-5 text-xs text-[#766D64] sm:flex-row sm:items-center sm:px-8">
          <p>© {new Date().getFullYear()} Paper &amp; Press Studio · paperpressprintables.com</p>
          <p>Instant digital editions · Priced in GBP</p>
        </div>
      </div>
    </footer>
  );
}
