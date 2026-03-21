const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

async function scrapeEbay(query) {
  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query + ' fashion clothing')}`;
    console.log("Fetching:", url);
    const { data } = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const $ = cheerio.load(data);
    const products = [];

    $('.s-item__wrapper').each((i, el) => {
      if (i === 0) return; // Skip the first hidden 'shop by category' item
      
      let title = $(el).find('.s-item__title').text().trim();
      // Remove 'New Listing' text if present
      title = title.replace(/^New Listing/, '').trim();
      let priceText = $(el).find('.s-item__price').text().trim();
      const productUrl = $(el).find('.s-item__link').attr('href');
      let imageUrl = $(el).find('.s-item__image-img').attr('src');
      
      if (imageUrl && imageUrl.includes('s-l140')) {
        imageUrl = imageUrl.replace('s-l140', 's-l500'); // Higher res
      }

      if (title && priceText && productUrl && !title.includes('Shop on eBay')) {
        products.push({
          title,
          priceText,
          productUrl: productUrl.split('?')[0],
          imageUrl
        });
      }
    });

    console.log(`Found ${products.length} products on eBay! Top 3:`);
    console.log(products.slice(0, 3));
    return products.slice(0, 5);
  } catch(e) {
    console.error("eBay Scraping failed:", e.message);
  }
}

scrapeEbay('minimalist summer outfit');
