import { z } from 'zod';

const windowModeSchema = z.enum(['compact', 'expanded']);

const projectWorkspaceSchema = z.object({
	project: z.object({
		id: z.string().min(1),
		name: z.string(),
		imageId: z.string().optional(),
		accentColor: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	}),
	summary: z.string(),
	focusStreak: z.number().int().nonnegative(),
	isSample: z.boolean(),
});

const taskSchema = z.object({
	id: z.string().min(1),
	title: z.string(),
	category: z.string(),
	status: z.enum(['in_progress', 'completed', 'cancelled', 'archived']),
	priority: z.enum(['low', 'medium', 'high']),
	notes: z.string(),
	projectId: z.string().min(1),
	estimatedSessions: z.number().int().nonnegative(),
	completedSessions: z.number().int().nonnegative(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

const settingsSchema = z.object({
	focusMinutes: z.number().int().positive(),
	breakMinutes: z.number().int().positive(),
	longBreakMinutes: z.number().int().positive(),
	focusSessionsBeforeLongBreak: z.number().int().positive(),
	autoStartBreaks: z.boolean(),
	autoStartFocus: z.boolean(),
	soundEnabled: z.boolean(),
	volume: z.number().min(0).max(1),
	notificationsEnabled: z.boolean(),
	alwaysOnTop: z.boolean(),
	rememberWindow: z.boolean(),
	reducedMotion: z.boolean(),
	backgroundMotion: z.boolean(),
	glowIntensity: z.number().min(0).max(1),
	theme: z.enum(['hybrid', 'liminal', 'constellation']),
	lastProjectId: z.string().optional(),
	lastWindowMode: windowModeSchema,
});

const timerSnapshotSchema = z.object({
	mode: z.enum(['focus', 'break']),
	status: z.enum(['idle', 'running', 'paused']),
	remainingSeconds: z.number().int().nonnegative(),
	totalSeconds: z.number().int().positive(),
	targetTimestamp: z.number().nullable(),
	breakKind: z.enum(['short', 'long']).optional(),
});

export const persistedAppStateSchema = z.object({
	version: z.literal(1),
	projects: z.array(projectWorkspaceSchema),
	tasks: z.array(taskSchema),
	settings: settingsSchema,
	selectedProjectId: z.string(),
	windowMode: windowModeSchema,
	timer: timerSnapshotSchema.optional(),
});

export type PersistedAppState = z.infer<typeof persistedAppStateSchema>;

export function parsePersistedAppState(
	value: unknown,
): PersistedAppState | null {
	const result = persistedAppStateSchema.safeParse(value);
	return result.success ? result.data : null;
}
