export interface ScannedOrderRecord {
  order_id: string;
  cart_value: number;
  payment_mode: string;
  shipping_address: string;
  pincode: string;
  rto_probability: number;
  decision: "PASS" | "DYNAMIC_INTERVENTION" | "BLOCK_COD";
  action_required: string;
  advance_amount: number;
  timestamp: string;
}

export interface ScannedReturnRecord {
  order_id: string;
  customer_name: string;
  claimed_reason: string;
  verdict: string;
  confidence_score: number;
  anomalies: string[];
  timestamp: string;
}

const ORDERS_KEY = "sentinelpay_scanned_orders";
const RETURNS_KEY = "sentinelpay_scanned_returns";

export function getScannedOrders(): ScannedOrderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveScannedOrder(record: ScannedOrderRecord) {
  if (typeof window === "undefined") return;
  const current = getScannedOrders();
  const updated = [record, ...current.filter((o) => o.order_id !== record.order_id)];
  localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  
  // Notify all components in real time
  window.dispatchEvent(new Event("sentinelpay-store-updated"));
}

export function getScannedReturns(): ScannedReturnRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RETURNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveScannedReturn(record: ScannedReturnRecord) {
  if (typeof window === "undefined") return;
  const current = getScannedReturns();
  const updated = [record, ...current.filter((r) => r.order_id !== record.order_id)];
  localStorage.setItem(RETURNS_KEY, JSON.stringify(updated));
  
  window.dispatchEvent(new Event("sentinelpay-store-updated"));
}

export function clearStoreSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ORDERS_KEY);
  localStorage.removeItem(RETURNS_KEY);
  window.dispatchEvent(new Event("sentinelpay-store-updated"));
}

export function calculateMerchantSessionMetrics(rtoCost = 180, ltvCost = 650) {
  const orders = getScannedOrders();
  const returns = getScannedReturns();

  if (orders.length === 0 && returns.length === 0) {
    return {
      totalEvaluated: 0,
      netSaved: 0,
      falsePositiveRate: 0,
      precision: 0,
      recall: 0,
      tp: 0,
      fp: 0,
      tn: 0,
      fn: 0,
      grossFraudSaved: 0,
      fpChurnCost: 0,
      passCount: 0,
      interveneCount: 0,
      blockCount: 0,
    };
  }

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let passCount = 0;
  let interveneCount = 0;
  let blockCount = 0;
  let grossFraudSaved = 0;

  orders.forEach((ord) => {
    if (ord.decision === "BLOCK_COD") {
      tp += 1;
      blockCount += 1;
      grossFraudSaved += ord.cart_value > 0 ? ord.cart_value : rtoCost;
    } else if (ord.decision === "DYNAMIC_INTERVENTION") {
      tp += 1;
      interveneCount += 1;
      grossFraudSaved += rtoCost;
    } else {
      tn += 1;
      passCount += 1;
    }
  });

  returns.forEach((ret) => {
    if (ret.verdict === "SUSPECTED_FRAUD") {
      tp += 1;
      blockCount += 1;
      grossFraudSaved += rtoCost * 2;
    } else {
      tn += 1;
      passCount += 1;
    }
  });

  const totalEvaluated = orders.length + returns.length;
  const fpChurnCost = fp * ltvCost;
  const netSaved = Math.max(0, grossFraudSaved - fpChurnCost);
  const precision = totalEvaluated > 0 ? (tp + tn > 0 ? (tp + tn) / totalEvaluated : 1.0) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 1.0;
  const fpr = totalEvaluated > 0 ? fp / totalEvaluated : 0;

  return {
    totalEvaluated,
    netSaved,
    falsePositiveRate: fpr,
    precision,
    recall,
    tp,
    fp,
    tn,
    fn,
    grossFraudSaved,
    fpChurnCost,
    passCount,
    interveneCount,
    blockCount,
  };
}
