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
	readonly detonated: boolean;
};

export class Minefield {
	#options!: MinefieldOptions;
	#grid!: Array<Array<Tile>>;
	#startTime!: Date;
	#completionTime?: Date;
	#remainingTiles!: number;
	#detonated!: boolean;

	#subscribers = new Set<() => void>();
	#snapshot?: Snapshot;

	get options() {
		return this.#options;
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
			const x = Math.floor(Math.random() * options.width);
			const y = Math.floor(Math.random() * options.height);

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

	markTile(at: Point) {
		const tile = this.#grid[at.x][at.y];
		tile.isMarked = !tile.isMarked;

		this.#notify();
	}

	checkTile(at: Point) {
		const tile = this.#grid.at(at.x)?.at(at.y);
		if (!tile || tile.isMarked) {
			return;
		}

		try {
			// If the tile is already checked and we click again, check everything
			// around it that hasn't been marked as a bomb by the player.
			if (tile.isChecked) {
				const neighbors = this.#getNeighbors(at);
				for (const neighbor of neighbors) {
					if (!neighbor.isChecked) {
						this.checkTile(neighbor.position);
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
				remainingTiles: this.#remainingTiles,
				detonated: this.#detonated,
			};
		}

		return this.#snapshot;
	};
}
