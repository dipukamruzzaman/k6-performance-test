// tests/api/soak-test.js
// K6 Soak Test — Sustained load over time
// Detects memory leaks and performance degradation

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m",  target: 20 },  // ramp up
    { duration: "3m",  target: 20 },  // sustained load
    { duration: "1m",  target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed:   ["rate<0.01"],
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

export default function () {

  const usersRes = http.get(`${BASE_URL}/users`);
  check(usersRes, {
    "GET /users — status 200":    (r) => r.status === 200,
    "GET /users — under 500ms":   (r) => r.timings.duration < 500,
  });
  sleep(1);

  const postsRes = http.get(`${BASE_URL}/posts`);
  check(postsRes, {
    "GET /posts — status 200":    (r) => r.status === 200,
    "GET /posts — under 500ms":   (r) => r.timings.duration < 500,
  });
  sleep(1);

  const payload = JSON.stringify({
    userId: 1,
    title: "Soak Test Transaction",
    body: "Testing sustained load"
  });

  const postRes = http.post(
    `${BASE_URL}/posts`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
  check(postRes, {
    "POST /posts — status 201":   (r) => r.status === 201,
  });
  sleep(1);
}