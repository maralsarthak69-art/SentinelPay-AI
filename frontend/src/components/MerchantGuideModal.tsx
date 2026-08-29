"use client";

import React, { useState } from "react";
import { HelpCircle, CheckCircle2, ShieldCheck, QrCode, FileText, ArrowRight, X } from "lucide-react";

export const MerchantGuideModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all border border-slate-200"
      >
        <HelpCircle className="w-4 h-4 text-sky-600" />
        <span>How it Works (Guide)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold">
                📖
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">How SentinelPay Protects Your Store</h2>
                <p className="text-xs text-slate-500">Simple 3-step guide for e-commerce sellers &amp; shop owners</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              {/* Step 1 */}
              <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Check COD Orders Before Shipping
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Before packing a Cash on Delivery (COD) order, enter the customer's address and pincode. SentinelPay instantly checks if the pincode has high return rates or if the customer placed multiple orders rapidly.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Ask for a ₹50 Advance to Confirm Order
                    <QrCode className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If an order looks risky, don't reject it immediately! The system automatically asks the customer to pay a small ₹50 UPI advance. Genuine buyers pay gladly (it's deducted from their total price), while fake orders are filtered out automatically!
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-3">
                <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    Win Fraudulent Return Claims
                    <FileText className="w-4 h-4 text-amber-600" />
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If a customer claims they got an empty box or wrong item, use our Return Fraud Helper. Upload the package picture—our AI checks parcel weight and box seals against your warehouse records, and creates a 1-page official PDF dispute report for Razorpay or your bank.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <span>Got it! Start Protecting Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
