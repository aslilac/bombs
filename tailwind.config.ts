export default {
	content: ["./src/index.html", "./src/**/*.tsx"],
	theme: {
		fontFamily: {
			sans: ["Outfit", "sans-serif"],
		},
		extend: {},
	},
	plugins: [],
} satisfies import("tailwindcss").Config;
