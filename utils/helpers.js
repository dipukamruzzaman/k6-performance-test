// utils/helpers.js
// Reusable helper functions for K6 tests

import { check } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// Custom metrics
export const responseTime  = new Trend("custom_response_time");
export const errorRate     = new Rate("custom_error_rate");
export const requestCount  = new Counter("custom_request_count");

// Standard response check
export function checkResponse(res, name, expectedStatus = 200) {
  const success = check(res, {
    [`${name} — status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} — response under 500ms`]:     (r) => r.timings.duration < 500,
  });

  responseTime.add(res.timings.duration);
  errorRate.add(!success);
  requestCount.add(1);

  return success;
}

// Log performance summary
export function logSummary(data) {
  return {
    stdout: `
╔══════════════════════════════════════════╗
║     FinanceQA K6 Performance Summary     ║
╠══════════════════════════════════════════╣
║ Total Requests : ${data.metrics.http_reqs.values.count}
║ Failed         : ${data.metrics.http_req_failed.values.rate * 100}%
║ Avg Duration   : ${data.metrics.http_req_duration.values.avg}ms
║ p95 Duration   : ${data.metrics.http_req_duration.values["p(95)"]}ms
║ p99 Duration   : ${data.metrics.http_req_duration.values["p(99)"]}ms
╚══════════════════════════════════════════╝
    `,
  };
}