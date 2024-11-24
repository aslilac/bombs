import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type PortalProps = {
	children?: React.ReactNode;
};

export const Portal: React.FC<PortalProps> = ({ children }) => {
	const portal = useRef<HTMLDivElement>(document.createElement("div"));

	useEffect(() => {
		portal.current.className = "absolute top-0 left-0";
		portal.current.role = "presentation";
		document.body.appendChild(portal.current);
		return () => {
			document.body.removeChild(portal.current);
		};
	}, []);

	return createPortal(children, portal.current);
};
