import { useRef, useState, useSyncExternalStore } from "react";
import { Button } from "./Button.tsx";
import Difficulties from "./Difficulties.ts";
import { Minefield, type Point } from "./Minefield.ts";
import { Options } from "./Options.tsx";
import { Tile } from "./Tile.tsx";
import { useTimer } from "./useTimer.ts";

const App: React.FC = () => {
	const [showOptions, setShowOptions] = useState(false);
	const [dismissEndcard, setDismissEndcard] = useState(false);
	const [options, setOptions] = useState(Difficulties.EASY);

	const minefieldRef = useRef<Minefield | undefined>();
	if (!minefieldRef.current) {
		minefieldRef.current = new Minefield(options);
	}
	const minefield = minefieldRef.current;
	const { grid, remainingTiles, remainingFlagsToPlace, detonated } =
		useSyncExternalStore(minefield.subscribe, minefield.getSnapshot);

	const hasWon = remainingTiles <= 0;
	const hasLost = detonated;

	const [time, restartTimer] = useTimer({
		paused: showOptions,
		stopped: hasWon || hasLost,
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

	if (minefield.options !== options) {
		onNewGame();
	}

	return (
		<>
			<div className="min-h-dvh flex flex-col-reverse">
				<div className="flex p-2 items-center justify-between border-t border-gray-300">
					<div className="flex items-center justify-between gap-2">
						<Button onClick={onNewGame}>New game</Button>
						<Button disabled={hasWon || hasLost} onClick={onHint}>
							Hint
						</Button>
					</div>
					<Button onClick={() => setShowOptions(true)}>Show options</Button>
				</div>
				<div className="flex flex-col flex-grow items-center justify-center gap-4">
					<div className="flex items-center justify-between gap-4">
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-gray-500">
								Elapsed time
							</div>
							<time>{Math.floor(time / 1000)}</time>
						</div>
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-gray-500">
								Remaining tiles
							</div>
							<data>{remainingTiles}</data>
						</div>
						<div className="flex flex-col-reverse items-center">
							<div className="uppercase tracking-wide text-xs text-gray-500">
								Flags to place
							</div>
							<data>{remainingFlagsToPlace}</data>
						</div>
					</div>

					<div className="flex gap-2 max-w-dvw max-h-dvh overflow-scroll px-4">
						{grid.map((column, x) => (
							<div key={x} className="flex flex-col gap-2">
								{column.map((tile, y) => (
									<Tile
										key={y}
										onMark={(event) => {
											event.preventDefault();
											onMarkTile(tile.position);
										}}
										onCheck={() => {
											onCheckTile(tile.position);
										}}
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
						<div className="w-72 py-2 text-center text-lg border rounded-lg border-emerald-500 bg-emerald-50 text-emerald-900">
							You won! c:
						</div>
					)}

					{hasLost && !dismissEndcard && (
						<div className="w-72 py-2 text-center text-lg border rounded-lg border-pink-500 bg-pink-50 text-pink-900">
							You blew up a mine :c
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
