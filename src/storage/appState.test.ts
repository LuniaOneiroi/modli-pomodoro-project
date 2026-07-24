import { describe, expect, it } from 'vitest';
import { SAMPLE_PROJECTS, SAMPLE_TASKS } from '../data/sampleData';
import { DEFAULT_SETTINGS } from '../domain/timer';
import { parsePersistedAppState } from './appState';

describe('persisted app state', () => {
	it('accepts a complete version-one state', () => {
		const state = {
			version: 1,
			projects: SAMPLE_PROJECTS,
			tasks: SAMPLE_TASKS,
			sessions: [],
			settings: DEFAULT_SETTINGS,
			selectedProjectId: SAMPLE_PROJECTS[0]!.project.id,
			selectedFocusTaskId: null,
			activeSessionId: null,
			windowMode: 'compact',
		};

		expect(parsePersistedAppState(state)).toEqual(state);
	});

	it('rejects malformed state before it reaches the UI', () => {
		const malformed = {
			version: 1,
			projects: SAMPLE_PROJECTS,
			tasks: [{ ...SAMPLE_TASKS[0], estimatedSessions: -1 }],
			sessions: [],
			settings: DEFAULT_SETTINGS,
			selectedProjectId: SAMPLE_PROJECTS[0]!.project.id,
			selectedFocusTaskId: null,
			activeSessionId: null,
			windowMode: 'compact',
		};

		expect(parsePersistedAppState(malformed)).toBeNull();
	});

	it('adds safe defaults when loading a legacy version-one state', () => {
		const legacyState = {
			version: 1,
			projects: SAMPLE_PROJECTS,
			tasks: SAMPLE_TASKS,
			settings: DEFAULT_SETTINGS,
			selectedProjectId: SAMPLE_PROJECTS[0]!.project.id,
			windowMode: 'compact',
			timer: {
				mode: 'focus',
				status: 'idle',
				remainingSeconds: 1500,
				totalSeconds: 1500,
				targetTimestamp: null,
			},
		};

		expect(parsePersistedAppState(legacyState)).toMatchObject({
			sessions: [],
			selectedFocusTaskId: null,
			activeSessionId: null,
			timer: { completedFocusSessions: 0 },
		});
	});
});
