export type TaskStatus = 'in_progress' | 'completed' | 'cancelled' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TimerMode = 'focus' | 'break';
export type TimerStatus = 'idle' | 'running' | 'paused';
export type WindowMode = 'compact' | 'expanded';
export type ModLiTheme = 'hybrid' | 'liminal' | 'constellation';

export interface Task {
	id: string;
	title: string;
	category: string;
	status: TaskStatus;
	priority: TaskPriority;
	notes: string;
	projectId: string;
	estimatedSessions: number;
	completedSessions: number;
	createdAt: string;
	updatedAt: string;
}

export interface Project {
	id: string;
	name: string;
	imageId?: string;
	accentColor: string;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectWorkspace {
	project: Project;
	summary: string;
	focusStreak: number;
	isSample: boolean;
}

export interface ProjectStatistics {
	completedTasks: number;
	totalTasks: number;
	progressPercent: number;
	estimatedSessions: number;
	completedSessions: number;
}

export interface PomodoroSession {
	id: string;
	mode: TimerMode;
	projectId?: string;
	taskId?: string;
	plannedMinutes: number;
	completedMinutes: number;
	completed: boolean;
	startedAt: string;
	endedAt?: string;
}

export interface ModLiSettings {
	focusMinutes: number;
	breakMinutes: number;
	longBreakMinutes: number;
	focusSessionsBeforeLongBreak: number;
	autoStartBreaks: boolean;
	autoStartFocus: boolean;
	soundEnabled: boolean;
	volume: number;
	notificationsEnabled: boolean;
	alwaysOnTop: boolean;
	rememberWindow: boolean;
	reducedMotion: boolean;
	backgroundMotion: boolean;
	glowIntensity: number;
	theme: ModLiTheme;
	lastProjectId?: string;
	lastWindowMode: WindowMode;
}

export interface TimerSnapshot {
	mode: TimerMode;
	status: TimerStatus;
	remainingSeconds: number;
	totalSeconds: number;
	targetTimestamp: number | null;
	breakKind?: 'short' | 'long';
}
