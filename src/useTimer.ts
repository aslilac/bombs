import { useEffect, useRef, useSyncExternalStore } from "react";

class Timer {
	#startTime = new Date();
	#lastAnimationRequest!: ReturnType<typeof requestAnimationFrame>;
	#subscribers = new Set<() => void>();
	#snapshot: number = 0;

	constructor() {
		this.#startNextTimer();
	}

	#startNextTimer() {
		this.#lastAnimationRequest = requestAnimationFrame(() => {
			this.#notify();
			this.#startNextTimer();
		});
	}

	[Symbol.dispose]() {
		cancelAnimationFrame(this.#lastAnimationRequest);
	}

	#notify() {
		this.#snapshot = Date.now() - this.#startTime.getTime();
		for (const subscriber of this.#subscribers) {
			subscriber();
		}
	}

	restart = () => {
		this.#startTime = new Date();
		this.#snapshot = 0;
		this.#notify();
	};

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

export function useTimer() {
	const timerRef = useRef<Timer | undefined>();
	if (!timerRef.current) {
		timerRef.current = new Timer();
	}

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
