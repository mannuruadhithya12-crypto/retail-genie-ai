import { FashionScraper } from './scraper';

// Example cron-like function to run daily
export async function runDailyCollection() {
  console.log('--- Starting Daily Fashion Data Collection ---');
  
  const sources = [
    { name: 'Zara', url: 'https://www.zara.com/us/en/man-new-in-l711.html', selector: '.product-grid-product' },
    { name: 'HM', url: 'https://www2.hm.com/en_us/men/new-arrivals/view-all.html', selector: '.product-item' },
    { name: 'ASOS', url: 'https://www.asos.com/men/new-in/cat/?cid=27110', selector: 'article' }
  ];

  for (const source of sources) {
    console.log(`Scraping ${source.name}...`);
    const count = await FashionScraper.scrapeAndStore(source.url, source.selector, source.name);
    console.log(`Successfully collected ${count} items from ${source.name}`);
  }

  console.log('--- Daily Collection Complete ---');
}
