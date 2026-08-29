"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { ConfusionMatrixView } from "@/components/ConfusionMatrixView";
import { ThresholdSlider } from "@/components/ThresholdSlider";
import { calculateMerchantSessionMetrics } from "@/lib/storeSession";

export default function BenchmarkPage() {
  const [mounted, setMounted] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(0.55);
  const [rtoCost, setRtoCost] = useState<number>(180);
  const [ltvCost, setLtvCost] = useState<number>(650);

  const [metrics, setMetrics] = useState({
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
  });
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const calc = calculateMerchantSessionMetrics(rtoCost, ltvCost);
    setMetrics(calc);
    if (calc.totalEvaluated > 0) {
      setHasCalculated(true);
    }
  }, []);

  const executeBenchmark = () => {
    const calc = calculateMerchantSessionMetrics(rtoCost, ltvCost);
    setMetrics(calc);
    setHasCalculated(true);
  };

  const handleRtoCostChange = (val: number) => {
    setRtoCost(val);
    setMetrics(calculateMerchantSessionMetrics(val, ltvCost));
  };

  const handleLtvCostChange = (val: number) => {
    setLtvCost(val);
    setMetrics(calculateMerchantSessionMetrics(rtoCost, val));
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="h-64 bg-slate-200 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Store Risk Protection Performance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Calculates performance metrics dynamically based on the actual orders scanned by your store.
          </p>
        </div>

        <button
          onClick={executeBenchmark}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-white" />
          <span>Calculate Store Performance Metrics</span>
        </button>
      </div>

      {/* Strictness & Cost Controls */}
      <ThresholdSlider
        threshold={threshold}
        onChange={(val) => setThreshold(val)}
        netSaved={metrics.netSaved}
        rtoCost={rtoCost}
        ltvCost={ltvCost}
        onRtoCostChange={handleRtoCostChange}
        onLtvCostChange={handleLtvCostChange}
      />

      {/* Confusion Matrix & Financial Breakdown */}
      {hasCalculated && metrics.totalEvaluated > 0 ? (
        <>
          <ConfusionMatrixView
            matrix={{
              true_positives: metrics.tp,
              false_positives: metrics.fp,
              true_negatives: metrics.tn,
              false_negatives: metrics.fn,
            }}
            financial={{
              gross_fraud_prevented_inr: metrics.grossFraudSaved,
              false_positive_churn_cost_inr: metrics.fpChurnCost,
              net_margin_saved_inr: metrics.netSaved,
            }}
            precision={metrics.precision}
            recall={metrics.recall}
            fpr={metrics.falsePositiveRate}
            totalRecords={metrics.totalEvaluated}
          />

          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Store Risk Protection Metrics calculated across {metrics.totalEvaluated} scanned store orders</span>
            </div>
            <span className="font-mono text-slate-400">SentinelPay Merchant Session</span>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700">0 store orders scanned in this session.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Go to "Check New Orders" to check customer shipping details or "Return Fraud Helper" to scan return packages. Your live store metrics will be calculated dynamically here!
          </p>
        </div>
      )}
    </div>
  );
}
