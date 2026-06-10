# ⚡ Energy Awareness Skill

Know how much energy your AI conversations use.

## What It Does

Ask Claude about your conversation's energy usage and get insights:

- **Energy consumed** (Wh) — what your chat actually used
- **Impact level** — from "negligible" to "substantial"
- **Carbon range** — varies by your electricity grid
- **Real-world comparisons** — kettles boiled, EV miles, LED hours

**Example**: "What's the energy usage of this conversation?"

Claude responds with energy metrics + relatable equivalencies.

---

## Quick Start (3 Steps)

### 1️⃣ Add the MCP Connection

Before the skill works, you need to connect it to the Energy Awareness API.

**Claude Desktop**:

- Settings → Developer → MCP Servers
- Click **Add MCP Server**
- Name: `AI Energy Awareness`
- URL: `https://carbon.miamollie.dev/mcp`
- Save & restart Claude

**Claude.ai (Web)**:

- Settings → Connections
- Add MCP Server
- URL: `https://carbon.miamollie.dev/mcp`
- Refresh page

⚠️ **Without this step, the skill won't work!**

### 2️⃣ Restart Claude

Close and reopen Claude completely.

### 3️⃣ Test It

Ask: **"What is the energy usage of this conversation?"**

You should see energy (Wh), impact level, carbon range, and real-world comparisons.

---

## What You'll See

> Based on this conversation (using Claude Sonnet 4.6):
>
> - **Energy used**: 26 Wh
> - **Impact level**: Very heavy
> - **Carbon range**: 0.00132–0.01848 kg CO₂e
>
> **Real-world equivalents:**
>
> - 1 minute boiling water
> - 0.1 miles in an EV
> - 4 minutes running a shredder
> - 2.6 hours of LED lighting

---

## How It Works

Your conversations use energy. The skill:

1. **Measures** your session tokens (input/output)
2. **Calls** the Energy Awareness API via MCP
3. **Shows** energy metrics + context


## Troubleshooting

### "Skill doesn't work"

→ Did you add the MCP server at `https://carbon.miamollie.dev/mcp`? That's required.

### "Command not found"

→ Restart Claude completely. It won't work until you do.

### "Cannot reach the API"

→ Check your internet. The API should be reachable at https://carbon.miamollie.dev/health


## Why This Matters

AI uses energy. Most people don't know how much. This skill makes it visible.

You'll start noticing:

- Longer conversations = more energy
- Different models = different impacts
- Your region's grid = your carbon footprint

Then you can decide: Is this worth it? Use a lighter model? Batch questions? 



## Questions?

**How accurate is this?**  
Directional, not precise. The API uses class-based estimates anchored to real model benchmarks. Good for awareness, not laboratory measurements.

**Can I use this offline?**  
No—the API call needs internet. But data is processed privately; no tracking happens.

**Does this slow down Claude?**  
No. It only runs when you ask about energy.



⚡🌍
