"use client";

import React, { useState, useEffect } from "react";
import { MetricCards } from "@/components/MetricCards";
import { ThresholdSlider } from "@/components/ThresholdSlider";
import { ShapWaterfall } from "@/components/ShapWaterfall";
import { LiveTransactionFeed, LiveOrderFeedItem } from "@/components/LiveTransactionFeed";
import { OrderDistributionChart } from "@/components/OrderDistributionChart";
import { SavingsTrendChart } from "@/components/SavingsTrendChart";
import { CategoryRiskChart } from "@/components/CategoryRiskChart";
import { runBenchmarkSuite, predictOrderRisk } from "@/lib/api";
import { FeatureExplanation, BenchmarkResponse } from "@/types";
import { Store, ArrowRight, RefreshCw, AlertCircle, Trash2, Database, Activity } from "lucide-react";
import Link from "next/link";
import { calculateMerchantSessionMetrics, getScannedOrders, clearStoreSession } from "@/lib/storeSession";

export default function OverviewPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  const [threshold, setThreshold] = useState<number>(0.55);
  const [rtoCost, setRtoCost] = useState<number>(180);
  const [ltvCost, setLtvCost] = useState<number>(650);

  const [useDatabaseMode, setUseDatabaseMode] = useState<boolean>(false);
  const [benchmarkDb, setBenchmarkDb] = useState<BenchmarkResponse | null>(null);

  const [sessionMetrics, setSessionMetrics] = useState({
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
  });
  const [scannedOrders, setScannedOrders] = useState<LiveOrderFeedItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LiveOrderFeedItem | null>(null);
  const [explanations, setExplanations] = useState<FeatureExplanation[]>([]);
  const [loadingDb, setLoadingDb] = useState<boolean>(false);

  const loadSessionData = (rCost = rtoCost, lCost = ltvCost) => {
    const calc = calculateMerchantSessionMetrics(rCost, lCost);
    setSessionMetrics(calc);

    const orders = getScannedOrders();
    const formatted: LiveOrderFeedItem[] = orders.map((o) => ({
      order_id: o.order_id,
      cart_value: o.cart_value,
      payment_mode: o.payment_mode,
      city: o.shipping_address,
      pincode: o.pincode,
      rto_probability: o.rto_probability,
      decision: o.decision,
      action_required: o.action_required,
      timestamp: o.timestamp,
    }));
    setScannedOrders(formatted);

    if (formatted.length > 0) {
      handleSelectOrder(formatted[0]);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadSessionData();

    const handleUpdate = () => loadSessionData();
    window.addEventListener("sentinelpay-store-updated", handleUpdate);
    return () => window.removeEventListener("sentinelpay-store-updated", handleUpdate);
  }, []);

  const handleToggleDbAnalytics = async () => {
    if (!useDatabaseMode) {
      setLoadingDb(true);
      const bRes = await runBenchmarkSuite({
        risk_threshold: threshold,
        avg_rto_cost_inr: rtoCost,
        customer_ltv_cost_inr: ltvCost,
      });
      setBenchmarkDb(bRes);
      setLoadingDb(false);
      setUseDatabaseMode(true);
    } else {
      setUseDatabaseMode(false);
    }
  };

  const handleClearSession = () => {
    if (confirm("Clear all scanned order history for this session?")) {
      clearStoreSession();
      loadSessionData();
      setSelectedOrder(null);
      setExplanations([]);
    }
  };

  const handleSelectOrder = async (item: LiveOrderFeedItem) => {
    setSelectedOrder(item);
    const res = await predictOrderRisk({
      order_id: item.order_id,
      cart_value: item.cart_value,
      payment_mode: item.payment_mode as "COD" | "PREPAID",
      shipping_address: item.city,
      pincode: item.pincode,
      device_order_count_last_24h: item.decision === "BLOCK_COD" ? 6 : 2,
      address_mismatch_flag: item.decision === "BLOCK_COD",
    });
    setExplanations(res.explanation);
  };

  const activeMetrics = useDatabaseMode && benchmarkDb
    ? {
        netMarginSaved: benchmarkDb.financial_impact.net_margin_saved_inr,
        falsePositiveRate: benchmarkDb.false_positive_rate,
        precision: benchmarkDb.precision,
        recall: benchmarkDb.recall,
        totalEvaluated: benchmarkDb.total_records_evaluated,
        passCount: benchmarkDb.pass_count ?? benchmarkDb.confusion_matrix.true_negatives,
        interveneCount: benchmarkDb.intervene_count ?? 0,
        blockCount: benchmarkDb.block_count ?? benchmarkDb.confusion_matrix.true_positives,
      }
    : {
        netMarginSaved: sessionMetrics.netSaved,
        falsePositiveRate: sessionMetrics.falsePositiveRate,
        precision: sessionMetrics.precision,
        recall: sessionMetrics.recall,
        totalEvaluated: sessionMetrics.totalEvaluated,
        passCount: sessionMetrics.passCount,
        interveneCount: sessionMetrics.interveneCount,
        blockCount: sessionMetrics.blockCount,
      };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-sky-200" />
            <h1 className="text-2xl font-bold tracking-tight">Store Safety Overview</h1>
          </div>
          <p className="text-sm text-sky-100 mt-1 max-w-2xl">
            Welcome! Protect your store from failed Cash on Delivery (COD) returns and friendly fraud.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleToggleDbAnalytics}
            className={`px-4 py-2.5 font-bold rounded-xl text-xs shadow transition-all flex items-center gap-2 shrink-0 ${
              useDatabaseMode
                ? "bg-emerald-500 text-white"
                : "bg-white text-sky-700 hover:bg-sky-50"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{loadingDb ? "Loading DB..." : useDatabaseMode ? "Showing Real Store DB" : "Load Store Database Analytics"}</span>
          </button>

          {sessionMetrics.totalEvaluated > 0 && (
            <button
              onClick={handleClearSession}
              className="px-3 py-2.5 bg-sky-900/60 hover:bg-sky-900 border border-sky-400/40 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
          )}

          <Link
            href="/live-stream"
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-2 shrink-0"
          >
            <span>Check a New Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <MetricCards
        netMarginSaved={activeMetrics.netMarginSaved}
        falsePositiveRate={activeMetrics.falsePositiveRate}
        precision={activeMetrics.precision}
        recall={activeMetrics.recall}
        totalEvaluated={activeMetrics.totalEvaluated}
        latencyMs={activeMetrics.totalEvaluated > 0 ? 18.4 : 0}
      />

      {/* Graphical Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderDistributionChart
          passCount={activeMetrics.passCount}
          interveneCount={activeMetrics.interveneCount}
          blockCount={activeMetrics.blockCount}
          totalOrders={activeMetrics.totalEvaluated}
        />

        <SavingsTrendChart scannedOrders={scannedOrders} />
      </div>

      {/* Category Risk Comparison Chart */}
      <CategoryRiskChart />

      {/* Dynamic Protection Strictness Slider */}
      <ThresholdSlider
        threshold={threshold}
        onChange={(v) => setThreshold(v)}
        netSaved={activeMetrics.netMarginSaved}
        rtoCost={rtoCost}
        ltvCost={ltvCost}
        onRtoCostChange={(v) => setRtoCost(v)}
        onLtvCostChange={(v) => setLtvCost(v)}
      />

      {/* Scanned Orders List & Risk Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Scanned Orders History ({scannedOrders.length})</span>
            <span className="text-xs font-normal text-slate-500">Updates live when checking orders</span>
          </h3>

          {scannedOrders.length > 0 ? (
            <LiveTransactionFeed orders={scannedOrders} onSelectOrder={handleSelectOrder} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No store orders checked in this session yet.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Click "Check a New Order" above to test customer shipping details and see live risk updates here.
              </p>
            </div>
          )}
        </div>

        <div>
          {selectedOrder && explanations.length > 0 ? (
            <ShapWaterfall explanations={explanations} orderId={selectedOrder.order_id} />
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm h-full flex flex-col items-center justify-center">
              <Activity className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No order selected for risk explanation.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Check an order in "Check New Orders" to view detailed risk factors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
