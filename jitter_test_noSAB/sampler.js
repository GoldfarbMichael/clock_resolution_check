// Create array for sampled timestamps
const NUM_SAMPLES = 100000;
const sampleArr = new Array(NUM_SAMPLES);
const timeStampArr = new Array(NUM_SAMPLES);


function wait_edge() {
    let next
    const last = performance.now();
    while ((next = performance.now()) === last) {}
    return next;
}

function count_edge() {
    let last = performance.now(), count = 0;
    while (performance.now() === last) count++;
    return [count, performance.now()];
}
4
// Main sampling routine
async function sampleOnPerfNowEdge() {
    for (let i = 0; i < NUM_SAMPLES; i++) {
        const start = wait_edge()
        const [edgeCount, end] = count_edge();
        sampleArr[i] = [edgeCount];
        timeStampArr[i] = (end - start) * 1000; // Convert to microseconds
        //console.log(`Sample ${i}: Count=${edgeCount}, Time=${timeStampArr[i]}μs`);
    }

    // Format CSV: count,time_us,delta_count,delta_time_us
    let csv = "count_edge,timeStampDelta\n";
    for (let i = 0; i < NUM_SAMPLES ; i++) {
        csv += `${sampleArr[i]},${timeStampArr[i]}\n`;
    }

    // Download
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "no_SAB_edge_count.csv";
    link.click();
}



setTimeout(() => {
    sampleOnPerfNowEdge();
}, 3000);

