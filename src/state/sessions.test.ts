import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS, SAMPLE_TASKS } from '../data/sampleData';
import {
	abandonPomodoroSession,
	completePomodoroSession,
	createPomodoroSession,
} from './sessions';

const startedAt = '2026-07-24T12:00:00.000Z';
const endedAt = '2026-07-24T12:25:00.000Z';

describe('Pomodoro session state', () => {
	it('completes a linked Focus session through one idempotent action', () => {
		const task = SAMPLE_TASKS[0]!;
		const session = createPomodoroSession(
			{
				mode: 'focus',
				totalSeconds: 1500,
				projectId: task.projectId,
				taskId: task.id,
			},
			() => 'session-1',
			() => startedAt,
		);

		const firstCompletion = completePomodoroSession(
			{
				sessions: [session],
				tasks: structuredClone(SAMPLE_TASKS),
				projects: structuredClone(SAMPLE_PROJECTS),
			},
			session.id,
			endedAt,
		);
		const completedTask = firstCompletion.tasks.find(
			(item) => item.id === task.id,
		);
		const completedProject = firstCompletion.projects.find(
			(item) => item.project.id === task.projectId,
		);

		expect(firstCompletion.completedSession).toMatchObject({
			id: session.id,
			completed: true,
			completedMinutes: 25,
			endedAt,
		});
		expect(completedTask?.completedSessions).toBe(task.completedSessions + 1);
		expect(completedProject?.focusStreak).toBe(
			SAMPLE_PROJECTS[0]!.focusStreak + 1,
		);

		const duplicateCompletion = completePomodoroSession(
			firstCompletion,
			session.id,
			endedAt,
		);
		expect(duplicateCompletion.completedSession).toBeNull();
		expect(
			duplicateCompletion.tasks.find((item) => item.id === task.id)
				?.completedSessions,
		).toBe(task.completedSessions + 1);
	});

	it('records a standalone Focus session without changing a task', () => {
		const session = createPomodoroSession(
			{
				mode: 'focus',
				totalSeconds: 1500,
				projectId: SAMPLE_PROJECTS[0]!.project.id,
			},
			() => 'session-2',
			() => startedAt,
		);
		const result = completePomodoroSession(
			{
				sessions: [session],
				tasks: structuredClone(SAMPLE_TASKS),
				projects: structuredClone(SAMPLE_PROJECTS),
			},
			session.id,
			endedAt,
		);

		expect(result.completedSession?.taskId).toBeUndefined();
		expect(result.tasks).toEqual(SAMPLE_TASKS);
		expect(result.projects[0]!.focusStreak).toBe(
			SAMPLE_PROJECTS[0]!.focusStreak + 1,
		);
	});

	it('ends a reset session without counting it as completed', () => {
		const session = createPomodoroSession(
			{ mode: 'focus', totalSeconds: 1500 },
			() => 'session-3',
			() => startedAt,
		);

		expect(
			abandonPomodoroSession([session], session.id, 185, endedAt)[0],
		).toMatchObject({
			completed: false,
			completedMinutes: 3,
			endedAt,
		});
	});
});
