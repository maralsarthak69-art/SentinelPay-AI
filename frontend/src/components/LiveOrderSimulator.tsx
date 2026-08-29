"use client";

import React, { useState, useEffect } from "react";
import { Play, Pause, Zap, ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";
import { saveScannedOrder } from "@/lib/storeSession";

const MOCK_ORDER_POOL = [
  { city: "Pune, MH", pincode: "411041", cart_value: 2499, item: "Nike Air Max Sneakers", risk: 0.12, decision: "PASS", action: "FULFILL_COD" },
  { city: "Chhapra, BR", pincode: "841301", cart_value: 12499, item: "Sony Wireless Headphones", risk: 0.88, decision: "BLOCK_COD", action: "ENFORCE_PREPAYMENT" },
  { city: "Bengaluru, KA", pincode: "560001", cart_value: 3999, item: "Fossil Men's Watch", risk: 0.48, decision: "DYNAMIC_INTERVENTION", action: "PROMPT_UPI_ADVANCE" },
  { city: "New Delhi, DL", pincode: "110001", cart_value: 1499, item: "Puma Sports T-Shirt", risk: 0.15, decision: "PASS", action: "FULFILL_COD" },
  { city: "Patna, BR", pincode: "800001", cart_value: 8999, item: "Ray-Ban Sunglasses", risk: 0.76, decision: "BLOCK_COD", action: "ENFORCE_PREPAYMENT" },
  { city: "Mumbai, MH", pincode: "400001", cart_value: 4999, item: "Levi's Denim Jacket", risk: 0.22, decision: "PASS", action: "FULFILL_COD" },
  { city: "Lucknow, UP", pincode: "226001", cart_value: 6499, item: "JBL Bluetooth Speaker", risk: 0.62, decision: "DYNAMIC_INTERVENTION", action: "PROMPT_UPI_ADVANCE" },
];

export const LiveOrderSimulator: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamedOrders, setStreamedOrders] = useState<any[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isStreaming) {
      interval = setInterval(() => {
        const randSample = MOCK_ORDER_POOL[Math.floor(Math.random() * MOCK_ORDER_POOL.length)];
        const newOrder = {
          order_id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
          cart_value: randSample.cart_value,
          payment_mode: "COD",
          shipping_address: randSample.city,
          pincode: randSample.pincode,
          item: randSample.item,
          rto_probability: randSample.risk,
          decision: randSample.decision,
          action_required: randSample.action,
          timestamp: new Date().toLocaleTimeString(),
        };

        setStreamedOrders((prev) => [newOrder, ...prev.slice(0, 4)]);

        // Save order into session state to update live dashboard metrics
        saveScannedOrder({
          order_id: newOrder.order_id,
          cart_value: newOrder.cart_value,
          payment_mode: "COD",
          shipping_address: newOrder.shipping_address,
          pincode: newOrder.pincode,
          rto_probability: newOrder.rto_probability,
          decision: newOrder.decision as any,
          action_required: newOrder.action_required,
          advance_amount: newOrder.decision === "DYNAMIC_INTERVENTION" ? 50 : 0,
          timestamp: newOrder.timestamp,
        });
      }, 2800);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${isStreaming ? "bg-emerald-500 animate-ping" : "bg-slate-500"}`} />
            <div className={`w-3 h-3 rounded-full absolute top-0 left-0 ${isStreaming ? "bg-emerald-500" : "bg-slate-500"}`} />
          </div>
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <span>Live Checkout Risk Stream</span>
              {isStreaming && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE SCORING
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Simulates real-time customer checkout orders streaming into your store</p>
          </div>
        </div>

        <button
          onClick={() => setIsStreaming(!isStreaming)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
            isStreaming
              ? "bg-rose-500 hover:bg-rose-600 text-white"
              : "bg-emerald-500 hover:bg-emerald-600 text-white"
          }`}
        >
          {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{isStreaming ? "Pause Live Stream" : "Start Live Order Stream"}</span>
        </button>
      </div>

      {/* Stream List */}
      <div className="space-y-2.5 min-h-[220px]">
        {streamedOrders.length > 0 ? (
          streamedOrders.map((ord, idx) => (
            <div
              key={ord.order_id + idx}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between transition-all animate-fadeIn"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    ord.decision === "PASS"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : ord.decision === "DYNAMIC_INTERVENTION"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {ord.decision === "PASS" ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : ord.decision === "DYNAMIC_INTERVENTION" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <ShieldAlert className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">{ord.order_id}</span>
                    <span className="text-xs text-slate-400 font-medium">&bull; {ord.item}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {ord.shipping_address} (PIN: {ord.pincode}) &bull; Value: <b>{formatCurrencyINR(ord.cart_value)}</b>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-md ${
                    ord.decision === "PASS"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : ord.decision === "DYNAMIC_INTERVENTION"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {(ord.rto_probability * 100).toFixed(0)}% Risk &bull; {ord.decision}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">{ord.timestamp}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Zap className="w-8 h-8 text-slate-700 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-300">Live order simulator is paused.</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
              Click <b className="text-emerald-400">"Start Live Order Stream"</b> above to watch real-time customer orders stream in with live risk scoring!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
