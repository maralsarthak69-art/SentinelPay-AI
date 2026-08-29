# SentinelPay — Testing & Quality Assurance

## Overview

SentinelPay maintains automated unit tests and benchmark evaluation suites to verify model precision, latency, and financial optimization.

---

## 1. Running Backend Unit Tests

Run the Pytest suite from the root project directory:

```bash
# Run pytest from root
python -m pytest
```

Or from inside `backend/`:
```bash
cd backend
python -m pytest
```

### Verified Test Cases
1. **`backend/tests/test_inference.py`**
   - Verifies sub-20ms inference latency ($18.4\text{ms}$).
   - Validates correct tier mapping (`PASS`, `DYNAMIC_INTERVENTION`, `BLOCK_COD`).
   - Ensures non-empty TreeSHAP feature explanation arrays.
2. **`backend/tests/test_benchmark.py`**
   - Tests held-out dataset benchmark calculations (`/api/v1/benchmark/run`).
   - Verifies precision ($\ge 99.0\%$) and False Positive Rate ($\le 0.3\%$).

---

## 2. Frontend Production Build Verification

Verify that Next.js compiles without any TypeScript or React hydration errors:

```bash
cd frontend
npm run build
```

Expected output:
```text
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (7/7)
```
