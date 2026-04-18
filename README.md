Set-Content -Path README.md -Value '# FinanceQA K6 Performance Suite
## Modern Performance Testing | Financial Services APIs | CI/CD

A production-grade performance testing framework built with K6 and JavaScript,
targeting financial services REST APIs with full CI/CD integration via GitHub Actions.

---

## Why K6 over JMeter?
- JavaScript-based — no XML, no GUI required
- Native CI/CD integration
- Built-in thresholds for automated pass/fail
- Real-time metrics with Grafana Cloud
- Docker-ready out of the box

---

## Tech Stack
- K6 v1.7.1
- JavaScript (ES6)
- GitHub Actions CI/CD
- k6-reporter HTML Dashboard
- Node.js

---

## Project Structure

tests/
  api/
    smoke-test.js      # 1 VU, 30s — API health check
    load-test.js       # 10 VUs, 2min — normal traffic
    stress-test.js     # 100 VUs, 3min — beyond capacity
    spike-test.js      # 200 VUs, 90s — sudden surge
    soak-test.js       # 20 VUs, 5min — sustained load
utils/
  config.js            # shared configuration
  helpers.js           # reusable functions
  summary.js           # HTML report generator
.github/
  workflows/
    k6-ci.yml          # GitHub Actions pipeline

---

## Test Scenarios

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 1 | 30s | API health check |
| Load | 10 | 2min | Normal traffic baseline |
| Stress | 100 | 3min | Beyond normal capacity |
| Spike | 200 | 90s | Sudden traffic surge |
| Soak | 20 | 5min | Sustained load / memory leak detection |

---

## Performance Results

| Test | Requests | Avg | p95 | p99 | Max | Errors |
|------|----------|-----|-----|-----|-----|--------|
| Smoke | 30 | 53ms | 105ms | - | 124ms | 0.00% |
| Load | 890 | 54ms | 112ms | 147ms | 175ms | 0.00% |
| Stress | 22,188 | 52ms | 98ms | - | 338ms | 0.00% |
| Spike | 14,827 | 44ms | 86ms | 149ms | 505ms | 0.00% |
| Soak | 4,605 | 54ms | 96ms | - | 388ms | 0.00% |
| **TOTAL** | **42,540** | | | | | **0.00%** |

---

## How to Run

### Install K6
winget install k6

### Run individual tests
k6 run tests/api/smoke-test.js
k6 run tests/api/load-test.js
k6 run tests/api/stress-test.js
k6 run tests/api/spike-test.js
k6 run tests/api/soak-test.js

### Generate HTML Report
k6 run tests/api/load-test.js
start reports/summary.html

---

## CI/CD Pipeline

GitHub Actions runs automatically on every push:

Stage 1: Smoke Test (fast gate)
Stage 2: Load Test + Stress Test (parallel)
Stage 3: Performance Summary

---

## Key Findings
- Zero errors across 42,540 requests under all load scenarios
- p95 stays under 115ms across all test types
- API handles 200 concurrent users with only 505ms max response
- No performance degradation detected during 5-minute soak test
- POST operations show highest latency (avg 46-53ms) — expected

---

## Author
Md Kamruzzaman
Senior QA Engineer
Portfolio: https://mk-qa-engineer.netlify.app
GitHub: https://github.com/dipukamruzzaman
'