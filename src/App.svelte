<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import ModLiWindow from './components/ModLiWindow.svelte';
	import { SAMPLE_PROJECTS, SAMPLE_TASKS } from './data/sampleData';
	import {
		activeHighPriorityTasks,
		calculateProjectStatistics,
	} from './domain/projects';
	import { DEFAULT_SETTINGS, PomodoroTimer } from './domain/timer';
	import type {
		ProjectWorkspace,
		ModLiSettings,
		PomodoroSession,
		Task,
		TimerMode,
		TimerSnapshot,
		WindowMode,
	} from './domain/types';
	import { playTimerChime, prepareTimerSound } from './platform/sound';
	import { prepareProjectImage } from './platform/images';
	import {
		closeDesktopWindow,
		initializeDesktopWindow,
		isDesktopRuntime,
		minimizeDesktopWindow,
		resizeDesktopWindow,
		setDesktopAlwaysOnTop,
	} from './platform/window';
	import { createProjectWorkspace } from './state/projects';
	import {
		abandonPomodoroSession,
		completePomodoroSession,
		createPomodoroSession,
	} from './state/sessions';
	import { createTaskRecord } from './domain/tasks';
	import {
		deleteProjectImage,
		getProjectImage,
		putProjectImage,
	} from './storage/imageStorage';
	import { loadAppState, saveAppState } from './storage/appStorage';

	let settings = $state<ModLiSettings>(structuredClone(DEFAULT_SETTINGS));
	let soundEnabled = $derived(settings.soundEnabled);
	let announcement = $state('');
	let completionMessage = $state<string | null>(null);
	let windowMode = $state<WindowMode>('compact');
	let projects = $state<ProjectWorkspace[]>(structuredClone(SAMPLE_PROJECTS));
	let sessions = $state<PomodoroSession[]>([]);
	let selectedProjectId = $state(SAMPLE_PROJECTS[0]!.project.id);
	let selectedFocusTaskId = $state<string | null>(null);
	let activeSessionId = $state<string | null>(null);
	let projectFormOpen = $state(false);
	let projectImageUrls = $state<Record<string, string>>({});
	let detailPanelOpen = $state(false);
	let settingsOpen = $state(false);
	let selectedTaskId = $state<string | null>(null);
	let snapshot = $state<TimerSnapshot>({
		mode: 'focus',
		status: 'idle',
		remainingSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
		totalSeconds: DEFAULT_SETTINGS.focusMinutes * 60,
		targetTimestamp: null,
		completedFocusSessions: 0,
	});
	const uploadedImageUrls: string[] = [];
	let completionTimeout: ReturnType<typeof globalThis.setTimeout> | null = null;
	let projectFormReturnFocus: HTMLElement | null = null;
	let settingsReturnFocus: HTMLElement | null = null;
	let hydrated = $state(false);
	let tasks = $state<Task[]>(SAMPLE_TASKS);
	const desktopRuntime = isDesktopRuntime();
	let selectedWorkspace = $derived(
		projects.find((workspace) => workspace.project.id === selectedProjectId) ??
			projects[0]!,
	);
	let projectStatistics = $derived(
		calculateProjectStatistics(tasks, selectedWorkspace.project.id),
	);
	let highPriorityTasks = $derived(
		activeHighPriorityTasks(tasks, selectedWorkspace.project.id),
	);
	let selectedProjectImageUrl = $derived(
		projectImageUrls[selectedWorkspace.project.id],
	);
	let selectedTask = $derived(
		tasks.find((task) => task.id === selectedTaskId) ?? null,
	);
	let linkedFocusTask = $derived(
		tasks.find((task) => task.id === selectedFocusTaskId) ?? null,
	);
	let availableFocusTasks = $derived.by(() => {
		const projectTasks = tasks.filter(
			(task) =>
				task.projectId === selectedProjectId && task.status === 'in_progress',
		);
		if (
			linkedFocusTask &&
			!projectTasks.some((task) => task.id === linkedFocusTask?.id)
		) {
			return [linkedFocusTask, ...projectTasks];
		}
		return projectTasks;
	});

	const timer = new PomodoroTimer(DEFAULT_SETTINGS, (completedMode) => {
		const completion = completePomodoroSession(
			{ sessions, tasks, projects },
			activeSessionId,
		);
		sessions = completion.sessions;
		tasks = completion.tasks;
		projects = completion.projects;
		activeSessionId = null;
		completionMessage =
			completedMode === 'focus' ? 'Session complete' : 'Break complete';
		announcement = `${completedMode === 'focus' ? 'Focus' : 'Break'} session complete. ${completedMode === 'focus' ? 'Break' : 'Focus'} mode is ready.`;
		if (completionTimeout !== null) globalThis.clearTimeout(completionTimeout);
		completionTimeout = globalThis.setTimeout(() => {
			completionMessage = null;
			completionTimeout = null;
		}, 5000);
		if (settings.soundEnabled) {
			void playTimerChime(settings.volume).catch(() => {
				announcement += ' The browser could not play the alert sound.';
			});
		}
		globalThis.queueMicrotask(() => {
			const nextSnapshot = timer.snapshot;
			if (nextSnapshot.status === 'running' && !activeSessionId) {
				beginTimerSession(nextSnapshot);
			}
		});
	});

	const unsubscribe = timer.subscribe((nextSnapshot) => {
		snapshot = nextSnapshot;
	});

	function changeMode(mode: TimerMode): void {
		if (activeSessionId) abandonActiveTimerSession();
		announcement = `${mode === 'focus' ? 'Focus' : 'Break'} mode selected.`;
		timer.setMode(mode);
	}

	function beginTimerSession(nextSnapshot: TimerSnapshot): void {
		if (activeSessionId) return;
		const task =
			nextSnapshot.mode === 'focus' &&
			linkedFocusTask?.projectId === selectedProjectId &&
			linkedFocusTask.status === 'in_progress'
				? linkedFocusTask
				: null;
		const session = createPomodoroSession({
			mode: nextSnapshot.mode,
			totalSeconds: nextSnapshot.totalSeconds,
			projectId: selectedProjectId,
			taskId: task?.id,
		});
		sessions = [...sessions, session];
		activeSessionId = session.id;
	}

	function startTimer(): void {
		if (settings.soundEnabled) void prepareTimerSound().catch(() => undefined);
		if (!activeSessionId) beginTimerSession(timer.snapshot);
		timer.start();
	}

	function pauseTimer(): void {
		timer.pause();
	}

	function abandonActiveTimerSession(): PomodoroSession | null {
		if (snapshot.status === 'running') timer.pause();
		const activeSession =
			sessions.find((session) => session.id === activeSessionId) ?? null;
		const latestSnapshot = timer.snapshot;
		sessions = abandonPomodoroSession(
			sessions,
			activeSessionId,
			latestSnapshot.totalSeconds - latestSnapshot.remainingSeconds,
		);
		activeSessionId = null;
		return activeSession;
	}

	function resetTimer(): void {
		const abandonedSession = activeSessionId
			? abandonActiveTimerSession()
			: null;
		if (abandonedSession?.mode === 'focus' && abandonedSession.projectId) {
			projects = projects.map((workspace) =>
				workspace.project.id === abandonedSession.projectId
					? { ...workspace, focusStreak: 0 }
					: workspace,
			);
		}
		timer.reset();
	}

	function toggleSound(): void {
		settings = { ...settings, soundEnabled: !settings.soundEnabled };
		announcement = `Timer alerts ${settings.soundEnabled ? 'enabled' : 'muted'}.`;
	}

	function selectProject(projectId: string): void {
		selectedProjectId = projectId;
		const activeSession = sessions.find(
			(session) => session.id === activeSessionId,
		);
		if (
			!activeSession ||
			activeSession.mode !== 'focus' ||
			activeSession.taskId !== selectedFocusTaskId
		) {
			selectedFocusTaskId = null;
		}
		detailPanelOpen = false;
		selectedTaskId = null;
		projectFormOpen = false;
		const project = projects.find(
			(workspace) => workspace.project.id === projectId,
		);
		if (project)
			announcement = `${project.project.name} selected. Project details updated.`;
	}

	function selectFocusTask(taskId: string | null): void {
		if (activeSessionId && snapshot.mode === 'focus') return;
		const task = tasks.find(
			(item) =>
				item.id === taskId &&
				item.projectId === selectedProjectId &&
				item.status === 'in_progress',
		);
		selectedFocusTaskId = task?.id ?? null;
		announcement = task
			? `${task.title} linked to the next Focus session.`
			: 'The next Focus session will run without a linked task.';
	}

	function openProjectForm(): void {
		projectFormReturnFocus = document.activeElement as HTMLElement | null;
		setWindowMode('expanded');
		detailPanelOpen = false;
		selectedTaskId = null;
		projectFormOpen = true;
		announcement = 'Add project form opened.';
	}

	function openProjectDetails(): void {
		setWindowMode('expanded');
		projectFormOpen = false;
		detailPanelOpen = true;
		selectedTaskId = null;
		announcement = `${selectedWorkspace.project.name} details opened.`;
	}

	function openTaskDetails(taskId: string): void {
		setWindowMode('expanded');
		projectFormOpen = false;
		detailPanelOpen = true;
		selectedTaskId = taskId;
		announcement = 'Task details opened.';
	}

	function closeDetailPanel(): void {
		detailPanelOpen = false;
		selectedTaskId = null;
	}

	function createTask(
		projectId: string,
		title: string,
		category: string,
		priority: Task['priority'],
		estimatedSessions: number,
		notes: string,
	): void {
		const task = createTaskRecord({
			projectId,
			title,
			category,
			priority,
			estimatedSessions,
			notes,
		});

		tasks = [...tasks, task];
		announcement = `${task.title} added to ${selectedWorkspace.project.name}.`;
	}

	function toggleTask(taskId: string): void {
		const currentTask = tasks.find((task) => task.id === taskId);
		if (!currentTask) return;
		const nextStatus =
			currentTask.status === 'completed' ? 'in_progress' : 'completed';
		tasks = tasks.map((task) =>
			task.id === taskId
				? {
						...task,
						status: nextStatus,
						updatedAt: new Date().toISOString(),
					}
				: task,
		);
		const activeSession = sessions.find(
			(session) => session.id === activeSessionId,
		);
		if (
			nextStatus !== 'in_progress' &&
			selectedFocusTaskId === taskId &&
			activeSession?.taskId !== taskId
		) {
			selectedFocusTaskId = null;
		}
		announcement = `${currentTask.title} marked ${nextStatus === 'completed' ? 'complete' : 'in progress'}.`;
	}

	function updateTask(updatedTask: Task): void {
		tasks = tasks.map((task) =>
			task.id === updatedTask.id ? updatedTask : task,
		);
		if (updatedTask.projectId !== selectedProjectId) {
			selectedProjectId = updatedTask.projectId;
		}
		const activeSession = sessions.find(
			(session) => session.id === activeSessionId,
		);
		if (
			selectedFocusTaskId === updatedTask.id &&
			updatedTask.status !== 'in_progress' &&
			activeSession?.taskId !== updatedTask.id
		) {
			selectedFocusTaskId = null;
		}
		announcement = `${updatedTask.title} saved.`;
	}

	function deleteTask(taskId: string): void {
		const task = tasks.find((item) => item.id === taskId);
		tasks = tasks.filter((item) => item.id !== taskId);
		if (selectedFocusTaskId === taskId) selectedFocusTaskId = null;
		closeDetailPanel();
		announcement = task ? `${task.title} deleted.` : 'Task deleted.';
	}

	async function closeProjectForm(): Promise<void> {
		projectFormOpen = false;
		announcement = 'Add project form closed.';
		await tick();
		projectFormReturnFocus?.focus();
	}

	function setWindowMode(nextMode: WindowMode): void {
		windowMode = nextMode;
		void tick().then(() => resizeDesktopWindow(nextMode));
	}

	function toggleWindowMode(): void {
		setWindowMode(windowMode === 'compact' ? 'expanded' : 'compact');
		if (windowMode === 'compact') {
			projectFormOpen = false;
			detailPanelOpen = false;
			selectedTaskId = null;
		}
		announcement = `${windowMode === 'expanded' ? 'Expanded project view opened' : 'Compact timer view restored'}. Timer state unchanged.`;
	}

	async function createProject(
		name: string,
		accentColor: string,
		imageFile: File | null,
	): Promise<void> {
		let workspace = createProjectWorkspace({
			name,
			accentColor,
		});

		if (imageFile) {
			const imageId = `project-image:${workspace.project.id}`;
			const processedImage = await prepareProjectImage(imageFile);
			workspace = {
				...workspace,
				project: { ...workspace.project, imageId },
			};
			try {
				await putProjectImage(imageId, processedImage);
			} catch {
				announcement =
					'The project was created, but its image could not be stored permanently.';
			}
			const imageUrl = URL.createObjectURL(processedImage);
			uploadedImageUrls.push(imageUrl);
			projectImageUrls = {
				...projectImageUrls,
				[workspace.project.id]: imageUrl,
			};
		}
		projects = [...projects, workspace];
		selectedProjectId = workspace.project.id;
		projectFormOpen = false;
		setWindowMode('expanded');
		announcement = `${workspace.project.name} created and selected for this session.`;
		await tick();
		document.getElementById('project-select')?.focus();
	}

	async function updateProjectImage(imageFile: File | null): Promise<void> {
		const projectId = selectedWorkspace.project.id;
		const currentImageId = selectedWorkspace.project.imageId;
		const currentUrl = projectImageUrls[projectId];

		if (!imageFile) {
			if (currentImageId?.startsWith('project-image:')) {
				try {
					await deleteProjectImage(currentImageId);
				} catch {
					announcement =
						'The image was removed from this view, but local cleanup failed.';
				}
			}
			if (currentUrl) URL.revokeObjectURL(currentUrl);
			const { [projectId]: removedUrl, ...remainingUrls } = projectImageUrls;
			void removedUrl;
			projectImageUrls = remainingUrls;
			projects = projects.map((workspace) =>
				workspace.project.id === projectId
					? {
							...workspace,
							project: {
								...workspace.project,
								imageId: undefined,
								updatedAt: new Date().toISOString(),
							},
						}
					: workspace,
			);
			announcement = 'Project image removed. The liminal fallback is active.';
			return;
		}

		const imageId = `project-image:${projectId}`;
		const processedImage = await prepareProjectImage(imageFile);
		try {
			await putProjectImage(imageId, processedImage);
		} catch {
			announcement =
				'The image is visible now, but it could not be stored permanently.';
		}
		if (currentUrl) URL.revokeObjectURL(currentUrl);
		const imageUrl = URL.createObjectURL(processedImage);
		uploadedImageUrls.push(imageUrl);
		projectImageUrls = { ...projectImageUrls, [projectId]: imageUrl };
		projects = projects.map((workspace) =>
			workspace.project.id === projectId
				? {
						...workspace,
						project: {
							...workspace.project,
							imageId,
							updatedAt: new Date().toISOString(),
						},
					}
				: workspace,
		);
		announcement = 'Project image updated.';
	}

	function openSettings(): void {
		settingsReturnFocus = document.activeElement as HTMLElement | null;
		settingsOpen = true;
		announcement = 'Settings opened.';
	}

	async function closeSettings(): Promise<void> {
		settingsOpen = false;
		announcement = 'Settings closed.';
		await tick();
		settingsReturnFocus?.focus();
	}

	function saveSettings(nextSettings: ModLiSettings): void {
		if (activeSessionId && snapshot.status !== 'running') {
			abandonActiveTimerSession();
		}
		settings = nextSettings;
		timer.updateSettings(nextSettings);
		void setDesktopAlwaysOnTop(nextSettings.alwaysOnTop);
		if (!nextSettings.rememberWindow) {
			setWindowMode(nextSettings.lastWindowMode);
		}
		settingsOpen = false;
		announcement = 'Settings saved.';
	}

	function previewSound(volume: number): void {
		void playTimerChime(volume).catch(() => {
			announcement = 'The browser could not preview the alert sound.';
		});
	}

	async function togglePin(): Promise<void> {
		const nextPinnedState = !settings.alwaysOnTop;
		const updated = await setDesktopAlwaysOnTop(nextPinnedState);
		if (!updated) {
			announcement = 'ModLi could not change the window pin state.';
			return;
		}
		settings = { ...settings, alwaysOnTop: nextPinnedState };
		announcement = nextPinnedState
			? 'ModLi will stay above other windows.'
			: 'ModLi is no longer pinned above other windows.';
	}

	async function hydrateApp(): Promise<void> {
		const persisted = await loadAppState();
		if (persisted) {
			projects = persisted.projects.length
				? persisted.projects
				: structuredClone(SAMPLE_PROJECTS);
			tasks = persisted.tasks;
			sessions = persisted.sessions;
			settings = { ...DEFAULT_SETTINGS, ...persisted.settings };
			selectedProjectId = projects.some(
				(workspace) => workspace.project.id === persisted.selectedProjectId,
			)
				? persisted.selectedProjectId
				: projects[0]!.project.id;
			activeSessionId = sessions.some(
				(session) =>
					session.id === persisted.activeSessionId &&
					!session.completed &&
					!session.endedAt,
			)
				? persisted.activeSessionId
				: null;
			const restoredActiveSession = sessions.find(
				(session) => session.id === activeSessionId,
			);
			selectedFocusTaskId =
				restoredActiveSession?.mode === 'focus' &&
				tasks.some((task) => task.id === restoredActiveSession.taskId)
					? (restoredActiveSession.taskId ?? null)
					: tasks.some(
								(task) =>
									task.id === persisted.selectedFocusTaskId &&
									task.status === 'in_progress',
						  )
						? persisted.selectedFocusTaskId
						: null;
			windowMode = settings.rememberWindow
				? persisted.windowMode
				: settings.lastWindowMode;
			timer.updateSettings(settings);
			if (persisted.timer) {
				if (persisted.timer.status !== 'idle' && !activeSessionId) {
					const restoredTask = tasks.find(
						(task) => task.id === selectedFocusTaskId,
					);
					const elapsedSeconds =
						persisted.timer.totalSeconds - persisted.timer.remainingSeconds;
					const inferredStart = new Date(
						Date.now() - Math.max(0, elapsedSeconds) * 1000,
					).toISOString();
					const restoredSession = createPomodoroSession(
						{
							mode: persisted.timer.mode,
							totalSeconds: persisted.timer.totalSeconds,
							projectId: selectedProjectId,
							taskId:
								persisted.timer.mode === 'focus' ? restoredTask?.id : undefined,
						},
						() => crypto.randomUUID(),
						() => inferredStart,
					);
					sessions = [...sessions, restoredSession];
					activeSessionId = restoredSession.id;
				}
				timer.restore(persisted.timer);
			}
		}
		hydrated = true;
		await tick();
		void initializeDesktopWindow(
			windowMode,
			settings.alwaysOnTop,
			settings.rememberWindow,
		);

		void Promise.all(
			projects.map(async (workspace) => {
				const imageId = workspace.project.imageId;
				if (!imageId?.startsWith('project-image:')) return;
				try {
					const blob = await getProjectImage(imageId);
					if (!blob) return;
					const imageUrl = URL.createObjectURL(blob);
					uploadedImageUrls.push(imageUrl);
					projectImageUrls = {
						...projectImageUrls,
						[workspace.project.id]: imageUrl,
					};
				} catch {
					// The timer display keeps its bundled fallback when IndexedDB fails.
				}
			}),
		);
	}

	onMount(() => {
		void hydrateApp();
	});

	$effect(() => {
		if (!hydrated) return;
		void saveAppState({
			version: 1,
			projects,
			tasks,
			sessions,
			settings: {
				...settings,
				lastProjectId: selectedProjectId,
				lastWindowMode: settings.rememberWindow
					? windowMode
					: settings.lastWindowMode,
			},
			selectedProjectId,
			selectedFocusTaskId,
			activeSessionId,
			windowMode,
			timer: snapshot,
		}).catch(() => {
			announcement = 'ModLi could not save changes locally.';
		});
	});

	onDestroy(() => {
		unsubscribe();
		timer.destroy();
		if (completionTimeout !== null) globalThis.clearTimeout(completionTimeout);
		for (const imageUrl of uploadedImageUrls) URL.revokeObjectURL(imageUrl);
	});
</script>

<svelte:head>
	<title>{snapshot.mode === 'focus' ? 'Focus' : 'Break'} — ModLi</title>
</svelte:head>

<div
	class="app-stage"
	class:app-stage--expanded={windowMode === 'expanded'}
	class:app-stage--desktop={desktopRuntime}
	class:app-stage--reduced-motion={settings.reducedMotion}
	class:app-stage--still={settings.reducedMotion || !settings.backgroundMotion}
	data-theme={settings.theme}
	style:--user-glow={settings.glowIntensity}
>
	<div class="stage-heading" aria-hidden="true">
		<span></span>
		<p>
			{windowMode === 'expanded'
				? 'Project focus companion'
				: 'Compact focus companion'}
		</p>
		<span></span>
	</div>
	<ModLiWindow
		{snapshot}
		{soundEnabled}
		{settings}
		{settingsOpen}
		{windowMode}
		{desktopRuntime}
		{projects}
		{selectedWorkspace}
		statistics={projectStatistics}
		{highPriorityTasks}
		{selectedProjectImageUrl}
		{availableFocusTasks}
		{linkedFocusTask}
		{activeSessionId}
		{completionMessage}
		{projectFormOpen}
		onCreateTask={createTask}
		onToggleTask={toggleTask}
		onUpdateTask={updateTask}
		onDeleteTask={deleteTask}
		onUpdateProjectImage={updateProjectImage}
		onOpenProjectDetails={openProjectDetails}
		onOpenTaskDetails={openTaskDetails}
		onCloseDetailPanel={closeDetailPanel}
		{detailPanelOpen}
		{selectedTask}
		onModeChange={changeMode}
		onStart={startTimer}
		onPause={pauseTimer}
		onReset={resetTimer}
		onSelectFocusTask={selectFocusTask}
		onSoundToggle={toggleSound}
		onOpenSettings={openSettings}
		onCloseSettings={closeSettings}
		onSaveSettings={saveSettings}
		onPreviewSound={previewSound}
		onToggleWindowMode={toggleWindowMode}
		onTogglePin={() => void togglePin()}
		onMinimizeWindow={() => void minimizeDesktopWindow()}
		onCloseWindow={() => void closeDesktopWindow()}
		onSelectProject={selectProject}
		onOpenProjectForm={openProjectForm}
		onCloseProjectForm={closeProjectForm}
		onCreateProject={createProject}
	/>
	<p class="milestone-note">
		{desktopRuntime ? 'Desktop companion' : 'Browser prototype'} · local session data
	</p>
	<p class="sr-only" aria-live="polite">{announcement}</p>
</div>
