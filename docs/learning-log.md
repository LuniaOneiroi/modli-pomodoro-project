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

IndexedDB is the browser database intended for durable binary data such as uploaded images. ModLi stores image byte records in `src/storage/browserStorage.ts`, while project records keep only a small image identifier and the adapter rebuilds a temporary Blob when the UI needs to display it. ArrayBuffer-backed records clone reliably in both Chromium and WebKit, and the reader still accepts older Blob records. This avoids placing multi-megabyte Base64 strings in `localStorage` and lets missing image records fall back to bundled liminal artwork.

Before storage, `src/platform/images.ts` uses the browser canvas to limit oversized images to a practical display resolution and encode them as WebP. The adapter returns the original file when bitmap or canvas processing is unavailable, so uploading remains resilient rather than becoming browser-dependent. Storing every original file would require less code, but it would consume local storage quickly without improving the compact timer display.

## Mutually exclusive expanded panels

The expanded project summary and the task-detail view occupy the same right-side panel slot while the compact timer stays mounted on the left. ModLi chooses which panel to render in `ModLiWindow.svelte` instead of reserving a permanent third grid column, so opening details does not compress the summary or leave an empty region behind. Related actions in `App.svelte` close conflicting panel state when a project changes or the add-project form opens. Keeping every panel mounted in separate columns would be simpler structurally, but it would break the progressive-disclosure layout and allow stale task details to remain visible for the wrong project.

## Semantic theme tokens

Semantic CSS variables name a visual role—such as `--surface`, `--border-active`, or `--text-muted`—instead of naming a particular color. ModLi uses them in `src/styles/global.css` so the Hybrid, Liminal, and Constellation variants can share one component tree and change atmosphere without changing interaction meaning. Temporary aliases keep older component styles working while the redesign is migrated in reviewable pieces. Directly hardcoding each blue or glow inside every component would be simpler initially, but it would make future theme refinement inconsistent and fragile.

## Persisted timer restoration

ModLi saves its timer snapshot alongside projects, tasks, selections, and settings. `PomodoroTimer.restore` resumes a future target timestamp or resolves an already expired target through the same completion path used by a live timer, preventing a second completion callback. This keeps the target-timestamp model intact and lets the browser recover from reloads without subtracting guessed elapsed seconds. Resetting the timer on every reload would be simpler, but it would interrupt the core focus workflow.

## Tauri desktop shell and window adapter

Tauri 2 packages the existing Svelte interface inside a native desktop window while keeping the frontend code and browser development workflow intact. ModLi keeps minimize, close, drag, resize, and always-on-top calls in `src/platform/window.ts`, where each operation safely becomes a no-op outside the desktop runtime. The `src-tauri/` directory contains the small Rust entry point, window configuration, bundle metadata, and narrowly scoped permissions that allow those controls. Rebuilding the interface with a native UI toolkit could provide deeper platform integration, but it would duplicate the working Svelte application and make browser-based development harder.

## Application-local desktop persistence

The Tauri Store plugin writes structured ModLi state to `modli-state.json` in the operating system's application-data directory, while the browser build continues to use `localStorage`. `src/storage/appStorage.ts` chooses the correct adapter and migrates a valid legacy webview state into the desktop store the first time it is found. Zod validates untrusted JSON at the persistence boundary before projects, tasks, settings, or timer state reach the UI. Keeping `localStorage` everywhere would require less code, but it ties important desktop data to a particular webview origin and makes future migrations harder.

The Window State plugin separately remembers the native window's position and size. Its Rust configuration stores only those two properties, while ModLi's existing state continues to own semantic choices such as compact versus expanded mode and always-on-top. Saving all native window flags would be simpler, but it could restore inappropriate fullscreen, visibility, or decoration states for a small focus companion.

## Native project-image files

The Tauri File System plugin stores processed project-image bytes beneath ModLi's private application-data directory instead of inside the desktop webview database. `src/storage/imageStorage.ts` routes browser builds to IndexedDB and desktop builds to `src/storage/desktopImageStorage.ts`; when it finds an older IndexedDB image in the desktop app, it copies that image into native storage on first read. The Tauri capability grants access only to the `project-images` folder and only for the file operations this adapter uses. Keeping IndexedDB in the desktop build would be simpler, but native app-data files are easier to migrate, back up, and manage independently of a particular webview.

## Idempotent Pomodoro session actions

A Pomodoro session record captures the project and optional task when the timer starts, so later project changes cannot redirect credit for work already underway. `src/state/sessions.ts` completes the history record, task count, and project streak in one pure action, and refuses to count an already ended session twice. Resetting preserves an incomplete history record with the elapsed whole minutes, while pausing keeps the same active record available for resuming. Updating these values independently inside UI callbacks would involve less initial code, but a single tested action makes reload recovery and future session-history views much safer.

## Playwright end-to-end testing

Playwright drives ModLi through the same accessible controls a person uses and verifies complete workflows across Chromium and WebKit. The configuration in `playwright.config.ts` starts an isolated Vite server, while `e2e/modli.spec.ts` covers timer restoration, task and project workflows, image persistence, Settings, keyboard focus, and malformed local data. Each test receives an isolated browser context so its local-first records cannot leak into another test. Component and domain tests are faster for individual rules, but Playwright catches integration and engine-specific behavior that unit tests cannot see.

## GitHub maintenance automation

GitHub Actions runs ModLi's existing quality commands again after pushes and pull requests, so a local oversight becomes a visible failed check before changes are accepted. The workflows in `.github/workflows/` use read-only repository access except for CodeQL's narrowly scoped permission to publish security findings. Dependabot reads the pnpm, Cargo, and workflow manifests weekly and proposes dependency updates as pull requests rather than changing `main` directly. Local checks remain the fastest feedback loop, while repository automation provides an independent, repeatable safety net.
