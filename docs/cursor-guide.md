# Using Cursor + Claude for the Hackday

This guide helps you get the most out of Cursor (our AI-powered IDE) and Claude (the AI model) during the hackday. Whether you're a developer or trying coding for the first time, these tips will help.

---

## Setup

1. **Download Cursor** from [cursor.com](https://cursor.com/download)
2. Open it, sign in (free tier is fine for the hackday)
3. Open the hackdays folder: **File → Open Folder**
4. Make sure Claude is selected as your model (bottom-right corner, or Settings → Models)

---

## The Three Ways to Use Claude in Cursor

### 1. Chat (`Cmd+L` / `Ctrl+L`)

A conversation panel opens on the side. Use this for:
- Planning: *"I want to build X, what's the best approach?"*
- Generating whole files: *"Create a React component that shows a bar chart of city budgets"*
- Debugging: *"Here's my error [paste]. What's wrong?"*
- Learning: *"Explain what this code does"*

**Pro tip:** You can drag files into the chat or type `@filename` to give Claude context about your project.

### 2. Inline Edit (`Cmd+K` / `Ctrl+K`)

Select some code, press `Cmd+K`, and tell Claude what to change:
- *"Make this responsive"*
- *"Add error handling"*
- *"Convert this to TypeScript"*

### 3. Autocomplete (just type)

Start typing and Claude will suggest completions. Press `Tab` to accept.

---

## Best Practices for the Hackday

### Be Specific
Bad: *"Make it better"*
Good: *"Add a loading spinner while the API call is in progress, using a simple CSS animation"*

### Give Context
Bad: *"Fix the bug"*
Good: *"When I click 'Submit', nothing happens. The console shows: TypeError: Cannot read property 'map' of undefined at line 42. The data comes from the /api/cities endpoint."*

### Iterate, Don't Restart
If Claude's first attempt isn't right, tell it what's wrong and ask it to fix that specific thing. Don't start over from scratch every time.

### Use @-references
In the chat, type `@` to reference files, folders, or documentation. This gives Claude the context it needs:
- `@src/app/page.tsx` — reference a specific file
- `@events/2026-06-11-unlock-the-money/apps/trust-score/` — reference your whole app

### Ask for Explanations
If Claude generates code you don't understand, ask it to explain. You'll learn faster and catch mistakes.

---

## Common Prompts That Work Well

| What you want | What to say |
|---------------|-------------|
| Start a new page | *"Create a new page at /dashboard that shows [describe what you want]"* |
| Add an API route | *"Create an API endpoint at /api/scores that fetches city data from [source] and returns a trust score"* |
| Fix styling | *"This page looks bad on mobile. Make it responsive with a single column layout on small screens"* |
| Add a chart | *"Add a line chart showing monthly budget allocations over the last 12 months using recharts"* |
| Connect to data | *"Fetch data from this public API: [URL] and display it in a table"* |
| Debug | *"I'm getting this error: [paste full error]. Here's the relevant code: [paste or @reference file]"* |

---

## What NOT to Do

- **Don't use other AI tools** (Copilot, ChatGPT for code, Windsurf) — we're testing this stack specifically
- **Don't blindly accept code** — read what Claude generates, ask questions if unsure
- **Don't fight the AI** — if an approach isn't working after 3 attempts, ask Claude for a different strategy
- **Don't worry about perfect code** — it's a hackday. Working > elegant

---

## Non-Technical? Start Here

If you've never coded before, here's your gameplan:

1. Open Cursor, open the chat (`Cmd+L`)
2. Say: *"I'm new to coding. I want to build [your idea] as a simple web page. Walk me through it step by step."*
3. Claude will guide you. Follow its instructions one at a time.
4. When something breaks (it will), paste the error and ask Claude to fix it.
5. Celebrate every small win. You're coding!

You'll be surprised how far you can get in 24 hours with AI help. That's the whole point.
