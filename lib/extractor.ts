import { chromium } from 'playwright';

export interface ExtractedProduct {
  name: string;
  imageUrl: string;
  price: string;
  url: string;
}

export class ProductExtractor {
  static async deepExtract(url: string): Promise<Partial<ExtractedProduct>> {
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      });
      const page = await context.newPage();
      
      // Navigate with timeout to keep it fast
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Try to extract high-quality product image (OG tag or first large img)
      const data = await page.evaluate(() => {
        const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
        
        // Find the most likely product image
        const productImg = document.querySelector('main img[src*="product"], main img[src*="image"], [class*="product"] img, #product-image, .ProductImage-image');
        const firstLargeImg = Array.from(document.querySelectorAll('img')).find(img => img.width > 200 && img.height > 200);

        const imgUrl = ogImage || twitterImage || productImg?.getAttribute('src') || productImg?.getAttribute('data-src') || firstLargeImg?.src;
        
        const priceElement = document.querySelector('[class*="price"], [id*="price"], .ProductPrice-price');
        
        return {
          imageUrl: imgUrl || null,
          price: priceElement?.textContent?.trim() || null,
          name: document.title.split(/\||-/)[0].trim()
        };
      });

      // Resolve relative URLs
      if (data.imageUrl && !data.imageUrl.startsWith('http')) {
        const baseUrl = new URL(url).origin;
        data.imageUrl = new URL(data.imageUrl, baseUrl).href;
      }

      return data;
    } catch (error) {
      console.error(`Extraction failed for ${url}:`, error);
      return {};
    } finally {
      if (browser) await browser.close();
    }
  }
}
