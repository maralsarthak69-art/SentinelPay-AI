"use client";

import React, { useState } from "react";
import { Calculator, TrendingUp, ShieldCheck, DollarSign } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

export const RoiCalculatorWidget: React.FC = () => {
  const [monthlyOrders, setMonthlyOrders] = useState<number>(3500);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(2200);

  // Financial calculations
  const estimatedCodOrders = Math.round(monthlyOrders * 0.65); // 65% COD ratio in India
  const estimatedRtoOrders = Math.round(estimatedCodOrders * 0.24); // 24% baseline COD RTO rate
  const preventedRtoOrders = Math.round(estimatedRtoOrders * 0.88); // 88% SentinelPay prevention efficiency
  const grossFreightSaved = preventedRtoOrders * 180; // ₹180 lost freight per return
  const estimatedProfitMarginSaved = Math.round(preventedRtoOrders * avgOrderValue * 0.22); // 22% gross margin saved from non-delivered inventory
  const totalNetMarginSaved = grossFreightSaved + estimatedProfitMarginSaved;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Interactive Store Profit Calculator</h3>
          <p className="text-xs text-slate-500">Calculate how much money SentinelPay will save your store every month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Monthly Store Orders</label>
              <span className="text-xs font-extrabold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                {monthlyOrders.toLocaleString()} Orders / Month
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700">Average Order Value (₹)</label>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {formatCurrencyINR(avgOrderValue)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="250"
              value={avgOrderValue}
              onChange={(e) => setAvgOrderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Calculation Output Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 block">
              Projected Monthly Money Saved
            </span>
            <div className="text-3xl font-extrabold tracking-tight mt-1">
              {formatCurrencyINR(totalNetMarginSaved)}
            </div>
            <span className="text-xs text-emerald-100 block mt-1 font-medium">
              &bull; Freight Saved: <b>{formatCurrencyINR(grossFreightSaved)}</b><br />
              &bull; Inventory Margin Protected: <b>{formatCurrencyINR(estimatedProfitMarginSaved)}</b>
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-400/40 flex items-center justify-between text-xs text-emerald-100 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>{preventedRtoOrders} Fake COD Returns Blocked</span>
            </span>
            <span className="text-[11px] bg-emerald-800/60 px-2 py-0.5 rounded font-mono">
              +{( (totalNetMarginSaved / (monthlyOrders * avgOrderValue)) * 100 ).toFixed(1)}% Profit Lift
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
