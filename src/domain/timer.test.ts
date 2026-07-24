import { describe, expect, it, vi } from 'vitest';
import {
	DEFAULT_SETTINGS,
	PomodoroTimer,
	durationInSeconds,
	formatTimer,
	remainingFromTarget,
	timerProgress,
} from './timer';

describe('timer calculations', () => {
	it('uses the canonical focus and break durations', () => {
		expect(durationInSeconds('focus', DEFAULT_SETTINGS)).toBe(1500);
		expect(durationInSeconds('break', DEFAULT_SETTINGS)).toBe(300);
	});

	it('derives remaining time from a target timestamp', () => {
		expect(remainingFromTarget(10_000, 8_501)).toBe(2);
		expect(remainingFromTarget(10_000, 11_000)).toBe(0);
	});

	it('formats time and clamps progress', () => {
		expect(formatTimer(65)).toBe('01:05');
		expect(
			timerProgress({
				mode: 'focus',
				status: 'running',
				remainingSeconds: 750,
				totalSeconds: 1500,
				targetTimestamp: 1,
			}),
		).toBe(0.5);
	});
});

describe('PomodoroTimer', () => {
	it('starts, pauses, resumes, and resets without interval drift', () => {
		let now = 1_000;
		const timer = new PomodoroTimer(DEFAULT_SETTINGS, undefined, () => now);

		timer.start();
		expect(timer.snapshot.targetTimestamp).toBe(1_501_000);

		now += 10_400;
		timer.pause();
		expect(timer.snapshot.remainingSeconds).toBe(1490);
		expect(timer.snapshot.status).toBe('paused');

		now += 50_000;
		timer.start();
		expect(timer.snapshot.targetTimestamp).toBe(now + 1_490_000);

		timer.reset();
		expect(timer.snapshot).toMatchObject({
			mode: 'focus',
			status: 'idle',
			remainingSeconds: 1500,
		});
		timer.destroy();
	});

	it('switches to a stopped break after focus completes', () => {
		let now = 0;
		const onComplete = vi.fn();
		const timer = new PomodoroTimer(DEFAULT_SETTINGS, onComplete, () => now);

		timer.start();
		now = 1_500_000;
		timer.tick();

		expect(onComplete).toHaveBeenCalledOnce();
		expect(onComplete).toHaveBeenCalledWith('focus');
		expect(timer.snapshot).toMatchObject({
			mode: 'break',
			status: 'idle',
			remainingSeconds: 300,
			targetTimestamp: null,
		});
		timer.destroy();
	});

	it('uses a long break after the configured focus interval', () => {
		let now = 0;
		const timer = new PomodoroTimer(
			{
				...DEFAULT_SETTINGS,
				focusMinutes: 1,
				focusSessionsBeforeLongBreak: 2,
				longBreakMinutes: 12,
			},
			undefined,
			() => now,
		);

		timer.start();
		now = 60_000;
		timer.tick();
		timer.start();
		now += 300_000;
		timer.tick();
		timer.start();
		now += 60_000;
		timer.tick();

		expect(timer.snapshot).toMatchObject({
			mode: 'break',
			breakKind: 'long',
			remainingSeconds: 720,
		});
		timer.destroy();
	});

	it('can automatically begin the next break', () => {
		let now = 0;
		const timer = new PomodoroTimer(
			{ ...DEFAULT_SETTINGS, focusMinutes: 1, autoStartBreaks: true },
			undefined,
			() => now,
		);

		timer.start();
		now = 60_000;
		timer.tick();

		expect(timer.snapshot).toMatchObject({
			mode: 'break',
			status: 'running',
			targetTimestamp: 360_000,
		});
		timer.destroy();
	});

	it('resolves an expired restored timer exactly once', () => {
		const onComplete = vi.fn();
		const timer = new PomodoroTimer(DEFAULT_SETTINGS, onComplete, () => 20_000);

		timer.restore({
			mode: 'focus',
			status: 'running',
			remainingSeconds: 5,
			totalSeconds: 1500,
			targetTimestamp: 10_000,
		});
		timer.tick();

		expect(onComplete).toHaveBeenCalledOnce();
		expect(timer.snapshot.mode).toBe('break');
		timer.destroy();
	});
});
