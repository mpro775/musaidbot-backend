import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeProduct(url: string): Promise<{ name: string; price: string }> {
    let browser: Browser | null = null;

    try {
      browser = await chromium.launch({ headless: true });
      const page: Page = await browser.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const nameRaw = await page.textContent('h1.product-title');
      const priceRaw = await page.textContent('span.price');

      const name = (nameRaw ?? 'Unknown').trim();
      const price = (priceRaw ?? 'Unknown').trim();

      await browser.close();
      return { name, price };
    } catch (rawError: unknown) {
      let errorMessage = 'Unknown error';
      if (rawError instanceof Error) {
        errorMessage = rawError.message;
      }
      this.logger.error(`Error scraping ${url}: ${errorMessage}`);

      if (browser) {
        await browser.close();
      }
      throw new InternalServerErrorException('Failed to scrape product');
    }
  }
}
