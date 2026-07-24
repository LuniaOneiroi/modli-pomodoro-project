<script lang="ts">
	import { onMount } from 'svelte';
	import { ImagePlus, X } from '@lucide/svelte';

	let {
		onSubmit,
		onCancel,
	}: {
		onSubmit: (
			name: string,
			accentColor: string,
			imageFile: File | null,
		) => void;
		onCancel: () => void;
	} = $props();

	let name = $state('');
	let accentColor = $state('#bd2840');
	let imageFile = $state<File | null>(null);
	let error = $state('');
	let nameInput: HTMLInputElement;

	onMount(() => nameInput.focus());

	function handleImageChange(event: Event): void {
		const file = (event.currentTarget as HTMLInputElement).files?.[0] ?? null;
		error = '';

		if (file && !file.type.startsWith('image/')) {
			error = 'Choose an image file for the project atmosphere.';
			imageFile = null;
			return;
		}

		if (file && file.size > 8 * 1024 * 1024) {
			error = 'Choose an image smaller than 8 MB for this session preview.';
			imageFile = null;
			return;
		}

		imageFile = file;
	}

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		if (!name.trim()) {
			error = 'Enter a project name.';
			nameInput.focus();
			return;
		}

		onSubmit(name, accentColor, imageFile);
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') onCancel();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<form onsubmit={handleSubmit} aria-labelledby="add-project-heading">
	<header>
		<div>
			<p class="eyebrow">New focus path</p>
			<h3 id="add-project-heading">Add project</h3>
		</div>
		<button
			type="button"
			class="icon-button"
			onclick={onCancel}
			aria-label="Close add project form"
			title="Close"
		>
			<X size={18} strokeWidth={1.8} />
		</button>
	</header>

	<div class="form-grid">
		<div class="field field--name">
			<label for="project-name">Project name</label>
			<input
				id="project-name"
				bind:this={nameInput}
				bind:value={name}
				maxlength="48"
				autocomplete="off"
				required
			/>
			<p class="helper">Up to 48 characters</p>
		</div>

		<div class="field field--color">
			<label for="project-accent">Accent color</label>
			<div class="color-control">
				<input id="project-accent" type="color" bind:value={accentColor} />
				<output for="project-accent">{accentColor.toUpperCase()}</output>
			</div>
			<p class="helper">Used for glints and progress</p>
		</div>

		<div class="field field--image">
			<label for="project-image">Optional project image</label>
			<label class="file-picker" for="project-image">
				<ImagePlus size={18} strokeWidth={1.8} />
				<span>{imageFile?.name ?? 'Choose an image'}</span>
			</label>
			<input
				id="project-image"
				class="sr-only"
				type="file"
				accept="image/*"
				onchange={handleImageChange}
			/>
			<p class="helper">Stored locally in this browser · maximum 8 MB</p>
		</div>
	</div>

	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}

	<div class="actions">
		<button type="button" class="text-button" onclick={onCancel}>Cancel</button>
		<button type="submit" class="primary-button">Create project</button>
	</div>
</form>

<style>
	form {
		margin: 0 16px 16px;
		padding: 16px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-medium);
		background: rgba(6, 21, 39, 0.72);
		box-shadow: inset 0 1px rgba(226, 245, 255, 0.07);
	}

	header,
	.actions,
	.color-control,
	.file-picker {
		display: flex;
		align-items: center;
	}

	header {
		justify-content: space-between;
		gap: 16px;
		margin-bottom: 14px;
	}

	.eyebrow,
	h3,
	.helper,
	.error {
		margin: 0;
	}

	.eyebrow {
		font: 700 0.62rem var(--font-ui);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--accent-primary);
	}

	h3 {
		font: 600 1.25rem var(--font-display);
		color: var(--text-primary);
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		padding: 0;
		border: 1px solid var(--modli-gold-dark);
		border-radius: 5px;
		background: transparent;
		color: var(--modli-gold-light);
	}

	.form-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(9rem, 0.65fr);
		gap: 12px 16px;
	}

	.field {
		display: grid;
		align-content: start;
		gap: 6px;
	}

	.field--image {
		grid-column: 1 / -1;
	}

	label {
		font: 650 0.73rem var(--font-ui);
		color: var(--modli-parchment);
	}

	input:not([type='color']) {
		width: 100%;
		min-height: 40px;
		padding: 0 11px;
		border: 1px solid var(--modli-gold-dark);
		border-radius: 5px;
		background: color-mix(in srgb, var(--modli-navy) 88%, transparent);
		color: var(--modli-ivory);
	}

	.color-control {
		gap: 9px;
		min-height: 40px;
		padding: 4px 9px 4px 5px;
		border: 1px solid var(--modli-gold-dark);
		border-radius: 5px;
	}

	input[type='color'] {
		width: 38px;
		height: 30px;
		padding: 0;
		border: 0;
		background: transparent;
	}

	output {
		font: 600 0.7rem var(--font-ui);
		font-variant-numeric: tabular-nums;
		color: var(--modli-parchment);
	}

	.file-picker {
		gap: 9px;
		min-height: 40px;
		padding: 0 11px;
		border: 1px dashed var(--modli-gold-dark);
		border-radius: 5px;
		color: var(--modli-gold-light);
		cursor: pointer;
	}

	.file-picker:focus-within {
		outline: 3px solid var(--modli-ivory);
		outline-offset: 2px;
	}

	.file-picker span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.helper {
		font: 500 0.63rem/1.35 var(--font-ui);
		color: color-mix(in srgb, var(--modli-parchment) 63%, transparent);
	}

	.error {
		margin-top: 10px;
		font: 600 0.72rem var(--font-ui);
		color: var(--modli-gold-light);
	}

	.actions {
		justify-content: flex-end;
		gap: 10px;
		margin-top: 14px;
	}

	.text-button,
	.primary-button {
		min-height: 38px;
		padding: 0 14px;
		border-radius: 5px;
		font: 700 0.7rem var(--font-ui);
		letter-spacing: 0.04em;
	}

	.text-button {
		border: 1px solid transparent;
		background: transparent;
		color: var(--modli-parchment);
	}

	.primary-button {
		border: 1px solid var(--modli-gold);
		background: var(--modli-crimson);
		color: var(--modli-ivory);
	}

	button:active,
	.file-picker:active {
		transform: translateY(1px) scale(0.99);
	}

	@media (max-width: 560px) {
		.form-grid {
			grid-template-columns: 1fr;
		}

		.field--image {
			grid-column: auto;
		}
	}
</style>
