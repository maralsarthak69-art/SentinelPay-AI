"use client";

import React from "react";
import { Grid, DollarSign, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { ConfusionMatrixData, FinancialImpactData } from "@/types";
import { formatCurrencyINR } from "@/lib/utils";

interface ConfusionMatrixViewProps {
  matrix: ConfusionMatrixData;
  financial: FinancialImpactData;
  precision: number;
  recall: number;
  fpr: number;
  totalRecords: number;
}

export const ConfusionMatrixView: React.FC<ConfusionMatrixViewProps> = ({
  matrix,
  financial,
  precision,
  recall,
  fpr,
  totalRecords,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Grid className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Store Order Classification Summary ({totalRecords.toLocaleString()} Orders Tested)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real performance breakdown from your store database.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg">
            Accuracy: {(precision * 100).toFixed(1)}%
          </span>
          <span className="bg-sky-50 border border-sky-200 text-sky-800 px-3 py-1.5 rounded-lg">
            Risk Catch Rate: {(recall * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* 2x2 Grid with plain merchant labels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* True Positives */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 text-center">
          <span className="text-xs text-emerald-800 uppercase font-extrabold tracking-wider">High Risk Orders Caught</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {matrix.true_positives.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Fake/Risky COD Orders Successfully Intervened</p>
        </div>

        {/* False Positives */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 text-center">
          <span className="text-xs text-amber-800 uppercase font-extrabold tracking-wider">Genuine Buyers Prompted Advance</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {matrix.false_positives.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Genuine Buyers Prompted ₹50 Advance (Confirmed Intent)</p>
        </div>

        {/* False Negatives */}
        <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 text-center">
          <span className="text-xs text-rose-800 uppercase font-extrabold tracking-wider">Uncaught Failed Deliveries</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {matrix.false_negatives.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Uncaught COD Shipments that Returned to Origin</p>
        </div>

        {/* True Negatives */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-700 uppercase font-extrabold tracking-wider">Genuine Buyers Shipped Instantly</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">
            {matrix.true_negatives.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">Clean COD Orders Dispatched Without Interruption</p>
        </div>
      </div>

      {/* Financial Breakdown Summary */}
      <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div>
          <span className="text-xs text-slate-500 font-bold">Gross Fraud Saved</span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">
            {formatCurrencyINR(financial.gross_fraud_prevented_inr)}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-bold">Estimated Customer Friction</span>
          <div className="text-lg font-bold text-amber-700 mt-0.5">
            {formatCurrencyINR(financial.false_positive_churn_cost_inr)}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 font-bold">Net Saved Money</span>
          <div className="text-lg font-extrabold text-sky-700 mt-0.5">
            {formatCurrencyINR(financial.net_margin_saved_inr)}
          </div>
        </div>
      </div>
    </div>
  );
};
