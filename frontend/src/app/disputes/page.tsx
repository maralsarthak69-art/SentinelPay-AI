"use client";

import React, { useState } from "react";
import { PackageCheck, Download, AlertOctagon, CheckCircle2, ShieldAlert, FileText, Upload, AlertCircle, FileCheck } from "lucide-react";
import { verifyReturnEvidence, downloadDisputeDossierPDF } from "@/lib/api";
import { VerifyReturnRequest, VerifyReturnResponse } from "@/types";

export default function DisputesPage() {
  const [req, setReq] = useState<VerifyReturnRequest>({
    order_id: "",
    customer_name: "",
    return_reason_claimed: "Empty Box / Missing Item Claimed",
    claimed_item: "",
  });

  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [auditResult, setAuditResult] = useState<VerifyReturnResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
    }
  };

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!req.order_id && !req.customer_name) {
      alert("Please enter Order ID or Customer Name.");
      return;
    }
    setLoading(true);
    
    const payload: VerifyReturnRequest = {
      order_id: req.order_id.trim() || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_name: req.customer_name.trim() || "Customer Claim",
      return_reason_claimed: req.return_reason_claimed,
      claimed_item: req.claimed_item.trim() || "Returned Package Item",
      mock_case_type: req.return_reason_claimed.includes("Empty") ? "EMPTY_BOX" : "WRONG_ITEM"
    };

    const res = await verifyReturnEvidence(payload);
    setAuditResult(res);
    setLoading(false);
  };

  const handleDownloadDossier = async () => {
    if (!auditResult) return;
    setGeneratingPdf(true);
    await downloadDisputeDossierPDF({
      order_id: req.order_id || auditResult.order_id,
      customer_name: req.customer_name || "Customer Claim",
      claimed_reason: req.return_reason_claimed,
      merchant_name: "Store Seller Protection",
      verdict: auditResult.verdict,
      confidence_score: auditResult.fraud_confidence_score,
      anomalies: auditResult.detected_anomalies,
    });
    setGeneratingPdf(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Return Package Scanner &amp; Dispute Helper
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan returned packages to detect empty boxes or item swaps, and generate official 1-page PDF dispute reports for Razorpay or bank chargeback defense.
          </p>
        </div>
      </div>

      {/* Main Grid: Upload & Form + Audit Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Input Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">Enter Return Package Details</h2>

          <form onSubmit={handleRunAudit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Order ID</label>
              <input
                type="text"
                placeholder="e.g. ORD-84920"
                value={req.order_id}
                onChange={(e) => setReq({ ...req, order_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Customer Name</label>
              <input
                type="text"
                placeholder="e.g. Rohan Verma"
                value={req.customer_name}
                onChange={(e) => setReq({ ...req, customer_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Customer Claimed Reason</label>
              <select
                value={req.return_reason_claimed}
                onChange={(e) => setReq({ ...req, return_reason_claimed: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:border-sky-600 focus:outline-none"
              >
                <option value="Empty Box / Missing Item Claimed">Empty Box / Missing Item Claimed</option>
                <option value="Wrong / Substituted Product Returned">Wrong / Substituted Product Returned</option>
                <option value="Product Damaged in Transit">Product Damaged in Transit</option>
                <option value="Standard Fit / Size Return">Standard Fit / Size Return</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Product Name / SKU</label>
              <input
                type="text"
                placeholder="e.g. Wireless Headphones SN-883921"
                value={req.claimed_item}
                onChange={(e) => setReq({ ...req, claimed_item: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                required
              />
            </div>

            {/* Clean File Dropzone */}
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Return Package Evidence Photo</label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50 hover:bg-slate-100 transition-all">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {uploadedFileName ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                    <FileCheck className="w-5 h-5 text-emerald-600" />
                    <span>Uploaded: {uploadedFileName}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-sky-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-800 block">Click or Drag Package Photo Here</span>
                    <span className="text-[11px] text-slate-500">Supports JPG, PNG, PDF</span>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{loading ? "Scanning Package & Audit Logs..." : "Scan Return Package Now"}</span>
            </button>
          </form>
        </div>

        {/* Right: Inspection Output */}
        <div className="lg:col-span-7 space-y-6">
          {auditResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              {/* Verdict Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Package Check Verdict</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {auditResult.verdict === "SUSPECTED_FRAUD" && "⚠️ High Risk Return Fraud Detected"}
                    {auditResult.verdict === "VERIFIED_GENUINE" && "✓ Verified Genuine Return"}
                    {auditResult.verdict === "NEEDS_MANUAL_REVIEW" && "🔍 Recommended for Courier Review"}
                  </div>
                </div>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                    auditResult.verdict === "VERIFIED_GENUINE"
                      ? "bg-emerald-100 text-emerald-800"
                      : auditResult.verdict === "SUSPECTED_FRAUD"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Confidence: {(auditResult.fraud_confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                {auditResult.summary}
              </p>

              {/* Physical Check Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Parcel Weight</span>
                  <div className="text-sm font-extrabold text-rose-700 mt-1">
                    {auditResult.weight_mismatch_grams}g
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Serial Tag</span>
                  <div className={`text-sm font-extrabold mt-1 ${auditResult.serial_number_match ? "text-emerald-700" : "text-rose-700"}`}>
                    {auditResult.serial_number_match ? "MATCHED" : "MISMATCHED"}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Security Seal</span>
                  <div className={`text-sm font-extrabold mt-1 ${auditResult.packaging_seal_tampered ? "text-rose-700" : "text-emerald-700"}`}>
                    {auditResult.packaging_seal_tampered ? "TAMPERED" : "INTACT"}
                  </div>
                </div>
              </div>

              {/* Anomalies List */}
              {auditResult.detected_anomalies.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                    Detected Parcel Problems
                  </h3>
                  <div className="space-y-2">
                    {auditResult.detected_anomalies.map((anom, idx) => (
                      <div
                        key={idx}
                        className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs flex items-center gap-2 font-medium"
                      >
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{anom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download PDF Report Button */}
              <button
                onClick={handleDownloadDossier}
                disabled={generatingPdf}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>{generatingPdf ? "Creating PDF Dispute Report..." : "Download Official 1-Page PDF Dispute Report"}</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">No return package scanned yet.</p>
              <p className="text-xs text-slate-500 mt-1">
                Enter return claim details on the left and click "Scan Return Package Now".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
