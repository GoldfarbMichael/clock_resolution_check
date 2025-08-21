self.onmessage = function(event) {
    const sharedBuffer = event.data;
    const counter = new Uint32Array(sharedBuffer);

    function incrementCounter() {
        while (1) {
            Atomics.add(counter, 0, 1);
        }
    }

    incrementCounter();
};
