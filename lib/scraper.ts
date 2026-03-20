import axios from 'axios';
import * as cheerio from 'cheerio';
import dbConnect from './mongodb';
import { ClothingItem } from './models';
import { generateOllama } from './ollama';

export class FashionScraper {
  static async scrapeAndStore(baseURL: string, selector: string, siteName: string, maxPages: number = 5) {
    try {
      await dbConnect();
      let totalCollected = 0;

      for (let page = 1; page <= maxPages; page++) {
        const url = baseURL.includes('?') ? `${baseURL}&page=${page}` : `${baseURL}?page=${page}`;
        console.log(`Scraping Page ${page}: ${url}`);

        try {
          const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
          });
          const html = data as string;
          const $ = cheerio.load(html);
          const results: any[] = [];

          $(selector).each((i: number, el: any) => {
            const product = {
              name: $(el).find('[class*="name"], [class*="title"]').first().text().trim(),
              brand: siteName,
              price: parseFloat($(el).find('[class*="price"]').first().text().replace(/[^0-9.]/g, '')) || 0,
              currency: 'USD',
              imageUrl: $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src'),
              productUrl: $(el).find('a').first().attr('href'),
              category: 'Men', 
              reviews: ["Great quality", "Fits true to size"], // Initially static, could be scraped per product
              rating: 4.5
            };
            if (product.name && product.productUrl) {
              results.push(product);
            }
          });

          for (const p of results) {
            // AI Style Tagging using Ollama
            const styleTags = await this.generateStyleTags(p.name, p.category);
            
            await ClothingItem.findOneAndUpdate(
              { productUrl: p.productUrl },
              { ...p, styleTags },
              { upsert: true, new: true }
            );
            totalCollected++;
          }
        } catch (pageError) {
          console.error(`Error on page ${page} of ${siteName}:`, pageError);
        }
        
        // Wait between pages to avoid being blocked
        await new Promise(r => setTimeout(r, 2000));
      }

      return totalCollected;
    } catch (error) {
      console.error(`Global scraper error for ${siteName}:`, error);
      return 0;
    }
  }

  static async generateStyleTags(name: string, category: string) {
    try {
      const prompt = `Identify fashion style tags for: "${name}" (${category}). Return ONLY a JSON array of 3 strings. Example: ["streetwear", "minimalist", "summer"]`;
      const response = await generateOllama({
        model: 'llama3',
        prompt,
        format: 'json'
      });
      const data = JSON.parse(response);
      return Array.isArray(data) ? data : ["casual"];
    } catch {
      return ["casual"];
    }
  }
}
