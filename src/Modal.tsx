import { useEffect } from "react";
import { Portal } from "./Portal";

export type ModalProps = {
	children?: React.ReactNode;
	onBlur?: () => void;
};

export const Modal: React.FC<ModalProps> = ({ children, onBlur }) => {
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
					className="w-104 p-8 bg-white shadow-2xl rounded-xl"
					onClick={stopPropagation}
				>
					{children}
				</div>
			</div>
		</Portal>
	);
};
