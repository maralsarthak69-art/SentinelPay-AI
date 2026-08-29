"use client";

import React, { useState, useEffect } from "react";
import { Send, ShieldAlert, ShieldCheck, RefreshCw, CheckCircle2, QrCode, AlertCircle, Phone, Smartphone, MessageSquare, Copy, Check, Truck } from "lucide-react";
import { predictOrderRisk, dispatchCarrierWebhook } from "@/lib/api";
import { OrderRiskRequest, OrderRiskResponse } from "@/types";
import { ShapWaterfall } from "@/components/ShapWaterfall";
import { formatCurrencyINR } from "@/lib/utils";
import { saveScannedOrder } from "@/lib/storeSession";

export default function LiveStreamPage() {
  const [mounted, setMounted] = useState<boolean>(false);

  const [form, setForm] = useState<OrderRiskRequest>({
    order_id: "",
    cart_value: 0,
    payment_mode: "COD",
    shipping_address: "",
    pincode: "",
    phone_number: "",
    device_order_count_last_24h: 1,
    address_mismatch_flag: false,
    category_risk_weight: 0.35,
  });

  const [result, setResult] = useState<OrderRiskResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ₹50 UPI Advance Modal State
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [upiPaid, setUpiPaid] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // 3PL Webhook Dispatcher State
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [dispatchingWebhook, setDispatchingWebhook] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shipping_address || !form.pincode || form.cart_value <= 0) {
      alert("Please enter customer shipping address, pincode, and order amount.");
      return;
    }
    setLoading(true);
    setUpiPaid(false);
    setLinkCopied(false);
    setWebhookStatus(null);

    const generatedId = form.order_id.trim() || `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const payload = { ...form, order_id: generatedId };

    const res = await predictOrderRisk(payload);
    setResult(res);
    setLoading(false);

    // Save checked order into merchant session
    saveScannedOrder({
      order_id: res.order_id,
      cart_value: form.cart_value,
      payment_mode: form.payment_mode,
      shipping_address: form.shipping_address,
      pincode: form.pincode,
      rto_probability: res.rto_probability,
      decision: res.decision,
      action_required: res.action_required,
      advance_amount: res.advance_amount,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Auto trigger ₹50 Commitment Advance popup if order has risk (DYNAMIC_INTERVENTION or BLOCK_COD)
    if (res.decision === "DYNAMIC_INTERVENTION" || res.decision === "BLOCK_COD") {
      setShowUpiModal(true);
    }
  };

  const handleConfirmUpiPayment = () => {
    setUpiPaid(true);
    if (result) {
      const updatedRes: OrderRiskResponse = {
        ...result,
        decision: "PASS",
        action_required: "FULFILL_COD",
        rto_probability: Math.max(0.05, result.rto_probability - 0.40),
      };
      setResult(updatedRes);

      saveScannedOrder({
        order_id: updatedRes.order_id,
        cart_value: form.cart_value,
        payment_mode: form.payment_mode,
        shipping_address: form.shipping_address,
        pincode: form.pincode,
        rto_probability: updatedRes.rto_probability,
        decision: "PASS",
        action_required: "FULFILL_COD",
        advance_amount: 50,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  const handleCopyPaymentLink = () => {
    navigator.clipboard.writeText(`https://rzp.io/l/sentinel-50-advance?order=${result?.order_id || "ORD"}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleTriggerCarrierWebhook = async () => {
    if (!result) return;
    setDispatchingWebhook(true);
    const whRes = await dispatchCarrierWebhook({
      order_id: result.order_id,
      decision: result.decision,
      cart_value: form.cart_value,
      pincode: form.pincode,
      action: result.action_required,
    });
    setWebhookStatus(`✓ 3PL Webhooks Dispatched: Shiprocket (${whRes.shiprocket.status}) & Delhivery (${whRes.delhivery.status})`);
    setDispatchingWebhook(false);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="h-96 bg-slate-200 rounded-2xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Order Risk Checker
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Check any customer order before shipping to prevent failed COD returns.
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Scoring Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Enter Customer Order Details</h2>

          <form onSubmit={handleEvaluate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Order ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. ORD-84920"
                  value={form.order_id}
                  onChange={(e) => setForm({ ...form, order_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none font-mono transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Cart Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2499"
                  value={form.cart_value === 0 ? "" : form.cart_value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, cart_value: val === "" ? 0 : parseFloat(val) });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Payment Method</label>
                <select
                  value={form.payment_mode}
                  onChange={(e) => setForm({ ...form, payment_mode: e.target.value as "COD" | "PREPAID" })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="PREPAID">Prepaid Online Payment</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Delivery PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 411041"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none font-mono transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Customer Shipping Address</label>
              <textarea
                rows={2}
                placeholder="House/Flat No, Landmark, Street Address, City"
                value={form.shipping_address}
                onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">24h Customer Orders</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="e.g. 1"
                  value={form.device_order_count_last_24h === 0 ? "" : form.device_order_count_last_24h}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, device_order_count_last_24h: val === "" ? 0 : parseInt(val) });
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Product Category</label>
                <select
                  value={form.category_risk_weight}
                  onChange={(e) => setForm({ ...form, category_risk_weight: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                >
                  <option value={0.15}>Grocery / FMCG (Lowest Risk)</option>
                  <option value={0.35}>Apparel &amp; Fashion (Normal Risk)</option>
                  <option value={0.65}>Footwear &amp; Accessories (Medium Risk)</option>
                  <option value={0.85}>Electronics &amp; Gadgets (High Risk)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="mismatch"
                checked={form.address_mismatch_flag}
                onChange={(e) => setForm({ ...form, address_mismatch_flag: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-600"
              />
              <label htmlFor="mismatch" className="text-xs text-slate-700 font-medium">
                Flag IP Geolocation vs. Delivery Address Mismatch
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Checking Order Safety..." : "Check Order Safety Now"}</span>
            </button>
          </form>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <>
              {/* Verdict Card */}
              <div
                className={`bg-white border-2 rounded-2xl p-6 shadow-sm ${
                  result.decision === "PASS"
                    ? "border-emerald-500"
                    : result.decision === "DYNAMIC_INTERVENTION"
                    ? "border-amber-500"
                    : "border-rose-500"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-500">Order Safety Verdict</span>
                    <div className="text-3xl font-extrabold text-slate-900 mt-1">
                      {result.decision === "PASS" && "Safe to Dispatch"}
                      {result.decision === "DYNAMIC_INTERVENTION" && "Ask ₹50 Commitment Advance"}
                      {result.decision === "BLOCK_COD" && "Require Digital Prepayment"}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                      result.decision === "PASS"
                        ? "bg-emerald-100 text-emerald-800"
                        : result.decision === "DYNAMIC_INTERVENTION"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    Risk Score: {(result.rto_probability * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-bold uppercase">Recommended Action</span>
                  <div className="text-sm font-bold text-slate-800 mt-1">
                    {result.action_required === "FULFILL_COD" && "✓ Dispatch immediately via standard COD courier."}
                    {result.action_required === "PROMPT_UPI_ADVANCE" && "⚡ Send ₹50 UPI confirmation prompt to customer before shipping."}
                    {result.action_required === "ENFORCE_PREPAYMENT" && "⛔ Do not ship on COD. Request 100% online prepayment."}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                  {(result.decision === "DYNAMIC_INTERVENTION" || result.decision === "BLOCK_COD") && (
                    <button
                      onClick={() => setShowUpiModal(true)}
                      className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Open ₹50 UPI Modal</span>
                    </button>
                  )}

                  <button
                    onClick={handleTriggerCarrierWebhook}
                    disabled={dispatchingWebhook}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow shrink-0"
                  >
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>{dispatchingWebhook ? "Dispatching 3PL..." : "Sync 3PL Webhooks (Delhivery & Shiprocket)"}</span>
                  </button>
                </div>

                {webhookStatus && (
                  <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                    {webhookStatus}
                  </div>
                )}
              </div>

              {/* Friendly Explanation */}
              <ShapWaterfall explanations={result.explanation} orderId={result.order_id} />
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No order checked yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Enter customer shipping details on the left and click "Check Order Safety Now".
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Customer ₹50 UPI Commitment Advance Payment Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setShowUpiModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">₹50 Refundable Commitment Advance</h3>
              <p className="text-xs text-slate-500 mt-1">
                Risk detected for Order <span className="font-mono font-bold text-slate-800">{result?.order_id || form.order_id}</span>. Prompt customer for ₹50 advance to confirm buyer intent.
              </p>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 my-4 text-center">
              <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">Commitment Advance Required</span>
              <div className="text-3xl font-extrabold text-amber-700 mt-1">₹50.00</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Deducted from final COD amount (Remaining payable on delivery: {formatCurrencyINR(Math.max(0, form.cart_value - 50))})
              </p>
            </div>

            {!upiPaid ? (
              <div className="space-y-2.5">
                <button
                  onClick={handleConfirmUpiPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Simulate Pay ₹50 via Razorpay UPI</span>
                </button>

                <button
                  onClick={handleCopyPaymentLink}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-sky-600" />}
                  <span>{linkCopied ? "Razorpay Payment Link Copied!" : "Send ₹50 UPI Payment Link via SMS / WhatsApp"}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>₹50 Commitment Advance Paid!</span>
                </div>
                <p className="text-xs text-slate-600">
                  Order converted from Risky COD to Confirmed Dispatch. Remaining COD on delivery: <b>{formatCurrencyINR(Math.max(0, form.cart_value - 50))}</b>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
