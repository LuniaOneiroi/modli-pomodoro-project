import { load } from '@tauri-apps/plugin-store';
import type { PersistedAppState } from './appState';
import { parsePersistedAppState } from './appState';

const STORE_FILE = 'modli-state.json';
const APP_STATE_KEY = 'app-state';

let storePromise: ReturnType<typeof load> | null = null;
let writeQueue = Promise.resolve();

function getStore(): ReturnType<typeof load> {
	storePromise ??= load(STORE_FILE, { autoSave: false });
	return storePromise;
}

export async function loadDesktopAppState(): Promise<PersistedAppState | null> {
	const store = await getStore();
	const storedValue = await store.get<unknown>(APP_STATE_KEY);
	return parsePersistedAppState(storedValue);
}

export function saveDesktopAppState(state: PersistedAppState): Promise<void> {
	writeQueue = writeQueue
		.catch(() => undefined)
		.then(async () => {
			const store = await getStore();
			await store.set(APP_STATE_KEY, state);
			await store.save();
		});
	return writeQueue;
}
