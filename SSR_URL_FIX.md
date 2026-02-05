# SSR URL Fix

## Problem
All services were using `INERTIA_SSR_URL=http://127.0.0.1:13714`, but SSR runs as a **separate Railway service** called "Inertia SSR", not in the same container.

## Solution
Updated all services to use the Railway internal domain for the SSR service:
```
INERTIA_SSR_URL=http://inertia-ssr.railway.internal:13714
```

## Services Updated
- ✅ Day News
- ✅ GoEventCity
- ✅ Go Local Voices
- ✅ Alphasite
- ✅ Downtown Guide

## Architecture
- **SSR Service**: Separate Railway service "Inertia SSR" (Online)
- **App Services**: Connect to SSR via Railway internal network
- **URL Format**: `http://{service-name}.railway.internal:{port}`

## Verification
All services now have:
```
INERTIA_SSR_ENABLED=true
INERTIA_SSR_URL=http://inertia-ssr.railway.internal:13714
```

This should resolve SSR connection issues and allow the apps to properly communicate with the SSR service.
