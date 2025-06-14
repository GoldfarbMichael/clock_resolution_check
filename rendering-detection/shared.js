let stopped = false;

export function stopEverything() {
    stopped = true;
    console.warn('[!] Sampling and site opening stopped.');
}

export function isStopped() {
    return stopped;
}
