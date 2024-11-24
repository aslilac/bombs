import type { MinefieldOptions } from "./Minefield";

export default {
	EASY: { mines: 10, width: 9, height: 9 },
	MEDIUM: { mines: 40, width: 16, height: 16 },
	HARD: { mines: 99, width: 30, height: 16 },
	EXPERT: { mines: 145, width: 30, height: 20 },
} satisfies Record<string, MinefieldOptions>;
