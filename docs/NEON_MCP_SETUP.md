# Neon MCP Connection Setup

This guide explains how to connect Cursor to your Neon Postgres database using Model Context Protocol (MCP).

## Prerequisites

- Neon Postgres database URL (provided by Rishav)
- Cursor IDE installed
- Access to your Neon project

## Step 1: Neon Connection Details

**✅ Configured:**
- **Project ID:** `crimson-glitter-19569216`
- **Database URL:** Configured in Railway and MCP settings

**Still Needed (Optional):**
- **API Key** - For programmatic access via Neon API (not required if using DATABASE_URL)

## Step 2: Configure MCP in Cursor

### Option A: Remote MCP Server (Recommended - Uses OAuth)

**✅ Configured:** The MCP configuration uses Neon's remote MCP server with OAuth authentication. This is simpler and doesn't require managing API keys:

```json
{
  "mcpServers": {
    "neon": {
      "url": "https://mcp.neon.tech/mcp"
    }
  }
}
```

**Benefits:**
- No API key management needed
- Automatic OAuth authentication
- Always uses the latest server version
- No local dependency issues

**First-time setup:**
1. Restart Cursor
2. When you first use the MCP server, it will prompt you to authenticate via OAuth
3. Complete the OAuth flow in your browser
4. You'll be connected to your Neon account

### Option B: Local MCP Server (Alternative)

If you prefer to run the server locally, you'll need a Neon API key:

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

**Note:** Get your API key from https://console.neon.tech → Settings → API Keys

### Option B: Project-Specific Configuration

**Note:** The global configuration at `~/.cursor/mcp.json` is already set up. If you prefer project-specific configuration, create `.cursor/mcp.json` in your project root with the same values:

```json
{
  "mcpServers": {
    "neon": {
      "command": "npx",
      "args": [
        "-y",
        "@neondatabase/mcp-server-neon"
      ],
      "env": {
        "NEON_PROJECT_ID": "crimson-glitter-19569216",
        "DATABASE_URL": "postgresql://neondb_owner:npg_5oJxXkB7abUz@ep-sweet-art-a41b7p8i-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
      }
    }
  }
}
```

**⚠️ Security Note:** If creating a project-specific config, make sure `.cursor/` is in `.gitignore` to avoid committing credentials.

## Step 3: Install Neon MCP Server

The MCP server will be installed automatically when Cursor tries to use it (via `npx -y`), but you can also install it globally:

```bash
npm install -g @neondatabase/mcp-server-neon
```

## Step 4: Verify Connection

1. Restart Cursor
2. Open the MCP panel in Cursor
3. You should see the Neon server connected
4. Try querying your database through Cursor's AI assistant

## Step 5: Access Better-Auth Token

Once connected, you can query the database to find better-auth tokens:

```sql
-- Find sessions with tokens
SELECT * FROM session WHERE expires_at > NOW();

-- Or query the user table managed by better-auth
SELECT * FROM user LIMIT 10;
```

## Troubleshooting

### MCP Server Not Found

**Error:** `Command not found: @neondatabase/mcp-server-neon`

**Solution:**
```bash
npm install -g @neondatabase/mcp-server-neon
```

### Connection Failed

**Error:** `Failed to connect to Neon`

**Solutions:**
1. Verify your `DATABASE_URL` is correct (already configured)
2. Check that `NEON_PROJECT_ID` matches your project (`crimson-glitter-19569216`)
3. Ensure your Neon project is active (not paused)
4. Check network connectivity
5. Restart Cursor after configuration changes

### Database URL Configuration

**✅ Already Configured:** The MCP configuration uses `DATABASE_URL` directly, which is the recommended approach. The configuration at `~/.cursor/mcp.json` includes:

- `NEON_PROJECT_ID`: `crimson-glitter-19569216`
- `DATABASE_URL`: Full connection string (configured)

**Note:** If you need to use an API key instead (for advanced features), you can add `NEON_API_KEY` to the env section, but `DATABASE_URL` should work for most use cases.

## Alternative: Direct Database Connection

If MCP setup is complex, you can also:

1. Use the `DATABASE_URL` environment variable in your `.env` file
2. Connect directly using TypeORM/your ORM
3. Query the database using standard SQL tools

## Resources

- [Neon MCP Documentation](https://neon.com/docs/ai/connect-mcp-clients-to-neon)
- [Neon API Documentation](https://neon.tech/docs/api)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)

## Next Steps

After connecting:
1. ✅ Verify you can query the `user` table (managed by better-auth)
2. ✅ Find a better-auth session token
3. ✅ Verify `tokenized_assets` table structure
4. ✅ Run the seeding script: `npm run seed:assets`

---

**Note:** Keep your Neon credentials secure. Never commit API keys or database URLs to version control.

