"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { BarChart2 } from "lucide-react";

interface OrderDistributionChartProps {
  passCount: number;
  interveneCount: number;
  blockCount: number;
  totalOrders: number;
}

export const OrderDistributionChart: React.FC<OrderDistributionChartProps> = ({
  passCount = 0,
  interveneCount = 0,
  blockCount = 0,
  totalOrders = 0,
}) => {
  const total = passCount + interveneCount + blockCount;

  const data = [
    { name: "Safe to Ship (Low Risk)", value: passCount, color: "#10B981" },
    { name: "Ask ₹50 Advance (Medium Risk)", value: interveneCount, color: "#F59E0B" },
    { name: "Require Prepayment (High Risk)", value: blockCount, color: "#EF4444" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Order Risk Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of checked store orders by risk decision</p>
          </div>
        </div>

        <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-700">
          {total > 0 ? `${total.toLocaleString()} Orders Scanned` : "0 Orders Scanned"}
        </span>
      </div>

      {total > 0 ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", fontWeight: "bold" }}
                formatter={(val: any) => [`${val.toLocaleString()} Orders`, "Count"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-bold text-slate-600">No chart data available</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Check orders in "Check New Orders" or click "Load Store Database Analytics" to view exact order breakdown.
          </p>
        </div>
      )}
    </div>
  );
};
