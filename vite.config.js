import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            "@": path.resolve(__dirname, "resources/js"),
            "@css": path.resolve(__dirname, "resources/css"),
            "@images": path.resolve(__dirname, "resources/images"),
            "@fonts": path.resolve(__dirname, "resources/fonts"),
            ziggy: path.resolve("vendor/tightenco/ziggy"),
        },
    },

    build: {
        
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        
                        if (id.includes("recharts")) {
                            return "vendor-charts";
                        }
                        
                        if (id.includes("axios") || id.includes("lodash")) {
                            return "vendor-utils";
                        }
                       
                        return "vendor";
                    }
                },
            },
        },
    },
});
