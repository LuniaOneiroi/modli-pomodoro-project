const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1200;

export async function prepareProjectImage(file: File): Promise<Blob> {
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(
			1,
			MAX_IMAGE_WIDTH / bitmap.width,
			MAX_IMAGE_HEIGHT / bitmap.height,
		);
		const width = Math.max(1, Math.round(bitmap.width * scale));
		const height = Math.max(1, Math.round(bitmap.height * scale));
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext('2d');
		if (!context) {
			bitmap.close();
			return file;
		}
		context.drawImage(bitmap, 0, 0, width, height);
		bitmap.close();
		const processed = await new Promise<Blob | null>((resolve) => {
			canvas.toBlob(resolve, 'image/webp', 0.82);
		});
		return processed ?? file;
	} catch {
		return file;
	}
}
