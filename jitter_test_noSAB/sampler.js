// Create array for sampled timestamps
const NUM_SAMPLES = 10000;
const sampleArr = new Array(NUM_SAMPLES);
const timeStampArr = new Array(NUM_SAMPLES);
const EDGE_RESOLUTION = 0.1 // in milliseconds
const NUM_EDGES = 100; // num of edges to record per sample
const COUNT_X_EDGES = true; // if true, count X edges per sample

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

function count_X_edges(numOfEdges) {
    let target = performance.now() + numOfEdges*EDGE_RESOLUTION, count = 0;
    while (performance.now() <= target) count++;
    return [count, performance.now()];
}

// Main sampling routine
async function sampleOnPerfNowEdge() {
    for (let i = 0; i < NUM_SAMPLES; i++) {
        let edgeCount, end;
        const start = wait_edge()
        if (COUNT_X_EDGES)
             [edgeCount, end] = count_X_edges(NUM_EDGES);
        else
             [edgeCount, end] = count_edge();
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
    if (COUNT_X_EDGES)
        link.download = `count_${NUM_EDGES}_edges_edge_time.csv`;
    else
        link.download = "no_SAB_edge_count.csv";
    link.click();
}



setTimeout(() => {
    sampleOnPerfNowEdge();
}, 5000);

