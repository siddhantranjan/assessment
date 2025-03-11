import { chromium, Browser, Page } from 'playwright';
import * as readline from 'readline';

// Interface for the scraped product data
interface Product {
  name: string;
  price: string;
  link: string;
}

// Function to prompt user for credentials
async function getCredentials(): Promise<{ username: string; password: string }> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const username = await new Promise<string>((resolve) => {
    rl.question('Enter your Amazon India username/email: ', (answer) => resolve(answer));
  });

  const password = await new Promise<string>((resolve) => {
    rl.question('Enter your Amazon India password: ', (answer) => resolve(answer));
  });

  rl.close();
  return { username, password };
}

// Main scraping function
async function scrapeAmazonIndia(): Promise<Product[]> {
  const browser: Browser = await chromium.launch({ headless: false });
  const page: Page = await browser.newPage();

  try {
    // Navigate to Amazon India login page
    await page.goto('https://www.amazon.in');
    console.log('Navigated to Amazon India homepage.');

    // Click on the sign-in button
    const signInButton = page.locator('#nav-link-accountList');
    await signInButton.click();
    console.log('Clicked on the sign-in button.');

    // Wait for the login page to load
    const emailInput = page.locator('#ap_email');
    await emailInput.waitFor({ state: 'visible' });
    console.log('Login page loaded.');

    // Get user credentials
    const { username, password } = await getCredentials();

    // Enter credentials
    await page.fill('#ap_email', username);
    await page.click('#continue');
    console.log('Entered username and clicked continue.');

    // Wait for the password field to appear
    await page.waitForSelector('#ap_password', { state: 'visible' });
    await page.fill('#ap_password', password);
    await page.click('#signInSubmit');
    console.log('Entered password and clicked sign-in.');

    // Handle MFA (if applicable)
    console.log('If MFA is required, complete it manually in the browser...');
    await page.waitForURL('https://www.amazon.in/?ref_=nav_ya_signin', { timeout: 30000 });
    console.log('Login successful. Navigated to homepage.');

    // Navigate to order history
    await page.goto('https://www.amazon.in/your-orders/orders?orderFilter=all&timeFilter=year-2024&ref_=ppx_yo2ov_mob_b_filter_y2024_all');
    console.log('Navigated to order history page.');

    const products: Product[] = [];
    for (const row of await page.locator('.order-card__list').all()) {

        const title = await row.locator(".yohtmlc-product-title").innerText();
        const price = await row.locator(".a-column.a-span2").locator(".a-size-base.a-color-secondary.aok-break-word").innerText();
        const link = await row.locator(".product-image").locator(".a-link-normal").getAttribute("href");

        products.push({
            name: title,
            price: price,
            link: "https://www.amazon.in" + link
        })
    }
    console.log(`Scraped ${products.length} purchased items.`);
    return products;
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

// Run the scraper and output results
scrapeAmazonIndia()
  .then((products) => {
    console.log(JSON.stringify(products, null, 2));
  })
  .catch((error) => {
    console.error('Error during scraping:', error);
  });