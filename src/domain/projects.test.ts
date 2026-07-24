import { describe, expect, it } from 'vitest';
import { SAMPLE_TASKS } from '../data/sampleData';
import {
	activeHighPriorityTasks,
	calculateProjectStatistics,
} from './projects';
import type { Task } from './types';

describe('project statistics', () => {
	it('calculates progress and session totals from eligible tasks', () => {
		const statistics = calculateProjectStatistics(
			SAMPLE_TASKS,
			'dream-architecture',
		);

		expect(statistics).toEqual({
			completedTasks: 3,
			totalTasks: 7,
			progressPercent: 43,
			estimatedSessions: 23,
			completedSessions: 15,
		});
	});

	it('returns zero progress when a project has no eligible tasks', () => {
		expect(calculateProjectStatistics([], 'new-project')).toEqual({
			completedTasks: 0,
			totalTasks: 0,
			progressPercent: 0,
			estimatedSessions: 0,
			completedSessions: 0,
		});
	});

	it('excludes cancelled and archived tasks from progress', () => {
		const excludedTasks: Task[] = [
			{
				...SAMPLE_TASKS[0]!,
				id: 'cancelled',
				status: 'cancelled',
			},
			{
				...SAMPLE_TASKS[0]!,
				id: 'archived',
				status: 'archived',
			},
		];

		expect(
			calculateProjectStatistics(excludedTasks, 'dream-architecture')
				.totalTasks,
		).toBe(0);
	});

	it('shows only active high-priority tasks for the selected project', () => {
		const tasks = activeHighPriorityTasks(SAMPLE_TASKS, 'dream-architecture');

		expect(tasks).toHaveLength(4);
		expect(tasks.every((task) => task.status === 'in_progress')).toBe(true);
		expect(tasks.every((task) => task.priority === 'high')).toBe(true);
	});
});
