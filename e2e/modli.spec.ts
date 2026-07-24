import { expect, test, type Page } from '@playwright/test';

const APP_STATE_KEY = 'modli:state:v1';

interface StoredSession {
	id: string;
	mode: 'focus' | 'break';
	projectId?: string;
	taskId?: string;
	plannedMinutes: number;
	completedMinutes: number;
	completed: boolean;
	startedAt: string;
	endedAt?: string;
}

interface StoredState {
	sessions: StoredSession[];
	activeSessionId: string | null;
	selectedFocusTaskId: string | null;
	selectedProjectId: string;
	timer?: {
		mode: 'focus' | 'break';
		status: 'idle' | 'running' | 'paused';
	};
	tasks: Array<{
		id: string;
		completedSessions: number;
	}>;
	projects: Array<{
		project: { id: string; imageId?: string };
		focusStreak: number;
	}>;
}

async function openModLi(page: Page): Promise<void> {
	await page.goto('/');
	await expect(
		page.getByRole('article', { name: /ModLi compact timer/i }),
	).toBeVisible();
}

async function readStoredState(page: Page): Promise<StoredState> {
	await expect
		.poll(async () =>
			page.evaluate((key) => Boolean(localStorage.getItem(key)), APP_STATE_KEY),
		)
		.toBe(true);
	return page.evaluate(
		(key) => JSON.parse(localStorage.getItem(key) ?? 'null') as StoredState,
		APP_STATE_KEY,
	);
}

async function readIndexedImage(
	page: Page,
	imageId: string,
): Promise<{ size: number; type: string } | null> {
	return page.evaluate(
		({ databaseName, storeName, key }) =>
			new Promise((resolve, reject) => {
				const openRequest = indexedDB.open(databaseName, 1);
				openRequest.onerror = () => reject(openRequest.error);
				openRequest.onsuccess = () => {
					const database = openRequest.result;
					const transaction = database.transaction(storeName, 'readonly');
					const request = transaction.objectStore(storeName).get(key);
					request.onerror = () => reject(request.error);
					request.onsuccess = () => {
						const value = request.result;
						database.close();
						resolve(
							value
								? {
										size: Number(value.size ?? value.bytes?.byteLength ?? 0),
										type: String(value.type ?? ''),
									}
								: null,
						);
					};
				};
			}),
		{
			databaseName: 'modli-images',
			storeName: 'project-images',
			key: imageId,
		},
	);
}

test('standalone and linked Focus sessions pause, restore, and reset', async ({
	page,
}) => {
	await openModLi(page);

	await page.getByRole('button', { name: 'Start' }).click();
	await expect(page.getByText('In progress', { exact: true })).toBeVisible();
	await page.getByRole('button', { name: 'Pause' }).click();
	await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();

	let state = await readStoredState(page);
	expect(state.sessions).toHaveLength(1);
	expect(state.sessions[0]?.mode).toBe('focus');
	expect(state.sessions[0]?.taskId).toBeUndefined();
	expect(state.activeSessionId).toBe(state.sessions[0]?.id);

	await page.reload();
	await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
	await page.getByRole('button', { name: 'Reset' }).click();
	await expect(page.getByRole('button', { name: 'Start' })).toBeEnabled();

	const focusTask = page.getByRole('combobox', { name: 'Focus with' });
	await focusTask.selectOption({ label: 'Finalize sacred geometry module' });
	await page.getByRole('button', { name: 'Start' }).click();
	await expect(focusTask).toBeDisabled();
	await page.getByRole('button', { name: 'Pause' }).click();

	state = await readStoredState(page);
	expect(state.sessions).toHaveLength(2);
	expect(state.sessions[0]).toMatchObject({
		completed: false,
		endedAt: expect.any(String),
	});
	expect(state.sessions[1]?.taskId).toBe('dream-1');
	expect(state.selectedFocusTaskId).toBe('dream-1');
});

test('an expired restored Focus session completes exactly once', async ({
	page,
}) => {
	const startedAt = new Date(Date.now() - 60_000).toISOString();
	const initialState = {
		version: 1,
		projects: [
			{
				project: {
					id: 'restored-project',
					name: 'Restored Project',
					accentColor: '#258a91',
					createdAt: startedAt,
					updatedAt: startedAt,
				},
				summary: 'A project used to verify timer restoration.',
				focusStreak: 2,
				isSample: false,
			},
		],
		tasks: [
			{
				id: 'restored-task',
				title: 'Restore this session',
				category: 'Recovery',
				status: 'in_progress',
				priority: 'high',
				notes: '',
				projectId: 'restored-project',
				estimatedSessions: 2,
				completedSessions: 1,
				createdAt: startedAt,
				updatedAt: startedAt,
			},
		],
		sessions: [
			{
				id: 'restored-session',
				mode: 'focus',
				projectId: 'restored-project',
				taskId: 'restored-task',
				plannedMinutes: 1,
				completedMinutes: 0,
				completed: false,
				startedAt,
			},
		],
		settings: {
			focusMinutes: 1,
			breakMinutes: 5,
			longBreakMinutes: 15,
			focusSessionsBeforeLongBreak: 4,
			autoStartBreaks: false,
			autoStartFocus: false,
			soundEnabled: false,
			volume: 0.7,
			notificationsEnabled: false,
			alwaysOnTop: false,
			rememberWindow: true,
			reducedMotion: false,
			backgroundMotion: true,
			glowIntensity: 0.65,
			theme: 'hybrid',
			lastProjectId: 'restored-project',
			lastWindowMode: 'expanded',
		},
		selectedProjectId: 'restored-project',
		selectedFocusTaskId: 'restored-task',
		activeSessionId: 'restored-session',
		windowMode: 'expanded',
		timer: {
			mode: 'focus',
			status: 'running',
			remainingSeconds: 1,
			totalSeconds: 60,
			targetTimestamp: Date.now() - 1_000,
			completedFocusSessions: 0,
		},
	};
	await page.addInitScript(
		({ key, value }) => {
			if (localStorage.getItem(key) === null) {
				localStorage.setItem(key, JSON.stringify(value));
			}
		},
		{ key: APP_STATE_KEY, value: initialState },
	);

	await page.goto('/');
	await expect(page.getByRole('button', { name: 'Break' })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	await expect
		.poll(async () => (await readStoredState(page)).activeSessionId)
		.toBeNull();

	let state = await readStoredState(page);
	expect(state.sessions[0]).toMatchObject({
		completed: true,
		completedMinutes: 1,
		endedAt: expect.any(String),
	});
	expect(state.tasks[0]?.completedSessions).toBe(2);
	expect(state.projects[0]?.focusStreak).toBe(3);

	await page.reload();
	await expect(page.getByText('Short break', { exact: true })).toBeVisible();
	state = await readStoredState(page);
	expect(state.sessions).toHaveLength(1);
	expect(state.tasks[0]?.completedSessions).toBe(2);
	expect(state.projects[0]?.focusStreak).toBe(3);
});

test('tasks validate, create, edit, complete, uncomplete, and delete', async ({
	page,
}) => {
	await openModLi(page);
	await page.getByRole('button', { name: 'Expand project view' }).click();
	await expect(
		page.getByRole('heading', { name: 'Dream Architecture' }),
	).toBeVisible();

	await page.getByRole('button', { name: 'Add Task' }).click();
	await page.getByLabel('Title').fill('E2E focus task');
	await page.getByLabel('Category').fill('Workflow');
	await page
		.getByLabel(/Notes/)
		.fill(Array.from({ length: 251 }, (_, index) => `word${index}`).join(' '));
	await page.getByRole('button', { name: 'Create task' }).click();
	await expect(page.getByRole('alert')).toHaveText(
		'Notes must be 250 words or fewer.',
	);

	await page.getByLabel(/Notes/).fill('A concise workflow note.');
	await page.getByRole('button', { name: 'Create task' }).click();
	const taskRow = page
		.locator('.task-row')
		.filter({ hasText: 'E2E focus task' });
	await expect(taskRow).toBeVisible();

	await taskRow.click();
	await expect(
		page.getByRole('heading', { name: 'Task details' }),
	).toBeVisible();
	await page.getByLabel('Task name').fill('E2E focus task edited');
	await page.getByLabel('Status').selectOption('completed');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await page.getByLabel('Status').selectOption('in_progress');
	await page.getByRole('button', { name: 'Save changes' }).click();
	await page.getByRole('button', { name: 'Back to project summary' }).click();

	const editedTaskRow = page
		.locator('.task-row')
		.filter({ hasText: 'E2E focus task edited' });
	await expect(editedTaskRow).toBeVisible();
	await editedTaskRow.click();
	await page.getByRole('button', { name: 'Delete task' }).click();
	await expect(
		page.getByRole('button', { name: 'Confirm delete' }),
	).toBeVisible();
	await page.getByRole('button', { name: 'Cancel' }).click();
	await page.getByRole('button', { name: 'Delete task' }).click();
	await page.getByRole('button', { name: 'Confirm delete' }).click();
	await expect(editedTaskRow).toHaveCount(0);

	const sampleCheck = page.getByRole('button', {
		name: 'Mark Finalize sacred geometry module complete',
	});
	await sampleCheck.click();
	await expect(sampleCheck).toHaveCount(0);
});

test('project image and selection survive reload', async ({ page }) => {
	await openModLi(page);
	await page.getByRole('button', { name: 'Add project' }).click();
	await page.getByLabel('Project name').fill('E2E Liminal Project');
	await page.getByLabel('Accent color').fill('#336699');
	await page
		.getByLabel('Optional project image')
		.setInputFiles('src/assets/backgrounds/liminal-temple.webp');
	await page.getByRole('button', { name: 'Create project' }).click();
	const projectSelect = page.getByLabel('Project', { exact: true });
	await expect(projectSelect.locator('option:checked')).toHaveText(
		'E2E Liminal Project',
	);
	await expect(page.locator('.timer-display img')).toHaveAttribute(
		'src',
		/^blob:/,
	);
	const storedState = await readStoredState(page);
	const imageId = storedState.projects.find(
		(project) => project.project.id === storedState.selectedProjectId,
	)?.project.imageId;
	expect(imageId).toBeTruthy();
	await expect
		.poll(async () => (await readIndexedImage(page, imageId!))?.size ?? 0)
		.toBeGreaterThan(0);
	expect((await readIndexedImage(page, imageId!))?.type).toMatch(/^image\//);

	await page.reload();
	await expect(projectSelect.locator('option:checked')).toHaveText(
		'E2E Liminal Project',
	);
	const reloadedImage = await readIndexedImage(page, imageId!);
	expect(reloadedImage?.size).toBeGreaterThan(0);
	expect(reloadedImage?.type).toMatch(/^image\//);
	await expect
		.poll(async () => page.locator('.timer-display img').getAttribute('src'))
		.toMatch(/^blob:/);
});

test('Settings persist appearance choices and restore keyboard focus', async ({
	page,
}) => {
	await openModLi(page);
	const settingsButton = page.getByRole('button', { name: 'Open settings' });
	await settingsButton.click();
	const dialog = page.getByRole('dialog', { name: 'Settings' });
	await expect(dialog).toBeVisible();

	await page.keyboard.press('Shift+Tab');
	await expect(
		page.getByRole('button', { name: 'Save settings' }),
	).toBeFocused();
	await page.getByLabel('Theme').selectOption('constellation');
	await page.getByLabel('Reduce motion').check();
	await page.getByRole('button', { name: 'Save settings' }).click();
	await expect(page.locator('.app-stage')).toHaveAttribute(
		'data-theme',
		'constellation',
	);
	await expect(page.locator('.app-stage')).toHaveClass(
		/app-stage--reduced-motion/,
	);

	await page.reload();
	await expect(page.locator('.app-stage')).toHaveAttribute(
		'data-theme',
		'constellation',
	);
	await settingsButton.click();
	await expect(page.getByLabel('Reduce motion')).toBeChecked();
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
	await expect(settingsButton).toBeFocused();
});

test('malformed local data fails safely to sample content', async ({
	page,
}) => {
	await page.addInitScript(
		({ key }) => localStorage.setItem(key, '{"version":1,"tasks":"broken"}'),
		{ key: APP_STATE_KEY },
	);
	await openModLi(page);
	await expect(page.getByLabel('Project', { exact: true })).toHaveValue(
		'dream-architecture',
	);
	await expect(page.getByText('25:00', { exact: true })).toBeVisible();
});
