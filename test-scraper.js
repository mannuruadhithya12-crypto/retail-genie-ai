const { chromium } = require('playwright');

async function scrapeAsos(query) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    const searchUrl = `https://www.asos.com/search/?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // Wait for product grid
    await page.waitForSelector('article', { timeout: 10000 });
    
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article')).slice(0, 5);
      return items.map(el => {
        const linkEl = el.querySelector('a');
        const imgEl = el.querySelector('img');
        const priceEl = el.querySelector('[data-auto-id="productTilePrice"]');
        const brandEl = el.querySelector('.productDescription'); // Usually contains brand + name
        
        return {
          name: imgEl?.getAttribute('alt') || brandEl?.textContent || 'ASOS Product',
          productUrl: linkEl?.href,
          imageUrl: imgEl?.src,
          priceText: priceEl?.textContent?.trim(),
          brand: 'ASOS'
        };
      });
    });
    
    console.log("Scraped Products:", products);
  } catch (err) {
    console.error("Scraping failed:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeAsos('minimalist shirts');
