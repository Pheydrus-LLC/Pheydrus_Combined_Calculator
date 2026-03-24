---
name: manychat-automation
description: "Automate ManyChat flow management using Playwright. Use for: logging into ManyChat, creating new automation flows from scratch, updating existing flow templates, managing bot responses, and testing flow triggers. Requires browser control via Playwright MCP."
argument-hint: "Describe the ManyChat task: e.g., 'Create a welcome flow', 'Update the subscriber onboarding template'"
---

# ManyChat Flow Automation

Automate building, testing, and updating ManyChat flows using Playwright browser control. This skill leverages the Playwright MCP to programmatically manage your bot automations.

## When to Use

- **Create new flows** from scratch
- **Update existing flow templates** with new steps, conditions, or triggers
- **Test flow triggers** and responses
- **Login/navigation** to ManyChat dashboard
- **Export or backup** flow configurations
- **Bulk operations** on multiple flows

## Prerequisites

- **Playwright MCP installed** (`npx @playwright/mcp@latest`)
- **ManyChat account** with bot set up
- **Credentials** (email and password for ManyChat login)

## Quick Procedure

### 1. Login to ManyChat

```typescript
// Use Playwright to automate login
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
await page.goto('https://manychat.com/login');
await page.fill('[name="email"]', process.env.MANYCHAT_EMAIL);
await page.fill('[name="password"]', process.env.MANYCHAT_PASSWORD);
await page.click('button:has-text("Sign In")');
await page.waitForNavigation();
```

### 2. Navigate to Automations

```typescript
// From dashboard, go to Automations section
await page.goto('https://app.manychat.com/automations');
await page.waitForSelector('[data-test-id="automation-list"]');
```

### 3. Create a New Flow

```typescript
// Click "Create New Flow" button
await page.click('button:has-text("Create New Flow")');
await page.fill('[placeholder="Flow Name"]', 'Your Flow Name');
await page.click('button:has-text("Create")');

// Wait for flow editor to load
await page.waitForSelector('[data-test-id="flow-editor"]');
```

### 4. Add Flow Steps

```typescript
// Add a message step
await page.click('[data-test-id="add-step"]');
await page.click('[data-test-id="step-type-message"]');
await page.fill('[contenteditable="true"]', 'Your bot message here');
await page.click('[data-test-id="save-step"]');

// Add a condition
await page.click('[data-test-id="add-step"]');
await page.click('[data-test-id="step-type-condition"]');
// Configure condition...
```

### 5. Set Flow Trigger

```typescript
// Configure when the flow triggers
await page.click('[data-test-id="trigger-settings"]');
await page.selectOption('[name="trigger-type"]', 'keyword');
await page.fill('[name="trigger-value"]', 'hello');
await page.click('[data-test-id="save-trigger"]');
```

### 6. Save & Publish

```typescript
// Save the flow
await page.click('button:has-text("Save")');
await page.waitForSelector('[aria-label="saved"]', { timeout: 5000 });

// Publish to make it active
await page.click('button:has-text("Publish")');
await page.waitForSelector('[aria-label="published"]', { timeout: 5000 });
```

## Common Patterns

### Update Existing Flow Template

```typescript
// Navigate to flows list and find the flow
await page.goto('https://app.manychat.com/automations');
await page.click(`text="${flowName}"`);
await page.waitForSelector('[data-test-id="flow-editor"]');

// Edit existing step
await page.click('[data-test-id="edit-step-1"]');
await page.fill('[contenteditable="true"]', 'Updated message');
await page.click('[data-test-id="save-step"]');

// Save changes
await page.click('button:has-text("Save")');
```

### Add Branching Logic

```typescript
// After a message, add a condition for user response
await page.click('[data-test-id="add-condition"]');
await page.selectOption('[name="condition-type"]', 'user-response');
await page.fill('[name="condition-value"]', 'yes');
await page.click('[data-test-id="condition-branch-true"]');
// Add true branch steps...
```

### Test Flow Trigger

```typescript
// Use the test feature in flow editor
await page.click('[data-test-id="test-flow"]');
await page.fill('[name="test-input"]', 'Test message');
await page.click('button:has-text("Send")');

// Wait for flow response
await page.waitForSelector('[data-test-id="bot-response"]');
const response = await page.textContent('[data-test-id="bot-response"]');
console.log('Bot responded:', response);
```

## Best Practices

1. **Wait for elements**: Always use `waitForSelector` before interactions
2. **Handle dialog boxes**: ManyChat often shows confirmations
3. **Use unique selectors**: Prefer `data-test-id` over class names when available
4. **Environment variables**: Store credentials in `.env.local`
   ```
   MANYCHAT_EMAIL=your-email@example.com
   MANYCHAT_PASSWORD=your-password
   ```
5. **Take screenshots**: Useful for debugging
   ```typescript
   await page.screenshot({ path: './flow-screenshot.png' });
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check credentials in `.env.local`, ensure 2FA is disabled |
| Elements not found | ManyChat UI may have changed; inspect page with `await page.screenshot()` |
| Slow interactions | Increase `timeout` values, wait for network idle: `await page.waitForLoadState('networkidle')` |
| Flow not saving | Look for error notifications, ensure all required fields are filled |

## References

- [Playwright Documentation](https://playwright.dev/)
- [ManyChat API Docs](https://manychat.com/api/)
- [Playwright MCP Guide](./references/playwright-mcp-guide.md)
- [Example Scripts](./scripts/)
