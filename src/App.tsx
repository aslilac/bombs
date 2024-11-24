import { useRef, useState, useSyncExternalStore } from "react";
import Difficulties from "./Difficulties.ts";
import { Minefield, type Point } from "./Minefield.ts";
import { Options } from "./Options.tsx";
import { Tile } from "./Tile.tsx";
import { useTimer } from "./useTimer.ts";

const App: React.FC = () => {
	const [showOptions, setShowOptions] = useState(false);
	const [dismissEndcard, setDismissEndcard] = useState(false);
	const [options, setOptions] = useState(Difficulties.EASY);
	const [time, restartTimer] = useTimer();

	const minefieldRef = useRef<Minefield | undefined>();
	if (!minefieldRef.current) {
		minefieldRef.current = new Minefield(options);
		restartTimer();
	}
	if (minefieldRef.current.options !== options) {
		minefieldRef.current.initialize(options);
		restartTimer();
	}

	const minefield = minefieldRef.current;
	const { grid, remainingTiles, detonated } = useSyncExternalStore(
		minefield.subscribe,
		minefield.getSnapshot,
	);

	const onNewGame = () => {
		minefield.initialize(options);
	};

	const onCheckTile = (at: Point) => {
		minefield.checkTile(at);
	};

	const onMarkTile = (at: Point) => {
		minefield.markTile(at);
	};

	return (
		<div className="min-h-dvh flex flex-col items-center justify-center gap-4">
			<div className="flex items-center justify-between gap-4">
				<button type="button" onClick={onNewGame}>
					New game
				</button>
				<button type="button" onClick={() => setShowOptions(true)}>
					Show options
				</button>
				{Math.floor(time / 1000)}
				{remainingTiles}
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
					initialOptions={{ mines: 10, width: 10, height: 10 }}
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
