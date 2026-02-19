# Vue / Vite / Tailwind Reference

## Vite Build Issues

### "Cannot find module" / Build fails
1. Check node version matches package.json engines
2. Run `npm ci` not `npm install` in production builds
3. Check vite.config.ts/js for correct paths
4. For Laravel + Vite: `@vitejs/plugin-vue` and `laravel-vite-plugin` required

### "Mixed Content" / Assets not loading
1. APP_URL must be https:// in production
2. ASSET_URL should match your domain
3. Vite manifest missing: run `npm run build` during deploy
4. For Laravel: `@vite(['resources/css/app.css', 'resources/js/app.js'])` in blade

### Hot Module Replacement (HMR) in dev
- Only works locally, not on Railway
- Production: always use `npm run build` in build command

## Tailwind CSS
- Config: tailwind.config.js/ts
- Content paths must include all template files
- PurgeCSS runs in production — if styles missing, check content paths
- Laravel: content should include `./resources/**/*.blade.php`, `./resources/**/*.vue`

## Vue 3 Composition API
- `<script setup>` is the standard pattern
- Reactivity: `ref()` for primitives, `reactive()` for objects
- Props: `defineProps()`, Emits: `defineEmits()`
- Composables: extract reusable logic into `use*.ts` files

## shadcn/ui (Vue)
- Component library based on Radix Vue + Tailwind
- Install: `npx shadcn-vue@latest init`
- Components go in `components/ui/`
- Each component is source code you own — not a dependency
- Customize by editing the component files directly
- Uses `class-variance-authority` for variant styling

## Common Deploy Command (Laravel + Vite)
```
npm ci && npm run build && composer install --no-dev --optimize-autoloader && php artisan optimize && php artisan migrate --force
```
