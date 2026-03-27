import { defineConfig, loadEnv, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";

const copyManifestPlugin = () => {
  let outDir: string;
  return {
    name: "copy-manifest",
    configResolved(config: ResolvedConfig) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const pkgPath = path.resolve(__dirname, "package.json");
      const manifestPath = path.resolve(__dirname, "manifest.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as { version: string };
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<string, unknown>;
      manifest.version = pkg.version;
      mkdirSync(outDir, { recursive: true });
      writeFileSync(
        path.join(outDir, "manifest.json"),
        JSON.stringify(manifest, null, 2)
      );
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const outDir = env.OUT_DIR ?? "dist/.obsidian/plugins/calendar-react";

  return {
    // Obsidian WebView has no Node `process`; React CJS checks process.env.NODE_ENV at runtime.
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        mode === "production" ? "production" : "development"
      ),
    },
    plugins: [react(), copyManifestPlugin()],
    esbuild: {
      legalComments: "none",
      drop: ["debugger"],
    },
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir,
      emptyOutDir: false,
      cssMinify: true,
      lib: {
        entry: path.resolve(__dirname, "src/main.ts"),
        formats: ["cjs"],
        fileName: () => "main.js",
      },
      rollupOptions: {
        output: {
          // One JS file: Obsidian only loads main.js from the plugin folder.
          inlineDynamicImports: true,
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
  };
});
