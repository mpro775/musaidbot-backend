// src/scraper/scraper.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { chromium, Page } from 'playwright';
import { zidSelectors } from './selectors-config';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  /** يحاول عدة selectors حتى يجد قيمة نصية */
  private async trySelectors(page: Page, selectors: string[]): Promise<string> {
    for (const selector of selectors) {
      try {
        await page.waitForFunction(
          (s) => !!document.querySelector(s)?.textContent?.trim(),
          selector,
          { timeout: 5000 },
        );
        const text = await page.$eval(
          selector,
          (el) => el.textContent?.trim() ?? '',
        );
        if (text) return text;
      } catch {
        /* جرب selector آخر */
      }
    }
    return '';
  }

  /** يحاول عدة selectors لجمع مصفوفة صور */
  private async tryImageSelectors(
    page: Page,
    selectors: string[],
  ): Promise<string[]> {
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        const imgs = await page.$$eval(selector, (els) =>
          (els as HTMLImageElement[])
            .map((img) => img.src)
            .filter((src) => !src.includes('placeholder')),
        );
        if (imgs.length) return imgs;
      } catch {
        /* جرب selector آخر */
      }
    }
    return [];
  }

  /**
   * @param url رابط المنتج
   * @param options.mode 'full' → كل الحقول, 'minimal' → السعر والتوفر فقط
   */
  async scrapeProduct(
    url: string,
    options: { mode: 'full' | 'minimal' } = { mode: 'full' },
  ): Promise<
    | { price: number; inStock: boolean }
    | {
        platform: string;
        name: string;
        price: number;
        inStock: boolean;
        images: string[];
        description: string;
        category: string;
        lowQuantity: string;
        specsBlock: string[];
      }
  > {
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page: Page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

      // ---------- الوضع minimal (سعر وتوفر فقط) ----------
      if (options.mode === 'minimal') {
        const priceRaw = await this.trySelectors(page, zidSelectors.price);
        const price = parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0;

        const lowQuantity = await this.trySelectors(
          page,
          zidSelectors.lowQuantity,
        );
        // إذا وجدت كلمة "نفد" نعتبره غير متوفر
        const inStock = !/نفد/i.test(lowQuantity);

        await browser.close();
        return { price, inStock };
      }

      // ---------- الوضع full (كل المعلومات) ----------
      const platform = 'zid';

      // فئة المنتج من ميتا
      const category =
        (await page.getAttribute(zidSelectors.category[0], 'content')) || '';

      // الاسم والإصدار
      const name = await this.trySelectors(page, zidSelectors.name);
      const variant = await this.trySelectors(page, zidSelectors.variant);
      const fullName = variant ? `${name} – ${variant}` : name;

      // السعر
      const priceRaw = await this.trySelectors(page, zidSelectors.price);
      const price = parseFloat(priceRaw.replace(/[^\d.]/g, '')) || 0;

      // الوصف
      const description =
        (await this.trySelectors(page, zidSelectors.description)) || '';

      // الصور
      const images = await this.tryImageSelectors(page, zidSelectors.images);

      // التوفر (نستخدم lowQuantity لاشتقاق inStock أيضاً)
      const lowQuantity = await this.trySelectors(
        page,
        zidSelectors.lowQuantity,
      );
      const inStock = !/نفد/i.test(lowQuantity);

      // specifications block
      const specsBlock = await page.$$eval(
        zidSelectors.specsBlock[0],
        (spans) =>
          (spans as HTMLSpanElement[])
            .map((s) => s.textContent?.trim() || '')
            .filter(Boolean),
      );

      await browser.close();
      return {
        platform,
        name: fullName,
        price,
        inStock,
        images,
        description,
        category,
        lowQuantity,
        specsBlock,
      };
    } catch (err) {
      this.logger.error(`Error scraping ${url}: ${(err as Error).message}`);
      if (browser) await browser.close();
      throw new InternalServerErrorException('Failed to scrape product');
    }
  }
}
