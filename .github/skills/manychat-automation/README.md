# ManyChat Automation Skill

Automate your ManyChat bot workflow management using Playwright browser control.

## Quick Start

1. **Tell Claude what you need:**
   - `/manychat-automation` — Create a new flow
   - `Create a subscriber onboarding sequence` — Update templates
   - `Test the welcome flow` — Verify flow behavior

2. **Set up credentials:**
   ```bash
   # Add to .env.local
   MANYCHAT_EMAIL=your-email@example.com
   MANYCHAT_PASSWORD=your-password
   MANYCHAT_BOT_ID=your-bot-id
   ```

3. **Claude will:**
   - Log into your ManyChat account
   - Navigate to automations
   - Create or update flows using Playwright
   - Test triggers and responses
   - Publish changes automatically

## What's Included

- **SKILL.md** — Complete automation procedures
- **scripts/auth.ts** — Login and navigation helpers
- **scripts/flows.ts** — Flow creation and editing functions
- **scripts/example-create-welcome-flow.ts** — Complete working example
- **references/playwright-mcp-guide.md** — Playwright best practices for ManyChat
- **references/testing-flows.md** — How to test flow behavior

## Use Cases

✅ Create new bot flows from scratch  
✅ Update existing flow templates or messages  
✅ Set up triggers (keywords, tags, buttons)  
✅ Add conditions and branching logic  
✅ Test flows before publishing  
✅ Publish or draft flows  
✅ Backup flow configurations  

## How It Works

Claude can use Playwright MCP to:
1. **Control the browser** programmatically
2. **Navigate to ManyChat** and log in
3. **Interact with the UI** (click buttons, fill forms)
4. **Wait for elements** to load (critical for reliability)
5. **Take screenshots** for debugging

## Key Dependencies

- **Playwright MCP** (installed: `npx @playwright/mcp@latest`)
- **Node.js 18+**
- **ManyChat account** with bot set up

## Commands

```bash
# Run the example: Create a simple welcome flow
npx ts-node .github/skills/manychat-automation/scripts/example-create-welcome-flow.ts

# View available functions
cat .github/skills/manychat-automation/scripts/flows.ts
```

## Need Help?

- See [Playwright MCP Guide](./references/playwright-mcp-guide.md) for common patterns
- See [Testing Flows](./references/testing-flows.md) for verification strategies
- See [SKILL.md](./SKILL.md) for complete procedures

---

**Ready to automate?** Type `/manychat-automation` in chat to invoke this skill.
