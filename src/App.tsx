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
	const { grid, remainingTiles, detonated } = useSyncExternalStore(
		minefield.subscribe,
		minefield.getSnapshot,
	);

	const [time, restartTimer] = useTimer({
		paused: showOptions,
		stopped: remainingTiles === 0 || detonated,
	});

	const onNewGame = () => {
		minefield.initialize(options);
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
		<div className="min-h-dvh flex flex-col items-center justify-center gap-4">
			<div className="flex items-center justify-between gap-4">
				<Button onClick={onNewGame}>New game</Button>
				<Button onClick={onHint}>Hint</Button>
				<Button onClick={() => setShowOptions(true)}>Show options</Button>
				<p>Time: {Math.floor(time / 1000)}</p>
				<p>Remaining tiles: {remainingTiles}</p>
			</div>
			{/* {grid.completed && showModal && (
				<div id="floating">
					<div id="modal">
						<h1 id="modal-title">
							{grid.victory
								? `You took ${((grid.completed - grid.start!) / 1000).toFixed(
										1,
									)} seconds c:`
								: `You blew up a mine :c`}
						</h1>
						<button id="modal-okay" onClick={startNewGame}>
							{grid.victory ? "Yay c:" : "Aww :c"}
						</button>
						<button id="modal-close" onClick={() => setShowModal(false)}>
							See it
						</button>
					</div>
				</div>
			)} */}

			<div className="minefield flex gap-2">
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
								isMine={tile.isMine}
								isChecked={tile.isChecked}
								isMarked={tile.isMarked}
								surroundingMines={tile.surroundingMines}
							/>
						))}
					</div>
				))}
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
		</div>
	);
};

export default App;
