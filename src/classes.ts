import { twMerge } from "tailwind-merge";

export default function classes(
	templateSegments: TemplateStringsArray,
	...variables: Array<string | false | null | undefined | 0 | 0n>
) {
	const segments = [...templateSegments];
	let className = segments.shift() ?? "";

	if (segments.length !== variables.length) {
		throw new ReferenceError("somehow these are wrong");
	}

	for (let i = 0; i < segments.length; i++) {
		if (variables[i]) {
			className += `${variables[i]}`;
		}
		className += segments[i];
	}

	return twMerge(className.replaceAll(/\s+/g, " "));
}
