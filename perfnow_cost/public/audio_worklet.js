// Audio thread: capture {framesNow, ticksNow} *together* at render boundaries.
// Posting them to main later is fine—arrival jitter doesn't pollute the samples.

class TickTapProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.sampleRate_ = sampleRate;   // Fixed per AudioContext
        this.totalFrames_ = 0;
        this.framesSinceLastSend_ = 0;
        this.sendIntervalFrames_ = Math.floor(this.sampleRate_ / 2); // ~2 Hz
        this.counterView_ = null;

        this.port.onmessage = (e) => {
            const { sab, sendHz } = e.data || {};
            if (sab) this.counterView_ = new BigInt64Array(sab);
            if (sendHz && sendHz > 0) {
                this.sendIntervalFrames_ = Math.max(128, Math.floor(this.sampleRate_ / sendHz));
            }
        };
    }

    //*
    // the main callback that the audio engine calls repeatedly
    // gets called every quantum time...
    // *//
    process(inputs, outputs) {
        const out = outputs[0];
        const frames = out?.[0]?.length || 128; // typical quantum size
        this.totalFrames_ += frames;
        this.framesSinceLastSend_ += frames;

        // if it passed the interval time so collect the frames & ticks & time and *send to main* thread
        if (this.counterView_ && this.framesSinceLastSend_ >= this.sendIntervalFrames_)  {
            // Read SAB counter *at the same boundary* as audio frames.
            const ticksNow = Atomics.load(this.counterView_, 0); // BigInt
            const framesNow = this.totalFrames_;
            const timeNow = framesNow / this.sampleRate_;
            this.port.postMessage({
                framesNow,
                ticksNow: ticksNow.toString(), // BigInt-safe
                timeNow
            });
            this.framesSinceLastSend_ = 0;
        }

        // Keep output silent but valid.
        if (out && out.length) {
            for (let ch = 0; ch < out.length; ch++) out[ch].fill(0);
        }
        return true;
    }
}

registerProcessor("tick-tap-processor", TickTapProcessor);
