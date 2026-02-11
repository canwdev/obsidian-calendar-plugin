import { defineConfig, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { copyFileSync, mkdirSync } from "fs";

const copyManifestPlugin = () => {
  let outDir: string;
  return {
    name: "copy-manifest",
    configResolved(config: ResolvedConfig) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const src = path.resolve(__dirname, "manifest.json");
      mkdirSync(outDir, { recursive: true });
      copyFileSync(src, path.join(outDir, "manifest.json"));
    },
  };
};

export default defineConfig({
  plugins: [react(), copyManifestPlugin()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "../../TestPlugins/.obsidian/plugins/calendar-react",
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      output: {
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css") ? "styles.css" : "[name].[ext]",
        format: "cjs",
        exports: "default",
      },
      external: ["obsidian", "fs", "os", "path"],
    },
    target: "es2022",
    sourcemap: false,
  },
});
