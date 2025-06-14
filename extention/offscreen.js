/**
    * this scrip is the script that probes the buffer
    * creates worker thread
    * the worker thread will count++ infinitely
* */

// ----------------------------------------------
//   Probe Shusterman Style
// ----------------------------------------------

// Create shared memory buffer
const sharedBuffer = new SharedArrayBuffer(4);
const counter = new Uint32Array(sharedBuffer);
// Create the worker thread
const worker = new Worker('worker.js');
worker.postMessage(sharedBuffer);

// Parameters
const BUFFER_SIZE_MB = 12;  // size of probe buffer
const LINE_SIZE = 64;  // size of one cache line (64 bytes)
const NUM_ITERATIONS = 100;  // number of Prime+Probe rounds

// Allocate probe buffer
const probeBuffer = new Uint8Array(BUFFER_SIZE_MB * 1024 * 1024);

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

// Fisher-Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}

// Probe loop
async function Probe() {
    console.log("Starting randomized Prime+Probe...");

    const offsets = buildRandomTraversal(probeBuffer, LINE_SIZE);

    for (let iteration = 0; iteration < NUM_ITERATIONS; iteration++) {
        // PROBE
        const probeStart = Atomics.load(counter, 0);
        for (const offset of offsets) {
            probeBuffer[offset]++;
        }
        const probeEnd = Atomics.load(counter, 0);

        const probeTime = probeEnd - probeStart;
        console.log(`Iteration ${iteration + 1}: Probe time (SAB ticks): ${probeTime}`);
    }

    console.log("Probe complete.");
    sleep(100)
}

// Helper sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start probing after warm-up
setTimeout(Probe, 10000);






















/**
 ************ CLOCK RESOLUTION TEST ************
 ****** After 10 samples --> about 500 ns ******
 * */

// // Create shared memory buffer
// const sharedBuffer = new SharedArrayBuffer(4);
// const counter = new Uint32Array(sharedBuffer);
//
// // Create the worker thread
// const worker = new Worker('worker.js');
// worker.postMessage(sharedBuffer);
//
// // Calibration parameters
// const SAMPLE_INTERVAL_MS = 1000;  // 1 second
// const NUM_SAMPLES = 10;
//
// let previousCount = Atomics.load(counter, 0);
// let previousWallClock = performance.now();
// let sampleCount = 0;
//
// function sampleSAB() {
//     const currentCount = Atomics.load(counter, 0);
//     const currentWallClock = performance.now();
//
//     const deltaCount = currentCount - previousCount;
//     const deltaTime = currentWallClock - previousWallClock; // ms
//
//     const frequency = (deltaTime / deltaCount); // ms/increment
//     const approxResolution = frequency * 1e6; // ns/increment
//
//     console.log(`[Sample ${sampleCount+1}] Estimated SAB resolution: ${approxResolution.toFixed(2)} ns`);
//
//     previousCount = currentCount;
//     previousWallClock = currentWallClock;
//
//     sampleCount++;
//
//     if (sampleCount < NUM_SAMPLES) {
//         setTimeout(sampleSAB, SAMPLE_INTERVAL_MS);
//     } else {
//         console.log("SAB resolution sampling complete.");
//     }
// }
//
// // Start sampling loop
// setTimeout(sampleSAB, SAMPLE_INTERVAL_MS);
