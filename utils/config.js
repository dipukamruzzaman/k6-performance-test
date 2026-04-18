// utils/config.js
// Shared configuration for all K6 tests

export const BASE_URL = "https://jsonplaceholder.typicode.com";

export const THRESHOLDS = {
  standard: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed:   ["rate<0.01"],
  },
  stress: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed:   ["rate<0.05"],
  },
  spike: {
    http_req_duration: ["p(99)<2000"],
    http_req_failed:   ["rate<0.10"],
  },
};

export const SLEEP_DURATION = 1;

export const HEADERS = {
  json: { "Content-Type": "application/json" },
};

export const TRANSACTION_PAYLOAD = JSON.stringify({
  userId: 1,
  title: "Wire Transfer - Account #4521",
  body: "Outbound transfer of $5,000"
});