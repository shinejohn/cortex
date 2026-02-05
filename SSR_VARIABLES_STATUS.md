# SSR Variables Status

## Current Configuration

All 5 services have SSR variables set:

### Variables Set:
- `INERTIA_SSR_ENABLED=true`
- `INERTIA_SSR_URL=http://127.0.0.1:13714`

### Services Configured:
- ✅ Day News
- ✅ GoEventCity
- ✅ Go Local Voices
- ✅ Alphasite
- ✅ Downtown Guide

## Where to Find in Railway UI

1. **Go to your Railway project**
2. **Select a service** (e.g., "Day News")
3. **Click on "Variables" tab**
4. **Look for:**
   - `INERTIA_SSR_ENABLED` (should show `true`)
   - `INERTIA_SSR_URL` (should show `http://127.0.0.1:13714`)

## If Variables Don't Appear in UI

The variables are set via CLI and should be visible. If they're not showing:

1. **Refresh the Railway dashboard**
2. **Check if you're looking at the correct service**
3. **Try searching for "INERTIA" in the variables list**
4. **Verify via CLI:**
   ```bash
   railway variables --service "Day News" | grep INERTIA_SSR
   ```

## What These Variables Do

- **`INERTIA_SSR_ENABLED`**: Enables/disables Server-Side Rendering
  - Set to `true` to enable SSR
  - Set to `false` to disable SSR

- **`INERTIA_SSR_URL`**: The URL where the SSR server is running
  - Set to `http://127.0.0.1:13714` for local SSR server (same container)
  - This is the default Inertia SSR port

## Verification

To verify variables are set correctly:
```bash
railway variables --service "Day News" --kv | grep INERTIA_SSR
```

Expected output:
```
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://127.0.0.1:13714
```
