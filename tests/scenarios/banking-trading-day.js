// tests/scenarios/banking-trading-day.js
// FinanceQA — Full Trading Day Performance Simulation
// Simulates realistic financial market traffic patterns
//
// Traffic Pattern:
// 06:00 Pre-market warmup     →  5 VUs
// 09:30 Market open spike     →  200 VUs (30s ramp)
// 10:00 Normal trading        →  50 VUs (sustained)
// 12:00 Lunch dip             →  20 VUs
// 15:00 Afternoon surge       →  80 VUs
// 16:00 Market close spike    →  150 VUs
// 16:30 After hours wind down →  10 VUs

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// ── Custom Metrics ─────────────────────────────────────────────
const accountQueryTime  = new Trend("account_query_time");
const transactionTime   = new Trend("transaction_time");
const portfolioTime     = new Trend("portfolio_query_time");
const errorRate         = new Rate("trading_error_rate");
const totalTransactions = new Counter("total_transactions");

// ── Trading Day Stages ─────────────────────────────────────────
export const options = {
  stages: [
    // Pre-market warmup
    { duration: "30s", target: 5   },
    { duration: "30s", target: 5   },

    // Market open — sudden spike
    { duration: "30s", target: 200 },
    { duration: "1m",  target: 200 },

    // Normal trading hours
    { duration: "30s", target: 50  },
    { duration: "1m",  target: 50  },

    // Lunch dip
    { duration: "30s", target: 20  },
    { duration: "30s", target: 20  },

    // Afternoon surge
    { duration: "30s", target: 80  },
    { duration: "30s", target: 80  },

    // Market close spike
    { duration: "30s", target: 150 },
    { duration: "30s", target: 150 },

    // After hours wind down
    { duration: "30s", target: 10  },
    { duration: "30s", target: 0   },
  ],

  thresholds: {
    // Overall API health
    http_req_duration:      ["p(95)<500", "p(99)<1000"],
    http_req_failed:        ["rate<0.01"],

    // Business-specific thresholds
    account_query_time:     ["p(95)<300"],  // accounts must be fast
    transaction_time:       ["p(95)<500"],  // transactions can be slower
    portfolio_query_time:   ["p(95)<400"],  // portfolio queries
    trading_error_rate:     ["rate<0.01"],  // less than 1% trading errors
  },
};

const BASE_URL = "https://jsonplaceholder.typicode.com";

// ── Trading Scenarios ──────────────────────────────────────────
export default function () {

  // Scenario 1 — Account Management (30% of traffic)
  group("Account Management", () => {
    const start = Date.now();

    const accountRes = http.get(`${BASE_URL}/users`);
    accountQueryTime.add(Date.now() - start);

    const success = check(accountRes, {
      "accounts — status 200":       (r) => r.status === 200,
      "accounts — has data":         (r) => r.json().length > 0,
      "accounts — under 300ms":      (r) => r.timings.duration < 300,
    });

    errorRate.add(!success);
    sleep(0.5);

    // Get specific account
    const singleRes = http.get(`${BASE_URL}/users/1`);
    check(singleRes, {
      "account detail — status 200": (r) => r.status === 200,
      "account detail — has email":  (r) => r.json().email !== "",
    });
    sleep(0.5);
  });

  // Scenario 2 — Transaction Processing (50% of traffic)
  group("Transaction Processing", () => {
    const start = Date.now();

    // View transaction history
    const historyRes = http.get(`${BASE_URL}/posts?userId=1`);
    transactionTime.add(Date.now() - start);

    check(historyRes, {
      "transactions — status 200":   (r) => r.status === 200,
      "transactions — has records":  (r) => r.json().length > 0,
      "transactions — under 500ms":  (r) => r.timings.duration < 500,
    });
    sleep(0.5);

    // Create new transaction
    const payload = JSON.stringify({
      userId: Math.floor(Math.random() * 10) + 1,
      title: `Trade-${Date.now()}`,
      body: `Market order executed at ${new Date().toISOString()}`
    });

    const tradeRes = http.post(
      `${BASE_URL}/posts`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const tradeSuccess = check(tradeRes, {
      "trade execution — status 201": (r) => r.status === 201,
      "trade execution — has id":     (r) => r.json().id !== undefined,
      "trade execution — under 500ms":(r) => r.timings.duration < 500,
    });

    if (tradeSuccess) totalTransactions.add(1);
    errorRate.add(!tradeSuccess);
    sleep(1);
  });

  // Scenario 3 — Portfolio Queries (20% of traffic)
  group("Portfolio Queries", () => {
    const start = Date.now();

    const portfolioRes = http.get(`${BASE_URL}/posts`);
    portfolioTime.add(Date.now() - start);

    check(portfolioRes, {
      "portfolio — status 200":      (r) => r.status === 200,
      "portfolio — 100 positions":   (r) => r.json().length === 100,
      "portfolio — under 400ms":     (r) => r.timings.duration < 400,
    });
    sleep(1);
  });
}

// ── End of Test Summary ────────────────────────────────────────
export function handleSummary(data) {
  const duration    = data.metrics.http_req_duration;
  const failed      = data.metrics.http_req_failed;
  const reqs        = data.metrics.http_reqs;

  return {
    stdout: `
╔══════════════════════════════════════════════════════════╗
║         FinanceQA — Trading Day Performance Report       ║
╠══════════════════════════════════════════════════════════╣
║  Total Requests    : ${reqs ? reqs.values.count : 'N/A'}
║  Failed Requests   : ${failed ? (failed.values.rate * 100).toFixed(2) : 'N/A'}%
║  Avg Response Time : ${duration ? duration.values.avg.toFixed(2) : 'N/A'}ms
║  p95 Response Time : ${duration ? duration.values['p(95)'].toFixed(2) : 'N/A'}ms
║  p99 Response Time : ${duration ? duration.values['p(99)'].toFixed(2) : 'N/A'}ms
╚══════════════════════════════════════════════════════════╝
    `,
  };
}