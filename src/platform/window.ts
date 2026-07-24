import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import {
	restoreStateCurrent,
	StateFlags,
} from '@tauri-apps/plugin-window-state';
import type { WindowMode } from '../domain/types';

const WINDOW_SIZES: Record<WindowMode, LogicalSize> = {
	compact: new LogicalSize(440, 800),
	expanded: new LogicalSize(1120, 800),
};

type DesktopWindow = ReturnType<typeof getCurrentWindow>;

export function isDesktopRuntime(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

async function runWindowAction(
	action: (appWindow: DesktopWindow) => Promise<void>,
): Promise<boolean> {
	if (!isDesktopRuntime()) return false;

	try {
		await action(getCurrentWindow());
		return true;
	} catch {
		return false;
	}
}

export function resizeDesktopWindow(mode: WindowMode): Promise<boolean> {
	return runWindowAction((appWindow) => appWindow.setSize(WINDOW_SIZES[mode]));
}

export function setDesktopAlwaysOnTop(enabled: boolean): Promise<boolean> {
	return runWindowAction((appWindow) => appWindow.setAlwaysOnTop(enabled));
}

export function minimizeDesktopWindow(): Promise<boolean> {
	return runWindowAction((appWindow) => appWindow.minimize());
}

export function closeDesktopWindow(): Promise<boolean> {
	return runWindowAction((appWindow) => appWindow.close());
}

export async function initializeDesktopWindow(
	mode: WindowMode,
	alwaysOnTop: boolean,
	restoreSavedState: boolean,
): Promise<boolean> {
	const resized = await resizeDesktopWindow(mode);
	if (restoreSavedState && isDesktopRuntime()) {
		try {
			await restoreStateCurrent(StateFlags.POSITION | StateFlags.SIZE);
		} catch {
			// A first launch has no saved native window state to restore.
		}
	}
	const pinned = await setDesktopAlwaysOnTop(alwaysOnTop);
	return resized && pinned;
}
