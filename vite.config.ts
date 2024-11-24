import ReactPlugin from "@vitejs/plugin-react";

export default {
	root: "src/",
	plugins: [ReactPlugin()],
	base: "./",
	build: {
		emptyOutDir: true,
		outDir: "../build/",
	},
} satisfies import("vite").UserConfig;
