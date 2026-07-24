<script lang="ts">
	import { ArrowLeft, Check, ImagePlus, Star, Trash2, X } from '@lucide/svelte';
	import type { ProjectWorkspace, Task } from '../domain/types';

	let {
		workspace,
		projects,
		task,
		onClose,
		onSave,
		onDelete,
		onUpdateProjectImage,
	}: {
		workspace: ProjectWorkspace;
		projects: ProjectWorkspace[];
		task: Task | null;
		onClose: () => void;
		onSave: (task: Task) => void;
		onDelete: (taskId: string) => void;
		onUpdateProjectImage: (imageFile: File | null) => void;
	} = $props();

	let title = $state('');
	let category = $state('');
	let status = $state<Task['status']>('in_progress');
	let priority = $state<Task['priority']>('medium');
	let projectId = $state('');
	let estimatedSessions = $state(0);
	let completedSessions = $state(0);
	let notes = $state('');
	let error = $state('');
	let confirmingDelete = $state(false);
	let loadedTaskId = $state<string | null>(null);
	let wordCount = $derived(notes.trim().split(/\s+/).filter(Boolean).length);

	$effect(() => {
		if (!task || task.id === loadedTaskId) return;
		loadedTaskId = task.id;
		title = task.title;
		category = task.category;
		status = task.status;
		priority = task.priority;
		projectId = task.projectId;
		estimatedSessions = task.estimatedSessions;
		completedSessions = task.completedSessions;
		notes = task.notes;
		error = '';
		confirmingDelete = false;
	});

	function save(): void {
		if (!task) return;
		if (!title.trim() || !category.trim()) {
			error = 'Title and category are required.';
			return;
		}
		if (wordCount > 250) {
			error = 'Notes must be 250 words or fewer.';
			return;
		}
		onSave({
			...task,
			title: title.trim(),
			category: category.trim(),
			status,
			priority,
			projectId,
			estimatedSessions: Math.max(0, Math.round(estimatedSessions)),
			completedSessions: Math.max(0, Math.round(completedSessions)),
			notes: notes.trim(),
			updatedAt: new Date().toISOString(),
		});
	}

	function updateImage(event: Event): void {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
			error = 'Choose an image file smaller than 8 MB.';
			return;
		}
		onUpdateProjectImage(file);
	}
</script>

<aside
	id="project-panel"
	class="detail-panel"
	aria-labelledby="detail-panel-heading"
	style:--project-accent={workspace.project.accentColor}
>
	<header class="detail-header">
		<button
			type="button"
			class="icon-button"
			onclick={onClose}
			aria-label="Back to project summary"
			title="Back to project summary"
		>
			<ArrowLeft size={19} strokeWidth={1.8} />
		</button>
		<div class="header-title">
			<span aria-hidden="true"></span>
			<h3 id="detail-panel-heading">
				{task ? 'Task details' : 'Project details'}
			</h3>
			<span aria-hidden="true"></span>
		</div>
		<button
			type="button"
			class="icon-button"
			onclick={onClose}
			aria-label="Close detail panel"
		>
			<X size={18} strokeWidth={1.8} />
		</button>
	</header>

	<div class="detail-scroll">
		{#if task}
			<form onsubmit={(event) => event.preventDefault()}>
				<div class="record-heading">
					<Star size={21} strokeWidth={1.6} aria-hidden="true" />
					<label>
						<span>Task name</span>
						<input bind:value={title} maxlength="80" />
					</label>
				</div>

				<div class="form-grid">
					<label>
						<span>Category</span>
						<input bind:value={category} maxlength="40" />
					</label>
					<label>
						<span>Status</span>
						<select bind:value={status}>
							<option value="in_progress">In progress</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
							<option value="archived">Archived</option>
						</select>
					</label>
					<label>
						<span>Priority</span>
						<select bind:value={priority}>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</label>
					<label>
						<span>Project</span>
						<select bind:value={projectId}>
							{#each projects as item (item.project.id)}
								<option value={item.project.id}>{item.project.name}</option>
							{/each}
						</select>
					</label>
					<label>
						<span>Estimated sessions</span>
						<input type="number" min="0" bind:value={estimatedSessions} />
					</label>
					<label>
						<span>Completed sessions</span>
						<input type="number" min="0" bind:value={completedSessions} />
					</label>
				</div>

				<label class="notes-field">
					<span
						>Notes <small class:over-limit={wordCount > 250}
							>{wordCount} / 250 words</small
						></span
					>
					<textarea bind:value={notes} rows="7"></textarea>
				</label>

				{#if error}<p class="error" role="alert">{error}</p>{/if}

				<footer class="detail-actions">
					<div class="delete-actions">
						{#if confirmingDelete}
							<button
								type="button"
								class="delete-button delete-button--confirm"
								onclick={() => onDelete(task.id)}
							>
								<Trash2 size={16} strokeWidth={1.8} />
								Confirm delete
							</button>
							<button
								type="button"
								class="text-button"
								onclick={() => (confirmingDelete = false)}
							>
								Cancel
							</button>
						{:else}
							<button
								type="button"
								class="delete-button"
								onclick={() => (confirmingDelete = true)}
							>
								<Trash2 size={16} strokeWidth={1.8} />
								Delete task
							</button>
						{/if}
					</div>
					<button type="button" class="save-button" onclick={save}>
						<Check size={17} strokeWidth={1.9} />
						Save changes
					</button>
				</footer>
			</form>
		{:else}
			<section class="project-card">
				<p class="eyebrow">Selected project</p>
				<h4>{workspace.project.name}</h4>
				<p>{workspace.summary}</p>
				<dl>
					<div>
						<dt>Focus streak</dt>
						<dd>{workspace.focusStreak} sessions</dd>
					</div>
					<div>
						<dt>Accent</dt>
						<dd>{workspace.project.accentColor}</dd>
					</div>
				</dl>
				<div class="image-actions">
					<label class="image-picker">
						<ImagePlus size={17} strokeWidth={1.8} />
						<span
							>{workspace.project.imageId ? 'Change image' : 'Add image'}</span
						>
						<input
							class="sr-only"
							type="file"
							accept="image/*"
							onchange={updateImage}
						/>
					</label>
					{#if workspace.project.imageId}
						<button type="button" onclick={() => onUpdateProjectImage(null)}>
							Remove image
						</button>
					{/if}
				</div>
			</section>
		{/if}
	</div>
</aside>

<style>
	.detail-panel {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
		min-width: 0;
		min-height: 0;
		overflow: hidden;
		border-left: 1px solid var(--border-subtle);
		background:
			radial-gradient(
				circle at 88% 8%,
				color-mix(in srgb, var(--project-accent) 12%, transparent),
				transparent 18rem
			),
			rgba(5, 17, 33, 0.5);
		animation: detail-entry var(--motion-standard) var(--ease-out) both;
	}

	.detail-header {
		display: grid;
		grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
		align-items: center;
		gap: 0.75rem;
		min-height: 3.8rem;
		padding: 0.5rem 0.9rem;
		border-bottom: 1px solid var(--border-subtle);
		background: rgba(7, 22, 41, 0.7);
	}

	.header-title {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.65rem;
	}

	.header-title span {
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-active));
	}

	.header-title span:last-child {
		background: linear-gradient(90deg, var(--border-active), transparent);
	}

	h3,
	h4,
	p,
	dl,
	dt,
	dd {
		margin: 0;
	}

	h3 {
		font: 600 0.76rem var(--font-ui);
		letter-spacing: 0.14em;
		text-align: center;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.icon-button {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-small);
		background: transparent;
		color: var(--text-secondary);
	}

	.icon-button:hover {
		border-color: var(--border-subtle);
		background: var(--surface-hover);
		color: var(--text-primary);
	}

	.detail-scroll {
		min-height: 0;
		overflow-y: auto;
		padding: 1rem;
	}

	form,
	.project-card {
		padding: 1rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-medium);
		background: rgba(6, 21, 39, 0.58);
		box-shadow: inset 0 1px rgba(226, 245, 255, 0.07);
	}

	.record-heading {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: end;
		gap: 0.8rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--accent-primary);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	label {
		display: grid;
		gap: 0.4rem;
		font: 600 0.67rem var(--font-ui);
		color: var(--text-secondary);
	}

	input,
	select,
	textarea {
		width: 100%;
		min-height: 2.55rem;
		padding: 0 0.7rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(2, 12, 26, 0.72);
		color: var(--text-primary);
	}

	textarea {
		min-height: 8.5rem;
		padding-block: 0.7rem;
		resize: vertical;
		line-height: 1.5;
	}

	.notes-field {
		margin-top: 0.9rem;
	}

	.notes-field > span {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	small {
		font-weight: 500;
		color: var(--text-muted);
	}

	.over-limit,
	.error {
		color: var(--danger);
	}

	.error {
		margin-top: 0.75rem;
		font: 600 0.7rem var(--font-ui);
	}

	.detail-actions,
	.delete-actions,
	.detail-actions button,
	.image-actions,
	.image-picker {
		display: flex;
		align-items: center;
	}

	.image-actions {
		gap: 0.65rem;
		margin-top: 1rem;
	}

	.image-picker,
	.image-actions button {
		justify-content: center;
		min-height: 2.55rem;
		padding: 0 0.85rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(12, 34, 58, 0.68);
		font: 650 0.69rem var(--font-ui);
		color: var(--text-primary);
		cursor: pointer;
	}

	.image-picker {
		display: inline-flex;
		flex-direction: row;
	}

	.image-actions button {
		color: var(--text-secondary);
	}

	.detail-actions {
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
	}

	.delete-actions {
		gap: 0.45rem;
	}

	.detail-actions button {
		justify-content: center;
		gap: 0.45rem;
		min-height: 2.55rem;
		padding: 0 0.85rem;
		border-radius: var(--radius-small);
		font: 650 0.69rem var(--font-ui);
	}

	.delete-button {
		border: 1px solid rgba(216, 134, 152, 0.36);
		background: rgba(97, 39, 55, 0.2);
		color: #e3a5b3;
	}

	.delete-button--confirm {
		background: rgba(125, 45, 63, 0.55);
		color: #fff;
	}

	.text-button {
		border: 0;
		background: transparent;
		color: var(--text-secondary);
	}

	.save-button {
		border: 1px solid var(--border-active);
		background: linear-gradient(135deg, #315f82, #3f4e7a);
		color: #fff;
		box-shadow: var(--glow-soft);
	}

	.project-card .eyebrow {
		margin-bottom: 0.35rem;
		font: 600 0.62rem var(--font-ui);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--accent-primary);
	}

	h4 {
		margin-bottom: 0.7rem;
		font: 500 1.55rem var(--font-display);
		color: var(--text-primary);
	}

	.project-card > p:last-of-type {
		font: 500 0.78rem/1.55 var(--font-ui);
		color: var(--text-secondary);
	}

	dl {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-top: 1rem;
	}

	dl div {
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
	}

	dt {
		font: 600 0.62rem var(--font-ui);
		color: var(--text-muted);
	}

	dd {
		margin-top: 0.3rem;
		font: 600 0.78rem var(--font-ui);
		color: var(--text-primary);
	}

	@keyframes detail-entry {
		from {
			opacity: 0;
			transform: translateX(0.8rem);
		}
	}

	@media (max-width: 560px) {
		.form-grid,
		dl {
			grid-template-columns: 1fr;
		}

		.detail-actions {
			align-items: stretch;
			flex-direction: column-reverse;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.detail-panel {
			animation: none;
		}
	}
</style>
