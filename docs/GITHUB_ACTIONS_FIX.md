# GitHub Actions CI/CD Fix

**Issue:** GitHub Actions workflows were failing due to Biome configuration conflicts.

## Problem

The GitHub Actions lint workflow was running `pnpm biome ci .` which tried to check the entire repository, including the `frontend/` directory. This caused a conflict because:

1. Root directory has `biome.jsonc` (backend config)
2. `frontend/` directory has `biome.json` (frontend config)
3. Biome doesn't allow nested root configurations

**Error:**
```
Found a nested root configuration, but there's already a root configuration.
```

## Solution

### 1. Updated Biome Configuration

**File:** `biome.jsonc`

Added `ignoreUnknown: true` to allow Biome to skip files it doesn't recognize:

```jsonc
"files": {
  "includes": ["src/**", "test/**", "vitest.setup.ts", "scripts/**"],
  "ignoreUnknown": true
}
```

### 2. Updated GitHub Actions Workflow

**File:** `.github/workflows/lint.yml`

Changed the Biome command to only check backend directories:

```yaml
- name: Run Biome
  run: pnpm biome ci src/ test/ scripts/
```

Instead of:
```yaml
- name: Run Biome
  run: pnpm biome ci .
```

## Why This Works

- **Scoped checking:** Only checks backend code (`src/`, `test/`, `scripts/`)
- **Avoids conflict:** Doesn't traverse into `frontend/` directory
- **Maintains separation:** Frontend has its own Biome config that won't conflict

## Verification

To test locally:

```bash
# This should work now
npx biome ci src/ test/ scripts/

# Or using npm script
npm run lint
```

## Related Workflows

All workflows use `pnpm`:
- **lint.yml** - Runs Biome linting
- **test.yml** - Runs Vitest tests
- **knip.yml** - Checks for unused dependencies

All workflows are configured to:
- Use Node.js 22
- Use pnpm (version 9 or 10)
- Cache dependencies for faster builds

## Status

✅ **Fixed** - The lint workflow should now pass in GitHub Actions.

---

**Note:** The frontend directory has its own Biome configuration and should be linted separately in its own workflow or as part of the frontend CI/CD pipeline.

