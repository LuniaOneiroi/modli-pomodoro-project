import type { ProjectWorkspace } from '../domain/types';

interface NewProjectRecord {
	name: string;
	accentColor: string;
	imageName?: string;
}

export function createProjectWorkspace(
	input: NewProjectRecord,
	idFactory: () => string = () => crypto.randomUUID(),
	now: () => string = () => new Date().toISOString(),
): ProjectWorkspace {
	const timestamp = now();
	const name = input.name.trim();

	return {
		project: {
			id: idFactory(),
			name,
			accentColor: input.accentColor,
			...(input.imageName ? { imageId: input.imageName } : {}),
			createdAt: timestamp,
			updatedAt: timestamp,
		},
		summary: `A new focus path for ${name}. Add tasks when you are ready to shape the work.`,
		focusStreak: 0,
		isSample: false,
	};
}
