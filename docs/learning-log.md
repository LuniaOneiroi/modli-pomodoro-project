# ModLi learning log

## Svelte 5, TypeScript, and Vite

Svelte compiles small `.svelte` components into browser JavaScript, while TypeScript checks the shapes of timer state, settings, and component props. Vite serves the browser prototype with fast module updates and creates the production bundle. ModLi uses them in `src/`, with `vite.config.ts` connecting the Svelte compiler to Vite; `svelte-check` is separate because Vite transpiles TypeScript without performing a full type check. A simpler alternative would be plain HTML, CSS, and JavaScript, but it would provide less structure as projects and tasks arrive in later milestones.

## Target-timestamp timer model

The timer stores an absolute target timestamp while it runs and derives the seconds remaining from the current time. ModLi uses this approach in `src/domain/timer.ts` so delayed browser intervals do not gradually make a 25-minute session longer. Pausing saves the derived duration, and resuming creates a fresh target; the UI interval only asks the model to recalculate. A simpler subtract-one-each-second loop is easier to write, but it drifts when the browser throttles background work.

## Image-backed timer progress

The timer presents its time over a project image while exposing a semantic linear progress bar to assistive technology. ModLi uses this approach in `TimerDisplay.svelte` so the redesigned no-ring display can keep project artwork recognizable without losing readable time or progress feedback. A layered veil and subtle glass wash provide stable contrast across bright and dark uploads. A plain text countdown would be simpler, but it would lose the project-specific atmosphere central to the redesigned compact view.

## Browser audio adapter

The Web Audio API can synthesize a short chime without a remote file or added sound library. ModLi prepares its audio context from the user's Start action in `src/platform/sound.ts`, which works with browser autoplay protections more reliably than creating audio only when the timer ends. The UI only expresses the intent to play a sound; browser-specific work stays behind this small adapter so a later desktop implementation can replace it. A bundled audio file would be simpler to tune, but it would add an asset to manage at this early milestone.

## Derived project statistics

Project records and task records remain separate, while `src/domain/projects.ts` derives counts, progress, and session totals from the selected project's eligible tasks. ModLi uses pure functions here so components display one consistent interpretation of completed, cancelled, and archived work. The compact timer and expanded panel receive the same calculated result, preventing their progress displays from drifting apart. A simpler approach would calculate totals inside each component, but duplicated business rules become difficult to test and maintain.

## IndexedDB project images

IndexedDB is the browser database intended for durable binary data such as uploaded images. ModLi stores image blobs in `src/storage/browserStorage.ts`, while project records keep only a small image identifier and the UI creates temporary object URLs when it needs to display the blob. This avoids placing multi-megabyte Base64 strings in `localStorage` and lets missing image records fall back to bundled liminal artwork. Keeping object URLs only for the current session was simpler, but project images disappeared whenever the page reloaded.

Before storage, `src/platform/images.ts` uses the browser canvas to limit oversized images to a practical display resolution and encode them as WebP. The adapter returns the original file when bitmap or canvas processing is unavailable, so uploading remains resilient rather than becoming browser-dependent. Storing every original file would require less code, but it would consume local storage quickly without improving the compact timer display.

## Mutually exclusive expanded panels

The expanded project summary and the task-detail view occupy the same right-side panel slot while the compact timer stays mounted on the left. ModLi chooses which panel to render in `ModLiWindow.svelte` instead of reserving a permanent third grid column, so opening details does not compress the summary or leave an empty region behind. Related actions in `App.svelte` close conflicting panel state when a project changes or the add-project form opens. Keeping every panel mounted in separate columns would be simpler structurally, but it would break the progressive-disclosure layout and allow stale task details to remain visible for the wrong project.

## Semantic theme tokens

Semantic CSS variables name a visual role—such as `--surface`, `--border-active`, or `--text-muted`—instead of naming a particular color. ModLi uses them in `src/styles/global.css` so the Hybrid, Liminal, and Constellation variants can share one component tree and change atmosphere without changing interaction meaning. Temporary aliases keep older component styles working while the redesign is migrated in reviewable pieces. Directly hardcoding each blue or glow inside every component would be simpler initially, but it would make future theme refinement inconsistent and fragile.

## Persisted timer restoration

ModLi saves its timer snapshot alongside projects, tasks, selections, and settings. `PomodoroTimer.restore` resumes a future target timestamp or resolves an already expired target through the same completion path used by a live timer, preventing a second completion callback. This keeps the target-timestamp model intact and lets the browser recover from reloads without subtracting guessed elapsed seconds. Resetting the timer on every reload would be simpler, but it would interrupt the core focus workflow.
