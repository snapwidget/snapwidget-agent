# SnapWidget for AI agents

Ask your AI agent to add your Instagram feed or your Google reviews to your website. It makes the widget and puts it on your site for you.

[SnapWidget](https://snapwidget.com) works with your Instagram, Facebook, TikTok, X and YouTube accounts, your Google and G2 reviews, and your testimonials. This repository has two parts:

- **A skill** (`skills/snapwidget/SKILL.md`) that tells the agent how to make a widget and add it to a site, with the steps for WordPress, Wix, Shopify, Squarespace, many other website builders and the JavaScript frameworks.
- **Plugin files** for Claude Code and Gemini CLI, with the skill and the SnapWidget MCP server.

## Install

**Claude Code**

```
/plugin marketplace add snapwidget/snapwidget-agent
/plugin install snapwidget@snapwidget
```

**Gemini CLI**

```
gemini extensions install https://github.com/snapwidget/snapwidget-agent
```

**Cursor**

Add this to `~/.cursor/mcp.json`, then add the skill with `npx skills add snapwidget/snapwidget-agent`:

```json
{
  "mcpServers": {
    "snapwidget": {
      "url": "https://snapwidget.com/mcp",
      "auth": { "CLIENT_ID": "01a1a540-0cf2-7324-a610-d2c2e5248a53" }
    }
  }
}
```

**Codex and other agents that read skills**

```
npx skills add snapwidget/snapwidget-agent
```

**Claude, ChatGPT and other chat apps:** add the SnapWidget MCP server, `https://snapwidget.com/mcp`. The steps for each app are in the [docs](https://snapwidget.com/docs/ai-agents).

## Use it

Ask your agent, for example:

- "Add my Instagram feed to the home page."
- "Show our Google reviews on the contact page."
- "Put the videos of my YouTube channel on this site."

The first time, the agent signs you in. With a new account, you type in the code that SnapWidget emails to you. To show the posts of an Instagram, Facebook, TikTok or X account, the owner of the account opens a link from the agent and clicks Allow.

## The CLI

For agents that work in a terminal:

```
npm install -g snapwidget
```

The commands and the code are in [snapwidget/snapwidget-cli](https://github.com/snapwidget/snapwidget-cli).

## Help

[SnapWidget docs](https://snapwidget.com/docs) · [AI agents](https://snapwidget.com/docs/ai-agents) · [Issues](https://github.com/snapwidget/snapwidget-agent/issues)

## License

MIT
