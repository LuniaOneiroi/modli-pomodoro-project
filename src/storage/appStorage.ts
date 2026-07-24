import { isDesktopRuntime } from '../platform/window';
import type { PersistedAppState } from './appState';
import { loadBrowserAppState, saveBrowserAppState } from './browserStorage';
import { loadDesktopAppState, saveDesktopAppState } from './desktopStorage';

export async function loadAppState(): Promise<PersistedAppState | null> {
	if (!isDesktopRuntime()) return loadBrowserAppState();

	try {
		const desktopState = await loadDesktopAppState();
		if (desktopState) return desktopState;

		const legacyBrowserState = loadBrowserAppState();
		if (legacyBrowserState) {
			await saveDesktopAppState(legacyBrowserState);
		}
		return legacyBrowserState;
	} catch {
		return loadBrowserAppState();
	}
}

export async function saveAppState(state: PersistedAppState): Promise<void> {
	if (!isDesktopRuntime()) {
		saveBrowserAppState(state);
		return;
	}

	try {
		await saveDesktopAppState(state);
	} catch {
		saveBrowserAppState(state);
	}
}
