import { chromium, Browser, Page } from 'playwright';
import { getUserInput } from './utils';
import { Product } from './dto/product.dto';
import { UserInput } from './dto/user-input-fn.dto';

const launchBrowser = async (): Promise<{ browser: Browser; page: Page }> => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  return { browser, page };
}

const loginToAmazon = async (page: Page, username: string, password: string): Promise<boolean> => {
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

const navigateToOrderPage = async (page: Page, userInputFn: UserInput) => {
  await page.goto('https://www.amazon.in/your-orders/orders');
  await page.locator('.a-dropdown-prompt').click();

  const filterRequired = await userInputFn.askForFilter();

  if (filterRequired) {
    const allFilteringCriteria = await page.locator('.a-popover-inner .a-nostyle.a-list-link .a-dropdown-link').all();

    const idMappedByYear = {};
    for (let year of allFilteringCriteria) {
      const yearText = await year.innerText();
      const yearId = await year.getAttribute('id');

      Object.assign(idMappedByYear, { [yearText]: yearId });
    }

    const id = await userInputFn.getFilterInput(idMappedByYear);
    console.log('Navigated to order history page.');
    await page.click(`[id=${id}]`);
  }

  try{
    await page.locator('.order-card__list').first().waitFor({ state: 'visible', timeout: 5000 });
  } catch (error) {
    console.log('No orders found.');
  }
  console.log('Order history page loaded.');
}

const scrapeOrders = async (page: Page): Promise<Product[]> => {

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
  const userInputFn: UserInput = await getUserInput();

  try {
    await navigateToHomePage(page);

    const { username, password } = await userInputFn.getCredentials();
    const loginSuccess = await loginToAmazon(page, username, password);
    if (!loginSuccess) return [];

    await navigateToOrderPage(page, userInputFn);
    return await scrapeOrders(page);
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
    userInputFn.closeReadline();
    console.log('Browser closed.');
  }
}

scrapeAmazonIndia().then(console.log);
