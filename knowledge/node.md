# Node.js Deployment Reference

## Railway Node.js
- Nixpacks auto-detects Node from package.json
- Respects `engines.node` version constraint
- Uses npm ci for installs by default
- Start command: uses "start" script from package.json

## Common Issues

### "Error: listen EADDRINUSE"
- App trying to bind a port already in use
- Use `process.env.PORT` — Railway sets this

### "MODULE_NOT_FOUND"
- Missing dependency: check package.json vs import
- Dev dependency used in production: move to dependencies
- Case sensitivity: Linux is case-sensitive, macOS isn't

### "JavaScript heap out of memory"
- Set NODE_OPTIONS=--max-old-space-size=4096
- Or optimize: check for memory leaks, large arrays, unbounded caches

### Build failures
- Lock file mismatch: delete node_modules and package-lock.json, reinstall
- Native modules: may need build tools in nixpacks.toml
- TypeScript errors: fix types or use `--skipLibCheck`

## Environment Variables
- Access via `process.env.VARIABLE_NAME`
- For Next.js public vars: must start with NEXT_PUBLIC_
- For Nuxt public vars: in nuxt.config runtime config
