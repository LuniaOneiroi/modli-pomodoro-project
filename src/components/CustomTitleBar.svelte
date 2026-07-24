<script lang="ts">
	import { Grip, Maximize2, Minimize2, Minus, Pin, X } from '@lucide/svelte';
	import type { WindowMode } from '../domain/types';

	let {
		windowMode,
		desktopRuntime,
		alwaysOnTop,
		onToggleWindowMode,
		onTogglePin,
		onMinimize,
		onClose,
	}: {
		windowMode: WindowMode;
		desktopRuntime: boolean;
		alwaysOnTop: boolean;
		onToggleWindowMode: () => void;
		onTogglePin: () => void;
		onMinimize: () => void;
		onClose: () => void;
	} = $props();
</script>

<header class="title-bar" data-tauri-drag-region="deep">
	<div class="drag-mark" aria-hidden="true">
		<Grip size={18} strokeWidth={1.8} />
	</div>
	<div class="brand-rule" aria-hidden="true"></div>
	<p class="brand">ModLi</p>
	<div class="brand-rule brand-rule--right" aria-hidden="true"></div>
	<nav aria-label="Window controls" data-tauri-drag-region="false">
		<button
			type="button"
			disabled={!desktopRuntime}
			title={desktopRuntime
				? alwaysOnTop
					? 'Unpin window'
					: 'Keep window on top'
				: 'Pin is available in the desktop app'}
			aria-label={alwaysOnTop ? 'Unpin window' : 'Pin window'}
			aria-pressed={alwaysOnTop}
			onclick={onTogglePin}
		>
			<Pin size={17} strokeWidth={1.8} />
		</button>
		<button
			type="button"
			disabled={!desktopRuntime}
			title={desktopRuntime
				? 'Minimize window'
				: 'Minimize is available in the desktop app'}
			aria-label="Minimize window"
			onclick={onMinimize}
		>
			<Minus size={18} strokeWidth={1.8} />
		</button>
		<button
			type="button"
			onclick={onToggleWindowMode}
			aria-label={windowMode === 'compact'
				? 'Expand project view'
				: 'Collapse project view'}
			aria-expanded={windowMode === 'expanded'}
			aria-controls="project-panel"
			title={windowMode === 'compact'
				? 'Expand project view'
				: 'Collapse project view'}
		>
			{#if windowMode === 'compact'}
				<Maximize2 size={17} strokeWidth={1.8} />
			{:else}
				<Minimize2 size={17} strokeWidth={1.8} />
			{/if}
		</button>
		<button
			type="button"
			disabled={!desktopRuntime}
			title={desktopRuntime
				? 'Close window'
				: 'Close is available in the desktop app'}
			aria-label="Close window"
			onclick={onClose}
		>
			<X size={18} strokeWidth={1.8} />
		</button>
	</nav>
</header>

<style>
	.title-bar {
		display: grid;
		grid-template-columns: auto 1fr auto 1fr auto;
		align-items: center;
		min-height: 48px;
		padding: 0 10px;
		border-bottom: 1px solid var(--border-subtle);
		background: rgba(5, 16, 31, 0.42);
	}

	.drag-mark {
		display: grid;
		place-items: center;
		width: 30px;
		color: var(--text-muted);
		opacity: 0.85;
	}

	.brand {
		margin: 0 10px;
		font-family: var(--font-display);
		font-size: 1.32rem;
		letter-spacing: 0.04em;
		color: var(--text-primary);
		text-shadow: 0 0 18px rgba(169, 217, 247, 0.2);
	}

	.brand-rule {
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-active));
	}

	.brand-rule--right {
		background: linear-gradient(90deg, var(--border-active), transparent);
	}

	nav {
		display: flex;
		align-items: center;
	}

	button {
		display: grid;
		place-items: center;
		width: 30px;
		height: 34px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--text-secondary);
	}

	button:disabled {
		cursor: not-allowed;
		opacity: 0.52;
	}

	button:not(:disabled) {
		border-radius: 4px;
		transition:
			transform 180ms var(--ease-out),
			background-color 180ms var(--ease-out);
	}

	button:not(:disabled):hover {
		background: var(--surface-hover);
		color: var(--text-primary);
	}

	button:not(:disabled):active {
		transform: translateY(1px) scale(0.98);
	}

	@media (max-width: 360px) {
		.title-bar {
			grid-template-columns: auto 1fr auto;
		}

		.brand-rule,
		.brand-rule--right {
			display: none;
		}
	}
</style>
