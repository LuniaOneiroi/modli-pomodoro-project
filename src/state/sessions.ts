import type {
	PomodoroSession,
	ProjectWorkspace,
	Task,
	TimerMode,
} from '../domain/types';

interface NewSessionInput {
	mode: TimerMode;
	totalSeconds: number;
	projectId?: string;
	taskId?: string;
}

interface SessionState {
	sessions: PomodoroSession[];
	tasks: Task[];
	projects: ProjectWorkspace[];
}

export function createPomodoroSession(
	input: NewSessionInput,
	idFactory: () => string = () => crypto.randomUUID(),
	now: () => string = () => new Date().toISOString(),
): PomodoroSession {
	return {
		id: idFactory(),
		mode: input.mode,
		...(input.projectId ? { projectId: input.projectId } : {}),
		...(input.mode === 'focus' && input.taskId ? { taskId: input.taskId } : {}),
		plannedMinutes: Math.max(1, Math.ceil(input.totalSeconds / 60)),
		completedMinutes: 0,
		completed: false,
		startedAt: now(),
	};
}

export function completePomodoroSession(
	state: SessionState,
	sessionId: string | null,
	endedAt: string = new Date().toISOString(),
): SessionState & { completedSession: PomodoroSession | null } {
	const session = state.sessions.find((item) => item.id === sessionId);
	if (!session || session.completed || session.endedAt) {
		return { ...state, completedSession: null };
	}

	const completedSession: PomodoroSession = {
		...session,
		completedMinutes: session.plannedMinutes,
		completed: true,
		endedAt,
	};
	const sessions = state.sessions.map((item) =>
		item.id === session.id ? completedSession : item,
	);

	if (session.mode !== 'focus') {
		return { ...state, sessions, completedSession };
	}

	const tasks = session.taskId
		? state.tasks.map((task) =>
				task.id === session.taskId
					? {
							...task,
							completedSessions: task.completedSessions + 1,
							updatedAt: endedAt,
						}
					: task,
			)
		: state.tasks;
	const projects = session.projectId
		? state.projects.map((workspace) =>
				workspace.project.id === session.projectId
					? {
							...workspace,
							focusStreak: workspace.focusStreak + 1,
						}
					: workspace,
			)
		: state.projects;

	return { sessions, tasks, projects, completedSession };
}

export function abandonPomodoroSession(
	sessions: PomodoroSession[],
	sessionId: string | null,
	elapsedSeconds: number,
	endedAt: string = new Date().toISOString(),
): PomodoroSession[] {
	if (!sessionId) return sessions;
	return sessions.map((session) =>
		session.id === sessionId && !session.completed && !session.endedAt
			? {
					...session,
					completedMinutes: Math.min(
						session.plannedMinutes,
						Math.max(0, Math.floor(elapsedSeconds / 60)),
					),
					endedAt,
				}
			: session,
	);
}
