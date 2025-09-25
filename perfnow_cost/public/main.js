// main.js — start calibration only after first user gesture, to satisfy autoplay policy.

const CALIBRATION_SECONDS = 60; // Total time of sampling
const SEND_HZ = 2; // How often the AudioWorklet sends {framesNow, ticksNow} samples to main thread

let audioCtx, node, worker, sab, tickView;
let lastSample = null;
let samples = [];
let stopTimer = null;

// Gate everything behind a one-time user gesture
window.addEventListener("pointerdown", startOnce, { once: true });
window.addEventListener("keydown", startOnce, { once: true });

function startOnce() {
    window.removeEventListener("pointerdown", startOnce);
    window.removeEventListener("keydown", startOnce);
    run().catch(err => console.error("Calibration error:", err));
}

async function run() {
    if (!crossOriginIsolated) {
        console.error("crossOriginIsolated=false. Run via Flask (COOP/COEP).");
        return;
    }

    // 1) SAB + Worker
    sab = new SharedArrayBuffer(BigInt64Array.BYTES_PER_ELEMENT);
    tickView = new BigInt64Array(sab);
    tickView[0] = 0n;

    worker = new Worker("./counterWorker.js");
    worker.postMessage({ sab });
    worker.postMessage({ cmd: "start" });

    // 2) AudioContext + AudioWorklet
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
    await audioCtx.audioWorklet.addModule("./audio_worklet.js"); // ensure filename matches

    node = new AudioWorkletNode(audioCtx, "tick-tap-processor", {
        numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [1]
    });

    const gain = audioCtx.createGain();
    gain.gain.value = 0;
    node.connect(gain).connect(audioCtx.destination);

    node.port.onmessage = onWorkletMessage;
    node.port.postMessage({ sab, sendHz: SEND_HZ });

    // AudioContext is created after a gesture, so resume should succeed without policy errors
    if (audioCtx.state !== "running") {
        try { await audioCtx.resume(); } catch (e) { console.warn("resume() failed:", e); }
    }

    console.log(`AudioContext sampleRate=${audioCtx.sampleRate} Hz`);
    console.log("Collecting calibration samples...");
}

function onWorkletMessage(e) {
    const { framesNow, ticksNow, timeNow } = e.data || {};
    const fNow = framesNow;
    const tNow = BigInt(ticksNow);

    if (lastSample) {
        const dFrames = fNow - lastSample.frames;
        const dTicksBig = tNow - lastSample.ticks;
        const dTicks = Number(dTicksBig); // safe for ~1 s windows
        const seconds = dFrames / audioCtx.sampleRate;
        const tps = dTicks / seconds;
        const spt = 1 / tps;

        samples.push({
            frames_prev: lastSample.frames,
            ticks_prev: lastSample.ticks.toString(),
            frames_now: fNow,
            ticks_now: tNow.toString(),
            delta_frames: dFrames,
            delta_ticks: dTicks,
            seconds,
            ticks_per_second: tps,
            seconds_per_tick: spt,
            audio_time_now: timeNow
        });

        if (samples.length % 5 === 0) {
            const medTps = median(samples.map(s => s.ticks_per_second));
            console.log(`[${samples.length}] median ticks/sec ≈ ${fmt(medTps)}, sec/tick ≈ ${fmt(1/medTps)} (${fmt((1/medTps)*1e9)} ns)`);
        }
    } else {
        // Start stop timer on first sample
        stopTimer = setTimeout(stopAndUpload, CALIBRATION_SECONDS * 1000);
    }

    lastSample = { frames: fNow, ticks: tNow };
}

async function stopAndUpload() {
    clearTimeout(stopTimer);

    const tpsList = samples.map(s => s.ticks_per_second);
    const med = median(tpsList), avg = average(tpsList);
    const sptMed = 1 / med;

    console.log(`Final: samples=${samples.length}`);
    console.log(`  median ticks/sec = ${fmt(med)}`);
    console.log(`  median sec/tick  = ${fmt(sptMed)}  (${fmt(sptMed*1e9)} ns)`);

    try { node?.disconnect(); } catch {}
    try { await audioCtx?.close(); } catch {}
    try { worker?.terminate(); } catch {}

    const payload = {
        sample_rate_hz_FRAMES_PER_SECOND: audioCtx ? audioCtx.sampleRate : null,
        cross_origin_isolated: crossOriginIsolated,
        collected_seconds: CALIBRATION_SECONDS,
        send_hz: SEND_HZ,
        summary: {
            samples_count: samples.length,
            median_ticks_per_second: med,
            median_seconds_per_tick: sptMed
        },
        samples
    };

    try {
        const res = await fetch("/upload", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const j = await res.json();
        if (j.ok) console.log(`Saved: ${j.file}  →  http://localhost:8080${j.path}`);
        else console.error("Upload failed:", j);
    } catch (e) {
        console.error("Upload error:", e);
    }
}

// helpers
function median(arr){ const a=arr.slice().sort((x,y)=>x-y); const n=a.length; return n? (n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):NaN; }
function average(arr){ return arr.length? arr.reduce((s,v)=>s+v,0)/arr.length : NaN; }
function fmt(x){ return Number.isFinite(x) ? x.toLocaleString(undefined,{maximumFractionDigits:3}) : String(x); }
