const BETWEEN_SAMPLES_INTERVAL = 2; // in ms

const SAB_RESOLUTION = 0.0005;  // in ms per increment (500 ns)
const INTERVAL_IN_SAB_INCREMENTS = BETWEEN_SAMPLES_INTERVAL/ SAB_RESOLUTION; // 4000 increments

const BUFFER_SIZE_MB = 12;
const LINE_SIZE = 64;
const RENDER_THRESHOLD = 8000;
const SAMPLES_PER_TRACE = 3000; // RETURN IT TO 3750!!!!

// const SITE_NAME = "example_site";
