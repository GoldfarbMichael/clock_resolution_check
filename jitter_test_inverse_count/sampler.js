import * as utils from './../utils.js';

const MIN_INCREMENTS = 1e5;
const MAX_INCREMENTS = 3e5; // Maximum increment for the loop
const NUM_SAMPLES = 1e4; // Number of samples to take for each increment
const INCREMENT_STEP = 90; // Step size for increments

const numOfIncrements = Math.floor((MAX_INCREMENTS - MIN_INCREMENTS) / INCREMENT_STEP) ;
let timeStampMatrix = new Array(numOfIncrements);

async function sampleAfterX_increments(){
    let startSampling = performance.now();
    let matrixIndex = 0;
    for (let i = MIN_INCREMENTS; i < MAX_INCREMENTS; i+= INCREMENT_STEP) {
        const timeStampArr = new Array(NUM_SAMPLES);
        console.log(`Working on increment: ${i}`);
        for(let j = 0; j < NUM_SAMPLES; j++) {
            let count = 0;
            const start = utils.wait_edge();
            while (count < i) {
                count++;
            }
            const end = performance.now();
            timeStampArr[j] = (end - start) * 1e3; // Convert to microseconds
        }
        timeStampMatrix[matrixIndex] = timeStampArr;
        matrixIndex++;
    }
    const endSampling = performance.now();
    console.log(`Sampling complete. took ${(endSampling - startSampling)*1e3}us \nDownloading CSV...`);

// At the end of your timeStampMatrix sampling loop
    if (timeStampMatrix.length === 0) {
        console.log("No data to download");
        return;
    }

    let csv = "";

// Create header row
    csv += "increments," + Array.from({length: timeStampMatrix[0].length}, (_, i) => `sample_${i + 1}`).join(",") + "\n";

// Add data rows: each row starts with increment number, then timestamp values
    for (let i = 0; i < timeStampMatrix.length; i++) {
        const incrementNumber = MIN_INCREMENTS + i * INCREMENT_STEP;
        csv += incrementNumber + "," + timeStampMatrix[i].join(",") + "\n";
    }

// Download the CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "timestamp_matrix.csv";
    link.click();

}

setTimeout(() => {
    sampleAfterX_increments();
}, 5000);

