import { Page } from 'playwright';

interface FlowStep {
  type: 'message' | 'condition' | 'action' | 'delay';
  content: string;
  condition?: string;
}

async function createNewFlow(page: Page, flowName: string) {
  console.log(`Creating new flow: "${flowName}"...`);

  // Click "Create New Flow" button
  await page.click('button:has-text("Create New Flow")');

  // Wait for modal to appear
  await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

  // Fill in flow name
  await page.fill('[placeholder*="Flow Name"]', flowName);

  // Click create button
  await page.click('button:has-text("Create")');

  // Wait for flow editor to load
  await page.waitForSelector('[data-test-id="flow-editor"]', { timeout: 10000 });
  console.log(`✓ Flow "${flowName}" created`);
}

async function addMessageStep(page: Page, message: string, stepIndex: number = 0) {
  console.log(`Adding message step: "${message}"`);

  await page.click('[data-test-id="add-step"]');
  await page.waitForSelector('[data-test-id="step-type-message"]', { timeout: 5000 });

  await page.click('[data-test-id="step-type-message"]');

  // Wait for message input
  await page.waitForSelector('[contenteditable="true"]', { timeout: 5000 });

  // Type message
  await page.click('[contenteditable="true"]');
  await page.keyboard.type(message);

  // Save step
  await page.click('button:has-text("Save")');
  console.log('✓ Message step added');
}

async function setFlowTrigger(
  page: Page,
  triggerType: 'keyword' | 'tag' | 'button',
  triggerValue: string,
) {
  console.log(`Setting trigger: ${triggerType} = "${triggerValue}"`);

  // Open trigger settings
  await page.click('[data-test-id="trigger-settings"]');
  await page.waitForSelector('[name="trigger-type"]', { timeout: 5000 });

  // Select trigger type
  await page.selectOption('[name="trigger-type"]', triggerType);

  // Fill trigger value
  await page.fill('[name="trigger-value"]', triggerValue);

  // Save
  await page.click('button:has-text("Save")');
  console.log('✓ Trigger configured');
}

async function publishFlow(page: Page) {
  console.log('Publishing flow...');

  // Save first
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(2000);

  // Publish
  await page.click('button:has-text("Publish")');

  // Wait for confirmation
  await page.waitForSelector('[aria-label*="published"]', { timeout: 10000 });
  console.log('✓ Flow published');
}

async function saveFlowDraft(page: Page) {
  console.log('Saving flow draft...');
  await page.click('button:has-text("Save")');
  await page.waitForTimeout(2000);
  console.log('✓ Flow saved as draft');
}

export { createNewFlow, addMessageStep, setFlowTrigger, publishFlow, saveFlowDraft };
