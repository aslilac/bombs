import { useEffect, useRef, useSyncExternalStore } from "react";

class Timer {
	#startTime = new Date();
	#lastAnimationRequest?: ReturnType<typeof requestAnimationFrame>;

	#pausedAt?: Date;
	#pausedFor = 0;
	#stopped = false;

	#subscribers = new Set<() => void>();
	#snapshot: number = 0;

	constructor() {
		this.#startNextTimer();
	}

	[Symbol.dispose]() {
		this.#stopTimer();
	}

	#startNextTimer() {
		this.#lastAnimationRequest = requestAnimationFrame(() => {
			this.#notify();
			this.#startNextTimer();
		});
	}

	#stopTimer() {
		if (this.#lastAnimationRequest !== undefined) {
			cancelAnimationFrame(this.#lastAnimationRequest);
			this.#lastAnimationRequest = undefined;
		}
	}

	start = () => {
		if (this.#stopped) {
			this.#stopped = false;
			this.#startTime = new Date();
			this.#pausedAt = undefined;
		}

		if (this.#pausedAt) {
			this.#pausedFor += Date.now() - this.#pausedAt.getTime();
			this.#pausedAt = undefined;
		}

		if (!this.#lastAnimationRequest) {
			this.#startNextTimer();
		}
	};

	pause = () => {
		if (this.#stopped || this.#pausedAt) {
			return;
		}
		this.#pausedAt = new Date();
		this.#stopTimer();
		this.#notify();
	};

	stop = () => {
		if (this.#stopped) {
			return;
		}
		this.#stopped = true;
		this.#pausedAt = undefined;
		this.#stopTimer();
		this.#notify();
	};

	restart = () => {
		this.#startTime = new Date();
		this.#pausedAt = undefined;
		this.#pausedFor = 0;
		this.#notify();
	};

	#notify() {
		this.#snapshot = Date.now() - this.#startTime.getTime() - this.#pausedFor;
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

	getSnapshot = (): number => {
		return this.#snapshot;
	};
}

type UseTimerOptions = {
	paused?: boolean;
	stopped?: boolean;
};

export function useTimer(options: UseTimerOptions = {}) {
	const { paused = false, stopped = false } = options;
	const timerRef = useRef<Timer | undefined>(undefined);
	if (!timerRef.current) {
		timerRef.current = new Timer();
		if (stopped) {
			timerRef.current.stop();
		} else if (paused) {
			timerRef.current.pause();
		}
	}

	useEffect(() => {
		if (!timerRef.current) {
			return;
		}

		if (stopped) {
			timerRef.current.stop();
		} else if (paused) {
			timerRef.current.pause();
		} else {
			timerRef.current.start();
		}
	}, [paused, stopped]);

	useEffect(() => {
		// clean-up only

		return () => {
			if (!timerRef.current) {
				return;
			}
			timerRef.current[Symbol.dispose]();
			timerRef.current = undefined;
		};
	}, []);

	const timer = timerRef.current;
	const time = useSyncExternalStore(timer.subscribe, timer.getSnapshot);

	return [time, timer.restart] as const;
}
