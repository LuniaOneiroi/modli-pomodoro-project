<script lang="ts">
	import liminalTemple from '../assets/backgrounds/liminal-temple.webp';
	import liminalTerrace from '../assets/backgrounds/liminal-terrace.webp';
	import type { Project, TimerMode, TimerStatus } from '../domain/types';

	let {
		project,
		projectImageUrl,
		mode,
		status,
		formattedTime,
		progress,
		breakKind = 'short',
		completionMessage = null,
	}: {
		project: Project;
		projectImageUrl?: string;
		mode: TimerMode;
		status: TimerStatus;
		formattedTime: string;
		progress: number;
		breakKind?: 'short' | 'long';
		completionMessage?: string | null;
	} = $props();

	let imageFailed = $state(false);
	let backgroundSource = $derived(
		projectImageUrl ??
			(project.imageId === 'seed-lunar-field' ? liminalTerrace : liminalTemple),
	);
	let modeLabel = $derived(
		completionMessage ??
			(mode === 'focus'
				? 'Focus mode'
				: breakKind === 'long'
					? 'Long break'
					: 'Short break'),
	);

	$effect(() => {
		if (backgroundSource) imageFailed = false;
	});
</script>

<section
	class="timer-display"
	class:timer-display--running={status === 'running'}
	class:timer-display--complete={Boolean(completionMessage)}
	aria-label={`${modeLabel}, ${formattedTime} remaining`}
>
	<img
		src={imageFailed ? liminalTemple : backgroundSource}
		alt=""
		onerror={() => (imageFailed = true)}
	/>
	<div class="image-veil" aria-hidden="true"></div>
	<div class="glass-wash" aria-hidden="true"></div>
	<div class="signal-grid" aria-hidden="true"></div>

	<div class="timer-copy">
		<p>{modeLabel}</p>
		<time datetime={`PT${Math.max(0, Math.round((1 - progress) * 60))}M`}>
			{formattedTime}
		</time>
		<span>
			{status === 'running'
				? 'In progress'
				: status === 'paused'
					? 'Paused'
					: 'Ready'}
		</span>
	</div>

	<div
		class="timer-progress"
		role="progressbar"
		aria-label={`${mode === 'focus' ? 'Focus' : 'Break'} session progress`}
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(progress * 100)}
	>
		<span style:--timer-progress={`${Math.round(progress * 100)}%`}></span>
	</div>
</section>

<style>
	.timer-display {
		position: relative;
		isolation: isolate;
		min-height: clamp(20rem, 58vw, 24rem);
		margin: 0 0.9rem;
		overflow: hidden;
		border: 1px solid var(--border-subtle);
		border-radius: var(--radius-large);
		background: var(--surface-solid);
		box-shadow:
			inset 0 1px rgba(235, 248, 255, 0.14),
			inset 0 -1px rgba(0, 5, 16, 0.38),
			var(--shadow-elevated);
		transition:
			border-color var(--motion-standard) var(--ease-out),
			box-shadow var(--motion-standard) var(--ease-out);
	}

	img,
	.image-veil,
	.glass-wash,
	.signal-grid {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	img {
		z-index: -4;
		object-fit: cover;
		object-position: center;
		filter: saturate(0.76) contrast(1.02) brightness(0.72);
		transform: scale(1.015);
		transition:
			filter 600ms var(--ease-out),
			transform 8s ease-out;
	}

	.image-veil {
		z-index: -3;
		background:
			linear-gradient(
				180deg,
				rgba(3, 11, 25, 0.16),
				rgba(3, 12, 27, 0.28) 46%,
				rgba(2, 9, 21, 0.82)
			),
			radial-gradient(
				circle at 50% 46%,
				transparent 0 30%,
				rgba(1, 7, 18, 0.28)
			);
	}

	.glass-wash {
		z-index: -2;
		border-radius: inherit;
		background: linear-gradient(
			135deg,
			rgba(218, 241, 255, 0.11),
			transparent 30% 70%,
			rgba(107, 148, 189, 0.08)
		);
		backdrop-filter: blur(1.5px);
	}

	.signal-grid {
		z-index: -1;
		background-image:
			linear-gradient(rgba(174, 220, 249, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(174, 220, 249, 0.08) 1px, transparent 1px);
		background-size: 48px 48px;
		mask-image: linear-gradient(to bottom, transparent 0 62%, #000);
		opacity: 0.18;
	}

	.timer-copy {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		padding: 1.5rem;
		text-align: center;
	}

	p,
	time,
	.timer-copy span {
		margin: 0;
		text-shadow: 0 2px 18px rgba(1, 8, 20, 0.88);
	}

	p {
		margin-bottom: 0.45rem;
		font: 600 0.7rem var(--font-ui);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	time {
		font: 400 clamp(4.25rem, 21vw, 6.15rem) / 0.96 var(--font-numeric);
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.09em;
		color: rgba(240, 249, 255, 0.91);
		text-shadow:
			0 2px 24px rgba(1, 8, 20, 0.94),
			0 0 26px rgba(163, 216, 249, 0.3);
		transform: translateX(-0.045em);
	}

	.timer-copy span {
		margin-top: 0.85rem;
		font: 500 0.66rem var(--font-ui);
		letter-spacing: 0.09em;
		color: rgba(215, 233, 245, 0.74);
	}

	.timer-progress {
		position: absolute;
		right: 1rem;
		bottom: 0.9rem;
		left: 1rem;
		height: 3px;
		overflow: hidden;
		border-radius: 10px;
		background: rgba(201, 229, 247, 0.16);
	}

	.timer-progress span {
		display: block;
		width: var(--timer-progress);
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(
			90deg,
			var(--accent-secondary),
			var(--accent-primary)
		);
		box-shadow: 0 0 12px rgba(131, 199, 238, 0.7);
		transition: width 350ms linear;
	}

	.timer-display--running {
		border-color: color-mix(
			in srgb,
			var(--border-active) 72%,
			var(--border-subtle)
		);
		box-shadow:
			inset 0 1px rgba(235, 248, 255, 0.18),
			var(--shadow-elevated),
			var(--glow-soft);
	}

	.timer-display--running img {
		transform: scale(1.035);
	}

	.timer-display--complete {
		border-color: rgba(180, 225, 255, 0.88);
		box-shadow:
			inset 0 0 0 1px rgba(214, 238, 255, 0.2),
			var(--shadow-elevated),
			0 0 40px rgba(133, 191, 239, 0.38),
			0 0 70px rgba(147, 118, 215, 0.2);
		animation: completion-pulse 1.7s ease-in-out 2;
	}

	.timer-display--complete .signal-grid {
		background-size: 32px 32px;
		opacity: 0.44;
		animation: signal-arrive 1.2s var(--ease-out) both;
	}

	.timer-display--complete p {
		color: #e9f7ff;
		text-shadow: 0 0 20px rgba(154, 218, 255, 0.75);
	}

	@keyframes completion-pulse {
		50% {
			filter: brightness(1.12);
		}
	}

	@keyframes signal-arrive {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
	}

	@media (max-width: 340px) {
		.timer-display {
			min-height: 18rem;
			margin-inline: 0.65rem;
		}

		time {
			font-size: 3.8rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.timer-display,
		.timer-progress span,
		img,
		.signal-grid {
			animation: none;
			transition: none;
		}
	}
</style>
