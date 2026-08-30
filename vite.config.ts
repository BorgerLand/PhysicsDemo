import { defineConfig } from "vite";
import * as path from "path";
import basicSsl from "@vitejs/plugin-basic-ssl";
import tsconfig from "./tsconfig.presentation.json" with { type: "json" };
import checker from "vite-plugin-checker";
import react from "@vitejs/plugin-react";

const MULTITHREADING_HEADERS =
	process.env.BORGER_SINGLETHREADED === "1"
		? {}
		: {
				"Cross-Origin-Opener-Policy": "same-origin",
				"Cross-Origin-Embedder-Policy": "require-corp",
			};

//https://vite.dev/config/
export default defineConfig({
	publicDir: "assets",
	plugins: [basicSsl(), checker({ typescript: { tsconfigPath: "tsconfig.presentation.json" } }), react()],
	resolve: {
		alias: Object.fromEntries(
			Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
				key.replace(/\/\*$/, ""),
				path.resolve(value.replace(/\/\*$/, "")),
			]),
		),
	},
	server: {
		watch: {
			ignored: (p) => p.startsWith(path.resolve("target") + path.sep),
		},
		headers: {
			...MULTITHREADING_HEADERS,
			"Cache-Control": "no-store, no-cache, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
			"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
		},
	},
	build: {
		outDir: "release/client",
		rolldownOptions: {
			//can't bundle this because it's imported dynamically
			external: ["@borger/rs"],
		},
	},
});
