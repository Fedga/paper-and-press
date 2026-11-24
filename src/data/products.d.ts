export interface Product {
  id: string;
  TITLE: string;
  DESCRIPTION: string;
  PRICE: number;
  CURRENCY_CODE: string;
  QUANTITY: number;
  TAGS: string[];
  MATERIALS: string[];
  IMAGES: string[];
  /**
   * Optional video URL shown in the product detail gallery.
   * Supports YouTube, Vimeo, or direct/local .mp4 / .webm links.
   * Leave as "" when no video is attached.
   */
  VIDEO_URL: string;
  SKU: string;
}

export declare const PRODUCTS: Product[];
