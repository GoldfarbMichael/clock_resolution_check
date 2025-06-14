import { monitor } from './monitor.js';
import { setupCombinedDownload } from './logger.js';
import './controller.js';

const canvas = document.getElementById('render-canvas');
const ctx = canvas.getContext('2d');

monitor(ctx);         // handles spike detection
setupCombinedDownload();
