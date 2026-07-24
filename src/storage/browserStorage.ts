import type { PersistedAppState } from './appState';
import { parsePersistedAppState } from './appState';

const APP_STATE_KEY = 'modli:state:v1';
const IMAGE_DATABASE = 'modli-images';
const IMAGE_STORE = 'project-images';

interface StoredProjectImage {
	bytes: ArrayBuffer;
	type: string;
}

function isStoredProjectImage(value: unknown): value is StoredProjectImage {
	return (
		typeof value === 'object' &&
		value !== null &&
		'bytes' in value &&
		value.bytes instanceof ArrayBuffer &&
		'type' in value &&
		typeof value.type === 'string'
	);
}

export function loadBrowserAppState(): PersistedAppState | null {
	try {
		const raw = localStorage.getItem(APP_STATE_KEY);
		if (!raw) return null;
		return parsePersistedAppState(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function saveBrowserAppState(state: PersistedAppState): void {
	localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
}

function openImageDatabase(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(IMAGE_DATABASE, 1);
		request.onupgradeneeded = () => {
			const database = request.result;
			if (!database.objectStoreNames.contains(IMAGE_STORE)) {
				database.createObjectStore(IMAGE_STORE);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

export async function putProjectImage(
	imageId: string,
	image: Blob,
): Promise<void> {
	const database = await openImageDatabase();
	const storedImage: StoredProjectImage = {
		bytes: await image.arrayBuffer(),
		type: image.type,
	};
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(IMAGE_STORE, 'readwrite');
		transaction.objectStore(IMAGE_STORE).put(storedImage, imageId);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
	database.close();
}

export async function getProjectImage(
	imageId: string,
): Promise<Blob | undefined> {
	const database = await openImageDatabase();
	const image = await new Promise<Blob | undefined>((resolve, reject) => {
		const transaction = database.transaction(IMAGE_STORE, 'readonly');
		const request = transaction.objectStore(IMAGE_STORE).get(imageId);
		request.onsuccess = () => {
			const storedImage: unknown = request.result;
			if (storedImage instanceof Blob) {
				resolve(storedImage);
				return;
			}
			resolve(
				isStoredProjectImage(storedImage)
					? new Blob([storedImage.bytes], { type: storedImage.type })
					: undefined,
			);
		};
		request.onerror = () => reject(request.error);
	});
	database.close();
	return image;
}

export async function deleteProjectImage(imageId: string): Promise<void> {
	const database = await openImageDatabase();
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(IMAGE_STORE, 'readwrite');
		transaction.objectStore(IMAGE_STORE).delete(imageId);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
	});
	database.close();
}
