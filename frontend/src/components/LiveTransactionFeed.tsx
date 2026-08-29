"use client";

import React from "react";
import { Activity, ShieldAlert, ShieldCheck, RefreshCw } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

export interface LiveOrderFeedItem {
  order_id: string;
  cart_value: number;
  payment_mode: string;
  city: string;
  pincode: string;
  rto_probability: number;
  decision: "PASS" | "DYNAMIC_INTERVENTION" | "BLOCK_COD";
  action_required: string;
  timestamp: string;
}

interface LiveTransactionFeedProps {
  orders: LiveOrderFeedItem[];
  onSelectOrder?: (order: LiveOrderFeedItem) => void;
}

export const LiveTransactionFeed: React.FC<LiveTransactionFeedProps> = ({
  orders,
  onSelectOrder,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
          <h3 className="text-base font-bold text-slate-900">Recent Store Orders &amp; Safety Checks</h3>
        </div>
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Live Feed
        </span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {orders.map((item, idx) => {
          const isPass = item.decision === "PASS";
          const isIntervene = item.decision === "DYNAMIC_INTERVENTION";

          return (
            <div
              key={idx}
              onClick={() => onSelectOrder?.(item)}
              className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isPass
                      ? "bg-emerald-100 text-emerald-700"
                      : isIntervene
                      ? "bg-amber-100 text-amber-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {isPass ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : isIntervene ? (
                    <RefreshCw className="w-5 h-5" />
                  ) : (
                    <ShieldAlert className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">{item.order_id}</span>
                    <span className="text-[11px] text-slate-500">({item.city} - {item.pincode})</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2 font-medium">
                    <span>{formatCurrencyINR(item.cart_value)}</span>
                    <span>&bull;</span>
                    <span>{item.payment_mode}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-700">
                  Risk: {(item.rto_probability * 100).toFixed(0)}%
                </div>
                <span
                  className={`inline-block mt-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    isPass
                      ? "bg-emerald-100 text-emerald-800"
                      : isIntervene
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {isPass ? "Safe to Ship" : isIntervene ? "Ask ₹50 Advance" : "Require Prepayment"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
