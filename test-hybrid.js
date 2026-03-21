const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');

async function extractProductData(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const data = await page.evaluate(() => {
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
      const imgUrl = ogImage || twitterImage;
      const priceElement = document.querySelector('[class*="price"], [id*="price"]');
      return {
        imageUrl: imgUrl,
        priceText: priceElement?.textContent?.trim(),
        name: document.title.split(/\\||-/)[0].trim(),
        productUrl: url
      };
    });
    return data;
  } catch(e) { 
    return null; 
  } finally {
    await browser.close();
  }
}

async function liveSearch(query) {
  console.log("Searching DuckDuckGo for: " + query);
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' site:asos.com OR site:zara.com')}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    
    const $ = cheerio.load(res.data);
    const links = [];
    $('.result__url').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.includes('search') && !href.includes('category')) {
        // Find clean URLs
        const cleanUrl = 'https://' + $(el).text().trim();
        if (cleanUrl.includes('asos.com') || cleanUrl.includes('zara.com')) {
           links.push(cleanUrl);
        }
      }
    });

    const topLinks = [...new Set(links)].slice(0, 3);
    console.log("Found Product URLs:", topLinks);
    
    const products = [];
    for (const link of topLinks) {
       console.log("Extracting:", link);
       const data = await extractProductData(link);
       if (data && data.imageUrl) products.push(data);
    }
    console.log("Final Scraped Products:", products);
    
  } catch(e) {
    console.error("Failed:", e.message);
  }
}

liveSearch('minimalist black t-shirt');
