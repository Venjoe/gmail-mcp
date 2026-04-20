# Codex quick start

Gmail MCP Bridge can run in Codex through Codex's MCP configuration file:

```toml
[mcp_servers.gmail-mcp]
command = "node"
args = ["C:\\Users\\you\\gmail-mcp\\gmail-mcp-extension\\mcp-server\\index.js"]
env = { NODE_ENV = "production" }
```

## Install

```bash
git clone https://github.com/Venjoe/gmail-mcp.git
cd gmail-mcp
npm run install:server
node ./bin/gmail-mcp install --force
```

The installer updates both:

- Claude Desktop: `claude_desktop_config.json`
- Codex: `~/.codex/config.toml`

### Windows and non-interactive terminal note

On Windows or in non-interactive terminals, `node ./bin/gmail-mcp install --force`
may still fail if the installer tries to redraw progress output.

If that happens, the manual Codex setup is:

1. Install the server dependencies:

```bash
npm run install:server
```

2. Add this block to `~/.codex/config.toml`:

```toml
[mcp_servers.gmail-mcp]
command = "node"
args = ["C:\\Users\\you\\gmail-mcp\\gmail-mcp-extension\\mcp-server\\index.js"]
env = { NODE_ENV = "production" }
```

3. Restart Codex.

## Chrome setup

Open `chrome://extensions/`, enable Developer mode, then load this unpacked extension folder:

```text
gmail-mcp-extension/extension
```

Open Gmail in Chrome and keep the target account signed in.
Keep at least one `https://mail.google.com/` tab open and fully loaded before testing.
If the bridge reports `chromeConnected: false` or account requests time out, refresh the Gmail tab once and try again.

## Use in Codex

Restart Codex after installation, then ask Codex to use the `gmail-mcp` MCP tools, for example:

```text
List my latest Gmail messages.
```

The MCP server starts the local bridge automatically. If another bridge is already running on `http://localhost:3456`, it reuses that bridge.

## Verify

```bash
curl http://localhost:3456/health
npm run test:bridge
```

Expected bridge health:

```json
{"status":"ok","chromeConnected":true}
```

If `chromeConnected` is `false`, the most common causes are:

- Chrome is not open
- the Gmail extension is disabled
- no Gmail tab is open
- Gmail is open but has not finished loading
