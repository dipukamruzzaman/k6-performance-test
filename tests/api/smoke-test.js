// tests/api/smoke-test.js
// K6 Smoke Test — FinanceQA Performance Suite
// Purpose: Quick sanity check — is the API alive and responding?

import http from "k6/http";
import { check, sleep } from "k6";

// ── Test Configuration ────────────────────────────────────────
export const options = {
  vus: 1,           // 1 virtual user
  duration: "30s",  // run for 30 seconds

  // Thresholds — test FAILS if these are breached
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% of requests under 500ms
    http_req_failed: ["rate<0.01"],    // error rate under 1%
  },
};

// ── Base URL ──────────────────────────────────────────────────
const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── Main Test Function ────────────────────────────────────────
export default function () {

  // Request 1 — GET all account holders
  const usersRes = http.get(`${BASE_URL}/users`);
  check(usersRes, {
    "GET /users — status 200":        (r) => r.status === 200,
    "GET /users — has data":          (r) => r.json().length > 0,
    "GET /users — response under 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // wait 1 second between requests (realistic user behaviour)

  // Request 2 — GET single account holder
  const userRes = http.get(`${BASE_URL}/users/1`);
  check(userRes, {
    "GET /users/1 — status 200":      (r) => r.status === 200,
    "GET /users/1 — has id field":    (r) => r.json().id === 1,
    "GET /users/1 — has email":       (r) => r.json().email !== "",
  });

  sleep(1);

  // Request 3 — GET all transactions
  const postsRes = http.get(`${BASE_URL}/posts`);
  check(postsRes, {
    "GET /posts — status 200":        (r) => r.status === 200,
    "GET /posts — 100 records":       (r) => r.json().length === 100,
  });

  sleep(1);
}