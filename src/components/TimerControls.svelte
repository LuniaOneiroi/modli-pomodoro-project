<script lang="ts">
	import { Pause, Play, RotateCcw } from '@lucide/svelte';
	import type { TimerStatus } from '../domain/types';

	let {
		status,
		onStart,
		onPause,
		onReset,
	}: {
		status: TimerStatus;
		onStart: () => void;
		onPause: () => void;
		onReset: () => void;
	} = $props();
</script>

<div class="controls" aria-label="Timer controls">
	<button
		type="button"
		class="control"
		class:control--active={status === 'running'}
		onclick={onStart}
		disabled={status === 'running'}
	>
		<span class="control__disc"
			><Play size={28} strokeWidth={1.8} fill="currentColor" /></span
		>
		<span>{status === 'paused' ? 'Resume' : 'Start'}</span>
	</button>
	<button
		type="button"
		class="control control--crimson"
		onclick={onPause}
		disabled={status !== 'running'}
	>
		<span class="control__disc"
			><Pause size={27} strokeWidth={1.8} fill="currentColor" /></span
		>
		<span>Pause</span>
	</button>
	<button type="button" class="control" onclick={onReset}>
		<span class="control__disc"><RotateCcw size={27} strokeWidth={1.8} /></span>
		<span>Reset</span>
	</button>
</div>

<style>
	.controls {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		padding: 12px 14px 16px;
	}

	.control {
		display: grid;
		justify-items: center;
		gap: 7px;
		padding: 0;
		border: 0;
		background: transparent;
		font: 600 0.66rem var(--font-ui);
		letter-spacing: 0.06em;
		color: var(--text-secondary);
	}

	.control__disc {
		display: grid;
		place-items: center;
		width: 54px;
		height: 46px;
		border: 1px solid var(--border-subtle);
		border-radius: 15px;
		background:
			linear-gradient(145deg, rgba(210, 238, 255, 0.09), transparent),
			rgba(9, 26, 47, 0.74);
		color: var(--text-primary);
		box-shadow:
			inset 0 1px rgba(232, 248, 255, 0.1),
			0 8px 18px rgba(0, 7, 20, 0.34);
		transition:
			transform 180ms var(--ease-out),
			border-color 180ms var(--ease-out);
	}

	.control--crimson .control__disc {
		background:
			linear-gradient(145deg, rgba(220, 217, 250, 0.12), transparent),
			rgba(32, 31, 67, 0.76);
	}

	.control:hover:not(:disabled) .control__disc {
		transform: translateY(-2px);
		border-color: var(--border-active);
		box-shadow: var(--glow-soft);
	}

	.control:active:not(:disabled) .control__disc {
		transform: translateY(1px) scale(0.98);
	}

	.control:disabled {
		cursor: not-allowed;
		opacity: 0.44;
	}

	.control:focus-visible {
		outline: none;
	}

	.control:focus-visible .control__disc {
		outline: 2px solid var(--accent-primary);
		outline-offset: 3px;
	}

	@media (max-width: 340px) {
		.controls {
			gap: 6px;
		}

		.control__disc {
			width: 50px;
			height: 44px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.control__disc {
			transition: none;
		}
	}
</style>
