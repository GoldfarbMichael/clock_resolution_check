// Dedicated Worker: free-running BigInt counter on SAB.
// Tight loop for maximum tick rate. Stop by worker.terminate() from main.

let view = null;

self.onmessage = (e) => {
    const { sab, cmd } = e.data || {};
    if (sab) view = new BigInt64Array(sab);
    if (cmd === "start") {
        if (!view) throw new Error("SAB not set before start");
        // Tight counting loop; no yields, no further onmessage processing needed.
        // We will stop this worker via Worker#terminate() from the main thread.
        // Atomics.add ensures visibility and monotonicity across threads.
        for (;;) {
            Atomics.add(view, 0, 1n); //1n is 1(big int) - increment by 1
        }
    }
};
