export function wait_edge() {
    let next
    const last = performance.now();
    while ((next = performance.now()) === last) {}
    return next;
}

export function count_edge() {
    let last = performance.now(), count = 0;
    while (performance.now() === last) count++;
    return [count, performance.now()];
}

// Expects an array of timeStampDelta
// Uses arr.length and triggers a CSV download.
export function downloadEdgeCSV(dataArray, filename = "edge_data.csv") {
    let csv = "count_edge\n";
    for (let i = 0; i < dataArray.length; i++) {
        csv += `${dataArray[i]}\n`;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}