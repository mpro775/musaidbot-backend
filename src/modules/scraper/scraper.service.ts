import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { chromium, Page } from 'playwright';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeProduct(url: string): Promise<{
    name: string;
    price: number;
    inStock: boolean;
    images: string[];
    description: string;
  }> {
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page: Page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });

      const nameHandle = await page.textContent('h1.product-title');
      const name = nameHandle?.trim() ?? '';

      const priceRaw = (await page.textContent('.price')) ?? '0';
      const price = parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0;

      let inStock = true;
      try {
        const stockText = await page.$eval(
          '.stock',
          (el) => el.textContent ?? '',
        );
        inStock = stockText.includes('متوفر');
      } catch {
        inStock = true; // إذا لم توجد .stock نعتبره متوفرًا
      }

      let images: string[] = [];
      try {
        images = await page.$$eval('img.product-gallery', (elements) =>
          elements
            .map((el) => el.getAttribute('src'))
            .filter((src): src is string => Boolean(src)),
        );
      } catch {
        images = [];
      }

      const descriptionRaw = await page.textContent('.description');
      const description = descriptionRaw?.trim() ?? '';

      await browser.close();
      return { name, price, inStock, images, description };
    } catch (err) {
      this.logger.error(`Error scraping ${url}: ${(err as Error).message}`);
      if (browser) await browser.close();
      throw new InternalServerErrorException('Failed to scrape product');
    }
  }
}
