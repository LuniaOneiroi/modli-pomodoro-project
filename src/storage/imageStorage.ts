import { isDesktopRuntime } from '../platform/window';
import {
	deleteProjectImage as deleteBrowserProjectImage,
	getProjectImage as getBrowserProjectImage,
	putProjectImage as putBrowserProjectImage,
} from './browserStorage';
import {
	deleteDesktopProjectImage,
	getDesktopProjectImage,
	putDesktopProjectImage,
} from './desktopImageStorage';

export async function putProjectImage(
	imageId: string,
	image: Blob,
): Promise<void> {
	if (!isDesktopRuntime()) {
		await putBrowserProjectImage(imageId, image);
		return;
	}

	try {
		await putDesktopProjectImage(imageId, image);
	} catch {
		await putBrowserProjectImage(imageId, image);
	}
}

export async function getProjectImage(
	imageId: string,
): Promise<Blob | undefined> {
	if (!isDesktopRuntime()) return getBrowserProjectImage(imageId);

	const desktopImage = await getDesktopProjectImage(imageId);
	if (desktopImage) return desktopImage;

	const legacyBrowserImage = await getBrowserProjectImage(imageId);
	if (!legacyBrowserImage) return undefined;

	try {
		await putDesktopProjectImage(imageId, legacyBrowserImage);
	} catch {
		// Keep using the IndexedDB copy when native migration is unavailable.
	}
	return legacyBrowserImage;
}

export async function deleteProjectImage(imageId: string): Promise<void> {
	if (!isDesktopRuntime()) {
		await deleteBrowserProjectImage(imageId);
		return;
	}

	let deleted = false;
	try {
		await deleteDesktopProjectImage(imageId);
		deleted = true;
	} catch {
		// The image may only exist in legacy IndexedDB storage.
	}

	try {
		await deleteBrowserProjectImage(imageId);
		deleted = true;
	} catch {
		// A successful native deletion is sufficient.
	}

	if (!deleted) throw new Error('Project image could not be deleted.');
}
