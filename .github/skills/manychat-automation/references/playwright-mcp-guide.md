# Playwright MCP Guide for ManyChat Automation

Playwright MCP enables programmatic browser control through Claude. This guide covers common patterns for ManyChat automation.

## Setup

```bash
# Install Playwright MCP
npx @playwright/mcp@latest

# Install Playwright in your project
npm install -D playwright @types/playwright
```

## Environment Variables

Create `.env.local` in the project root:

```env
MANYCHAT_EMAIL=your-manychat-email@example.com
MANYCHAT_PASSWORD=your-password
MANYCHAT_BOT_ID=your-bot-id
```

## Common Selectors in ManyChat

ManyChat UI elements use both `data-test-id` attributes and standard HTML selectors:

| Element | Selector |
|---------|----------|
| Automation List | `[data-test-id="automation-list"]` |
| Flow Editor | `[data-test-id="flow-editor"]` |
| Add Step Button | `[data-test-id="add-step"]` |
| Message Step Type | `[data-test-id="step-type-message"]` |
| Condition Step Type | `[data-test-id="step-type-condition"]` |
| Message Input | `[contenteditable="true"]` |
| Save Button | `button:has-text("Save")` |
| Publish Button | `button:has-text("Publish")` |
| Trigger Settings | `[data-test-id="trigger-settings"]` |
| Trigger Type Select | `[name="trigger-type"]` |

## Common Patterns

### Wait for Load States

```typescript
// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Wait for specific element
await page.waitForSelector('[data-test-id="flow-editor"]', { timeout: 10000 });

// Wait for navigation
await page.waitForNavigation({ waitUntil: 'networkidle' });
```

### Handle Dialogs

```typescript
// Accept dialog (OK/Confirm)
page.once('dialog', dialog => dialog.accept());
await page.click('button:has-text("Delete")');

// Dismiss dialog (Cancel)
page.once('dialog', dialog => dialog.dismiss());
await page.click('button:has-text("Cancel Flow")');
```

### Screenshot for Debugging

```typescript
await page.screenshot({ path: './debug.png' });
```

### Get Text Content

```typescript
const text = await page.textContent('[data-test-id="bot-response"]');
console.log('Bot said:', text);
```

### Check Element Visibility

```typescript
const isVisible = await page.isVisible('[data-test-id="success-message"]');
if (isVisible) {
  console.log('Flow successfully created');
}
```

## ManyChat-Specific Tips

1. **2FA Handling**: Disable 2FA on your ManyChat account for automation, or handle SMS/email codes programmatically
2. **Waits**: ManyChat can be slow; use longer timeouts (10-15 seconds)
3. **Bot ID**: Find your bot ID in the URL: `app.manychat.com/automations?bot=YOUR_BOT_ID`
4. **Network Issues**: Always use `waitForLoadState('networkidle')` after navigation
5. **Element Timing**: Wait for elements to be stable before clicking

## Debugging

```typescript
// Enable detailed logging
const browser = await chromium.launch({
  headless: false, // Keep window open
  slowMo: 1000,    // Slow down actions by 1 second
});

// Take screenshots at key points
await page.screenshot({ path: './step-1-login.png' });
await page.screenshot({ path: './step-2-flows-list.png' });
```

## Error Handling

```typescript
try {
  await navigateToBotAutomations(page, botId);
} catch (error) {
  console.error('Failed to navigate:', error.message);
  // Fallback: manually navigate
  await page.goto('https://app.manychat.com/automations');
}
```

## References

- [Playwright API](https://playwright.dev/docs/api/intro)
- [Playwright Selectors](https://playwright.dev/docs/locators)
- [ManyChat Dashboard](https://app.manychat.com/)
