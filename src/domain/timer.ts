import type { ModLiSettings, TimerMode, TimerSnapshot } from './types';

export const DEFAULT_SETTINGS: ModLiSettings = {
	focusMinutes: 25,
	breakMinutes: 5,
	longBreakMinutes: 15,
	focusSessionsBeforeLongBreak: 4,
	autoStartBreaks: false,
	autoStartFocus: false,
	soundEnabled: true,
	volume: 0.7,
	notificationsEnabled: false,
	alwaysOnTop: false,
	rememberWindow: true,
	reducedMotion: false,
	backgroundMotion: true,
	glowIntensity: 0.65,
	theme: 'hybrid',
	lastWindowMode: 'compact',
};

export function durationInSeconds(
	mode: TimerMode,
	settings: ModLiSettings,
): number {
	return (
		(mode === 'focus' ? settings.focusMinutes : settings.breakMinutes) * 60
	);
}

export function remainingFromTarget(
	targetTimestamp: number,
	now: number,
): number {
	return Math.max(0, Math.ceil((targetTimestamp - now) / 1000));
}

export function nextTimerMode(mode: TimerMode): TimerMode {
	return mode === 'focus' ? 'break' : 'focus';
}

export function formatTimer(seconds: number): string {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function timerProgress(snapshot: TimerSnapshot): number {
	if (snapshot.totalSeconds <= 0) return 0;
	return Math.min(
		1,
		Math.max(0, 1 - snapshot.remainingSeconds / snapshot.totalSeconds),
	);
}

type TimerListener = (snapshot: TimerSnapshot) => void;
type CompletionListener = (completedMode: TimerMode) => void;

export class PomodoroTimer {
	#settings: ModLiSettings;
	#snapshot: TimerSnapshot;
	#listeners = new Set<TimerListener>();
	#onComplete: CompletionListener;
	#now: () => number;
	#intervalId: ReturnType<typeof globalThis.setInterval> | null = null;
	#completedFocusSessions = 0;

	constructor(
		settings: ModLiSettings = DEFAULT_SETTINGS,
		onComplete: CompletionListener = () => undefined,
		now: () => number = Date.now,
	) {
		this.#settings = settings;
		this.#onComplete = onComplete;
		this.#now = now;
		const totalSeconds = durationInSeconds('focus', settings);
		this.#snapshot = {
			mode: 'focus',
			status: 'idle',
			remainingSeconds: totalSeconds,
			totalSeconds,
			targetTimestamp: null,
		};
	}

	get snapshot(): TimerSnapshot {
		return { ...this.#snapshot };
	}

	subscribe(listener: TimerListener): () => void {
		this.#listeners.add(listener);
		listener(this.snapshot);
		return () => this.#listeners.delete(listener);
	}

	start(): void {
		if (this.#snapshot.status === 'running') return;
		this.#snapshot.status = 'running';
		this.#snapshot.targetTimestamp =
			this.#now() + this.#snapshot.remainingSeconds * 1000;
		this.#beginTicking();
		this.#emit();
	}

	pause(): void {
		if (
			this.#snapshot.status !== 'running' ||
			this.#snapshot.targetTimestamp === null
		)
			return;
		this.#snapshot.remainingSeconds = remainingFromTarget(
			this.#snapshot.targetTimestamp,
			this.#now(),
		);
		this.#snapshot.targetTimestamp = null;
		this.#snapshot.status = 'paused';
		this.#stopTicking();
		this.#emit();
	}

	reset(): void {
		this.#stopTicking();
		const totalSeconds = durationInSeconds(this.#snapshot.mode, this.#settings);
		this.#snapshot = {
			mode: this.#snapshot.mode,
			status: 'idle',
			remainingSeconds: totalSeconds,
			totalSeconds,
			targetTimestamp: null,
		};
		this.#emit();
	}

	updateSettings(settings: ModLiSettings): void {
		this.#settings = settings;
		if (this.#snapshot.status !== 'running') {
			const totalSeconds = durationInSeconds(
				this.#snapshot.mode,
				this.#settings,
			);
			this.#snapshot = {
				...this.#snapshot,
				status: 'idle',
				remainingSeconds: totalSeconds,
				totalSeconds,
				targetTimestamp: null,
				...(this.#snapshot.mode === 'break'
					? { breakKind: 'short' as const }
					: {}),
			};
			this.#emit();
		}
	}

	restore(snapshot: TimerSnapshot): void {
		this.#stopTicking();
		this.#snapshot = {
			...snapshot,
			remainingSeconds: Math.max(0, snapshot.remainingSeconds),
			totalSeconds: Math.max(1, snapshot.totalSeconds),
		};
		if (
			this.#snapshot.status === 'running' &&
			this.#snapshot.targetTimestamp !== null
		) {
			this.#beginTicking();
			this.tick();
		}
		this.#emit();
	}

	setMode(mode: TimerMode): void {
		if (mode === this.#snapshot.mode) return;
		this.#stopTicking();
		const totalSeconds = durationInSeconds(mode, this.#settings);
		this.#snapshot = {
			mode,
			status: 'idle',
			remainingSeconds: totalSeconds,
			totalSeconds,
			targetTimestamp: null,
		};
		this.#emit();
	}

	tick(): void {
		if (
			this.#snapshot.status !== 'running' ||
			this.#snapshot.targetTimestamp === null
		)
			return;
		const remainingSeconds = remainingFromTarget(
			this.#snapshot.targetTimestamp,
			this.#now(),
		);
		if (remainingSeconds <= 0) {
			this.#finishSession();
			return;
		}
		if (remainingSeconds !== this.#snapshot.remainingSeconds) {
			this.#snapshot.remainingSeconds = remainingSeconds;
			this.#emit();
		}
	}

	destroy(): void {
		this.#stopTicking();
		this.#listeners.clear();
	}

	#finishSession(): void {
		const completedMode = this.#snapshot.mode;
		const mode = nextTimerMode(completedMode);
		if (completedMode === 'focus') this.#completedFocusSessions += 1;
		const isLongBreak =
			completedMode === 'focus' &&
			this.#completedFocusSessions %
				Math.max(1, this.#settings.focusSessionsBeforeLongBreak) ===
				0;
		const totalSeconds =
			mode === 'break' && isLongBreak
				? this.#settings.longBreakMinutes * 60
				: durationInSeconds(mode, this.#settings);
		const shouldAutoStart =
			mode === 'break'
				? this.#settings.autoStartBreaks
				: this.#settings.autoStartFocus;
		this.#stopTicking();
		this.#snapshot = {
			mode,
			status: shouldAutoStart ? 'running' : 'idle',
			remainingSeconds: totalSeconds,
			totalSeconds,
			targetTimestamp: shouldAutoStart
				? this.#now() + totalSeconds * 1000
				: null,
			...(mode === 'break'
				? { breakKind: isLongBreak ? 'long' : 'short' }
				: {}),
		};
		this.#onComplete(completedMode);
		if (shouldAutoStart) this.#beginTicking();
		this.#emit();
	}

	#beginTicking(): void {
		this.#stopTicking();
		this.#intervalId = globalThis.setInterval(() => this.tick(), 250);
	}

	#stopTicking(): void {
		if (this.#intervalId !== null) {
			globalThis.clearInterval(this.#intervalId);
			this.#intervalId = null;
		}
	}

	#emit(): void {
		const snapshot = this.snapshot;
		for (const listener of this.#listeners) listener(snapshot);
	}
}
