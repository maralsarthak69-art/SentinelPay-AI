"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

interface SavingsTrendChartProps {
  scannedOrders: Array<{
    order_id: string;
    cart_value: number;
    decision: string;
    timestamp: string;
  }>;
}

export const SavingsTrendChart: React.FC<SavingsTrendChartProps> = ({ scannedOrders }) => {
  const hasOrders = scannedOrders.length > 0;

  // Generate chart data points from scanned orders or sample timeline
  const chartData = hasOrders
    ? scannedOrders.map((ord, idx) => ({
        name: `Order ${idx + 1}`,
        orderAmount: ord.cart_value,
        moneySaved: ord.decision === "BLOCK_COD" ? ord.cart_value : ord.decision === "DYNAMIC_INTERVENTION" ? 180 : 0,
      }))
    : [
        { name: "Week 1", orderAmount: 15000, moneySaved: 2800 },
        { name: "Week 2", orderAmount: 32000, moneySaved: 6400 },
        { name: "Week 3", orderAmount: 48000, moneySaved: 11200 },
        { name: "Week 4", orderAmount: 75000, moneySaved: 18500 },
        { name: "Week 5", orderAmount: 110000, moneySaved: 27400 },
      ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Store Revenue Protection Trend</h3>
            <p className="text-xs text-slate-500">Total Order Volume vs. Money Saved from COD Returns</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(val) => `₹${val}`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", fontWeight: "bold" }}
              formatter={(value: any) => [formatCurrencyINR(value), "Amount"]}
            />
            <Area type="monotone" dataKey="moneySaved" name="Money Saved" stroke="#0284C7" fillOpacity={1} fill="url(#colorSaved)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="orderAmount" name="Order Amount" stroke="#10B981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
