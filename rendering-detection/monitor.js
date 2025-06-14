import { THRESHOLD_MS } from './config.js';
import { renderHeavyTask } from './stressor.js';
import { logSample } from './logger.js';

let lastFrameTime = performance.now();
let active = true;

export function monitor(ctx) {
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;

    if (active) renderHeavyTask(ctx);

    const detected = delta > THRESHOLD_MS;
    logSample(delta, detected);

    if (detected && active) {
        active = false;
        console.warn('[!] Contention detected. Halting stressor.');
    }

    requestAnimationFrame(() => monitor(ctx));
}
