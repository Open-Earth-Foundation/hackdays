# Getting Started

**Welcome!** This guide is for everyone — even if you've never used a terminal, git, or written code before. The whole point is to learn by doing, with AI helping you every step.

---

## What You Need Installed

Before the hackday, make sure you have these (ask in Slack if you need help):

| Tool | What it is | How to install |
|------|-----------|----------------|
| **Cursor** | Your AI-powered code editor | [cursor.com/download](https://cursor.com/download) — just download and open |
| **Git** | Version control (saves your work & shares with the team) | Mac: already installed. Windows: [git-scm.com](https://git-scm.com) |
| **Node.js** | Runs JavaScript apps | [nodejs.org](https://nodejs.org) — download the LTS version |
| **Python** (optional) | If your team picks a Python project | [python.org](https://python.org) |

---

## Step 1: Get the Code

Open your **Terminal** (Mac: search "Terminal" in Spotlight; Windows: search "Git Bash").

```bash
# Go to where you want the project
cd ~/Desktop

# Download the hackday repo
git clone https://github.com/Open-Earth-Foundation/hackdays.git

# Go into it
cd hackdays
```

Then open this folder in Cursor: **File → Open Folder → select `hackdays`**

---

## Step 2: Create Your Team's App

In the terminal (you can use the one inside Cursor — press `` Ctrl+` `` to open it):

```bash
# Replace YYYY-MM-DD with the event date and TEAM-NAME with your team name
# For the June 2026 hackday, it would be:
cp -r events/2026-06-11-unlock-the-money/apps/_template events/2026-06-11-unlock-the-money/apps/YOUR-TEAM-NAME
```

**Example:** If your team is called "trust-score":
```bash
cp -r events/2026-06-11-unlock-the-money/apps/_template events/2026-06-11-unlock-the-money/apps/trust-score
```

---

## Step 3: Create Your Branch

A **branch** is like your team's private workspace. It keeps your code separate from other teams until you're ready to share.

```bash
# Create and switch to your team's branch
# Format: hackday/EVENT-DATE/team-name
git checkout -b hackday/2026-06-11/YOUR-TEAM-NAME
```

**Example:**
```bash
git checkout -b hackday/2026-06-11/trust-score
```

---

## Step 4: Run Your App

```bash
# Go into your team's app folder
cd events/2026-06-11-unlock-the-money/apps/YOUR-TEAM-NAME

# Install dependencies
npm install

# Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see a starter page.

---

## Step 5: Build with Claude

This is where the magic happens. In Cursor:

1. Press `Cmd+L` (Mac) or `Ctrl+L` (Windows) to open the AI chat
2. Tell Claude what you want to build: *"I want to create a dashboard that shows a trust score for Brazilian cities based on budget data and political cycles"*
3. Claude will write the code. Review it, accept it, iterate.
4. If something breaks, tell Claude: *"This is broken, here's the error: [paste error]"*

**Tips:**
- Be specific about what you want
- Share error messages — Claude can fix them
- Ask Claude to explain anything you don't understand
- Use `Cmd+K` (inline edit) to modify specific code sections

---

## Step 6: Save Your Work (Git Basics)

Every 30 minutes or so, save your progress:

```bash
# See what you changed
git status

# Add all your changes
git add .

# Save with a message describing what you did
git commit -m "Added the main dashboard page"

# Upload to GitHub (first time)
git push -u origin hackday/2026-06-11/YOUR-TEAM-NAME

# Upload to GitHub (after the first time)
git push
```

**Don't worry about perfect commit messages.** "wip" or "stuff works now" is fine for a hackday.

---

## Step 7: Demo Time

Before demos, open a Pull Request:

1. Go to https://github.com/Open-Earth-Foundation/hackdays
2. You'll see a banner: "Compare & pull request" — click it
3. Title: your team name + what you built
4. Description: paste your app's README content
5. Submit!

---

## Common Problems

| Problem | Solution |
|---------|----------|
| "Permission denied" when pushing | Ask Pablo to add you to the repo |
| "npm not found" | Install Node.js from nodejs.org |
| Port 3000 already in use | Kill the other process or change port: `npm run dev -- --port 3001` |
| "I messed up git" | Ask in Slack — we've all been there. Or: `git stash` saves your work and `git stash pop` brings it back |
| "My code is broken and I can't fix it" | Tell Claude the full error. If stuck, ask a teammate or anyone in Slack |

---

## The Golden Rule

**There are no stupid questions during a hackday.** Ask in Slack, ask Claude, ask your team. The point is to learn and build something cool together.

---

## Want to use Python instead?

```bash
# Copy the Python template instead
cp -r templates/python events/2026-06-11-unlock-the-money/apps/YOUR-TEAM-NAME

cd events/2026-06-11-unlock-the-money/apps/YOUR-TEAM-NAME
python -m venv .venv
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python app.py
```
