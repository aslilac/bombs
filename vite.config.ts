import ReactPlugin from "@vitejs/plugin-react";
import TailwindPlugin from "@tailwindcss/vite";

export default {
	root: "src/",
	plugins: [ReactPlugin(), TailwindPlugin()],
	base: "./",
	build: {
		emptyOutDir: true,
		outDir: "../build/",
	},
} satisfies import("vite").UserConfig;
