import * as Random from "./Random.ts";

export type MinefieldOptions = {
	readonly mines: number;
	readonly width: number;
	readonly height: number;
};

export type Tile = {
	readonly position: Point;
	isMine: boolean;
	isChecked: boolean;
	isMarked: boolean;
	surroundingMines: number;
};

export type Point = {
	readonly x: number;
	readonly y: number;
};

type Snapshot = {
	readonly grid: Array<Array<Tile>>;
	readonly startTime: Date;
	readonly completionTime?: Date;
	readonly remainingTiles: number;
	readonly remainingFlagsToPlace: number;
	readonly detonated: boolean;
};

export class Minefield {
	#options!: MinefieldOptions;
	#grid!: Array<Array<Tile>>;
	#startTime!: Date;
	#completionTime?: Date;
	#remainingTiles!: number;
	#flagsPlaced!: number;
	#detonated!: boolean;

	#subscribers = new Set<() => void>();
	#snapshot?: Snapshot;

	get options() {
		return this.#options;
	}

	get isGameOver() {
		return this.#remainingTiles <= 0 || this.#detonated;
	}

	constructor(options: MinefieldOptions) {
		this.initialize(options);
	}

	initialize(options: MinefieldOptions) {
		this.#options = options;
		this.#grid = [];
		this.#startTime = new Date();
		this.#completionTime = undefined;
		this.#remainingTiles = options.width * options.height - options.mines;
		this.#flagsPlaced = 0;
		this.#detonated = false;

		for (let x = 0; x < options.width; x++) {
			const column: Array<Tile> = [];

			for (let y = 0; y < options.height; y++) {
				column.push({
					position: { x, y },
					isMine: false,
					isChecked: false,
					isMarked: false,
					surroundingMines: 0,
				});
			}

			this.#grid.push(column);
		}

		for (let mines = 0; mines < options.mines; mines++) {
			const x = Random.inRange(0, options.width);
			const y = Random.inRange(0, options.height);

			// Try again if this is already a mine
			if (this.#grid[x][y].isMine) {
				mines--;
				continue;
			}

			// If it's in one of the corners, try again
			if (
				(x === 0 || x === options.width - 1) &&
				(y === 0 || y === options.height - 1)
			) {
				mines--;
				continue;
			}

			this.#grid[x][y].isMine = true;
		}

		for (let x = 0; x < options.width; x++) {
			for (let y = 0; y < options.height; y++) {
				this.#grid[x][y].surroundingMines = this.#getNeighbors({
					x,
					y,
				}).reduce((i, it) => i + Number(it.isMine), 0);
			}
		}

		this.#notify();
	}

	#getNeighbors(at: Point): Tile[] {
		return [
			this.#grid[at.x - 1]?.[at.y - 1],
			this.#grid[at.x]?.[at.y - 1],
			this.#grid[at.x + 1]?.[at.y - 1],
			this.#grid[at.x - 1]?.[at.y],
			this.#grid[at.x + 1]?.[at.y],
			this.#grid[at.x - 1]?.[at.y + 1],
			this.#grid[at.x]?.[at.y + 1],
			this.#grid[at.x + 1]?.[at.y + 1],
		].filter(Boolean);
	}

	hint() {
		if (this.isGameOver) {
			return;
		}

		// We intentionally do not place mines in the corners. If the player hasn't
		// already cleared all of the corners then we can start by clearing those.
		const corners = [
			{ x: 0, y: 0 },
			{ x: this.#options.width - 1, y: 0 },
			{ x: 0, y: this.#options.height - 1 },
			{ x: this.#options.width - 1, y: this.#options.height - 1 },
		];
		for (const at of corners) {
			if (!this.#grid[at.x][at.y].isChecked) {
				this.checkTile(at);
				return;
			}
		}

		// Now that we definitely have some tiles cleared, we search for tiles near
		// tiles that are already clear which are not mines, and we pick one
		// randomly to reveal.
		const possibilities = new Set<Point>();

		for (const column of this.#grid) {
			for (const tile of column) {
				// If a tile is falsey marked, then that's a great hint to give. Unmark
				// it and then return.
				if (tile.isMarked && !tile.isMine) {
					tile.isMarked = false;
					this.#notify();
					return;
				}

				if (!tile.isChecked) {
					continue;
				}

				for (const neighbor of this.#getNeighbors(tile.position)) {
					if (neighbor.isChecked || neighbor.isMarked || neighbor.isMine) {
						continue;
					}

					possibilities.add(neighbor.position);
				}
			}
		}

		if (possibilities.size < 0) {
			// If somehow, the player has cleared all the corners, not marked anything
			// incorrectly, and is _entirely_ surrounded by mines, then just pick a
			// random tile and clear it.
			for (const column of this.#grid) {
				for (const tile of column) {
					if (tile.isChecked || tile.isMine) {
						continue;
					}

					possibilities.add(tile.position);
				}
			}
		}

		const at = Random.fromArray([...possibilities]);
		this.checkTile(at);
	}

	markTile(at: Point) {
		if (this.isGameOver) {
			return;
		}

		const tile = this.#grid[at.x][at.y];

		tile.isMarked = !tile.isMarked;

		this.#flagsPlaced += tile.isMarked ? 1 : -1;

		this.#notify();
	}

	checkTile(at: Point) {
		const tile = this.#grid[at.x][at.y];
		if (!tile || tile.isMarked || this.isGameOver) {
			return;
		}

		try {
			// If the tile is already checked and we click again, check everything
			// around it that hasn't been marked as a bomb by the player.
			if (tile.isChecked) {
				const neighbors = this.#getNeighbors(at);

				// If the number of marked neighbors is equal to the number that are
				// mines, then check all the remaining neighbors.
				if (
					neighbors.reduce((i, it) => i + Number(it.isMarked), 0) ===
					tile.surroundingMines
				) {
					for (const neighbor of neighbors) {
						if (!neighbor.isChecked) {
							this.checkTile(neighbor.position);
						}
					}
				}

				// If all remaining unchecked neighbors must be mines, then mark all of
				// them as mines.
				if (
					neighbors.reduce(
						(i, it) => i + Number(it.isMarked || !it.isChecked),
						0,
					) === tile.surroundingMines
				) {
					for (const neighbor of neighbors) {
						if (!neighbor.isMarked && !neighbor.isChecked) {
							this.markTile(neighbor.position);
						}
					}
				}

				return;
			}

			tile.isChecked = true;

			// If it's a mine, we're done
			if (tile.isMine) {
				this.#detonated = true;
				return;
			}

			this.#remainingTiles--;

			// If there aren't any mines surrounding the file, then we can check all
			// of them automatically to save the player a few clicks
			if (tile.surroundingMines === 0) {
				const neighbors = this.#getNeighbors(at);
				for (const neighbor of neighbors) {
					if (!neighbor.isChecked) {
						this.checkTile(neighbor.position);
					}
				}
			}

			if (this.#remainingTiles === 0) {
				this.#completionTime = new Date();
			}
		} finally {
			this.#notify();
		}
	}

	#notify() {
		this.#snapshot = undefined;
		for (const subscriber of this.#subscribers) {
			subscriber();
		}
	}

	subscribe = (subscriber: () => void): (() => void) => {
		this.#subscribers.add(subscriber);
		return () => {
			this.#subscribers.delete(subscriber);
		};
	};

	getSnapshot = (): Snapshot => {
		if (!this.#snapshot) {
			this.#snapshot = {
				grid: this.#grid.map((column) => [
					...column.map((tile) => ({
						...tile,
					})),
				]),
				startTime: new Date(this.#startTime),
				completionTime: this.#completionTime && new Date(this.#completionTime),
				remainingTiles: this.isGameOver ? 0 : this.#remainingTiles,
				remainingFlagsToPlace: this.isGameOver
					? 0
					: this.options.mines - this.#flagsPlaced,
				detonated: this.#detonated,
			};
		}

		return this.#snapshot;
	};
}
