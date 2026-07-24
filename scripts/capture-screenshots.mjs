import { mkdir } from 'node:fs/promises';
import { env } from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const baseUrl = env.MODLI_SCREENSHOT_URL ?? 'http://127.0.0.1:4173';
const screenshotsDirectory = fileURLToPath(
	new URL('../docs/screenshots/', import.meta.url),
);

await mkdir(screenshotsDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
	colorScheme: 'dark',
	deviceScaleFactor: 2,
	reducedMotion: 'reduce',
	viewport: { width: 1200, height: 960 },
});
const page = await context.newPage();

async function waitForArtwork() {
	await page.locator('img').evaluateAll(async (images) => {
		await Promise.all(
			images.map((image) => {
				if (image.complete) {
					return Promise.resolve();
				}

				return new Promise((resolve) => {
					image.addEventListener('load', resolve, { once: true });
					image.addEventListener('error', resolve, { once: true });
				});
			}),
		);
	});
}

async function capture(filename) {
	const app = page.getByRole('article', { name: /ModLi .* timer/i });
	await app.waitFor({ state: 'visible' });
	await waitForArtwork();
	await page.waitForTimeout(250);
	await app.screenshot({
		animations: 'disabled',
		path: `${screenshotsDirectory}/${filename}`,
	});
}

try {
	await page.goto(baseUrl, { waitUntil: 'networkidle' });
	await capture('modli-compact.png');

	await page.getByRole('button', { name: 'Expand project view' }).click();
	await capture('modli-expanded.png');

	await page
		.locator('.task-row')
		.filter({ hasText: 'Finalize sacred geometry module' })
		.click();
	await capture('modli-task-details.png');

	await page.getByRole('button', { name: 'Back to project summary' }).click();
	await page.getByRole('button', { name: 'Collapse project view' }).click();
	await page.getByRole('button', { name: 'Open settings' }).click();
	await capture('modli-settings.png');
} finally {
	await browser.close();
}
