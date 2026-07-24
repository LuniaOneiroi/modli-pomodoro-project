import { describe, expect, it } from 'vitest';
import { createTaskRecord } from './tasks';
import type { TaskPriority } from './types';

describe('createTaskRecord', () => {
	it('creates a task with trimmed values and default state', () => {
		const task = createTaskRecord(
			{
				projectId: 'project-1',
				title: '  Draft the opening chapter  ',
				category: ' Writing ',
				priority: 'high' as TaskPriority,
				estimatedSessions: 3,
				notes: 'Keep it calm and clear.',
			},
			() => 'task-1',
			() => '2026-07-23T10:00:00.000Z',
		);

		expect(task).toEqual({
			id: 'task-1',
			title: 'Draft the opening chapter',
			category: 'Writing',
			status: 'in_progress',
			priority: 'high',
			notes: 'Keep it calm and clear.',
			projectId: 'project-1',
			estimatedSessions: 3,
			completedSessions: 0,
			createdAt: '2026-07-23T10:00:00.000Z',
			updatedAt: '2026-07-23T10:00:00.000Z',
		});
	});
});
