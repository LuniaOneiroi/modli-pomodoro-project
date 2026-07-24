import type { Task, TaskPriority, TaskStatus } from './types';

interface NewTaskInput {
	projectId: string;
	title: string;
	category: string;
	priority: TaskPriority;
	estimatedSessions: number;
	notes?: string;
}

export function createTaskRecord(
	input: NewTaskInput,
	idFactory: () => string = () => crypto.randomUUID(),
	now: () => string = () => new Date().toISOString(),
): Task {
	const timestamp = now();
	const title = input.title.trim();
	const category = input.category.trim();
	const notes = input.notes?.trim() ?? '';

	return {
		id: idFactory(),
		title,
		category,
		status: 'in_progress' as TaskStatus,
		priority: input.priority,
		notes,
		projectId: input.projectId,
		estimatedSessions: Math.max(0, input.estimatedSessions),
		completedSessions: 0,
		createdAt: timestamp,
		updatedAt: timestamp,
	};
}
