// tests/api/load-test.js
// K6 Load Test — Normal operating conditions
// Simulates average daily trading traffic

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";
import { handleSummary } from "../../utils/summary.js";
// ── Custom Metrics ─────────────────────────────────────────────
const responseTime = new Trend("response_time");
const errorRate = new Rate("error_rate");
const requestCount = new Counter("request_count");

// ── Test Configuration ─────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s", target: 10 },  // ramp up to 10 users
    { duration: "1m",  target: 10 },  // stay at 10 users
    { duration: "30s", target: 0  },  // ramp down to 0
  ],
  thresholds: {
    http_req_duration:  ["p(95)<500", "p(99)<1000"],
    http_req_failed:    ["rate<0.01"],
    response_time:      ["p(95)<500"],
    error_rate:         ["rate<0.01"],
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── Helper Function ────────────────────────────────────────────
function makeRequest(url, name) {
  const res = http.get(url);
  responseTime.add(res.timings.duration);
  requestCount.add(1);
  errorRate.add(res.status !== 200);
  return res;
}

// ── Main Test Function ─────────────────────────────────────────
export default function () {

  // GET all account holders
  const usersRes = makeRequest(`${BASE_URL}/users`, "GET Users");
  check(usersRes, {
    "GET /users — status 200":     (r) => r.status === 200,
    "GET /users — response time":  (r) => r.timings.duration < 500,
  });
  sleep(1);

  // GET single account holder
  const userRes = makeRequest(`${BASE_URL}/users/1`, "GET User");
  check(userRes, {
    "GET /users/1 — status 200":   (r) => r.status === 200,
    "GET /users/1 — correct id":   (r) => r.json().id === 1,
  });
  sleep(1);

  // GET all transactions
  const postsRes = makeRequest(`${BASE_URL}/posts`, "GET Posts");
  check(postsRes, {
    "GET /posts — status 200":     (r) => r.status === 200,
    "GET /posts — has records":    (r) => r.json().length > 0,
  });
  sleep(1);

  // GET filtered transactions
  const filteredRes = makeRequest(`${BASE_URL}/posts?userId=1`, "GET Filtered");
  check(filteredRes, {
    "GET filtered — status 200":   (r) => r.status === 200,
    "GET filtered — correct user": (r) => r.json()[0].userId === 1,
  });
  sleep(1);

  // POST create transaction
  const payload = JSON.stringify({
    userId: 1,
    title: "Wire Transfer - Account #4521",
    body: "Outbound transfer of $5,000"
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const postRes = http.post(`${BASE_URL}/posts`, payload, params);
  requestCount.add(1);
  check(postRes, {
    "POST /posts — status 201":    (r) => r.status === 201,
    "POST /posts — has id":        (r) => r.json().id !== undefined,
  });
  sleep(1);
}
export { handleSummary };