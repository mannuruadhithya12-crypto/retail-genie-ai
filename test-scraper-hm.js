const { chromium } = require('playwright');

async function scrapeHM(query) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  
  try {
    const searchUrl = `https://www2.hm.com/en_us/search-results.html?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to H&M: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    // Check what elements are on the page
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article.hm-product-item')).slice(0, 5);
      return items.map(el => {
        const linkEl = el.querySelector('a.link');
        const imgEl = el.querySelector('img.item-image');
        const priceEl = el.querySelector('span.price');
        const nameEl = el.querySelector('h3.item-heading a');
        
        return {
          name: nameEl?.textContent?.trim() || imgEl?.getAttribute('alt') || 'H&M Product',
          productUrl: linkEl?.href,
          imageUrl: imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src'),
          priceText: priceEl?.textContent?.trim(),
          brand: 'H&M'
        };
      });
    });
    
    console.log("H&M Scraped Products:", products.length ? products : "No products found. Selector might be wrong.");
  } catch (err) {
    console.error("H&M Scraping failed:", err.message);
  } finally {
    await browser.close();
  }
}

scrapeHM('minimalist shirts');
