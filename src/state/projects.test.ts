import { describe, expect, it } from 'vitest';
import { createProjectWorkspace } from './projects';

describe('createProjectWorkspace', () => {
	it('creates a session project with stable typed defaults', () => {
		const workspace = createProjectWorkspace(
			{
				name: '  Atlas of Small Hours  ',
				accentColor: '#258a91',
				imageName: 'night-garden.jpg',
			},
			() => 'project-atlas',
			() => '2026-07-18T17:00:00.000Z',
		);

		expect(workspace).toMatchObject({
			project: {
				id: 'project-atlas',
				name: 'Atlas of Small Hours',
				imageId: 'night-garden.jpg',
				accentColor: '#258a91',
				createdAt: '2026-07-18T17:00:00.000Z',
				updatedAt: '2026-07-18T17:00:00.000Z',
			},
			focusStreak: 0,
			isSample: false,
		});
	});
});
