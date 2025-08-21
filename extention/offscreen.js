/**
    * this script is the script that probes the buffer
    * creates worker thread
    * the worker thread will count++ infinitely
* */

//
// console.log("Chrome API available?", typeof chrome);
//
// // Create shared memory buffer
// const sharedBuffer = new SharedArrayBuffer(4);
// const counter = new Uint32Array(sharedBuffer);
// // Create the worker thread
// const worker = new Worker('worker.js');
// worker.postMessage(sharedBuffer);
//
// // ----------------------------------------------
// //   Probe Shusterman Style
// // ----------------------------------------------
//
// // Allocate probe buffer
// const sweepBuffer = new Uint8Array(BUFFER_SIZE_MB * 1024 * 1024);
// const sweepOffsets = buildRandomTraversal(sweepBuffer, LINE_SIZE);
// const samples = new Uint32Array(SAMPLES_PER_TRACE);
//
//
// // Rendering detection loop
// async function monitorRendering() {
//     while (true) {
//         console.log("Rendering");
//
//         const start = Atomics.load(counter, 0);
//         renderHeavyTask();
//         const end = Atomics.load(counter, 0);
//         const delta = end - start;
//
//         if (delta >= RENDER_THRESHOLD) {
//             console.log("Rendering detected! Starting sampling...");
//             await probe();
//             break;
//         }
//         await sleep(100);
//     }
// }
//
//
// // Sampling logic skeleton
// async function probe() {
//     let tStart;
//     let tEnd;
//     let waitEnd;
//
//     for (let i = 0; i < SAMPLES_PER_TRACE; i++) {
//         tStart = Atomics.load(counter, 0);
//         for (const offset of sweepOffsets) {
//             sweepBuffer[offset]++;
//         }
//         tEnd = Atomics.load(counter, 0);
//         samples[i] = tEnd - tStart;
//
//         waitEnd = Atomics.load(counter, 0) + INTERVAL_IN_SAB_INCREMENTS;
//         while (Atomics.load(counter, 0) < waitEnd) {}
//     }
//
//     console.log("Sampling complete");
//     chrome.runtime.sendMessage({
//         action: "save_csv",
//         samples: Array.from(samples)  // Convert typed array to normal array for messaging
//     });
// }
//
// setTimeout(() => {
//     monitorRendering();
// }, 3000);





/**
 ************ CLOCK jitter TEST ************
 ******                           ******
 * */


// Create shared memory buffer
const sharedBuffer = new SharedArrayBuffer(4);
const counter = new Uint32Array(sharedBuffer);

// Create the worker thread
const worker = new Worker('worker.js');
worker.postMessage(sharedBuffer);

// Create array for sampled timestamps
const NUM_SAMPLES = 10001;
const sampleArr = new Array(NUM_SAMPLES);
const timeStampArr = new Array(NUM_SAMPLES);


// Main sampling routine
async function sampleOnPerfNowEdge() {
    let currentEdge = performance.now();

    for (let i = 0; i < NUM_SAMPLES; ) {
        const now = performance.now();

        if (now !== currentEdge) {
            currentEdge = now;

            // sample SAB
            sampleArr[i] = Atomics.load(counter, 0);
            timeStampArr[i] = currentEdge;
            i++;
        }
    }
    //  Calculate deltas
    const countDelta = [];
    const timeStampDelta = [];

    for (let i = 0; i < NUM_SAMPLES - 1; i++) {
        countDelta.push(sampleArr[i + 1] - sampleArr[i]);
        timeStampDelta.push((timeStampArr[i + 1] - timeStampArr[i]) * 1000); // Convert to microseconds and push delta
    }

    // Format CSV: count,time_us,delta_count,delta_time_us
    let csv = "countDelta,timeStampDelta\n";
    for (let i = 0; i < NUM_SAMPLES - 1; i++) {
        csv += `${countDelta[i]},${timeStampDelta[i]}\n`;
    }

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sab_timing_data.csv";
    link.click();
}



setTimeout(() => {
    sampleOnPerfNowEdge();
}, 3000);









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
