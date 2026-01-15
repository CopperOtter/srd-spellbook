import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */

const dev = process.argv.includes("dev");

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: "build",
      assets: "build",
      fallback: "404.html",
    }),
    paths: {
      // your repo will be served from /srd-spellbook
      base: dev ? "" : process.env.BASE_PATH ?? "",
    },
  },
};

export default config;
