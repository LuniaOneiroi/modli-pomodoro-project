<script lang="ts">
	import type {
		Project,
		ProjectStatistics,
		Task,
		TimerMode,
		TimerSnapshot,
	} from '../domain/types';
	import { formatTimer, timerProgress } from '../domain/timer';
	import TimerDisplay from './TimerDisplay.svelte';
	import TimerControls from './TimerControls.svelte';

	let {
		snapshot,
		project,
		projectImageUrl,
		statistics,
		onModeChange,
		onStart,
		onPause,
		onReset,
		availableFocusTasks,
		linkedFocusTask,
		focusTaskLocked,
		onSelectFocusTask,
		completionMessage = null,
	}: {
		snapshot: TimerSnapshot;
		project: Project;
		projectImageUrl?: string;
		statistics: ProjectStatistics;
		onModeChange: (mode: TimerMode) => void;
		onStart: () => void;
		onPause: () => void;
		onReset: () => void;
		availableFocusTasks: Task[];
		linkedFocusTask: Task | null;
		focusTaskLocked: boolean;
		onSelectFocusTask: (taskId: string | null) => void;
		completionMessage?: string | null;
	} = $props();

	let formattedTime = $derived(formatTimer(snapshot.remainingSeconds));
	let progress = $derived(timerProgress(snapshot));
</script>

<main class="timer-shell">
	<div class="mode-switcher" aria-label="Timer mode">
		<button
			type="button"
			class:active={snapshot.mode === 'focus'}
			aria-pressed={snapshot.mode === 'focus'}
			onclick={() => onModeChange('focus')}
		>
			Focus
		</button>
		<svg aria-hidden="true" viewBox="0 0 16 16"
			><path d="M8 0 9.7 6.3 16 8l-6.3 1.7L8 16 6.3 9.7 0 8l6.3-1.7z" /></svg
		>
		<button
			type="button"
			class:active={snapshot.mode === 'break'}
			aria-pressed={snapshot.mode === 'break'}
			onclick={() => onModeChange('break')}
		>
			Break
		</button>
	</div>

	<TimerDisplay
		{project}
		{projectImageUrl}
		mode={snapshot.mode}
		status={snapshot.status}
		{formattedTime}
		{progress}
		breakKind={snapshot.breakKind}
		{completionMessage}
	/>

	<section class="focus-task" aria-labelledby="focus-task-label">
		<label id="focus-task-label" for="focus-task-select">
			{snapshot.mode === 'focus' ? 'Focus with' : 'Next focus'}
		</label>
		<select
			id="focus-task-select"
			value={linkedFocusTask?.id ?? ''}
			disabled={focusTaskLocked}
			aria-describedby={focusTaskLocked ? 'focus-task-status' : undefined}
			onchange={(event) => onSelectFocusTask(event.currentTarget.value || null)}
		>
			<option value="">
				{availableFocusTasks.length ? 'No linked task' : 'No active tasks'}
			</option>
			{#each availableFocusTasks as task (task.id)}
				<option value={task.id}>{task.title}</option>
			{/each}
		</select>
		{#if focusTaskLocked}
			<span id="focus-task-status" class="sr-only">
				Task selection is locked until this Focus session ends or resets.
			</span>
		{/if}
	</section>

	<section class="project-progress" aria-labelledby="project-progress-label">
		<div>
			<p id="project-progress-label">Project progress</p>
			<p>{statistics.completedTasks} / {statistics.totalTasks} complete</p>
		</div>
		<progress
			max={Math.max(statistics.totalTasks, 1)}
			value={statistics.completedTasks}
		>
			{statistics.completedTasks} of {statistics.totalTasks} tasks complete
		</progress>
	</section>

	<TimerControls status={snapshot.status} {onStart} {onPause} {onReset} />
</main>

<style>
	.timer-shell {
		position: relative;
		padding: 0.15rem 0 0.25rem;
	}

	.mode-switcher {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 11px;
		min-height: 38px;
		margin-bottom: 2px;
		color: var(--accent-primary);
	}

	.mode-switcher button {
		padding: 5px 7px;
		border: 0;
		border-bottom: 1px solid transparent;
		background: transparent;
		font: 600 0.68rem var(--font-ui);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.mode-switcher button.active {
		border-color: var(--accent-primary);
		color: var(--text-primary);
	}

	.mode-switcher svg {
		width: 10px;
		height: 10px;
		fill: var(--accent-primary);
	}

	.project-progress {
		padding: 7px 18px 0;
	}

	.focus-task {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 10px;
		padding: 10px 18px 2px;
	}

	.focus-task label {
		font: 600 0.67rem var(--font-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.focus-task select {
		min-width: 0;
		height: 34px;
		padding: 0 30px 0 10px;
		border: 1px solid var(--border-subtle);
		border-radius: 10px;
		background-color: rgba(8, 25, 47, 0.78);
		font: 500 0.72rem var(--font-ui);
		text-overflow: ellipsis;
		color: var(--text-primary);
	}

	.focus-task select:disabled {
		cursor: not-allowed;
		opacity: 0.68;
	}

	.focus-task select:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.project-progress div {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 7px;
	}

	.project-progress p {
		margin: 0;
		font: 600 0.76rem var(--font-ui);
		letter-spacing: 0.025em;
		color: var(--text-secondary);
	}

	.project-progress p:last-child {
		color: var(--text-primary);
	}

	progress {
		display: block;
		width: 100%;
		height: 10px;
		padding: 2px;
		border: 1px solid var(--border-subtle);
		border-radius: 999px;
		background: rgba(198, 224, 241, 0.08);
		color: var(--accent-primary);
	}

	progress::-webkit-progress-bar {
		border-radius: 999px;
		background: rgba(198, 224, 241, 0.08);
	}

	progress::-webkit-progress-value {
		border-radius: 999px;
		background: linear-gradient(
			90deg,
			var(--accent-secondary),
			var(--accent-primary)
		);
	}

	progress::-moz-progress-bar {
		border-radius: 999px;
		background: linear-gradient(
			90deg,
			var(--accent-secondary),
			var(--accent-primary)
		);
	}
</style>
