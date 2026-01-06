# Neon MCP Server Troubleshooting

## Error: Unexpected token '', "[31merror"... is not valid JSON

**Symptoms:**
```
[error] Client error for command Unexpected token '', "[31merror"... is not valid JSON
[error] No server info found
```

**Cause:**
The Neon MCP server is outputting ANSI color codes (terminal colors) instead of pure JSON, which breaks the MCP protocol communication. This happens when:
1. The server is run incorrectly (expects command-line arguments)
2. The server outputs errors to stderr with colors enabled
3. The server requires a NEON_API_KEY as a command-line argument, not just environment variables

**Solution: Use Remote MCP Server (Recommended)**

The Neon MCP server supports a remote URL approach that handles authentication via OAuth:

```json
{
  "mcpServers": {
    "neon": {
      "url": "https://mcp.neon.tech/mcp"
    }
  }
}
```

This will prompt you to authenticate via OAuth when first used.

**Alternative: Use Local Server with API Key**

If you prefer local execution, you need a NEON_API_KEY:

1. **Get API Key:**
   - Go to https://console.neon.tech
   - Navigate to Settings → API Keys
   - Create a new API key

2. **Update MCP config:**
   ```json
   {
     "mcpServers": {
       "neon": {
         "command": "npx",
         "args": [
           "-y",
           "@neondatabase/mcp-server-neon",
           "start",
           "YOUR_NEON_API_KEY_HERE"
         ],
         "env": {
           "NO_COLOR": "1"
         }
       }
     }
   }
   ```

---

## Error: Cannot find package 'cors/lib/index.js'

**Symptoms:**
```
Error: Cannot find package '/Users/.../.npm/_npx/.../node_modules/cors/lib/index.js'
ERR_MODULE_NOT_FOUND
```

**Cause:**
The `npx` command creates a temporary installation that sometimes has dependency resolution issues, especially with the `cors` package.

**Solution 1: Use Globally Installed Version (Recommended)**

1. **Install globally:**
   ```bash
   npm install -g @neondatabase/mcp-server-neon
   ```

2. **Update MCP config to use global install:**
   ```json
   {
     "mcpServers": {
       "neon": {
         "command": "node",
         "args": [
           "/usr/local/lib/node_modules/@neondatabase/mcp-server-neon/dist/index.js"
         ],
         "env": {
           "NEON_PROJECT_ID": "crimson-glitter-19569216",
           "DATABASE_URL": "postgresql://..."
         }
       }
     }
   }
   ```

3. **Restart Cursor**

**Solution 2: Clear npx Cache**

If you prefer to keep using `npx`:

```bash
# Clear npx cache
rm -rf ~/.npm/_npx

# Clear npm cache
npm cache clean --force

# Restart Cursor
```

**Solution 3: Use Specific Node Version**

The error might be related to Node.js version compatibility. Try:

```bash
# Check Node version
node --version

# If using nvm, try Node 20 LTS
nvm install 20
nvm use 20
```

---

## Error: No server info found

**Symptoms:**
```
[error] No server info found
```

**Cause:**
MCP server failed to start or initialize properly.

**Solutions:**
1. Check the MCP server logs in Cursor
2. Verify the configuration file syntax is valid JSON
3. Ensure the command path is correct
4. Try restarting Cursor

---

## Error: Connection Failed

**Symptoms:**
- MCP server starts but can't connect to database
- "Authentication failed" errors

**Solutions:**
1. **Verify DATABASE_URL:**
   ```bash
   # Test connection directly
   psql "postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Check Neon Dashboard:**
   - Ensure project is active (not paused)
   - Verify connection string is correct

3. **Check Environment Variables:**
   - Ensure `DATABASE_URL` is set correctly in MCP config
   - Ensure `NEON_PROJECT_ID` matches your project

---

## General Troubleshooting Steps

### 1. Verify Installation

```bash
# Check if globally installed
npm list -g @neondatabase/mcp-server-neon

# Check file exists
ls -la /usr/local/lib/node_modules/@neondatabase/mcp-server-neon/dist/index.js
```

### 2. Test MCP Server Manually

```bash
# Try running directly (should show error about missing stdio, which is expected)
node /usr/local/lib/node_modules/@neondatabase/mcp-server-neon/dist/index.js
```

### 3. Check Cursor Logs

1. Open Cursor
2. Go to Help → Toggle Developer Tools
3. Check Console for MCP-related errors

### 4. Verify Configuration

```bash
# Check MCP config file
cat ~/.cursor/mcp.json

# Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('~/.cursor/mcp.json', 'utf8'))"
```

### 5. Reinstall MCP Server

```bash
# Uninstall
npm uninstall -g @neondatabase/mcp-server-neon

# Clear cache
npm cache clean --force
rm -rf ~/.npm/_npx

# Reinstall
npm install -g @neondatabase/mcp-server-neon
```

---

## Current Configuration

**✅ Working Configuration:**

```json
{
  "mcpServers": {
    "neon": {
      "command": "node",
      "args": [
        "/usr/local/lib/node_modules/@neondatabase/mcp-server-neon/dist/index.js"
      ],
      "env": {
        "NEON_PROJECT_ID": "crimson-glitter-19569216",
        "DATABASE_URL": "postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    }
  }
}
```

**Location:** `~/.cursor/mcp.json`

---

## Alternative: Use Direct Database Connection

If MCP continues to have issues, you can:

1. **Use psql directly:**
   ```bash
   psql "postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

2. **Use Database GUI Tools:**
   - DBeaver
   - pgAdmin
   - TablePlus

3. **Use TypeORM CLI:**
   ```bash
   npm run typeorm query "SELECT * FROM tokenized_assets"
   ```

---

## Getting Help

If issues persist:

1. **Check Neon MCP Server Issues:**
   - https://github.com/neondatabase/mcp-server-neon/issues

2. **Check Cursor MCP Issues:**
   - https://github.com/cursor/cursor/issues

3. **Neon Documentation:**
   - https://neon.com/docs/ai/connect-mcp-clients-to-neon

---

**Last Updated:** January 6, 2025


