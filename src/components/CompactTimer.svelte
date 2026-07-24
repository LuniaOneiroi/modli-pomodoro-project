<script lang="ts">
	import type {
		Project,
		ProjectStatistics,
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
