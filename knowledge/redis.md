# Redis Troubleshooting Reference

## Railway Redis
- Provisioned as a service, reachable via private networking
- Connection: `${{Redis.REDIS_URL}}` or `redis://default:password@host:port`
- Private host: `Redis.railway.internal` (or service name)
- Default port: 6379

## Connection Issues

### "Connection refused" / "ECONNREFUSED"
1. Is Redis service running?
2. Host should be Railway reference, not hardcoded
3. For Laravel: REDIS_HOST=`${{Redis.RAILWAY_PRIVATE_DOMAIN}}`, REDIS_PORT=6379
4. Check REDIS_PASSWORD if authentication is enabled

### "NOAUTH Authentication required"
1. Railway Redis has a password — check REDIS_PASSWORD variable
2. Connection URL includes password: `redis://default:PASSWORD@host:port`

## Laravel + Redis
- CACHE_DRIVER=redis — use Redis for caching
- SESSION_DRIVER=redis — use Redis for sessions
- QUEUE_CONNECTION=redis — use Redis for job queues
- Config in config/database.php under 'redis' key
- Laravel uses phpredis extension or predis package
- Check: `php -m | grep redis` to verify extension installed

## Common Patterns
- Cache clear: `redis-cli FLUSHDB` (clears current database)
- Check memory: `redis-cli INFO memory`
- Check connected clients: `redis-cli INFO clients`
- Key count: `redis-cli DBSIZE`
- Monitor commands: `redis-cli MONITOR` (careful in production)

## Queue Monitoring
- Pending jobs: `redis-cli LLEN queues:default`
- For Horizon: check Horizon dashboard or `php artisan horizon:status`
- Stuck jobs usually mean worker process died or Redis connection dropped
