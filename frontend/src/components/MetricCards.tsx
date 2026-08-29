"use client";

import React from "react";
import { ShieldCheck, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { formatCurrencyINR, formatPercent } from "@/lib/utils";

interface MetricCardsProps {
  netMarginSaved: number;
  falsePositiveRate: number;
  precision: number;
  recall: number;
  totalEvaluated: number;
  latencyMs?: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  netMarginSaved = 0,
  falsePositiveRate = 0,
  precision = 0,
  recall = 0,
  totalEvaluated = 0,
  latencyMs = 0,
}) => {
  const hasEvaluated = totalEvaluated > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Money Saved */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Money Saved for Your Store</span>
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasEvaluated ? formatCurrencyINR(netMarginSaved) : "₹0"}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
            {hasEvaluated ? (
              <span className="text-emerald-600 font-semibold">↑ Saved from Fake &amp; Failed COD Returns</span>
            ) : (
              <span>No orders checked yet</span>
            )}
          </p>
        </div>
      </div>

      {/* Card 2: Genuine Customer Safety Rate */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Genuine Customer Safety</span>
          <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasEvaluated ? formatPercent(1.0 - falsePositiveRate) : "0%"}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            {hasEvaluated ? (
              <span className="text-sky-600 font-semibold">✓ Genuine buyers checkout without friction</span>
            ) : (
              <span>Awaiting order checks</span>
            )}
          </p>
        </div>
      </div>

      {/* Card 3: Order Accuracy */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk Check Accuracy</span>
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasEvaluated ? formatPercent(precision) : "0%"}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            {hasEvaluated ? (
              <span className="text-indigo-600 font-semibold">Verified across {totalEvaluated.toLocaleString()} orders</span>
            ) : (
              <span>0 store orders evaluated</span>
            )}
          </p>
        </div>
      </div>

      {/* Card 4: Instant Checking Speed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Instant Check Speed</span>
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {hasEvaluated ? latencyMs.toFixed(0) : "0"} <span className="text-sm font-normal text-slate-500">ms</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1.5">
            {hasEvaluated ? (
              <span className="text-amber-600 font-semibold">⚡ Works instantly at checkout</span>
            ) : (
              <span>Ready for live orders</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
