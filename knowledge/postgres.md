# PostgreSQL Troubleshooting Reference

## Railway Postgres Specifics
- Railway provisions Postgres as a service in your project
- Connection info available via reference variables: `${{Postgres.DATABASE_URL}}`
- Individual vars: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
- Private networking: Postgres is reachable at `Postgres.railway.internal` (or whatever the service name is)
- Public access: disabled by default, enable in service settings if needed for external tools

## Connection Issues

### "Connection refused"
1. Is the Postgres service running? Check its deploy status
2. Is the host correct? Use Railway reference, not a hardcoded IP
3. Is the port correct? Railway Postgres uses 5432 internally
4. Private networking: use `servicename.railway.internal:5432`

### "FATAL: password authentication failed"
1. Credentials changed? Re-check PGPASSWORD via Railway dashboard
2. Using the right user? Railway creates a default user
3. Connection string format: `postgresql://user:password@host:port/database`

### "FATAL: database does not exist"
1. Check PGDATABASE matches an actual database
2. Railway creates one database by default — check its name
3. Create if missing: `CREATE DATABASE dbname;`

### "too many connections"
1. Railway Postgres has connection limits based on plan
2. Use connection pooling (PgBouncer) for production
3. Laravel: set DB_CONNECTION to use pooling, or reduce pool size in config/database.php
4. Check for connection leaks: are connections being closed after use?

## Performance
- `EXPLAIN ANALYZE` on slow queries
- Check for missing indexes on WHERE/JOIN columns
- Vacuum: Railway handles auto-vacuum, but `VACUUM ANALYZE tablename` for manual
- Connection count: `SELECT count(*) FROM pg_stat_activity;`
- Active queries: `SELECT * FROM pg_stat_activity WHERE state = 'active';`
- Kill long query: `SELECT pg_cancel_backend(pid);`

## Backups
- Railway provides automatic backups (plan-dependent)
- Manual dump: `pg_dump -h host -U user -d dbname > backup.sql`
- Restore: `psql -h host -U user -d dbname < backup.sql`

## Common Postgres + Laravel Patterns
- DATABASE_URL parsing in config/database.php:
  ```php
  'pgsql' => [
      'url' => env('DATABASE_URL'),
      // OR individual vars:
      'host' => env('DB_HOST', '127.0.0.1'),
      'port' => env('DB_PORT', '5432'),
      ...
  ]
  ```
- If using DATABASE_URL, make sure config/database.php's default connection uses it
- Laravel default connection: DB_CONNECTION=pgsql
