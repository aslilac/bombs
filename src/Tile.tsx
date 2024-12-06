import { Bomb, FlagTriangleRight } from "lucide";
import { useMemo } from "react";
import classes from "./classes.ts";

type TileProps = {
	onMark: (event: React.SyntheticEvent) => void;
	onCheck: () => void;
	isGameOver: boolean;
	isMine: boolean;
	isChecked: boolean;
	isMarked: boolean;
	surroundingMines: number;
};

export const Tile: React.FunctionComponent<TileProps> = ({
	onCheck,
	onMark,
	isGameOver,
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
			return "border-stone-700 text-black";
		}

		if (!isChecked) {
			return classes`
				text-stone-800 border-stone-300
				${!isGameOver && "hover:border-stone-950 hover:background-stone-50"}
			`;
		}

		if (isMine) {
			return "bg-pink-200 border-pink-700 text-pink-700";
		}

		switch (surroundingMines) {
			case 0:
				return "border-stone-700";
			case 1:
				return "border-blue-700 text-blue-700";
			case 2:
				return "border-emerald-700 text-emerald-700";
			case 3:
				return "border-lime-600 text-lime-600";
			case 4:
				return "border-yellow-600 text-yellow-600";
			default:
				return "border-amber-600 text-amber-600";
		}
	}, [isGameOver, isMarked, isChecked, isMine, surroundingMines]);

	return (
		<button
			type="button"
			onClick={onClick}
			onContextMenu={onMark}
			className={classes`
				flex items-center justify-center
				text-sm ${color}
				w-8 h-8 p-0 border rounded-md
				shadow-xs ${(!isMine || !isChecked) && "bg-button"}
				select-none transition-colors
			`}
		>
			{isMine
				? (isChecked || isGameOver) && <Bomb size={16} />
				: isChecked && surroundingMines !== 0 && surroundingMines}
			{isMarked && <FlagTriangleRight size={16} />}
		</button>
	);
};
