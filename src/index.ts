import { chromium, Browser, Page } from 'playwright';
import { getCredentials } from './utils';
import { Product } from './dto/product.dto';

async function launchBrowser(): Promise<{ browser: Browser; page: Page }> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  return { browser, page };
}

async function loginToAmazon(page: Page, username: string, password: string): Promise<boolean> {
  try {
    await page.locator('input[name="email"]').waitFor({ state: 'visible' });
    console.log('Login page loaded.');

    await page.locator('input[name="email"]').fill(username);
    await page.locator('#continue').first().click();
    console.log('Entered username and clicked continue.');

    await page.locator('input[name="password"]').waitFor({ state: 'visible' });
    await page.locator('input[name="password"]').fill(password);
    await page.locator('#signInSubmit').click();
    console.log('Entered password and clicked sign-in.');

    await page.waitForURL('https://www.amazon.in/?ref_=nav_ya_signin', { timeout: 30000 });
    console.log('Login successful.');
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

async function scrapeOrders(page: Page): Promise<Product[]> {
  await page.goto('https://www.amazon.in/your-orders/orders?orderFilter=all&timeFilter=year-2024&ref_=ppx_yo2ov_mob_b_filter_y2024_all');
  console.log('Navigated to order history page.');

  const products: Product[] = [];
  for (const row of await page.locator('.order-card__list').all()) {
    const title = await row.locator('.yohtmlc-product-title').innerText();
    const price = await row.locator('.a-column.a-span2 .a-size-base.a-color-secondary.aok-break-word').innerText();
    const link = await row.locator('.product-image .a-link-normal').getAttribute('href');

    products.push({
      name: title,
      price: price,
      link: `https://www.amazon.in${link}`,
    });
  }

  console.log(`Scraped ${products.length} purchased items.`);
  return products;
}

const navigateToHomePage = async (page: Page) => {
  await page.goto('https://www.amazon.in');
  console.log('Navigated to Amazon India homepage.');

  await page.locator('#nav-link-accountList').click();
  console.log('Clicked on the sign-in button.');
}

async function scrapeAmazonIndia(): Promise<Product[]> {
  const { browser, page } = await launchBrowser();

  try {
    await navigateToHomePage(page);

    const { username, password } = await getCredentials();
    const loginSuccess = await loginToAmazon(page, username, password);
    if (!loginSuccess) return [];

    return await scrapeOrders(page);
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

scrapeAmazonIndia().then(console.log);
