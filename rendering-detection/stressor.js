import { isStopped } from './shared.js';

export function renderHeavyTask(ctx) {
    if (isStopped()) return;
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * ctx.canvas.width;
        const y = Math.random() * ctx.canvas.height;
        ctx.fillRect(x, y, 1, 1);
    }
}
