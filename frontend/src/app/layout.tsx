import "./globals.css";
import React from "react";
import Link from "next/link";
import { Shield, LayoutDashboard, Send, BarChart3, PackageCheck, Store } from "lucide-react";
import { MerchantGuideModal } from "@/components/MerchantGuideModal";

export const metadata = {
  title: "SentinelPay Merchant Portal | Protect COD Orders & Stop Return Fraud",
  description: "Simple, intelligent store protection for Indian E-Commerce and D2C sellers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
            {/* Brand Logo & Title */}
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 bg-sky-600 group-hover:bg-sky-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-sky-600/20 transition-all shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                    SentinelPay
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200">
                    Store Shield
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  COD Order Protection &amp; Dispute Helper
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
              <Link
                href="/"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <LayoutDashboard className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Store Overview</span>
              </Link>

              <Link
                href="/live-stream"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Send className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Check New Orders</span>
              </Link>

              <Link
                href="/benchmark"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <BarChart3 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Store Performance</span>
              </Link>

              <Link
                href="/disputes"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-amber-600 hover:bg-slate-100 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <PackageCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Return Fraud Helper</span>
              </Link>
            </nav>

            {/* Right Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <MerchantGuideModal />

              <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Store Protection: <b>ACTIVE</b></span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium">
              <Store className="w-4 h-4 text-sky-600" />
              <span>SentinelPay Merchant Shield &mdash; Built for Indian E-Commerce &amp; D2C Stores</span>
            </div>
            <p>Razorpay AI Buildathon Submission &bull; Production Risk Engine</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
