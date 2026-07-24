import type { ProjectStatistics, Task } from './types';

export function eligibleProjectTasks(tasks: Task[], projectId: string): Task[] {
	return tasks.filter(
		(task) =>
			task.projectId === projectId &&
			task.status !== 'archived' &&
			task.status !== 'cancelled',
	);
}

export function calculateProjectStatistics(
	tasks: Task[],
	projectId: string,
): ProjectStatistics {
	const eligibleTasks = eligibleProjectTasks(tasks, projectId);
	const completedTasks = eligibleTasks.filter(
		(task) => task.status === 'completed',
	).length;
	const totalTasks = eligibleTasks.length;

	return {
		completedTasks,
		totalTasks,
		progressPercent:
			totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
		estimatedSessions: eligibleTasks.reduce(
			(total, task) => total + task.estimatedSessions,
			0,
		),
		completedSessions: eligibleTasks.reduce(
			(total, task) => total + task.completedSessions,
			0,
		),
	};
}

export function activeHighPriorityTasks(
	tasks: Task[],
	projectId: string,
): Task[] {
	return tasks.filter(
		(task) =>
			task.projectId === projectId &&
			task.priority === 'high' &&
			task.status === 'in_progress',
	);
}
