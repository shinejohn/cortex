# Database Variables Fix - Matching Downtown Guide

## 🔍 Discovery

**Downtown Guide is working** because it uses **individual DB_* variables** instead of DATABASE_URL.

## ✅ Downtown Guide Configuration (Working)

```
DB_CONNECTION=pgsql
DB_HOST=postgres.railway.internal
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=kXOyoJTnDLmQAyTsTFwemXOabfQxylXn
```

## 🔧 Fix Applied

Set the same individual DB_* variables for all crashed services:
- Day News
- GoEventCity
- Go Local Voices
- Alphasite

## Why This Works

Laravel can use either:
1. `DATABASE_URL` (full connection string) - but Railway CLI truncates it
2. Individual `DB_*` variables - more reliable for Railway

Since Downtown Guide works with individual variables, we're matching that configuration.

## Expected Results

- ✅ Services should connect to database successfully
- ✅ Migrations should run
- ✅ Services should stay online
- ✅ No more password authentication errors

## Monitor

Watch Railway dashboard - services should:
1. Redeploy automatically
2. Connect to database successfully
3. Complete migrations
4. Stay online (not crash)
