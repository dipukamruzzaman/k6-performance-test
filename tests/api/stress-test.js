// tests/api/stress-test.js
// K6 Stress Test — Beyond normal capacity
// Finds the breaking point of the API

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10  },  // warm up
    { duration: "30s", target: 50  },  // ramp to stress
    { duration: "1m",  target: 50  },  // hold stress
    { duration: "30s", target: 100 },  // push beyond
    { duration: "30s", target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],  // relaxed for stress
    http_req_failed:   ["rate<0.05"],   // allow up to 5% errors
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/users`],
    ["GET", `${BASE_URL}/users/1`],
    ["GET", `${BASE_URL}/posts`],
  ]);

  responses.forEach((res) => {
    check(res, {
      "status is 200": (r) => r.status === 200,
      "response under 1s": (r) => r.timings.duration < 1000,
    });
  });

  sleep(1);
}