/**
 * Re-exports the parsed Etsy catalog from ./products.json.
 * Edit src/data/products.json directly to update titles, descriptions, prices,
 * image URLs, or VIDEO_URL links without touching UI code.
 */
import products from './products.json';

export const PRODUCTS = products;
