
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}

// Build randomized access order
function buildRandomTraversal(buffer, lineSize) {
    const numOfLines = Math.floor(buffer.length / lineSize);
    const offsets = new Uint32Array(numOfLines);
    for (let i = 0; i < numOfLines; i++) {
        offsets[i] = i * lineSize;
    }
    shuffle(offsets);
    return offsets;
}


// Create heavy rendering workload
function renderHeavyTask() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.style.width = '500px';
        div.style.height = '500px';
        div.style.border = '1px solid black';
        div.style.margin = '5px';
        container.appendChild(div);
    }
}
