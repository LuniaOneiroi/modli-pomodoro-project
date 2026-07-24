<script lang="ts">
	import type { Task } from '../domain/types';

	let {
		projectId,
		onSubmit,
		onComplete,
	}: {
		projectId: string;
		onSubmit: (
			projectId: string,
			title: string,
			category: string,
			priority: Task['priority'],
			estimatedSessions: number,
			notes: string,
		) => void;
		onComplete: () => void;
	} = $props();

	let title = $state('');
	let category = $state('');
	let priority = $state<Task['priority']>('high');
	let estimatedSessions = $state(1);
	let notes = $state('');
	let error = $state('');
	let wordCount = $derived(notes.trim().split(/\s+/).filter(Boolean).length);

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		const trimmedTitle = title.trim();
		const trimmedCategory = category.trim();

		if (!trimmedTitle) {
			error = 'Enter a task title.';
			return;
		}

		if (!trimmedCategory) {
			error = 'Enter a category.';
			return;
		}

		if (wordCount > 250) {
			error = 'Notes must be 250 words or fewer.';
			return;
		}

		onSubmit(
			projectId,
			trimmedTitle,
			trimmedCategory,
			priority,
			estimatedSessions,
			notes.trim(),
		);
		onComplete();
		title = '';
		category = '';
		priority = 'high';
		estimatedSessions = 1;
		notes = '';
		error = '';
	}
</script>

<form class="task-form" onsubmit={handleSubmit}>
	<h4>Add task</h4>
	<div class="field">
		<label for="task-title">Title</label>
		<input id="task-title" bind:value={title} maxlength="80" />
	</div>
	<div class="field">
		<label for="task-category">Category</label>
		<input id="task-category" bind:value={category} maxlength="40" />
	</div>
	<div class="field">
		<label for="task-priority">Priority</label>
		<select id="task-priority" bind:value={priority}>
			<option value="high">High</option>
			<option value="medium">Medium</option>
			<option value="low">Low</option>
		</select>
	</div>
	<div class="field">
		<label for="task-estimated-sessions">Estimated sessions</label>
		<input
			id="task-estimated-sessions"
			type="number"
			min="0"
			bind:value={estimatedSessions}
		/>
	</div>
	<div class="field">
		<label for="task-notes"
			>Notes <span class:over-limit={wordCount > 250}
				>{wordCount} / 250 words</span
			></label
		>
		<textarea id="task-notes" rows="3" bind:value={notes}></textarea>
	</div>
	{#if error}
		<p class="error" role="alert">{error}</p>
	{/if}
	<div class="actions">
		<button type="button" class="text-button" onclick={onComplete}
			>Cancel</button
		>
		<button type="submit" class="primary-button">Create task</button>
	</div>
</form>

<style>
	.task-form {
		margin: 0 16px 16px;
		padding: 16px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-medium);
		background: rgba(6, 21, 39, 0.72);
		color: var(--text-primary);
	}

	h4 {
		margin: 0 0 12px;
		font: 600 1rem var(--font-display);
	}

	.field {
		display: grid;
		gap: 6px;
		margin-bottom: 10px;
	}

	label {
		font: 650 0.73rem var(--font-ui);
		color: var(--text-secondary);
	}

	label {
		display: flex;
		justify-content: space-between;
	}

	label span {
		font-weight: 500;
		color: var(--text-muted);
	}

	label .over-limit {
		color: var(--danger);
	}

	input,
	select,
	textarea {
		width: 100%;
		min-height: 40px;
		padding: 0 11px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(2, 12, 26, 0.72);
		color: var(--text-primary);
	}

	textarea {
		min-height: 84px;
		padding: 10px 11px;
	}

	.error {
		margin: 0 0 10px;
		color: var(--danger);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
	}

	.actions button {
		min-height: 2.5rem;
		padding: 0 0.85rem;
		border-radius: var(--radius-small);
		font: 650 0.7rem var(--font-ui);
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
	}
</style>
