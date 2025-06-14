// When extension is installed or reloaded, start our timer logic
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed — starting SharedArrayBuffer timer");

    // Initialize SharedArrayBuffer (4 bytes = 1 Uint32 counter)
    const sharedBuffer = new SharedArrayBuffer(4);
    const counter = new Uint32Array(sharedBuffer);

    // Start incrementing the counter using microtasks (tight loop)
    function incrementCounter() {
        Atomics.add(counter, 0, 1);
        // Yield after every 1000 increments
        if (Atomics.load(counter, 0) % 1000 === 0) {
            setTimeout(() => queueMicrotask(incrementCounter), 0);
        } else {
            queueMicrotask(incrementCounter);
        }

    }
    incrementCounter();

    // Every 100ms, print the current value to the console
    setInterval(() => {
        const timeValue = Atomics.load(counter, 0);
        console.log("High-Res Time:", timeValue);
    }, 100);
});
