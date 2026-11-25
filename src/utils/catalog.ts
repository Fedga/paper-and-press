import type { Product } from '../data/products';

const ACRONYMS = new Set([
  '3d',
  'svg',
  'png',
  'dxf',
  'eps',
  'pdf',
  'dtf',
  'adhd',
  'cv',
  'a4',
  'a3',
  'a7',
  'us',
  'diy',
  'xmas',
  'jpg',
  'cnc',
  '5x7',
  '11oz',
  '15oz',
  '20oz',
]);

export function formatPrice(amount: number, currencyCode = 'GBP'): string {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode || 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function formatTagLabel(rawTag: string): string {
  return rawTag
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (ACRONYMS.has(lower)) {
        if (lower === '11oz' || lower === '15oz' || lower === '20oz' || lower === '5x7') {
          return lower;
        }
        return lower.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/**
 * Extracts a concise primary heading and optional subtitle from long Etsy SEO titles.
 */
export function splitProductTitle(fullTitle: string): { primary: string; secondary: string } {
  const cleaned = fullTitle.replace(/\s+/g, ' ').trim();
  const commaIndex = cleaned.indexOf(',');
  const pipeIndex = cleaned.indexOf('|');

  let splitAt = -1;
  if (commaIndex > 12 && (pipeIndex === -1 || commaIndex < pipeIndex)) {
    splitAt = commaIndex;
  } else if (pipeIndex > 12) {
    splitAt = pipeIndex;
  }

  if (splitAt > 0 && splitAt < cleaned.length - 6) {
    return {
      primary: cleaned.slice(0, splitAt).trim(),
      secondary: cleaned.slice(splitAt + 1).trim(),
    };
  }

  return { primary: cleaned, secondary: '' };
}

export interface TagCount {
  raw: string;
  normalized: string;
  label: string;
  count: number;
}

export interface AutoCategory {
  id: string;
  label: string;
  navLabel: string;
  count: number;
  matches: (product: Product) => boolean;
}

const CATEGORY_DEFINITIONS: Array<{
  id: string;
  label: string;
  navLabel: string;
  keywords: string[];
}> = [
  {
    id: 'holiday-craft',
    label: 'Holiday & Seasonal',
    navLabel: 'Holiday & Craft',
    keywords: ['christmas', 'holiday', 'xmas', 'winter', 'festive', 'santa', 'gingerbread'],
  },
  {
    id: 'svg-cut-files',
    label: 'SVG & Laser Cut Files',
    navLabel: 'SVG & Cut Files',
    keywords: ['svg', 'cricut', 'silhouette', 'dxf', 'laser', 'glowforge', 'kirigami', 'xtool'],
  },
  {
    id: 'sublimation-dtf',
    label: 'Sublimation & Apparel',
    navLabel: 'Sublimation & DTF',
    keywords: ['sublimation', 'dtf', 'mug', 'shirt', 'sweatshirt', 'hoodie', 'tumbler', 'streetwear'],
  },
  {
    id: 'planners-printables',
    label: 'Planners & Printables',
    navLabel: 'Planners & Print',
    keywords: ['planner', 'calendar', 'resume', 'cv', 'coloring', 'printable', 'notion', 'goodnotes'],
  },
  {
    id: 'pets-animals',
    label: 'Pets & Wildlife',
    navLabel: 'Pets & Wildlife',
    keywords: ['dog', 'cat', 'pet', 'cow', 'duck', 'retriever', 'dachshund', 'frenchie', 'labrador'],
  },
  {
    id: 'patchwork-craft',
    label: 'Patchwork & Paper Art',
    navLabel: 'Patchwork & Paper',
    keywords: ['patchwork', 'kinusaiga', 'quilt', 'fabric', 'popup', 'pop_up', 'card_making', 'talavera'],
  },
];

function productMatchesKeywords(product: Product, keywords: string[]): boolean {
  const tagText = product.TAGS.join(' ').toLowerCase();
  return keywords.some((kw) => tagText.includes(kw));
}

export function buildAutoCategories(products: Product[]): AutoCategory[] {
  const categories: AutoCategory[] = [
    {
      id: 'all',
      label: 'All Editions',
      navLabel: 'All Editions',
      count: products.length,
      matches: () => true,
    },
  ];

  for (const def of CATEGORY_DEFINITIONS) {
    const matcher = (p: Product) => productMatchesKeywords(p, def.keywords);
    const count = products.filter(matcher).length;
    if (count > 0) {
      categories.push({
        id: def.id,
        label: def.label,
        navLabel: def.navLabel,
        count,
        matches: matcher,
      });
    }
  }

  return categories;
}

export function getPrimaryCategoryLabel(product: Product): string {
  const tagText = product.TAGS.join(' ').toLowerCase();
  if (tagText.includes('planner') || tagText.includes('calendar') || tagText.includes('resume') || tagText.includes('coloring')) {
    return 'Printable & Digital';
  }
  if (tagText.includes('kinusaiga') || tagText.includes('fabric_tucking')) {
    return 'Fabric Craft Pattern';
  }
  if (tagText.includes('laser') || tagText.includes('glowforge')) {
    return 'Laser Cut Files';
  }
  if (tagText.includes('popup') || tagText.includes('pop_up') || tagText.includes('kirigami')) {
    return '3D Paper Craft';
  }
  if (tagText.includes('mug_wrap') || tagText.includes('mug_sublimation')) {
    return 'Mug Sublimation';
  }
  if (tagText.includes('sublimation') || tagText.includes('dtf')) {
    return 'Sublimation & DTF';
  }
  if (tagText.includes('svg')) {
    return 'SVG Cut Bundle';
  }
  return 'Digital Edition';
}

const FORMAT_CHECKS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'SVG', pattern: /\bsvg\b/i },
  { label: 'PNG', pattern: /\bpng\b/i },
  { label: 'PDF', pattern: /\bpdf\b/i },
  { label: 'DXF', pattern: /\bdxf\b/i },
  { label: 'EPS', pattern: /\beps\b/i },
  { label: 'Canva', pattern: /\bcanva\b/i },
  { label: 'Notion', pattern: /\bnotion\b/i },
];

/**
 * Automatically extracts file-format badges (SVG, PNG, PDF, DXF, etc.)
 * from each product's TITLE, TAGS, and DESCRIPTION.
 */
export function extractFileFormats(product: Product, max = 3): string[] {
  const haystack = `${product.TITLE} ${product.TAGS.join(' ')} ${product.DESCRIPTION}`;
  const found: string[] = [];

  for (const check of FORMAT_CHECKS) {
    if (check.pattern.test(haystack)) {
      found.push(check.label);
      if (found.length >= max) break;
    }
  }

  return found.length > 0 ? found : ['PDF'];
}

export function extractTagIndex(products: Product[]): TagCount[] {
  const map = new Map<string, TagCount>();

  for (const product of products) {
    const seenInProduct = new Set<string>();
    for (const rawTag of product.TAGS) {
      const normalized = rawTag.trim().toLowerCase();
      if (!normalized || seenInProduct.has(normalized)) continue;
      seenInProduct.add(normalized);

      const existing = map.get(normalized);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(normalized, {
          raw: rawTag.trim(),
          normalized,
          label: formatTagLabel(rawTag),
          count: 1,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.label.localeCompare(b.label);
  });
}

export type ParsedVideo =
  | { type: 'youtube'; embedUrl: string; sourceUrl: string }
  | { type: 'vimeo'; embedUrl: string; sourceUrl: string }
  | { type: 'file'; src: string; sourceUrl: string }
  | null;

/**
 * Parses a YouTube, Vimeo, or local/direct video (.mp4, .webm, .ogg, .mov) URL
 * from the product's VIDEO_URL field.
 */
export function parseVideoUrl(rawUrl?: string | null): ParsedVideo {
  const url = (rawUrl || '').trim();
  if (!url) return null;

  // YouTube formats: watch?v=, youtu.be/, embed/, shorts/
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0`,
      sourceUrl: url,
    };
  }

  // Vimeo formats: vimeo.com/123456789 or player.vimeo.com/video/123456789
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      sourceUrl: url,
    };
  }

  // Local or direct video file (.mp4, .webm, .ogg, .mov, or relative /videos/...)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.startsWith('/')) {
    return {
      type: 'file',
      src: url,
      sourceUrl: url,
    };
  }

  // Fallback for direct streaming URLs
  return {
    type: 'file',
    src: url,
    sourceUrl: url,
  };
}

export interface DescriptionBlock {
  type: 'heading' | 'list' | 'paragraph';
  text?: string;
  items?: string[];
}

/**
 * Formats raw Etsy listing descriptions into clean editorial headings, bullet lists,
 * and paragraphs by stripping decorative ASCII divider bars while preserving content.
 */
export function formatDescriptionBlocks(rawDescription: string): DescriptionBlock[] {
  const lines = rawDescription
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());

  const blocks: DescriptionBlock[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: currentList });
      currentList = [];
    }
  };

  for (const line of lines) {
    // Skip empty lines or decorative divider lines (e.g. ━━━━━ or -----)
    if (!line || /^[━─═\-_*•·\s]{4,}$/.test(line)) {
      flushList();
      continue;
    }

    // Detect bullet or numbered list items
    const bulletMatch = line.match(/^(?:[•✔✘\-*]|(?:\d{1,2}\.))\s+(.+)$/);
    if (bulletMatch) {
      currentList.push(bulletMatch[1].trim());
      continue;
    }

    flushList();

    // Detect short section headers (mostly uppercase or short heading ending with colon)
    const strippedHeading = line.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N})]+$/gu, '').trim();
    const lettersOnly = strippedHeading.replace(/[^A-Za-z]/g, '');
    const isAllCapsHeading =
      lettersOnly.length >= 4 &&
      lettersOnly === lettersOnly.toUpperCase() &&
      strippedHeading.length <= 72;
    const isShortColonHeading =
      line.endsWith(':') && line.length <= 64 && !line.includes('http');

    if (isAllCapsHeading || isShortColonHeading) {
      const cleanTitle = strippedHeading
        .replace(/:$/, '')
        .toLowerCase()
        .replace(/(^|\s|[-/(])([a-z])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())
        .replace(/\b(Pdf|Svg|Dxf|Png|Eps|Dtf|A4|A3|A7|Us|Adhd)\b/g, (m) => m.toUpperCase());
      blocks.push({ type: 'heading', text: cleanTitle });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  }

  flushList();
  return blocks;
}

export function getRelatedProducts(current: Product, allProducts: Product[], limit = 3): Product[] {
  const currentTags = new Set(current.TAGS.map((t) => t.toLowerCase()));
  const currentTokens = new Set(
    current.TAGS.flatMap((t) => t.toLowerCase().split('_')).filter((w) => w.length > 2),
  );

  return allProducts
    .filter((p) => p.id !== current.id)
    .map((p) => {
      let score = 0;
      for (const tag of p.TAGS) {
        const lower = tag.toLowerCase();
        if (currentTags.has(lower)) score += 4;
        for (const tok of lower.split('_')) {
          if (currentTokens.has(tok)) score += 1;
        }
      }
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}
