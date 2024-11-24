import { FlagTriangleRight } from "lucide";
import { useMemo } from "react";
import classes from "./classes.ts";

type TileProps = {
	onMark: (event: React.SyntheticEvent) => void;
	onCheck: () => void;
	isMine: boolean;
	isChecked: boolean;
	isMarked: boolean;
	surroundingMines: number;
};

export const Tile: React.FC<TileProps> = ({
	onCheck,
	onMark,
	isMine,
	isChecked,
	isMarked,
	surroundingMines,
}) => {
	const onClick = (event: React.MouseEvent) => {
		if (event.shiftKey || event.ctrlKey) {
			onMark(event);
			return;
		}

		onCheck();
	};

	const color = useMemo(() => {
		if (isMarked) {
			return "border-gray-700 text-black";
		}

		if (!isChecked) {
			return "text-black";
		}

		switch (surroundingMines) {
			case 0:
				return "border-gray-700";
			case 1:
				return "border-green-700 text-green-700";
			case 2:
				return "border-blue-700 text-blue-700";
			default:
				return "border-red-700 text-red-700";
		}
	}, [isMarked, isChecked, surroundingMines]);

	return (
		<button
			type="button"
			onClick={onClick}
			onContextMenu={onMark}
			className={classes`flex items-center justify-center w-8 h-8 p-0 ${isChecked && "checked"} ${isMine && "mine"} ${color}`}
		>
			{isChecked && !isMine && surroundingMines !== 0 && surroundingMines}
			{isMarked && <FlagTriangleRight size={16} />}
		</button>
	);
};
