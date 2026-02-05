# Database Password Fix

## Problem
All services were crashing with "password authentication failed for user 'postgres'" errors.

## Root Cause
The `DATABASE_URL` environment variable had an incorrect password:
- **Wrong**: `kXOyoJTnDLmQAyTsTFwemX0abfQxylXn` (with zero "0")
- **Correct**: `kXOyoJTnDLmQAyTsTFwemXOabfQxylXn` (with capital "O")

The Postgres Publishing service's actual password uses a capital "O", not a zero.

## Fix Applied
1. **Updated `DATABASE_URL`** for all 5 services to use the correct password:
   ```
   postgresql://postgres:kXOyoJTnDLmQAyTsTFwemXOabfQxylXn@postgres.railway.internal:5432/railway
   ```

2. **Updated `DB_PASSWORD`** for all services to match:
   ```
   kXOyoJTnDLmQAyTsTFwemXOabfQxylXn
   ```

3. **Updated Supervisor SSR config** to include the correct database credentials explicitly.

## Services Fixed
- ✅ Day News
- ✅ GoEventCity
- ✅ Go Local Voices
- ✅ Alphasite
- ✅ Downtown Guide

## Verification
After the fix, logs show:
```
✅ Database connection successful
```

All services should now connect to the database successfully.
