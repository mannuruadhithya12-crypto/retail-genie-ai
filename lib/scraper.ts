import axios from 'axios';
import * as cheerio from 'cheerio';
import { connectToDatabase } from './mongodb';
import { ClothingItem } from './models';
import { generateOllama } from './ollama';

export interface ScrapedProduct {
  name: string;
  brand: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  category: string;
  reviews: string[];
  rating: number;
  reviewCount: number;
}

export class FashionScraper {
  static async scrapeAndStore(url: string, selector: string, siteName: string) {
    try {
      await connectToDatabase();
      const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      const $ = cheerio.load(data);
      const results: any[] = [];

      $(selector).each((i, el) => {
        // Generic extraction logic, would be overridden by site-specific scrapers
        const product = {
          name: $(el).find('.product-name').text().trim(),
          brand: siteName,
          price: parseFloat($(el).find('.price').text().replace(/[^0-9.]/g, '')),
          currency: 'USD',
          imageUrl: $(el).find('img').attr('src'),
          productUrl: url,
          category: 'General',
          reviews: [],
          rating: 0,
          reviewCount: 0
        };
        if (product.name) results.push(product);
      });

      for (const p of results) {
        // 1. AI Style Tagging using Ollama
        const styleTags = await this.generateStyleTags(p.name, p.category);
        
        // 2. Upsert into MongoDB
        await ClothingItem.findOneAndUpdate(
          { productUrl: p.productUrl },
          { ...p, styleTags },
          { upsert: true, new: true }
        );
      }

      return results.length;
    } catch (error) {
      console.error(`Scraper error for ${siteName}:`, error);
      return 0;
    }
  }

  static async generateStyleTags(name: string, category: string) {
    try {
      const prompt = `Identify fashion style tags for this item: "${name}" (${category}). 
      Output ONLY a JSON array of 3 strings. Example: ["streetwear", "minimalist", "summer"]`;
      const response = await generateOllama({
        model: 'llama3',
        prompt,
        format: 'json'
      });
      return JSON.parse(response);
    } catch {
      return ["casual"];
    }
  }
}
