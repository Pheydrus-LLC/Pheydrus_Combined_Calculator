import { chromium } from 'playwright';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MANYCHAT_EMAIL = process.env.MANYCHAT_EMAIL;
const MANYCHAT_PASSWORD = process.env.MANYCHAT_PASSWORD;

async function loginToManyChat(page) {
  console.log('Navigating to ManyChat login...');
  await page.goto('https://manychat.com/login', { waitUntil: 'networkidle' });

  // Fill login credentials
  await page.fill('[name="email"]', MANYCHAT_EMAIL);
  await page.fill('[name="password"]', MANYCHAT_PASSWORD);

  // Click sign in button
  await page.click('button:has-text("Sign In")');

  // Wait for navigation to dashboard
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('✓ Successfully logged into ManyChat');
}

async function navigateToBotAutomations(page, botId) {
  console.log(`Navigating to automations for bot ${botId}...`);
  await page.goto(`https://app.manychat.com/automations?bot=${botId}`, {
    waitUntil: 'networkidle',
  });

  // Wait for automation list to load
  await page.waitForSelector('[data-test-id="automation-list"]', { timeout: 10000 });
  console.log('✓ Automations page loaded');
}

export { loginToManyChat, navigateToBotAutomations };
