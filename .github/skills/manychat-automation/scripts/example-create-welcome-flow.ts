import { chromium } from 'playwright';
import { loginToManyChat, navigateToBotAutomations } from './auth';
import { createNewFlow, addMessageStep, setFlowTrigger, publishFlow } from './flows';

/**
 * Complete example: Create a welcome flow in ManyChat
 * Usage: npx ts-node scripts/example-create-welcome-flow.ts
 */

async function main() {
  const browser = await chromium.launch({ headless: false }); // visible browser for demo
  const page = await browser.newPage();

  try {
    // Step 1: Login
    await loginToManyChat(page);

    // Step 2: Navigate to automations (assuming you have a BOT_ID env var)
    const botId = process.env.MANYCHAT_BOT_ID || 'your-bot-id';
    await navigateToBotAutomations(page, botId);

    // Step 3: Create new flow
    await createNewFlow(page, 'Welcome Flow');

    // Step 4: Add message steps
    await addMessageStep(page, '👋 Welcome to our bot!');
    await addMessageStep(page, 'How can I help you today?');

    // Step 5: Set trigger (when someone types "hello")
    await setFlowTrigger(page, 'keyword', 'hello');

    // Step 6: Publish
    await publishFlow(page);

    console.log('✅ Welcome flow created and published successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
