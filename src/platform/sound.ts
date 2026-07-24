let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
	audioContext ??= new AudioContext();
	return audioContext;
}

export async function prepareTimerSound(): Promise<void> {
	const context = getAudioContext();
	if (context.state === 'suspended') {
		await context.resume();
	}
}

export async function playTimerChime(volume = 0.7): Promise<void> {
	await prepareTimerSound();
	const context = getAudioContext();
	const gain = context.createGain();
	const now = context.currentTime;

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.exponentialRampToValueAtTime(
		Math.max(0.001, Math.min(1, volume)) * 0.23,
		now + 0.025,
	);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
	gain.connect(context.destination);

	for (const [index, frequency] of [523.25, 659.25].entries()) {
		const oscillator = context.createOscillator();
		const start = now + index * 0.16;
		oscillator.type = 'sine';
		oscillator.frequency.setValueAtTime(frequency, start);
		oscillator.connect(gain);
		oscillator.start(start);
		oscillator.stop(now + 0.9);
	}
}
