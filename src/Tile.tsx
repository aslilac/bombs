import { Bomb, FlagTriangleRight } from "lucide";
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

		if (isMine) {
			return "bg-red-200 border-red-700 text-red-700";
		}

		switch (surroundingMines) {
			case 0:
				return "border-gray-700";
			case 1:
				return "border-blue-700 text-blue-700";
			case 2:
				return "border-emerald-700 text-emerald-700";
			case 3:
				return "border-lime-600 text-lime-600";
			case 4:
				return "border-yellow-600 text-yellow-600";
			case 5:
			default:
				return "border-amber-600 text-amber-600";
		}
	}, [isMarked, isChecked, isMine, surroundingMines]);

	return (
		<button
			type="button"
			onClick={onClick}
			onContextMenu={onMark}
			className={classes`text-sm shadow-xs ${(!isMine || !isChecked) && "bg-button"} border rounded-md transition-colors select-none ${!isChecked && "border-gray-300 hover:border-gray-950 hover:background-gray-50"} flex items-center justify-center w-8 h-8 p-0 ${isChecked && "checked"} ${isMine && "mine"} ${color}`}
		>
			{isChecked &&
				(isMine ? (
					<Bomb size={16} />
				) : (
					surroundingMines !== 0 && surroundingMines
				))}
			{isMarked && <FlagTriangleRight size={16} />}
		</button>
	);
};
