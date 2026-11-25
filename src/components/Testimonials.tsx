import { Star } from 'lucide-react';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  edition: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    quote:
      'Usually pop-up SVGs take an hour of troubleshooting score lines, but the magenta score layer uploaded straight into Cricut Design Space on the first try. I made twelve Golden Retriever front-door cards in a single evening and every fold sat completely flat in A7 envelopes.',
    author: 'Hannah Whitaker',
    role: 'Papercraft Maker · Bath, UK',
    edition: '3D Pop Up Christmas Card SVG',
  },
  {
    quote:
      'I had abandoned three bloated planners before trying the 2027 ADHD Reset bundle. Having both a calm GoodNotes PDF with right-edge tabs and a Today-Only Notion inbox with Safe-to-Spend math made payday budgeting feel peaceful for the first time.',
    author: 'Claire Donnelly',
    role: 'Freelance Illustrator · Bristol',
    edition: '2027 ADHD Digital Planner & Notion Bundle',
  },
  {
    quote:
      'The hex colour swatches and one-page stacking blueprint on every gingerbread house saved me so much trial and error on 3mm birch plywood. All ten houses cut cleanly on my xTool and sold out at our local winter craft market.',
    author: 'Martin Gallagher',
    role: 'Owner, Hearth & Pine Laser Co.',
    edition: '3D Christmas Village Laser Cut Bundle',
  },
];

export function Testimonials() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="mx-auto max-w-[1360px] px-5 pt-16 sm:px-8 lg:pt-20"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-[#E8E0D5] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium tracking-[0.06em] text-[#2C4A3E]">
            Maker Notes
          </p>
          <h2
            id="testimonials-heading"
            className="font-display mt-2 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] font-medium tracking-[-0.01em] text-[#1F1B18]"
          >
            Loved at the Craft Table
          </h2>
        </div>
        <p className="text-sm text-[#6B6259]">
          Verified reviews from Cricut, laser &amp; stationery makers
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {TESTIMONIALS.map((item) => (
          <figure
            key={item.author}
            className="flex flex-col justify-between rounded-2xl border border-[#E8E0D5] bg-white p-6 sm:p-7"
          >
            <div>
              <div
                className="flex items-center gap-0.5 text-[#9C5A3C]"
                aria-label="Rated 5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-current"
                    strokeWidth={1.5}
                  />
                ))}
              </div>

              <blockquote className="mt-4 text-[14.5px] leading-[1.72] text-[#3D352E]">
                “{item.quote}”
              </blockquote>
            </div>

            <figcaption className="mt-6 border-t border-[#F0E9DF] pt-4">
              <p className="font-display text-[15px] font-medium text-[#1F1B18]">
                {item.author}
              </p>
              <p className="mt-0.5 text-xs text-[#6B6259]">{item.role}</p>
              <p className="mt-2 text-[11px] font-medium text-[#2C4A3E]">
                Edition: {item.edition}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
