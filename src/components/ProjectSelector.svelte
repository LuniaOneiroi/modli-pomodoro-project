<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import type { ProjectWorkspace } from '../domain/types';

	let {
		projects,
		selectedProjectId,
		onSelect,
		onAddProject,
	}: {
		projects: ProjectWorkspace[];
		selectedProjectId: string;
		onSelect: (projectId: string) => void;
		onAddProject: () => void;
	} = $props();

	function handleChange(event: Event): void {
		onSelect((event.currentTarget as HTMLSelectElement).value);
	}
</script>

<div class="project-row">
	<div class="select-frame">
		<label for="project-select">Project</label>
		<select
			id="project-select"
			value={selectedProjectId}
			onchange={handleChange}
		>
			{#each projects as workspace (workspace.project.id)}
				<option value={workspace.project.id}>{workspace.project.name}</option>
			{/each}
		</select>
	</div>
	<button
		type="button"
		onclick={onAddProject}
		title="Add project"
		aria-label="Add project"
	>
		<Plus size={21} strokeWidth={1.8} />
	</button>
</div>

<style>
	.project-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 42px;
		gap: 8px;
		padding: 12px 14px 10px;
	}

	.select-frame {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		min-height: 40px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(4, 15, 30, 0.46);
		box-shadow: inset 0 1px rgba(226, 245, 255, 0.08);
	}

	label {
		padding-left: 11px;
		font: 600 0.7rem var(--font-ui);
		letter-spacing: 0.02em;
		color: var(--text-muted);
	}

	select {
		min-width: 0;
		min-height: 38px;
		padding: 0 30px 0 6px;
		border: 0;
		background-color: transparent;
		font: 600 0.8rem var(--font-ui);
		letter-spacing: 0.01em;
		color: var(--text-primary);
	}

	button {
		display: grid;
		place-items: center;
		min-height: 40px;
		padding: 0;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(4, 15, 30, 0.46);
		color: var(--text-secondary);
		box-shadow: inset 0 1px rgba(226, 245, 255, 0.08);
		transition:
			transform 180ms var(--ease-out),
			background-color 180ms var(--ease-out);
	}

	button:hover {
		border-color: var(--border-active);
		background: var(--surface-hover);
		color: var(--text-primary);
	}

	button:active {
		transform: translateY(1px) scale(0.98);
	}

	@media (max-width: 340px) {
		label {
			display: none;
		}

		.select-frame {
			grid-template-columns: 1fr;
		}

		select {
			padding-left: 11px;
		}
	}
</style>
