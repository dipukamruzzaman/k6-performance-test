// tests/api/spike-test.js
// K6 Spike Test — Sudden traffic surge
// Simulates market opening or flash event

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 1   },  // baseline
    { duration: "10s", target: 200 },  // massive spike
    { duration: "30s", target: 200 },  // hold spike
    { duration: "10s", target: 1   },  // recover
    { duration: "30s", target: 1   },  // verify recovery
  ],
  thresholds: {
    http_req_duration: ["p(99)<2000"],  // 99% under 2s during spike
    http_req_failed:   ["rate<0.10"],   // allow up to 10% errors
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  const res = http.get(`${BASE_URL}/users`);
  check(res, {
    "status 200": (r) => r.status === 200,
  });
  sleep(0.5);
}