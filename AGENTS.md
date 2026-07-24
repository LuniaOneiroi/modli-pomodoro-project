# ModLi Repository Instructions

## Project mission

ModLi is a small, local-first desktop focus companion: a Pomodoro timer combined with daily tasks, lightweight project tracking, and a richly illustrated tarot/oracle-card visual language.

It should feel like a personal focus artifact that can remain beside other applications, not like a general-purpose project-management suite. Preserve that distinction when making product, architecture, and interface decisions.

This repository is also a learning project. Favor readable, teachable code and incremental milestones over clever abstractions or a large one-shot implementation.

## Read before changing code

Before starting work:

1. Read this file completely.
2. Inspect the existing repository and current uncommitted changes. Preserve user work and do not rewrite unrelated files.
3. Read relevant files in `docs/` if they exist.
4. Use `themes-and-inspo/modli-hi-fi-wireframe.png` as the primary visual reference if it exists.
5. State a short implementation plan for the current milestone. Ask for approval only when a missing choice would materially change the product, architecture, or user data.

When instructions conflict, use this priority:

1. The user's current request
2. This `AGENTS.md`
3. Canonical project documentation in `docs/`
4. Existing implementation patterns

Do not treat the wireframe as a pixel-perfect mandate. Preserve its layout, hierarchy, color balance, and atmosphere while correcting accessibility, responsive behavior, overflow, and implementation problems.

## Product principles

- Keep ModLi compact, calm, and focused on work happening now.
- A timer must work without a selected task.
- No due dates, calendars, or scheduling pressure in version one.
- Use progressive disclosure: the everyday timer stays simple; project and task controls appear when expanded.
- Make every ornate element serve hierarchy, atmosphere, or feedback.
- Do not sacrifice clarity, keyboard access, contrast, or performance for decoration.
- Keep all core functionality usable offline.
- Prefer small, reversible changes that leave the app working.

## Canonical technology choices

### Frontend

- Svelte 5
- TypeScript in strict mode
- Vite
- Semantic HTML
- Component-scoped plain CSS and shared CSS custom properties
- Inline SVG for timer graphics and original ornamentation

### Desktop

- Tauri 2, added only after the browser prototype is stable
- Keep native window and filesystem calls behind small adapters so browser development remains possible.

### Data and validation

- Browser prototype: `localStorage` for structured data and preferences; IndexedDB for uploaded images.
- Tauri version: an application-local store or JSON file for records and the app-data directory for processed images.
- Store image identifiers or paths in project records, not large Base64 strings.
- Use Zod only at persistence/import boundaries where runtime validation is useful. Do not spread schema parsing through UI components.

### Quality tools

- ESLint
- Prettier
- Vitest for domain logic, timer behavior, statistics, and persistence
- Playwright for critical user workflows once the interface is functional

Do not install all possible dependencies at project creation. Add a package only when the current milestone needs it. Prefer browser APIs, CSS, TypeScript, and Svelte before adding a library. Do not add Tailwind or a component framework. A consistent lightweight icon package such as Lucide is acceptable for functional icons, but custom celestial decoration should remain original SVG/CSS.

Use current official documentation when an API or setup detail may have changed, especially for Svelte and Tauri.

## Build sequence

Work through these milestones in order unless the user explicitly changes the order.

### Milestone 1: web shell and compact timer

- Scaffold Svelte + TypeScript + Vite.
- Establish design tokens and base typography.
- Build the compact widget shell and responsive frame.
- Implement Focus and Break timer modes with Start, Pause, and Reset.
- Add the accessible SVG progress medallion.
- Add a sound toggle; a simple browser alert or bundled sound is sufficient initially.
- Use seeded sample data only when it helps demonstrate the interface, and keep it easy to replace.

### Milestone 2: projects and expanded view

- Add project creation and selection.
- Add project accent colors and optional project-image treatment.
- Make the compact timer remain on the left while an expanded project panel opens to the right.
- Add project summary statistics and active high-priority task rows.

### Milestone 3: task workflows

- Add create, view, edit, complete/uncomplete, and delete flows.
- Use one form component for create and edit when practical.
- Add categories, status, priority, session estimates, completed sessions, and optional notes.
- Enforce the 250-word note limit with visible, accessible feedback.

### Milestone 4: persistence and resilience

- Persist projects, tasks, sessions, preferences, timer state, and current selections.
- Add safe parsing, schema versioning, migrations, and recovery from malformed local data.
- Add IndexedDB image persistence and reasonable resize/compression.
- Verify state survives reload and interruption.

### Milestone 5: refinement and browser testing

- Finish settings, empty states, error states, keyboard navigation, reduced motion, and responsive compact/expanded layouts.
- Test the critical workflows with Playwright.
- Compare compact, expanded, and task-detail screenshots with the wireframe and correct layout drift.

### Milestone 6: Tauri desktop shell

- Add Tauri only after the browser milestones pass their checks.
- Implement custom title-bar behavior, dragging, pin/always-on-top, minimize, close, resizing, and compact/expanded window dimensions.
- Persist window position, size, mode, pin state, and sound preference.
- Migrate storage through adapters without rewriting domain or UI logic.
- Treat tray behavior, launch at startup, global shortcuts, and native notifications as later enhancements unless requested.

Complete one coherent milestone or user-requested slice at a time. Do not silently implement later milestones while working on an earlier one.

## Interface states

### Compact view

The default everyday view contains:

- ModLi name and understandable window controls
- Project selector and add-project affordance
- Optional atmospheric project image behind the timer
- Large Focus/Break label and readable countdown
- Celestial SVG progress medallion
- Optional current-task link, but never a required task
- Project progress fraction and bar
- Start, Pause, and Reset controls
- Sound and settings controls

It must remain useful at a narrow widget width.

### Expanded view

Expansion increases the window width rather than replacing the timer. Keep the compact timer column visible on the left. Open the project panel on the right with:

- Project summary
- Tasks completed
- Project progress
- Focus streak
- Estimated/completed sessions
- Active high-priority task list
- Add Project and Add Task actions

### Task details / create task

Open a right-side drawer or replace only the expanded right panel. Do not discard or reset the running timer when task details open.

Include:

- Title
- Category
- Status
- Priority
- Project
- Estimated sessions
- Completed sessions
- Notes and word counter
- Save, Delete, Back/Close

The checkbox is a separate action from opening the task row. Confirm destructive deletion when data would be lost.

## Visual system

The wireframe's visual identity is part of the product, not a temporary skin.

### Direction

Aim for a luminous digital tarot/oracle artifact with deep blue card interiors, crimson focal states, warm gold linework, and parchment highlights. It should not resemble steampunk machinery, an industrial dashboard, a generic SaaS task manager, or a literal copy of an existing deck.

Starting tokens:

```css
:root {
	--modli-navy: #071b3d;
	--modli-cobalt: #123f8c;
	--modli-ultramarine: #244fbd;
	--modli-crimson: #981d32;
	--modli-ruby: #bd2840;
	--modli-burgundy: #641426;
	--modli-gold: #d9ad55;
	--modli-gold-light: #f2d68a;
	--modli-gold-dark: #8e6421;
	--modli-parchment: #f4e5c9;
	--modli-ivory: #fff7e9;
	--modli-teal: #258a91;
	--modli-violet: #6d4ab0;
	--modli-lavender: #a38bd2;
}
```

These are starting points, not immutable values. Centralize tokens rather than scattering color literals through components. Project accents may influence glows, progress, selections, and small ornaments, but must not replace the core blue/crimson/gold identity.

### Ornament and imagery

- Build frames, corner filigree, celestial dividers, stars, rings, glows, and progress marks with CSS and reusable inline SVG.
- Use raster imagery only for user-selected project art or explicit reference material.
- Never embed inspiration images as interface decoration.
- Treat project images with overlays, edge fades, and controlled contrast so text stays readable.
- Avoid runtime CDN assets and remote fonts; bundle intentionally chosen assets later if needed.
- Use recognizable icons for functional actions. Celestial symbols may support them but must not obscure their meaning.

### Typography and motion

- Use an elegant display serif for branding and major headings.
- Use a highly readable UI face for labels, forms, tasks, and statistics.
- Keep timer numerals large, clean, and stable in width.
- Favor subtle progress, glow, shimmer, and panel transitions.
- Do not add constant particles, rapid sparkles, or several rotating layers.
- Respect `prefers-reduced-motion` and the in-app reduced-motion preference.

## Canonical domain rules

Use explicit TypeScript types in a domain module. Do not redefine slightly different record shapes inside components.

```ts
type TaskStatus = 'in_progress' | 'completed' | 'cancelled' | 'archived';
type TaskPriority = 'low' | 'medium' | 'high';
type TimerMode = 'focus' | 'break';
type WindowMode = 'compact' | 'expanded';

interface Task {
	id: string;
	title: string;
	category: string;
	status: TaskStatus;
	priority: TaskPriority;
	notes: string;
	projectId: string;
	estimatedSessions: number;
	completedSessions: number;
	createdAt: string;
	updatedAt: string;
}

interface Project {
	id: string;
	name: string;
	imageId?: string;
	accentColor: string;
	createdAt: string;
	updatedAt: string;
}

interface PomodoroSession {
	id: string;
	mode: TimerMode;
	projectId?: string;
	taskId?: string;
	plannedMinutes: number;
	completedMinutes: number;
	completed: boolean;
	startedAt: string;
	endedAt?: string;
}

interface ModLiSettings {
	focusMinutes: number;
	breakMinutes: number;
	soundEnabled: boolean;
	notificationsEnabled: boolean;
	alwaysOnTop: boolean;
	reducedMotion: boolean;
	lastProjectId?: string;
	lastWindowMode: WindowMode;
}
```

Rules:

- Default Focus duration: 25 minutes.
- Default Break duration: 5 minutes.
- Ending a session switches mode and loads the next duration, but does not automatically start it in version one.
- Calculate remaining time from a target timestamp. Do not implement countdown by blindly subtracting one each interval.
- Pausing stores the derived remaining duration; resuming creates a new target timestamp.
- Reloading an expired running timer resolves the session transition once and must not create duplicate history records.
- A completed linked Focus session increments the task and project session data through one domain action.
- Checking a task sets it to `completed`. Unchecking a completed task returns it to `in_progress`.
- Cancelled and archived tasks do not appear in the main active list.
- Project progress is completed tasks divided by all non-archived, non-cancelled tasks. With no eligible tasks, show 0%, not `NaN`.
- High-priority view shows active `high` tasks for the selected project.
- Priority and status are always communicated with text as well as styling.
- Notes are optional and limited to 250 words, not 250 characters.
- Session estimates and manual completed-session values are non-negative integers.
- For version one, focus streak means consecutive completed Focus sessions. Pausing does not break it; resetting an active Focus session does. Document any later change to this rule.
- Store timestamps as ISO 8601 strings and generate stable unique IDs with `crypto.randomUUID()` where supported.

## Architecture boundaries

Keep these concerns separate even if the exact folder names evolve:

- `components/`: presentation and user interaction
- `domain/`: types, timer rules, statistics, and pure calculations
- `state/`: application state and actions
- `storage/`: browser and Tauri persistence adapters, schemas, and migrations
- `platform/`: sound, notifications, images, and desktop-window adapters
- `styles/`: global tokens, typography, and shared primitives

Suggested UI composition:

```text
App
└── ModLiWindow
    ├── CustomTitleBar
    ├── ProjectSelector
    ├── CompactTimer
    │   ├── ProjectImageBackground
    │   ├── TarotTimerMedallion
    │   ├── ProjectProgress
    │   ├── CurrentTaskLink
    │   └── TimerControls
    └── ExpandedPanel
        ├── ProjectSummary
        ├── StatisticsCards
        ├── HighPriorityTaskList
        └── TaskDetailsDrawer
```

Guidelines:

- Keep pure calculations outside Svelte components.
- Components should receive typed props and emit intent; they should not know storage details.
- Use a single source of truth for timer state and application records.
- Avoid premature generic component systems. Extract a component when it has a clear responsibility or meaningful reuse.
- Do not create a backend, account system, or network dependency.
- Do not introduce SQLite in version one unless the user explicitly changes the storage plan.

## Accessibility and interaction requirements

- Meet WCAG AA contrast for functional text and controls.
- Use native buttons and form elements where practical.
- Give icon-only controls accessible names and visible tooltips where helpful.
- Provide visible `:focus-visible` states that fit the gold/ivory theme.
- Connect every form label to its control and expose validation messages accessibly.
- Ensure keyboard users can operate the timer, project selector, task list, drawers, and dialogs.
- Manage focus when opening and closing a drawer or modal; Escape should close dismissible overlays.
- Do not rely on color alone for selection, status, priority, or timer mode.
- Make task rows comfortably targetable and keep scrolling inside long expanded/detail panels.
- Do not place text inside decorative images.
- Test at 200% zoom and with reduced motion.

## Verification requirements

Before reporting an implementation complete, run the checks available for the current milestone. Once configured, the expected baseline is:

```sh
pnpm check
pnpm lint
pnpm test
pnpm build
```

Run Playwright tests when the changed workflow has end-to-end coverage. For visual work, inspect compact, expanded, and task-detail states at their intended sizes and check for clipping, overflow, illegible contrast, and layout shift.

Critical behaviors to cover:

- timer starts, pauses, resumes without drift, resets, and switches modes
- timer restoration does not duplicate completed sessions
- standalone and task-linked Focus sessions both work
- tasks create, edit, complete/uncomplete, validate notes, and delete
- cancelled/archived tasks and progress calculations follow the domain rules
- projects create, switch, retain accents/images, and calculate statistics
- saved state survives reload and malformed data fails safely
- the core interface works by keyboard and with reduced motion

Do not claim a check passed if it was not run. If a check cannot run, state why and provide the exact next step.

## Learning log

Maintain `docs/learning-log.md` once development begins. When adding a dependency or introducing a meaningful concept, append a concise entry answering:

- What is it?
- Why does ModLi use it?
- Where is it used?
- What simpler or alternative option exists?

Keep each entry to roughly 3–8 sentences unless the user asks for a tutorial. Teach through ModLi's actual code. Do not fill the log with routine file edits or repeat the same explanation.

## Version-one scope

Version one includes:

- compact and expanded views
- Focus/Break timer, controls, mode switching, alert, and sound toggle
- projects, optional images, accent colors, progress, and summary statistics
- tasks, categories, statuses, priorities, notes, and session counts
- task details/create/edit flow
- local persistence and basic settings
- accessible tarot-inspired presentation
- Tauri window behavior after the web prototype is stable

Explicitly out of scope unless requested:

- accounts, login, backend, cloud sync, or online database
- team collaboration or shared projects
- due dates, due times, calendars, recurring tasks, or notifications tied to schedules
- subtasks, Kanban boards, or complex project hierarchies
- mobile app or social features
- AI task generation
- external project-management integrations
- a full analytics dashboard

## Working agreement

At the end of each implementation slice:

1. Summarize the user-visible outcome first.
2. List the important files changed.
3. Report checks run and any remaining limitations honestly.
4. Briefly explain new concepts that matter to a learner.
5. Suggest one sensible next milestone without beginning it unless it is already authorized.

Avoid large unrelated refactors, speculative features, and silent scope expansion. If a choice is reversible and consistent with this file, make a reasonable decision and document it. If it changes the product direction, storage compatibility, or desktop architecture, pause and ask the user.
