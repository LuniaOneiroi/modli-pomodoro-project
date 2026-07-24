<script lang="ts">
	import { BellRing, SlidersHorizontal, Volume2, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { ModLiSettings } from '../domain/types';
	import { DEFAULT_SETTINGS } from '../domain/timer';

	let {
		settings,
		onSave,
		onClose,
		onPreviewSound,
	}: {
		settings: ModLiSettings;
		onSave: (settings: ModLiSettings) => void;
		onClose: () => void;
		onPreviewSound: (volume: number) => void;
	} = $props();

	let panel: HTMLElement;
	let draft = $state<ModLiSettings>(structuredClone(DEFAULT_SETTINGS));
	let error = $state('');

	onMount(() => {
		draft = structuredClone(settings);
		panel.querySelector<HTMLElement>('button')?.focus();
	});

	function save(): void {
		if (
			draft.focusMinutes < 1 ||
			draft.breakMinutes < 1 ||
			draft.longBreakMinutes < 1 ||
			draft.focusSessionsBeforeLongBreak < 1
		) {
			error = 'Timer durations and the long-break interval must be at least 1.';
			return;
		}
		onSave({
			...draft,
			focusMinutes: Math.round(draft.focusMinutes),
			breakMinutes: Math.round(draft.breakMinutes),
			longBreakMinutes: Math.round(draft.longBreakMinutes),
			focusSessionsBeforeLongBreak: Math.round(
				draft.focusSessionsBeforeLongBreak,
			),
			volume: Math.min(1, Math.max(0, draft.volume)),
			glowIntensity: Math.min(1, Math.max(0, draft.glowIntensity)),
		});
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}
		if (event.key !== 'Tab') return;
		const controls = Array.from(
			panel.querySelectorAll<HTMLElement>(
				'button:not(:disabled), input:not(:disabled), select:not(:disabled)',
			),
		);
		if (controls.length === 0) return;
		const first = controls[0]!;
		const last = controls.at(-1)!;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="settings-backdrop">
	<button
		type="button"
		class="dismiss-layer"
		onclick={onClose}
		aria-label="Close settings"
	></button>
	<div
		bind:this={panel}
		class="settings-panel"
		role="dialog"
		aria-modal="true"
		aria-labelledby="settings-heading"
	>
		<header>
			<div>
				<p>Preferences</p>
				<h2 id="settings-heading">Settings</h2>
			</div>
			<button type="button" onclick={onClose} aria-label="Close settings">
				<X size={20} strokeWidth={1.8} />
			</button>
		</header>

		<div class="settings-scroll">
			<section aria-labelledby="timer-settings-heading">
				<div class="section-title">
					<SlidersHorizontal size={18} strokeWidth={1.7} />
					<h3 id="timer-settings-heading">Timer</h3>
				</div>
				<div class="field-grid">
					<label>
						<span>Focus minutes</span>
						<input
							type="number"
							min="1"
							max="180"
							bind:value={draft.focusMinutes}
						/>
					</label>
					<label>
						<span>Short break</span>
						<input
							type="number"
							min="1"
							max="60"
							bind:value={draft.breakMinutes}
						/>
					</label>
					<label>
						<span>Long break</span>
						<input
							type="number"
							min="1"
							max="90"
							bind:value={draft.longBreakMinutes}
						/>
					</label>
					<label>
						<span>Focus sessions per long break</span>
						<input
							type="number"
							min="1"
							max="12"
							bind:value={draft.focusSessionsBeforeLongBreak}
						/>
					</label>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.autoStartBreaks} />
					<span>Automatically begin breaks</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.autoStartFocus} />
					<span>Automatically begin focus sessions</span>
				</label>
			</section>

			<section aria-labelledby="sound-settings-heading">
				<div class="section-title">
					<Volume2 size={18} strokeWidth={1.7} />
					<h3 id="sound-settings-heading">Sound</h3>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.soundEnabled} />
					<span>Timer alerts</span>
				</label>
				<label class="range-field">
					<span>Alert volume</span>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={draft.volume}
					/>
				</label>
				<button
					type="button"
					class="secondary-button"
					onclick={() => onPreviewSound(draft.volume)}
				>
					<BellRing size={16} strokeWidth={1.8} />
					Preview alert
				</button>
			</section>

			<section aria-labelledby="appearance-settings-heading">
				<div class="section-title">
					<SlidersHorizontal size={18} strokeWidth={1.7} />
					<h3 id="appearance-settings-heading">Appearance</h3>
				</div>
				<label>
					<span>Theme</span>
					<select bind:value={draft.theme}>
						<option value="hybrid">Hybrid</option>
						<option value="liminal">Liminal</option>
						<option value="constellation">Constellation</option>
					</select>
				</label>
				<label class="range-field">
					<span>Glow intensity</span>
					<input
						type="range"
						min="0"
						max="1"
						step="0.05"
						bind:value={draft.glowIntensity}
					/>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.backgroundMotion} />
					<span>Background motion</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.reducedMotion} />
					<span>Reduce motion</span>
				</label>
			</section>

			<section aria-labelledby="window-settings-heading">
				<div class="section-title">
					<SlidersHorizontal size={18} strokeWidth={1.7} />
					<h3 id="window-settings-heading">Window</h3>
				</div>
				<label>
					<span>Open ModLi in</span>
					<select bind:value={draft.lastWindowMode}>
						<option value="compact">Compact view</option>
						<option value="expanded">Expanded view</option>
					</select>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.rememberWindow} />
					<span>Remember the last view</span>
				</label>
				<label class="toggle">
					<input type="checkbox" bind:checked={draft.alwaysOnTop} />
					<span>Keep ModLi above other windows</span>
				</label>
				<p class="support-note">
					The desktop app remembers its native position and size. Browser
					preview ignores desktop-only window controls.
				</p>
			</section>

			{#if error}<p class="error" role="alert">{error}</p>{/if}
		</div>

		<footer>
			<button type="button" class="text-button" onclick={onClose}>Cancel</button
			>
			<button type="button" class="primary-button" onclick={save}>
				Save settings
			</button>
		</footer>
	</div>
</div>

<style>
	.settings-backdrop {
		position: absolute;
		inset: 0;
		z-index: 20;
		display: flex;
		justify-content: flex-end;
		background: rgba(1, 7, 17, 0.6);
		backdrop-filter: blur(5px);
	}

	.dismiss-layer {
		position: absolute;
		inset: 0;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: default;
	}

	.settings-panel {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		width: min(100%, 31rem);
		min-height: 0;
		border-left: 1px solid var(--border-active);
		background:
			linear-gradient(145deg, rgba(206, 235, 252, 0.08), transparent 25%),
			rgba(5, 18, 35, 0.94);
		box-shadow: -24px 0 70px rgba(0, 5, 16, 0.5);
		animation: settings-arrive var(--motion-standard) var(--ease-out) both;
	}

	header,
	footer,
	.section-title,
	.secondary-button {
		display: flex;
		align-items: center;
	}

	header,
	footer {
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.15rem;
		border-bottom: 1px solid var(--border-subtle);
	}

	header p,
	header h2,
	h3,
	.support-note,
	.error {
		margin: 0;
	}

	header p {
		font: 600 0.62rem var(--font-ui);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--accent-primary);
	}

	header h2 {
		font: 500 1.55rem var(--font-display);
		color: var(--text-primary);
	}

	header button {
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(10, 29, 50, 0.65);
		color: var(--text-secondary);
	}

	.settings-scroll {
		min-height: 0;
		overflow-y: auto;
		padding: 0.2rem 1.15rem 1.4rem;
	}

	section {
		padding: 1.15rem 0;
		border-bottom: 1px solid var(--border-subtle);
	}

	.section-title {
		gap: 0.55rem;
		margin-bottom: 0.9rem;
		color: var(--accent-primary);
	}

	h3 {
		font: 650 0.86rem var(--font-ui);
		color: var(--text-primary);
	}

	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	label {
		display: grid;
		gap: 0.42rem;
		margin-bottom: 0.75rem;
		font: 600 0.69rem var(--font-ui);
		color: var(--text-secondary);
	}

	input,
	select {
		width: 100%;
		min-height: 2.55rem;
		padding: 0 0.7rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(2, 12, 26, 0.7);
		color: var(--text-primary);
	}

	input[type='range'] {
		min-height: 1.5rem;
		padding: 0;
		accent-color: var(--accent-primary);
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-height: 2.4rem;
		margin-bottom: 0.3rem;
	}

	.toggle input {
		width: 1.05rem;
		min-height: auto;
		height: 1.05rem;
		accent-color: var(--accent-primary);
	}

	.secondary-button {
		justify-content: center;
		gap: 0.45rem;
		min-height: 2.45rem;
		padding: 0 0.8rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(16, 39, 64, 0.65);
		color: var(--text-primary);
	}

	.support-note {
		font: 500 0.67rem/1.5 var(--font-ui);
		color: var(--text-muted);
	}

	.error {
		margin-top: 1rem;
		color: var(--danger);
	}

	footer {
		border-top: 1px solid var(--border-subtle);
		border-bottom: 0;
	}

	footer button {
		min-height: 2.7rem;
		padding: 0 1rem;
		border-radius: var(--radius-small);
		font: 650 0.72rem var(--font-ui);
	}

	.text-button {
		border: 0;
		background: transparent;
		color: var(--text-secondary);
	}

	.primary-button {
		border: 1px solid var(--border-active);
		background: linear-gradient(135deg, #315f82, #3f4e7a);
		color: #fff;
		box-shadow: var(--glow-soft);
	}

	@keyframes settings-arrive {
		from {
			opacity: 0;
			transform: translateX(1.25rem);
		}
	}

	@media (max-width: 560px) {
		.settings-panel {
			width: 100%;
			border-left: 0;
		}

		.field-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.settings-panel {
			animation: none;
		}
	}
</style>
