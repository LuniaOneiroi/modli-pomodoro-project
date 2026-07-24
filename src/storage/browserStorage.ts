import type {
	ModLiSettings,
	ProjectWorkspace,
	Task,
	TimerSnapshot,
	WindowMode,
} from '../domain/types';

const APP_STATE_KEY = 'modli:state:v1';
const IMAGE_DATABASE = 'modli-images';
const IMAGE_STORE = 'project-images';

export interface PersistedAppState {
	version: 1;
	projects: ProjectWorkspace[];
	tasks: Task[];
	settings: ModLiSettings;
	selectedProjectId: string;
	windowMode: WindowMode;
	timer?: TimerSnapshot;
}

export function loadAppState(): PersistedAppState | null {
	try {
		const raw = localStorage.getItem(APP_STATE_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			!('version' in parsed) ||
			parsed.version !== 1 ||
			!('projects' in parsed) ||
			!Array.isArray(parsed.projects) ||
			!('tasks' in parsed) ||
			!Array.isArray(parsed.tasks)
		) {
			return null;
		}
		return parsed as PersistedAppState;
	} catch {
		return null;
	}
}

export function saveAppState(state: PersistedAppState): void {
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
	await new Promise<void>((resolve, reject) => {
		const transaction = database.transaction(IMAGE_STORE, 'readwrite');
		transaction.objectStore(IMAGE_STORE).put(image, imageId);
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
		request.onsuccess = () => resolve(request.result as Blob | undefined);
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
