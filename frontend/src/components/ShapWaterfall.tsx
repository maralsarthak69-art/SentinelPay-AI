"use client";

import React from "react";
import { HelpCircle, AlertCircle, CheckCircle } from "lucide-react";
import { FeatureExplanation } from "@/types";

interface ShapWaterfallProps {
  explanations: FeatureExplanation[];
  orderId?: string;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  explanations,
  orderId = "ORD-98214",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Why was this score given to {orderId}?</h3>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Here are the key factors our system checked for this customer's address and order details:
      </p>

      <div className="space-y-3">
        {explanations.map((exp, idx) => {
          const isRiskInc = exp.type === "RISK_INCREASE";

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                isRiskInc
                  ? "bg-rose-50/70 border-rose-200 text-rose-900"
                  : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isRiskInc ? (
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">{exp.feature}</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      isRiskInc ? "bg-rose-200 text-rose-800" : "bg-emerald-200 text-emerald-800"
                    }`}
                  >
                    {isRiskInc ? "Increases Risk" : "Reduces Risk"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  {isRiskInc
                    ? "This detail suggests potential delivery or return difficulty."
                    : "This detail confirms customer credibility and valid address matching."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
