# Testing ManyChat Flows with Playwright

Guide for verifying flow behavior and functionality using automated testing.

## Test Flow Triggers

```typescript
async function testFlowTrigger(page, flowName, triggerInput) {
  // Navigate to flow
  await page.goto(`https://app.manychat.com/automations`);
  await page.click(`text="${flowName}"`);
  await page.waitForSelector('[data-test-id="flow-editor"]');

  // Click test button
  await page.click('[data-test-id="test-flow"]');
  await page.waitForSelector('[data-test-id="test-input"]');

  // Send test message
  await page.fill('[data-test-id="test-input"]', triggerInput);
  await page.click('button:has-text("Send")');

  // Wait for bot response
  await page.waitForSelector('[data-test-id="bot-response"]', { timeout: 5000 });

  // Get response text
  const response = await page.textContent('[data-test-id="bot-response"]');
  return response;
}

// Usage
const response = await testFlowTrigger(page, 'Welcome Flow', 'hello');
console.log('Bot response:', response);
```

## Verify Flow Settings

```typescript
async function verifyFlowTrigger(page, expectedType, expectedValue) {
  // Open trigger settings
  await page.click('[data-test-id="trigger-settings"]');

  // Get current values
  const triggerType = await page.inputValue('[name="trigger-type"]');
  const triggerValue = await page.inputValue('[name="trigger-value"]');

  // Verify
  if (triggerType !== expectedType) {
    throw new Error(`Expected trigger type "${expectedType}", got "${triggerType}"`);
  }
  if (triggerValue !== expectedValue) {
    throw new Error(`Expected trigger value "${expectedValue}", got "${triggerValue}"`);
  }

  console.log('✓ Flow trigger settings verified');
}
```

## Check Flow Step Content

```typescript
async function verifyFlowSteps(page, expectedSteps) {
  const steps = await page.locator('[data-test-id="flow-step"]').all();

  if (steps.length !== expectedSteps.length) {
    throw new Error(
      `Expected ${expectedSteps.length} steps, found ${steps.length}`,
    );
  }

  for (let i = 0; i < steps.length; i++) {
    const stepText = await steps[i].textContent();
    if (!stepText.includes(expectedSteps[i])) {
      throw new Error(`Step ${i + 1}: expected "${expectedSteps[i]}", got "${stepText}"`);
    }
  }

  console.log('✓ All flow steps verified');
}
```

## Monitor Flow Updates

```typescript
async function verifyFlowIsPublished(page) {
  const publishStatus = await page.getAttribute(
    '[data-test-id="publish-status"]',
    'data-status',
  );

  if (publishStatus !== 'published') {
    throw new Error(`Flow is not published. Status: ${publishStatus}`);
  }

  console.log('✓ Flow is published');
}
```

## Complete Test Suite Example

```typescript
import { chromium } from 'playwright';
import { loginToManyChat, navigateToBotAutomations } from './auth';

async function runFlowTests() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Setup
    await loginToManyChat(page);
    const botId = process.env.MANYCHAT_BOT_ID;
    await navigateToBotAutomations(page, botId);

    // Test 1: Verify flow exists
    await page.click('text="Welcome Flow"');
    console.log('✓ Test 1 passed: Flow exists');

    // Test 2: Verify trigger settings
    await verifyFlowTrigger(page, 'keyword', 'hello');
    console.log('✓ Test 2 passed: Trigger settings correct');

    // Test 3: Test flow execution
    const response = await testFlowTrigger(page, 'Welcome Flow', 'hello');
    if (!response.includes('Welcome')) {
      throw new Error('Response does not contain expected text');
    }
    console.log('✓ Test 3 passed: Flow responds correctly');

    // Test 4: Verify flow is published
    await verifyFlowIsPublished(page);
    console.log('✓ Test 4 passed: Flow is published');

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: './test-failure.png' });
  } finally {
    await browser.close();
  }
}

runFlowTests();
```

## Common Test Assertions

| Check | Code |
|-------|------|
| Element exists | `await page.isVisible('[selector]')` |
| Text contains | `await page.textContent('[selector]').then(t => t.includes('text'))` |
| Element count | `await page.locator('[selector]').count()` |
| Attribute value | `await page.getAttribute('[selector]', 'data-status')` |
| Input value | `await page.inputValue('[selector]')` |

## Tips

1. **Use long timeouts** for network-dependent assertions
2. **Take screenshots** on failures for debugging
3. **Isolate tests** so each one can run independently
4. **Mock external data** when testing conditions
