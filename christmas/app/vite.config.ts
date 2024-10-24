import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { purgeCss } from "vite-plugin-tailwind-purgecss";
// "vite-plugin-node-polyfills": "^0.17.0" is required for this to work 0.19.0 does not work with buffer
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
    envDir: "../",
    plugins: [sveltekit(), purgeCss(), nodePolyfills()],
    define: {},
    resolve: {
        alias: {
            process: "process/browser",
        },
    },
    server: {
        watch: {
            ignored: ["**/node_modules/**", "**/test-ledger/**"],
        },
    },
    test: {
        globalSetup: ["tests/globalSetup.ts"],
        setupFiles: ["tests/setupFiles"],
    },
});
