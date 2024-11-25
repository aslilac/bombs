import classes from "./classes";

export const Button: React.FC<JSX.IntrinsicElements["button"]> = ({
	className,
	children,
	...attrs
}) => {
	return (
		<button
			type="button"
			{...attrs}
			className={classes`
				text-sm shadow-xs
				bg-button disabled:bg-stone-100 hover:background-stone-50
				px-3 py-1.5
				border border-stone-300 disabled:border-stone-700 hover:border-stone-950
				rounded-md
				transition-colors
				select-none
				disabled:opacity-60
				${className}
			`}
		>
			{children}
		</button>
	);
};
