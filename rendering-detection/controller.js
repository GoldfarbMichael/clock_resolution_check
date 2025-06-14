import { isStopped } from './shared.js';
import { logSiteOpenTime } from './logger.js';

const realSites = [
    'https://en.wikipedia.org',
    'https://www.bing.com',
    'https://www.youtube.com/'
];

function randomDelay() {
    return 8000 + Math.random() * 2000; // 3–5 seconds
}

function openSite() {
    if (isStopped()) return;

    const site = realSites[Math.floor(Math.random() * realSites.length)];
    const popup = window.open(site, '_blank');
    if (popup) {
        logSiteOpenTime();
        setTimeout(() => popup.close(), 7000);
    }
}
function schedule() {
    const delay = randomDelay();
    setTimeout(() => {
        openSite();
        schedule();
    }, delay);
}
schedule();
