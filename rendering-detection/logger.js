import { stopEverything } from './shared.js';

const renderLog = [];
const upLog = [];

export function logSample(delta, detected) {
    const now = performance.now();
    renderLog.push({
        timestamp: now.toFixed(2),
        delta: delta.toFixed(2),
        detected
    });

    if (detected) {
        console.warn(`[Spike] Δ=${delta.toFixed(2)}ms`);
    }
}

export function logSiteOpenTime() {
    upLog.push(performance.now().toFixed(2));
}

export function setupCombinedDownload(buttonId = 'download-all') {
    document.getElementById(buttonId).addEventListener('click', () => {
        stopEverything();

        const renderCSV = [
            'timestamp,delta_ms,detected',
            ...renderLog.map(e => `${e.timestamp},${e.delta},${e.detected}`)
        ].join('\n');

        const upCSV = ['timestamp', ...upLog].join('\n');

        const download = (content, filename) => {
            const blob = new Blob([content], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        download(renderCSV, 'render_test_log.csv');
        download(upCSV, 'up_sites.csv');
    });
}