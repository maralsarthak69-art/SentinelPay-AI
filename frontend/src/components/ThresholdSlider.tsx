"use client";

import React from "react";
import { Sliders, HelpCircle } from "lucide-react";
import { formatCurrencyINR } from "@/lib/utils";

interface ThresholdSliderProps {
  threshold: number;
  onChange: (val: number) => void;
  netSaved: number;
  rtoCost: number;
  ltvCost: number;
  onRtoCostChange: (val: number) => void;
  onLtvCostChange: (val: number) => void;
}

export const ThresholdSlider: React.FC<ThresholdSliderProps> = ({
  threshold,
  onChange,
  netSaved,
  rtoCost,
  ltvCost,
  onRtoCostChange,
  onLtvCostChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Store Risk Protection Level</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Adjust how strictly you want to check Cash on Delivery (COD) orders to maximize your store profits.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
          <span className="text-[11px] text-emerald-800 uppercase font-bold tracking-wider">Estimated Money Saved</span>
          <div className="text-xl font-extrabold text-emerald-700">
            {formatCurrencyINR(netSaved)}
          </div>
        </div>
      </div>

      {/* Main Protection Level Slider */}
      <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Protection Strictness</span>
            <span className="bg-sky-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
              {threshold < 0.35 ? "Strict Protection" : threshold > 0.70 ? "Relaxed Protection" : "Recommended Balance"}
            </span>
          </label>
          <span className="text-xs font-bold text-sky-700">
            Level {(threshold * 100).toFixed(0)}%
          </span>
        </div>

        <input
          type="range"
          min="0.10"
          max="0.90"
          step="0.01"
          value={threshold}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
        />

        <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
          <span>High Strictness (Block More Fake COD)</span>
          <span className="text-sky-700 font-bold">Optimal Balance (Recommended)</span>
          <span>Low Strictness (Allow More COD)</span>
        </div>
      </div>

      {/* Store Cost Inputs - Neatly Editable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <span>Shipping Cost Lost Per Failed Return (₹)</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
            <input
              type="number"
              placeholder="e.g. 180"
              value={rtoCost === 0 ? "" : rtoCost}
              onChange={(e) => {
                const val = e.target.value;
                onRtoCostChange(val === "" ? 0 : parseFloat(val));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <span>Average Value of a Repeat Customer (₹)</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
            <input
              type="number"
              placeholder="e.g. 650"
              value={ltvCost === 0 ? "" : ltvCost}
              onChange={(e) => {
                const val = e.target.value;
                onLtvCostChange(val === "" ? 0 : parseFloat(val));
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
