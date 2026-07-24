<script lang="ts">
	import { Settings, Volume2, VolumeX } from '@lucide/svelte';
	import type {
		ProjectStatistics,
		ProjectWorkspace,
		ModLiSettings,
		Task,
		TimerMode,
		TimerSnapshot,
		WindowMode,
	} from '../domain/types';
	import CompactTimer from './CompactTimer.svelte';
	import CustomTitleBar from './CustomTitleBar.svelte';
	import ExpandedProjectPanel from './ExpandedProjectPanel.svelte';
	import ProjectSelector from './ProjectSelector.svelte';
	import TaskDetailsPanel from './TaskDetailsPanel.svelte';
	import SettingsPanel from './SettingsPanel.svelte';

	let {
		snapshot,
		soundEnabled,
		settings,
		settingsOpen,
		windowMode,
		desktopRuntime,
		projects,
		selectedWorkspace,
		statistics,
		highPriorityTasks,
		selectedProjectImageUrl,
		availableFocusTasks,
		linkedFocusTask,
		activeSessionId,
		completionMessage,
		projectFormOpen,
		onModeChange,
		onStart,
		onPause,
		onReset,
		onSelectFocusTask,
		onSoundToggle,
		onOpenSettings,
		onCloseSettings,
		onSaveSettings,
		onPreviewSound,
		onToggleWindowMode,
		onTogglePin,
		onMinimizeWindow,
		onCloseWindow,
		onSelectProject,
		onOpenProjectForm,
		onCloseProjectForm,
		onCreateProject,
		onCreateTask,
		onToggleTask,
		onUpdateTask,
		onDeleteTask,
		onUpdateProjectImage,
		onOpenProjectDetails,
		onOpenTaskDetails,
		onCloseDetailPanel,
		detailPanelOpen,
		selectedTask,
	}: {
		snapshot: TimerSnapshot;
		soundEnabled: boolean;
		settings: ModLiSettings;
		settingsOpen: boolean;
		windowMode: WindowMode;
		desktopRuntime: boolean;
		projects: ProjectWorkspace[];
		selectedWorkspace: ProjectWorkspace;
		statistics: ProjectStatistics;
		highPriorityTasks: Task[];
		selectedProjectImageUrl?: string;
		availableFocusTasks: Task[];
		linkedFocusTask: Task | null;
		activeSessionId: string | null;
		completionMessage?: string | null;
		projectFormOpen: boolean;
		onModeChange: (mode: TimerMode) => void;
		onStart: () => void;
		onPause: () => void;
		onReset: () => void;
		onSelectFocusTask: (taskId: string | null) => void;
		onSoundToggle: () => void;
		onOpenSettings: (returnFocus?: HTMLElement) => void;
		onCloseSettings: () => void;
		onSaveSettings: (settings: ModLiSettings) => void;
		onPreviewSound: (volume: number) => void;
		onToggleWindowMode: () => void;
		onTogglePin: () => void;
		onMinimizeWindow: () => void;
		onCloseWindow: () => void;
		onSelectProject: (projectId: string) => void;
		onOpenProjectForm: () => void;
		onCloseProjectForm: () => void;
		onCreateProject: (
			name: string,
			accentColor: string,
			imageFile: File | null,
		) => void;
		onCreateTask: (
			projectId: string,
			title: string,
			category: string,
			priority: Task['priority'],
			estimatedSessions: number,
			notes: string,
		) => void;
		onToggleTask: (taskId: string) => void;
		onUpdateTask: (task: Task) => void;
		onDeleteTask: (taskId: string) => void;
		onUpdateProjectImage: (imageFile: File | null) => void;
		onOpenProjectDetails: () => void;
		onOpenTaskDetails: (taskId: string) => void;
		onCloseDetailPanel: () => void;
		detailPanelOpen: boolean;
		selectedTask: Task | null;
	} = $props();

	let settingsButton: HTMLButtonElement;
</script>

<article
	class="modli-window"
	class:modli-window--expanded={windowMode === 'expanded'}
	aria-label={`ModLi ${windowMode} timer`}
	style:--project-accent={selectedWorkspace.project.accentColor}
>
	<div class="corner corner--top-left" aria-hidden="true"></div>
	<div class="corner corner--top-right" aria-hidden="true"></div>
	<CustomTitleBar
		{windowMode}
		{desktopRuntime}
		alwaysOnTop={settings.alwaysOnTop}
		{onToggleWindowMode}
		{onTogglePin}
		onMinimize={onMinimizeWindow}
		onClose={onCloseWindow}
	/>

	<div class="workspace-layout">
		<section class="compact-column" aria-label="Timer and project selection">
			<ProjectSelector
				{projects}
				selectedProjectId={selectedWorkspace.project.id}
				onSelect={onSelectProject}
				onAddProject={onOpenProjectForm}
			/>
			<CompactTimer
				{snapshot}
				project={selectedWorkspace.project}
				projectImageUrl={selectedProjectImageUrl}
				{statistics}
				{onModeChange}
				{onStart}
				{onPause}
				{onReset}
				{availableFocusTasks}
				{linkedFocusTask}
				focusTaskLocked={Boolean(activeSessionId && snapshot.mode === 'focus')}
				{onSelectFocusTask}
				{completionMessage}
			/>
		</section>

		{#if windowMode === 'expanded'}
			{#if detailPanelOpen}
				<TaskDetailsPanel
					workspace={selectedWorkspace}
					{projects}
					task={selectedTask}
					onClose={onCloseDetailPanel}
					onSave={onUpdateTask}
					onDelete={onDeleteTask}
					{onUpdateProjectImage}
				/>
			{:else}
				<ExpandedProjectPanel
					workspace={selectedWorkspace}
					{statistics}
					{highPriorityTasks}
					{projectFormOpen}
					{onOpenProjectForm}
					{onCloseProjectForm}
					{onCreateProject}
					{onCreateTask}
					{onToggleTask}
					{onOpenProjectDetails}
					{onOpenTaskDetails}
				/>
			{/if}
		{/if}
	</div>

	<footer>
		<button
			type="button"
			class="utility-button"
			aria-label={soundEnabled ? 'Mute timer sound' : 'Enable timer sound'}
			aria-pressed={soundEnabled}
			title={soundEnabled ? 'Sound on' : 'Sound off'}
			onclick={onSoundToggle}
		>
			{#if soundEnabled}
				<Volume2 size={21} strokeWidth={1.8} />
			{:else}
				<VolumeX size={21} strokeWidth={1.8} />
			{/if}
		</button>
		<p>
			{snapshot.status === 'running'
				? 'Session in progress'
				: snapshot.status === 'paused'
					? 'Session paused'
					: 'Ready when you are'}
		</p>
		<button
			bind:this={settingsButton}
			type="button"
			class="utility-button"
			aria-label="Open settings"
			title="Settings"
			onclick={() => onOpenSettings(settingsButton)}
		>
			<Settings size={21} strokeWidth={1.8} />
		</button>
	</footer>

	{#if settingsOpen}
		<SettingsPanel
			{settings}
			onSave={onSaveSettings}
			onClose={onCloseSettings}
			{onPreviewSound}
		/>
	{/if}
</article>

<style>
	.modli-window {
		position: relative;
		width: min(100%, 390px);
		overflow: hidden;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-window);
		background:
			linear-gradient(145deg, rgba(217, 239, 252, 0.06), transparent 32%),
			var(--surface);
		backdrop-filter: blur(var(--glass-blur)) saturate(1.12);
		box-shadow:
			inset 0 1px rgba(230, 246, 255, 0.14),
			var(--shadow-panel),
			0 0 calc(18px + 26px * var(--user-glow, 0.65))
				rgba(107, 184, 231, calc(0.08 + 0.18 * var(--user-glow, 0.65)));
	}

	.modli-window--expanded {
		width: min(100%, 1080px);
	}

	.modli-window::before {
		position: absolute;
		inset: 1px;
		z-index: 1;
		border: 1px solid rgba(224, 243, 255, 0.04);
		border-radius: calc(var(--radius-window) - 1px);
		content: '';
		pointer-events: none;
	}

	.modli-window > :global(*) {
		position: relative;
	}

	.modli-window > :global(.settings-backdrop) {
		position: absolute;
	}

	.workspace-layout {
		display: grid;
		grid-template-columns: minmax(0, 386px);
	}

	.modli-window--expanded .workspace-layout {
		grid-template-columns: minmax(340px, 386px) minmax(0, 1fr);
	}

	.compact-column {
		min-width: 0;
	}

	.modli-window--expanded .compact-column {
		border-right: 1px solid var(--border-subtle);
	}

	.corner {
		position: absolute;
		z-index: 2;
		width: 24px;
		height: 24px;
		border-top: 1px solid rgba(205, 235, 255, 0.46);
		pointer-events: none;
	}

	.corner--top-left {
		top: 5px;
		left: 5px;
		border-left: 1px solid rgba(205, 235, 255, 0.46);
		border-radius: 10px 0 0;
	}

	.corner--top-right {
		top: 5px;
		right: 5px;
		border-right: 1px solid rgba(205, 235, 255, 0.46);
		border-radius: 0 10px 0 0;
	}

	footer {
		display: grid;
		grid-template-columns: 44px 1fr 44px;
		align-items: center;
		min-height: 50px;
		padding: 0 12px;
		border-top: 1px solid var(--border-subtle);
		background: rgba(5, 17, 33, 0.5);
	}

	footer p {
		margin: 0;
		font: 700 0.65rem var(--font-ui);
		letter-spacing: 0.12em;
		text-align: center;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.utility-button {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--text-secondary);
	}

	.utility-button:hover:not(:disabled) {
		border-color: var(--border-active);
		background: var(--surface-hover);
		color: var(--text-primary);
	}

	.utility-button:active:not(:disabled) {
		transform: translateY(1px) scale(0.98);
	}

	.utility-button:disabled {
		cursor: not-allowed;
		opacity: 0.48;
	}

	@media (max-width: 820px) {
		.modli-window--expanded .workspace-layout {
			grid-template-columns: 1fr;
		}

		.modli-window--expanded .compact-column {
			width: min(100%, 390px);
			margin-inline: auto;
			border-right: 0;
			border-bottom: 1px solid var(--border-subtle);
		}
	}
</style>
