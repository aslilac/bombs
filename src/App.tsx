import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "./Button.tsx";
import classes from "./classes.ts";
import Difficulties from "./Difficulties.ts";
import { Minefield, type Point } from "./Minefield.ts";
import { Options } from "./Options.tsx";
import { Tile } from "./Tile.tsx";
import { useTimer } from "./useTimer.ts";

const App: React.FunctionComponent = () => {
	const [showOptions, setShowOptions] = useState(false);
	const [dismissEndcard, setDismissEndcard] = useState(false);
	const [options, setOptions] = useState(Difficulties.EASY);

	const minefieldRef = useRef<Minefield | undefined>(undefined);
	if (!minefieldRef.current) {
		minefieldRef.current = new Minefield(options);
	}
	const minefield = minefieldRef.current;
	const { grid, remainingTiles, remainingFlagsToPlace, detonated, undos } =
		useSyncExternalStore(minefield.subscribe, minefield.getSnapshot);

	const hasWon = remainingTiles <= 0;
	const hasLost = detonated;

	const [time, restartTimer] = useTimer({
		paused: showOptions || hasWon || hasLost,
	});

	const onNewGame = () => {
		minefield.initialize(options);
		setDismissEndcard(false);
		restartTimer();
	};

	const onHint = () => {
		minefield.hint();
	};

	const onMarkTile = (at: Point) => {
		minefield.markTile(at);
	};

	const onCheckTile = (at: Point) => {
		minefield.checkTile(at);
	};

	const onUndo = () => {
		minefield.undo();
	};

	const preventDefault = (event: React.SyntheticEvent) => {
		event.preventDefault();
	};

	if (minefield.options !== options) {
		onNewGame();
	}

	return (
		<>
			<div className="h-dvh w-dvw flex flex-col-reverse">
				<div className="flex p-2 items-center justify-between border-t border-stone-300">
					<div className="flex items-center justify-between gap-2">
						<Button onClick={onNewGame}>New game</Button>
						<Button disabled={hasWon || hasLost} onClick={onHint}>
							Hint
						</Button>
					</div>
					<Button onClick={() => setShowOptions(true)}>Show options</Button>
				</div>

				<div className="flex flex-col flex-grow items-center justify-center overflow-y-auto gap-4 py-1">
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-stone-500">
								Elapsed time
							</div>
							<time>{Math.floor(time / 1000)}</time>
						</div>
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-stone-500">
								Remaining tiles
							</div>
							<data>{remainingTiles}</data>
						</div>
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-stone-500">
								Flags to place
							</div>
							<data>{remainingFlagsToPlace}</data>
						</div>
						{undos > 0 && (
							<div className="flex flex-col-reverse items-center">
								<div className="uppercase tracking-wide text-xs text-stone-500">
									Undos
								</div>
								<data>{undos}</data>
							</div>
						)}
					</div>

					<div
						onContextMenu={preventDefault}
						className="flex gap-2 max-w-full max-h-full overflow-x-auto scrollbar-hidden px-4 py-2"
					>
						{grid.map((column, x) => (
							<div key={x} className="flex flex-col gap-2">
								{column.map((tile, y) => (
									<Tile
										key={y}
										onMark={() => onMarkTile(tile.position)}
										onCheck={() => onCheckTile(tile.position)}
										isGameOver={hasWon || hasLost}
										isMine={tile.isMine}
										isChecked={tile.isChecked}
										isMarked={tile.isMarked}
										surroundingMines={tile.surroundingMines}
									/>
								))}
							</div>
						))}
					</div>

					{hasWon && !dismissEndcard && (
						<div className="flex items-center justify-between gap-2 min-w-72 p-2 text-lg border rounded-lg border-emerald-500 bg-emerald-50 text-emerald-900">
							<span className="px-2">You won! c:</span>
							<Button
								onClick={onNewGame}
								className={classes`border-emerald-300`}
							>
								New game
							</Button>
						</div>
					)}

					{hasLost && !dismissEndcard && (
						<div className="flex items-center justify-between gap-2 min-w-72 p-2 text-lg border rounded-lg border-pink-500 bg-pink-50 text-pink-900">
							<span className="px-2">You blew up a mine :c</span>
							<Button onClick={onNewGame} className="border-pink-200">
								New game
							</Button>
							<Button onClick={onUndo} className="border-pink-200">
								Undo
							</Button>
						</div>
					)}
				</div>
			</div>

			{showOptions && (
				<Options
					initialOptions={options}
					onCancel={() => setShowOptions(false)}
					updateOptions={(options) => {
						setOptions(options);
						setShowOptions(false);
					}}
				/>
			)}
		</>
	);
};

export default App;
