import {
	BaseDirectory,
	mkdir,
	readFile,
	remove,
	writeFile,
} from '@tauri-apps/plugin-fs';

const IMAGE_DIRECTORY = 'project-images';

function imagePath(imageId: string): string {
	const safeName = imageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 160);
	return `${IMAGE_DIRECTORY}/${safeName || 'project-image'}`;
}

function inferImageMimeType(bytes: Uint8Array): string {
	if (
		bytes[0] === 0x89 &&
		bytes[1] === 0x50 &&
		bytes[2] === 0x4e &&
		bytes[3] === 0x47
	) {
		return 'image/png';
	}
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
		return 'image/jpeg';
	}
	if (
		bytes[0] === 0x52 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x46 &&
		bytes[8] === 0x57 &&
		bytes[9] === 0x45 &&
		bytes[10] === 0x42 &&
		bytes[11] === 0x50
	) {
		return 'image/webp';
	}
	if (
		bytes[0] === 0x47 &&
		bytes[1] === 0x49 &&
		bytes[2] === 0x46 &&
		bytes[3] === 0x38
	) {
		return 'image/gif';
	}
	return 'application/octet-stream';
}

export async function putDesktopProjectImage(
	imageId: string,
	image: Blob,
): Promise<void> {
	await mkdir(IMAGE_DIRECTORY, {
		baseDir: BaseDirectory.AppData,
		recursive: true,
	});
	const bytes = new Uint8Array(await image.arrayBuffer());
	await writeFile(imagePath(imageId), bytes, {
		baseDir: BaseDirectory.AppData,
	});
}

export async function getDesktopProjectImage(
	imageId: string,
): Promise<Blob | undefined> {
	try {
		const bytes = await readFile(imagePath(imageId), {
			baseDir: BaseDirectory.AppData,
		});
		return new Blob([bytes], { type: inferImageMimeType(bytes) });
	} catch {
		return undefined;
	}
}

export async function deleteDesktopProjectImage(
	imageId: string,
): Promise<void> {
	await remove(imagePath(imageId), {
		baseDir: BaseDirectory.AppData,
	});
}
