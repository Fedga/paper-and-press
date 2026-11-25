import { Download, Scissors, ShoppingBag } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Choose your editions & check out',
    description:
      'Add any SVG cut bundle, laser template, sublimation pack, or printable planner to your bag and complete secure checkout in seconds.',
    icon: ShoppingBag,
  },
  {
    number: '02',
    title: 'Download & unzip immediately',
    description:
      'Receive organized ZIP folders and PDF quick-start guides right away—no waiting on postage, customs, or physical shipping.',
    icon: Download,
  },
  {
    number: '03',
    title: 'Upload, print & start crafting',
    description:
      'Import color-coded cut & score layers into Cricut Design Space, Silhouette Studio, Glowforge, GoodNotes, Canva, or your home printer.',
    icon: Scissors,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="mt-20 border-y border-[#E8E0D5] bg-[#F3EEE6]/70"
    >
      <div className="mx-auto max-w-[1360px] px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.06em] text-[#2C4A3E]">
            From Studio to Craft Table
          </p>
          <h2
            className="font-display mt-2.5 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] font-medium tracking-[-0.01em] text-[#1F1B18]"
            style={{ textWrap: 'balance' }}
          >
            How Digital Downloads Work
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#5C534A]">
            Every listing in our studio is delivered as clean, print-ready
            digital files—tested for smooth cutting, crisp margins, and easy
            setup on desktop or tablet.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex flex-col rounded-2xl border border-[#E6DDD1] bg-[#FAF8F5] p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display tabular-nums text-2xl font-medium text-[#9C5A3C]">
                    {step.number}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6DDD1] bg-white text-[#2C4A3E]">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                </div>
                <h3 className="font-display mt-5 text-xl leading-snug font-medium text-[#1F1B18]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-[1.68] text-[#5C534A]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-[#6B6259]">
          Compatible with Cricut Maker &amp; Explore · Silhouette Cameo &amp;
          Portrait · Glowforge &amp; xTool · GoodNotes 6 &amp; Notion · Canva
          Free · US Letter, A4 &amp; A3 home printers.
        </p>
      </div>
    </section>
  );
}
