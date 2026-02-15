import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import laravel from "laravel-vite-plugin";
import { resolve, join } from "path";
import { defineConfig } from "vite";
import fs from "fs";

function getPageInputs() {
    const root = process.cwd();
    const pagesDir = join(root, 'resources/js/pages');
    const inputs: string[] = [];

    function traverse(dir: string) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                traverse(fullPath);
            } else if (file.endsWith('.tsx')) {
                // Get path relative to root
                const relativePath = fullPath.substring(root.length + 1);
                inputs.push(relativePath);
            }
        }
    }

    traverse(pagesDir);
    return inputs;
}

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx", ...getPageInputs()],
            ssr: "resources/js/ssr.tsx",
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: "automatic",
    },
    resolve: {
        alias: {
            "@": resolve(process.cwd(), "resources/js"),
            "ziggy-js": resolve(process.cwd(), "vendor/tightenco/ziggy"),
        },
    },
});
