"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Layers } from "lucide-react";

export const CategoryRiskChart: React.FC = () => {
  const data = [
    { category: "Electronics", risk: 85, color: "#EF4444" },
    { category: "Fashion", risk: 65, color: "#F97316" },
    { category: "Footwear", risk: 50, color: "#F59E0B" },
    { category: "Books", risk: 35, color: "#3B82F6" },
    { category: "Grocery / FMCG", risk: 15, color: "#10B981" },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Product Category Risk Comparison</h3>
            <p className="text-xs text-slate-500">COD return risk weight across e-commerce product lines</p>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748B" }} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#334155", fontWeight: "bold" }} width={100} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", fontSize: "12px", fontWeight: "bold" }}
              formatter={(value: any) => [`${value}% Risk Weight`, "Risk Score"]}
            />
            <Bar dataKey="risk" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
