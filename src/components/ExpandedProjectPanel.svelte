<script lang="ts">
	import {
		Check,
		ClipboardCheck,
		Flame,
		Hourglass,
		NotebookText,
		Plus,
		Star,
	} from '@lucide/svelte';
	import type {
		ProjectStatistics,
		ProjectWorkspace,
		Task,
	} from '../domain/types';
	import AddProjectForm from './AddProjectForm.svelte';
	import TaskForm from './TaskForm.svelte';

	let taskFormOpen = $state(false);

	let {
		workspace,
		statistics,
		highPriorityTasks,
		projectFormOpen,
		onOpenProjectForm,
		onCloseProjectForm,
		onCreateProject,
		onCreateTask,
		onOpenProjectDetails,
		onOpenTaskDetails,
		onToggleTask,
	}: {
		workspace: ProjectWorkspace;
		statistics: ProjectStatistics;
		highPriorityTasks: Task[];
		projectFormOpen: boolean;
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
		onOpenProjectDetails: () => void;
		onOpenTaskDetails: (taskId: string) => void;
		onToggleTask: (taskId: string) => void;
	} = $props();
</script>

<aside
	id="project-panel"
	class="project-panel"
	aria-labelledby="project-panel-heading"
>
	<div class="panel-scroll">
		<header class="panel-header">
			<div>
				<p class="eyebrow">Project summary</p>
				<button
					type="button"
					class="panel-title-button"
					onclick={onOpenProjectDetails}
				>
					<h2 id="project-panel-heading">{workspace.project.name}</h2>
				</button>
			</div>
			<button
				type="button"
				class="add-project-button"
				onclick={onOpenProjectForm}
				aria-expanded={projectFormOpen}
			>
				<Plus size={17} strokeWidth={1.8} />
				<span>Add project</span>
			</button>
		</header>

		<div class="celestial-rule" aria-hidden="true">
			<span></span>
			<svg viewBox="0 0 18 18"
				><path d="M9 0 11 7l7 2-7 2-2 7-2-7-7-2 7-2z" /></svg
			>
			<span></span>
		</div>

		<p class="summary">{workspace.summary}</p>
		{#if workspace.isSample}<p class="sample-label">
				Clearly identified sample project data
			</p>{/if}

		{#if projectFormOpen}
			<AddProjectForm
				onSubmit={onCreateProject}
				onCancel={onCloseProjectForm}
			/>
		{/if}

		<section class="statistics" aria-label="Project statistics">
			<article class="statistic">
				<ClipboardCheck size={25} strokeWidth={1.6} aria-hidden="true" />
				<div>
					<p>Tasks completed</p>
					<strong
						>{statistics.completedTasks}<span>
							/ {statistics.totalTasks}</span
						></strong
					>
				</div>
			</article>
			<article class="statistic statistic--progress">
				<Star size={25} strokeWidth={1.6} aria-hidden="true" />
				<div>
					<p>Project progress</p>
					<strong>{statistics.progressPercent}<span>%</span></strong>
				</div>
				<progress max="100" value={statistics.progressPercent}
					>{statistics.progressPercent}% complete</progress
				>
			</article>
			<article class="statistic">
				<Flame size={25} strokeWidth={1.6} aria-hidden="true" />
				<div>
					<p>Focus streak</p>
					<strong>{workspace.focusStreak}<span> sessions</span></strong>
				</div>
			</article>
			<article class="statistic">
				<Hourglass size={25} strokeWidth={1.6} aria-hidden="true" />
				<div>
					<p>Sessions est. / done</p>
					<strong
						>{statistics.estimatedSessions}<span>
							/ {statistics.completedSessions}</span
						></strong
					>
				</div>
			</article>
		</section>

		<section class="tasks" aria-labelledby="high-priority-heading">
			<header class="section-heading">
				<div>
					<p class="eyebrow">Current work</p>
					<h3 id="high-priority-heading">High-priority tasks</h3>
				</div>
				<button
					type="button"
					class="add-task-button"
					onclick={() => (taskFormOpen = true)}
				>
					<span>+ Add Task</span>
				</button>
			</header>

			{#if taskFormOpen}
				<TaskForm
					projectId={workspace.project.id}
					onSubmit={onCreateTask}
					onComplete={() => {
						taskFormOpen = false;
					}}
				/>
			{/if}

			{#if highPriorityTasks.length > 0}
				<ul>
					{#each highPriorityTasks as task (task.id)}
						<li>
							<button
								type="button"
								class="task-check"
								onclick={() => onToggleTask(task.id)}
								aria-label={`Mark ${task.title} complete`}
								title="Mark complete"
							>
								<Check size={15} strokeWidth={1.9} />
							</button>
							<button
								type="button"
								class="task-row"
								onclick={() => onOpenTaskDetails(task.id)}
							>
								<span class="task-star" aria-hidden="true"
									><Star size={16} strokeWidth={1.7} /></span
								>
								<div class="task-copy">
									<p>{task.title}</p>
									<span>{task.category}</span>
								</div>
								{#if task.notes}
									<span class="notes-icon" aria-label="Has notes">
										<NotebookText size={16} strokeWidth={1.7} />
									</span>
								{/if}
								<span class="priority">High priority</span>
								<span class="status">In progress</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty-state">
					<svg aria-hidden="true" viewBox="0 0 48 48"
						><circle cx="24" cy="24" r="17" /><path
							d="m24 12 2.8 9.2L36 24l-9.2 2.8L24 36l-2.8-9.2L12 24l9.2-2.8z"
						/></svg
					>
					<p>No active high-priority tasks</p>
					<span
						>Add a high-priority task to keep current work visible here.</span
					>
				</div>
			{/if}
		</section>
	</div>
</aside>

<style>
	.project-panel {
		min-width: 0;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background:
			radial-gradient(
				circle at 88% 5%,
				color-mix(in srgb, var(--project-accent) 12%, transparent),
				transparent 16rem
			),
			rgba(5, 17, 33, 0.44);
		backdrop-filter: blur(18px);
		animation: panel-entry 260ms var(--ease-out) both;
	}

	.panel-scroll {
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-color: var(--text-muted) transparent;
	}

	.panel-header,
	.section-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 18px;
	}

	.panel-header {
		padding: 17px 18px 0;
	}

	.eyebrow,
	h2,
	h3,
	.summary,
	.sample-label,
	.statistic p,
	.statistic strong,
	.task-copy p,
	.task-copy span,
	.empty-state p,
	.empty-state span {
		margin: 0;
	}

	.eyebrow {
		font: 700 0.62rem var(--font-ui);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--accent-primary);
	}

	h2 {
		font: 600 clamp(1.4rem, 2.6vw, 1.85rem)/1.1 var(--font-display);
		text-wrap: balance;
		color: var(--text-primary);
	}

	.panel-title-button {
		display: block;
		padding: 0;
		border: 0;
		background: transparent;
		text-align: left;
		color: inherit;
		appearance: none;
	}

	.panel-title-button h2 {
		transition: color 180ms var(--ease-out);
	}

	.panel-title-button:hover h2 {
		color: #fff;
	}

	.panel-title-button:active {
		transform: translateY(1px);
	}

	.add-project-button,
	.section-heading button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		width: 7.5rem;
		min-height: 38px;
		padding: 0 12px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(10, 29, 51, 0.66);
		font: 700 0.69rem var(--font-ui);
		color: var(--text-primary);
	}

	.add-project-button:active {
		transform: translateY(1px) scale(0.98);
	}

	.celestial-rule {
		display: grid;
		grid-template-columns: 1fr 16px 1fr;
		align-items: center;
		gap: 8px;
		margin: 12px 18px 8px;
	}

	.celestial-rule span {
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--border-active));
	}

	.celestial-rule span:last-child {
		background: linear-gradient(90deg, var(--border-active), transparent);
	}

	.celestial-rule svg {
		width: 16px;
		fill: var(--accent-primary);
	}

	.summary {
		max-width: 72ch;
		padding: 0 18px;
		font: 500 0.76rem/1.52 var(--font-ui);
		text-wrap: pretty;
		color: var(--text-secondary);
	}

	.sample-label {
		width: fit-content;
		margin: 8px 18px 13px;
		padding: 3px 7px;
		border-left: 2px solid var(--project-accent);
		font: 700 0.58rem var(--font-ui);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.statistics {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		margin: 0 16px 18px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-medium);
		background: rgba(8, 25, 45, 0.52);
		box-shadow: inset 0 1px rgba(225, 244, 255, 0.07);
		overflow: hidden;
	}

	.statistic {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 9px;
		min-height: 94px;
		padding: 12px 11px;
		border-right: 1px solid var(--border-subtle);
		color: var(--accent-primary);
	}

	.statistic:last-child {
		border-right: 0;
	}

	.statistic p {
		font: 600 0.61rem/1.3 var(--font-ui);
		color: var(--text-secondary);
	}

	.statistic strong {
		display: block;
		font: 500 1.48rem/1.1 var(--font-numeric);
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.statistic strong span {
		font-size: 0.72rem;
		color: var(--text-muted);
	}

	.statistic--progress {
		grid-template-rows: 1fr auto;
	}

	.statistic--progress > div {
		grid-column: 2;
	}

	progress {
		grid-column: 1 / -1;
		width: 100%;
		height: 7px;
		border: 1px solid var(--border-subtle);
		border-radius: 99px;
		background: rgba(198, 224, 241, 0.08);
	}

	progress::-webkit-progress-bar {
		border-radius: 99px;
		background: rgba(198, 224, 241, 0.08);
	}

	progress::-webkit-progress-value {
		border-radius: 99px;
		background: linear-gradient(
			90deg,
			var(--accent-secondary),
			var(--accent-primary)
		);
	}

	progress::-moz-progress-bar {
		border-radius: 99px;
		background: linear-gradient(
			90deg,
			var(--accent-secondary),
			var(--accent-primary)
		);
	}

	.tasks {
		margin: 0 16px 18px;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-medium);
		overflow: hidden;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--project-accent) 8%, transparent) 0%,
				transparent 48%
			),
			rgba(6, 20, 38, 0.58);
		box-shadow: inset 0 1px rgba(228, 245, 255, 0.07);
	}

	.section-heading {
		padding: 12px 12px 10px;
		border-bottom: 1px solid var(--border-subtle);
	}

	h3 {
		font: 600 1.03rem var(--font-display);
		color: var(--text-primary);
	}

	.add-task-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-small);
		background: rgba(12, 34, 58, 0.72);
		font: 700 0.68rem var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.add-task-button:hover {
		border-color: var(--border-active);
		background: var(--surface-hover);
	}

	.add-task-button:active {
		transform: translateY(1px) scale(0.98);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		padding-left: 0.65rem;
		border-bottom: 1px solid var(--border-subtle);
		background: rgba(3, 14, 29, 0.18);
	}

	.task-check {
		display: grid;
		place-items: center;
		width: 1.65rem;
		height: 1.65rem;
		padding: 0;
		border: 1px solid var(--border-active);
		border-radius: 7px;
		background: rgba(5, 20, 39, 0.72);
		color: transparent;
		transition:
			color var(--motion-fast) var(--ease-out),
			background var(--motion-fast) var(--ease-out);
	}

	.task-check:hover {
		background: var(--surface-hover);
		color: var(--accent-primary);
	}

	.task-row {
		display: grid;
		grid-template-columns: auto minmax(12rem, 1fr) auto auto auto;
		align-items: center;
		gap: 9px;
		width: 100%;
		min-height: 58px;
		padding: 8px 11px;
		border: 0;
		background: transparent;
		text-align: left;
		color: inherit;
	}

	li:last-child {
		border-bottom: 0;
	}

	.task-star,
	.notes-icon {
		color: var(--accent-primary);
	}

	.task-row {
		transition:
			background-color 180ms var(--ease-out),
			box-shadow 180ms var(--ease-out);
	}

	.task-row:hover {
		background: var(--surface-hover);
	}

	.task-row:active {
		background: color-mix(in srgb, var(--project-accent) 19%, transparent);
	}

	.task-copy {
		min-width: 0;
	}

	.task-copy p {
		overflow: hidden;
		font: 600 0.76rem var(--font-ui);
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text-primary);
	}

	.task-copy span {
		font: 500 0.6rem var(--font-ui);
		color: var(--text-muted);
	}

	.priority,
	.status {
		font: 700 0.58rem var(--font-ui);
		white-space: nowrap;
	}

	.priority {
		padding: 4px 6px;
		border: 1px solid rgba(163, 144, 215, 0.46);
		border-radius: 6px;
		background: rgba(104, 80, 148, 0.16);
		text-transform: uppercase;
		color: #c8bdeb;
	}

	.status {
		color: var(--text-secondary);
	}

	.empty-state {
		display: grid;
		justify-items: center;
		padding: 28px 18px 32px;
		text-align: center;
	}

	.empty-state svg {
		width: 42px;
		margin-bottom: 8px;
		fill: none;
		stroke: var(--modli-gold-dark);
	}

	.empty-state p {
		font: 600 0.83rem var(--font-ui);
		color: var(--modli-parchment);
	}

	.empty-state span {
		margin-top: 3px;
		font: 500 0.66rem var(--font-ui);
		color: color-mix(in srgb, var(--modli-parchment) 60%, transparent);
	}

	@keyframes panel-entry {
		from {
			opacity: 0;
			transform: translateX(12px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (max-width: 970px) {
		.statistics {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.statistic:nth-child(2) {
			border-right: 0;
		}

		.statistic:nth-child(-n + 2) {
			border-bottom: 1px solid
				color-mix(in srgb, var(--modli-gold-dark) 56%, transparent);
		}

		.task-row {
			grid-template-columns: auto minmax(10rem, 1fr) auto auto;
		}

		.status {
			display: none;
		}
	}

	@media (max-width: 560px) {
		.project-panel {
			max-height: none;
		}

		.panel-header,
		.section-heading {
			align-items: flex-start;
			flex-direction: column;
		}

		.statistics {
			grid-template-columns: 1fr;
		}

		.statistic,
		.statistic:nth-child(2) {
			border-right: 0;
			border-bottom: 1px solid
				color-mix(in srgb, var(--modli-gold-dark) 56%, transparent);
		}

		.statistic:last-child {
			border-bottom: 0;
		}

		.task-row {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}

		.notes-icon,
		.status {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-panel {
			animation: none;
		}
	}
</style>
