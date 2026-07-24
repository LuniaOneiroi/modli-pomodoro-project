# ModLi Redesign Spec

# ModLi Existing-Project Redesign Prompt
You are working inside an **already existing ModLi desktop application project**.

Do not start a new project, replace the current architecture, or rebuild the application from scratch. 

First inspect the existing codebase, understand how the current timer, projects, tasks, data storage, compact view, expanded view, and desktop-window behavior work, and then redesign the existing interface in place.

The goal is to preserve the current working functionality while substantially improving the visual design.

## Primary objective
Redesign ModLi using a **hybrid liminal-glass and subtle constellation-tech aesthetic**.
The design foundation should be approximately:
* 80% clean liminal frosted glass
* 20% restrained constellation and celestial detail (for timer completion)

⠀The interface should feel:
* modern
* calm
* clean
* atmospheric
* premium
* readable
* suitable for long focus sessions

Do not reproduce the original antique, parchment, tarot-card, or ornate visual treatment.
Do not turn the interface into an excessively bright neon sci-fi dashboard. The constellation styling should be subtle and secondary to usability.

See reference image: /modli-wireframe/modli-design-references/modli-hybrid-no-ring-reference.png

## Existing project rules
Before changing anything:
1. Inspect the current project structure.
2. Identify the existing framework, dependencies, component system, styles, state management, data persistence, and desktop integration.
3. Run the existing app and confirm what currently works.
4. Preserve all working functionality unless a change is explicitly requested below.
5. Reuse and refactor existing components instead of duplicating them.
6. Do not unnecessarily replace dependencies or rewrite stable logic.
7. Keep the current project and task data intact.
8. Do not delete existing features simply because they are not visible in the design reference.
9. Make changes in logical, reviewable stages.

If something in the current implementation conflicts with the requested design, preserve the underlying behavior and update only its presentation unless otherwise specified.

## Visual references
Use the **latest no-ring hybrid design** as the primary reference for:
* interface hierarchy
* panel layout
* frosted-glass treatment
* project-image timer display
* typography scale
* compact view
* expanded view
* task-details view
* calm celestial color palette

The visual references are guides, not screenshots to be inserted wholesale into the app.
Do not use an entire UI mockup image as the app background.

## Preserve the current interface structure
Do not fundamentally change the existing ModLi structure.
The app should continue to support:

**Compact view**
* app title bar
* current project selector
* add-project control where currently appropriate
* timer display
* focus, break, or session state
* project progress
* timer controls
* utility controls
* compact desktop-widget behavior

⠀**Expanded view**
* project selector
* add-project action
* project summary
* tasks completed
* project progress
* current focus streak
* estimated and completed sessions
* high-priority task list
* add-task action
* task statuses
* task notes indicator
* task-selection behavior

⠀**Task details / create task view**
* task name
* category
* status
* priority
* project
* estimated sessions
* completed sessions
* notes
* save action
* delete action
* create-task behavior
* edit-task behavior

⠀Preserve existing data structures and behavior wherever possible.

## Core visual design
### Background
Use a deep midnight navy and blue-black base.
The global background may include:
* a very subtle radial gradient
* faint stars
* restrained constellation lines
* soft atmospheric haze
* a subtle vignette
* limited cyan and violet light
* optional very slow ambient movement

⠀The background must remain quiet enough that it does not interfere with the interface.
Avoid:
* dense star fields
* large glowing geometric structures
* excessive particle effects
* bright saturated neon everywhere
* complex illustrated graphics created with crude CSS shapes

⠀Respect reduced-motion settings.

### Frosted-glass panels
Use frosted glass as the primary panel treatment:
* translucent dark surfaces
* background blur where supported
* thin low-contrast borders
* soft internal highlights
* restrained shadows
* rounded corners
* subtle elevation differences
* clear text contrast

The glass should remain readable even if backdrop blur is unavailable.
Provide a suitable fallback background color.
Avoid making every small element a separate glowing glass card. Use cards only where they improve hierarchy.

### Color palette
Base colors:
* midnight navy
* blue-black
* soft moonlit blue
* icy white
* pale blue-gray

⠀Accent colors:
* restrained cyan
* muted violet
* subtle cool magenta only when necessary

⠀Use accent colors primarily for:
* active timer states
* selected tasks
* progress
* focus-session indicators
* primary actions
* small constellation details

⠀Do not use intense glow around every element.

### Typography
Use highly readable modern interface typography.

The ModLi name may retain a slightly elegant or atmospheric display treatment, but ordinary interface text should use a clean sans-serif.

Ensure:
* timer digits are clear
* task text remains readable
* labels have sufficient contrast
* muted text is not too faint
* form controls remain accessible
* text does not depend solely on glow for visibility

## Timer redesign
This is a major required change.
### Remove the timer ring completely
Do not display:
* a circular timer ring
* a constellation ring
* an orbit around the timer
* a radial progress ring
* decorative circular framing around the time

The timer must not look like a circular dial.

### Timer display area
The timer display should instead be a large image-based section within the compact panel.
Use a softly rounded rectangular display area that occupies the central space where the old timer ring existed.

The timer display should contain the following layers:

Timer display
├── project image or default liminal background
├── subtle readability overlay
├── restrained frosted-glass layer
├── current mode label
└── large glowing timer numbers

### Project-image state
When the selected project has an uploaded image:
* use that image as the timer-display background
* fill the entire timer display area
* use object-fit: cover or the equivalent
* preserve the image’s aspect ratio
* center it by default
* do not stretch it
* make sure the image fills the section
* place the timer text over it
* apply a subtle dark or gradient overlay for readability
* retain a light frosted treatment

⠀The project image should remain visibly recognizable behind the timer.

### No-project-image state
When the selected project does not have an uploaded image:
* use one of the images located in the **/assets-imgs/images-project-default**
* use the supplied background asset rather than trying to recreate detailed artwork with crude CSS
* the fallback must occupy the same display area as a project image
* the component dimensions must not change between states

Use one shared timer-display component with two background states rather than creating two separate layouts.

### Timer text
Display the time directly over the background image.
The timer numbers should be:
* larger than in the current app
* centered
* softly glowing
* slightly transparent
* readable without completely obscuring the project image
* elegant and uncluttered
* responsive to compact-window resizing

Do not make the numbers so transparent that they become difficult to read.
The timer should still show the current mode, such as:
* Focus Mode
* Short Break
* Long Break

⠀The mode label should be smaller and quieter than the timer digits.

### Timer controls
Preserve the existing timer behavior.
The controls should remain clear and functional:
* Start
* Pause
* Reset

Use consistent SVG icons and visible text or accessible labels.
Do not use emojis as production icons.

### Timer Completion
When the timer reaches zero, the compact timer panel should enter a temporary completion state inspired by the constellation board concept. 

**See files: /modli-wireframe/modli-design-references/constellation-board-reference.png**
 This state should feel like the interface has “activated” or “awakened,” using a restrained celestial-tech treatment such as:
* brighter frosted-glass edges
* subtle constellation-line or star-thread overlays
* a soft cyan-violet luminous pulse
* a temporary label change such as “Session Complete” or “Break Complete”
* optional gentle shimmer or signal-like glow Keep the effect elegant and atmospheric, not loud or overly animated. Respect reduced-motion settings.

### Project images
Preserve or implement project-image upload support according to the existing project architecture.

Each project should be able to store an optional image reference.
Requirements:
* image selection or upload must be associated with the project
* changing the selected project updates the timer background
* removing a project image restores the standard liminal fallback
* invalid or missing image paths must also fall back safely
* image state should persist using the app’s existing persistence system
* do not store unnecessarily large unprocessed image data if the current architecture supports file references
* handle loading and failure states gracefully

⠀Do not display a broken image icon.

## Compact and expanded view consistency
Compact and expanded views are two states of the same application.
Global controls should remain in consistent relative locations where possible.
Use a small utility area for global controls such as:
* sound
* settings
* expand or collapse

⠀Do not scatter duplicate global controls across unrelated parts of the interface.

## Sound control
The sound icon is only useful if it controls real timer alerts.
Implement or preserve a functional sound toggle.
It should support:
* alerts enabled
* alerts muted
* a visible state change between enabled and muted

The sound control should affect timer-complete and break-complete alerts.
Do not add unnecessary interface-click sounds.
The sound setting should persist.
The expanded view does not need an extra sound icon beside the project selector. Place sound in the consistent utility area instead.

## Settings control and settings panel
The settings icon must exist and be functional.

Use the same relative location in compact and expanded views wherever practical.

Clicking Settings should open a frosted-glass modal or right-side settings sheet over the existing interface.

Do not replace the full project dashboard with the settings page.
The app behind the settings panel should dim slightly.

The panel should match the rest of ModLi:
* dark translucent surface
* backdrop blur
* thin pale-blue border
* rounded corners
* subtle shadow
* minimal celestial ornament
* clear form controls
* close button
* responsive sizing

⠀Suggested width:
* approximately 420–520 pixels on a large window
* responsive full-width treatment on small windows

⠀Settings sections

### Timer
Include settings for:
* focus duration
* short-break duration
* long-break duration
* number of focus sessions before a long break
* automatically begin breaks
* automatically begin focus sessions

⠀Use sensible validation and prevent invalid negative durations.

### Sound
Include:
* timer alerts on/off
* alert sound selection, if more than one sound exists
* volume
* preview-sound button

⠀If the app currently supports only one alert, do not invent a large sound library. A simple enabled toggle, volume control, and preview are enough.

### Appearance
Include:
* theme selector
* glow intensity
* background motion
* reduced motion
* interface scale if practical

⠀Theme options may include:
* Hybrid
* Liminal
* Constellation

For this milestone, the **Hybrid theme is the primary finished theme**.

Architecture should allow the liminal and constellation variants to be added or refined later through design tokens.

Do not create completely separate component trees for each theme.

### Window behavior
Include settings for:
* keep ModLi on top by default
* remember window position and size
* open in compact or expanded view
* minimize to tray, if supported by the current desktop framework
* launch at startup, only if supported cleanly by the current framework

⠀Do not fake unsupported operating-system functionality.

### Data
Include appropriate actions such as:
* export data
* import data
* clear completed tasks
* reset ModLi data

Destructive actions must require confirmation.
Do not add these controls if they cannot be implemented safely in the current architecture without significant unrelated work. In that case, clearly mark them as a later milestone rather than creating nonfunctional buttons.

### Settings actions
Include:
* Cancel or Close
* Save Settings

⠀Changes such as sound and visual preferences may preview immediately, but saving should persist them.

## Bottom panel from the design image
The long bottom panel shown beneath the three design mockups is **not part of the actual ModLi application**.

It is only a design-document legend explaining the controls.
Do not recreate that large instructional panel inside the app.

Instead, distribute those functions naturally:
### Title bar or window chrome
* drag handle
* pin or unpin
* minimize
* close
* window resize behavior
* expand or restore when appropriate

**⠀Compact and expanded utility area**
* sound
* settings
* expand or collapse

**⠀Project controls**
* add project near the project selector

**⠀Task controls**
* add task near the task list
* delete task inside Task Details or a task overflow menu

⠀Do not add permanent labels such as:
* Keep widget on top
* Collapse to icon
* Move anywhere
* Adjust window size
* Create new items
* Remove tasks

⠀Use tooltips and accessible labels instead.

## Window controls
Preserve the existing desktop-window behavior.
Where supported, maintain:
* draggable window region
* interactive controls excluded from drag regions
* pin or always-on-top
* minimize
* close
* resize
* compact-to-expanded switching
* remembered position and dimensions

Use the desktop framework’s actual APIs rather than visually simulating window behavior.
Do not break text selection, buttons, inputs, or dropdowns by making the entire interface draggable.

## Icons and graphics
The previous implementation’s graphics were not polished enough.
Do not ask CSS to imitate complex illustrations.

### Use a consistent SVG icon library
Use the icon system already installed if it is suitable.

Otherwise, use a clean lightweight library such as Lucide, if adding it is appropriate for the current stack.

Use consistent icons for:
* play
* pause
* reset
* volume
* muted volume
* settings
* pin
* expand
* collapse
* close
* plus
* trash
* notes
* timer
* dropdowns
* navigation

Do not mix unrelated icon families.
Do not use emojis or arbitrary Unicode characters as final interface icons.

### CSS-generated effects
CSS may be used for:
* frosted glass
* blur
* gradients
* shadows
* borders
* text glow
* subtle stars
* mild vignette
* gentle atmospheric movement
* restrained noise texture

⠀**Avoid crude CSS drawings of:**
* large moons
* detailed landscapes
* complex temples
* elaborate constellations
* ornate sigils

## Recommended asset organization
Adapt this to the existing project conventions rather than forcing an unrelated structure:
src/
  assets/
   backgrounds/
     liminal-default.webp
   overlays/
     constellation-overlay.svg
   textures/
     subtle-noise.png
   icons/
   project-images/

If the desktop app stores user-uploaded files outside the source tree, continue using the app’s proper user-data location.

Do not copy user uploads into the source repository unless the current architecture explicitly requires it.

## Theme architecture
Create or refine a centralized theme-token system.

Do not hardcode colors and glow values repeatedly throughout components.

Use design tokens or CSS custom properties for values such as:

**--app-background;**
**--surface;**
**--surface-elevated;**
**--surface-hover;**
**--border-subtle;**
**--border-active;**

**--text-primary;**
**--text-secondary;**
**--text-muted;**

**--accent-primary;**
**--accent-secondary;**
**--danger;**
**--success;**

**--shadow-panel;**
**--shadow-elevated;**
**--glow-soft;**
**--glow-active;**

**--glass-opacity;**
**--glass-blur;**

**--radius-small;**
**--radius-medium;**
**--radius-large;**

**--motion-fast;**
**--motion-standard;**

The hybrid theme should be the default.
Keep the component structure shared across themes.

Theme changes should affect:
* colors
* background assets
* border treatments
* glow intensity
* texture
* decorative overlays

⠀Theme changes should not affect:
* control locations
* panel dimensions
* information architecture
* task behavior
* timer logic
* interaction meaning

⠀
## Accessibility and readability
Maintain:
* sufficient text contrast
* visible keyboard focus states
* keyboard-accessible controls
* appropriate button labels
* form labels
* semantic HTML where applicable
* accessible modal focus trapping
* Escape key to close modal panels
* reduced-motion support
* tooltips for icon-only controls
* minimum usable click targets

⠀Do not rely only on color to communicate:
* selected state
* high priority
* task status
* sound state
* timer state

## Responsive behavior
The app should work across its supported desktop-window sizes.
Compact view should remain useful at small dimensions.
Expanded view should:
* avoid horizontal overflow
* preserve readable task rows
* stack summary cards when necessary
* keep the task-details view usable
* allow internal scrolling where appropriate
* not shrink text to unreadable sizes

⠀The timer background and timer text should scale smoothly.

## Implementation order
Work in stages.

**Stage 1: Audit**
* inspect the existing project
* document the current architecture
* identify the components and files that will change
* identify existing functionality that must be preserved
* confirm how project images, settings, and persistence currently work
* run the existing app and note any current errors

⠀**Stage 2: Theme foundation**
* create or refine design tokens
* implement the hybrid palette
* implement the global liminal background
* implement frosted-glass surfaces
* update typography and icons
* preserve layout and logic

⠀**Stage 3: Timer display**
* remove the timer ring
* build the image-based timer display
* add project-image and fallback states
* enlarge and style timer digits
* preserve timer controls and timer logic
* test project switching and image failures

**⠀Stage 4: Main panels**
* restyle compact view
* restyle expanded view
* restyle project summary
* restyle task rows
* restyle task-details and task-creation forms
* preserve current behavior

**⠀Stage 5: Utilities**
* implement the consistent sound control
* implement the settings button
* implement the settings modal or sheet
* persist preferences
* confirm window controls remain functional

**⠀Stage 6: Polish**
* improve responsive behavior
* add restrained hover and focus states
* add reduced-motion support
* test contrast and readability
* remove nonfunctional decorative controls
* remove duplicated sound and settings controls
* verify that no large bottom legend was added to the app

## Testing requirements
Test at minimum:
* timer starts, pauses, resets, and completes
* focus and break modes work
* alert sound obeys mute and volume settings
* settings persist after restarting the app
* selected project persists as expected
* project image appears in the timer display
* projects without images use the liminal fallback
* missing or broken project images use the fallback
* timer text remains readable on bright and dark images
* project switching updates the display
* compact and expanded views work
* add, edit, complete, and delete task behaviors still work
* project summary calculations remain correct
* task notes and priorities remain correct
* window drag, resize, minimize, pin, and close still work where currently supported
* keyboard navigation works
* settings modal traps and restores focus correctly
* reduced-motion mode disables unnecessary animation
* no existing user data is lost

## Constraints
Do not:
* start a new application
* replace the project’s current stack without a clear technical necessity
* discard current working logic
* use the entire design mockup as a background image
* recreate the bottom instructional legend in the app
* add nonfunctional icons
* add duplicate sound or settings controls
* place a ring around the timer
* use emojis as production icons
* make complex graphics from crude CSS shapes
* fill the interface with excessive glow
* make the timer numbers opaque enough to hide the project artwork
* make them too transparent to read
* change the interface structure solely to match AI-generated concept-art inaccuracies
* silently delete features that exist in the current app

## Completion criteria
The redesign is complete when:
* the existing ModLi project still functions
* the original structure remains recognizable
* the antique styling has been replaced
* the app uses the hybrid liminal-glass theme
* the timer has no ring
* the timer background uses a project image when available
* the standard liminal background appears when no image exists
* timer numbers are larger, glowing, and slightly transparent
* frosted-glass styling surrounds and overlays the timer appropriately
* compact and expanded views share consistent global controls
* sound and settings controls are functional
* the settings panel is implemented and styled
* supplied image and SVG assets are used appropriately
* icons are polished and consistent
* the design legend from the reference image has not been added to the actual app
* the result remains readable, maintainable, and suitable for everyday use

At the end, provide:
1. A summary of the existing architecture you found.
2. A list of files changed.
3. A description of preserved functionality.
4. A description of newly added functionality.
5. Any features deferred because the current framework does not support them cleanly.
6. Instructions for running and testing the updated app.
7. Any remaining visual discrepancies between the app and the references.


