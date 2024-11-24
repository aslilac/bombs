import { useEffect } from "react";
import classes from "./classes.ts";
import { Portal } from "./Portal";

export type ModalProps = {
	children?: React.ReactNode;
	className?: string;
	noDefaultStyles?: boolean;
	onBlur?: () => void;
};

export const Modal: React.FC<ModalProps> = ({
	children,
	className,
	noDefaultStyles,
	onBlur,
}) => {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onBlur?.();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	const stopPropagation = (event: React.SyntheticEvent) => {
		event.stopPropagation();
	};

	return (
		<Portal>
			<div
				className="absolute top-0 left-0 flex flex-col w-dvw h-dvh items-center justify-center bg-gray-900/40"
				onClick={onBlur}
			>
				<div
					onClick={stopPropagation}
					className={classes`
						${!noDefaultStyles && "w-sm max-w-dvw p-8 bg-white shadow-2xl rounded-xl"}
						${className}
					`}
				>
					{children}
				</div>
			</div>
		</Portal>
	);
};
