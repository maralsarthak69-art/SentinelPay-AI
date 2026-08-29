import os
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import risk, benchmark, dispute, carrier

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SentinelPay: Hybrid RTO & Friendly-Fraud Mitigation Engine for Razorpay AI Buildathon"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(risk.router, prefix=f"{settings.API_V1_STR}", tags=["Risk & Pre-Dispatch"])
app.include_router(benchmark.router, prefix=f"{settings.API_V1_STR}/benchmark", tags=["Benchmark & Matrix"])
app.include_router(dispute.router, prefix=f"{settings.API_V1_STR}", tags=["Post-Delivery Disputes"])
app.include_router(carrier.router, prefix=f"{settings.API_V1_STR}/carrier", tags=["3PL Carrier Webhooks"])

@app.get("/")
def root():
    return {
        "status": "active",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/v1/sample-orders")
def get_recent_store_orders():
    """Returns actual transaction records from the store database (sales.csv & customers.csv)."""
    archive_sales = r"C:\Users\SARTHAK\Downloads\archive\sales.csv"
    archive_cust = r"C:\Users\SARTHAK\Downloads\archive\customers.csv"

    if os.path.exists(archive_sales) and os.path.exists(archive_cust):
        try:
            df_s = pd.read_csv(archive_sales, nrows=50)
            df_c = pd.read_csv(archive_cust)
            merged = df_s.merge(df_c[['Customer_ID', 'City', 'State', 'Pincode']], on='Customer_ID', how='left')
            
            orders = []
            for _, row in merged.head(10).iterrows():
                pincode_str = str(int(row['Pincode'])) if pd.notnull(row['Pincode']) else "110001"
                orders.append({
                    "order_id": str(row['Order_ID']),
                    "cart_value": float(row['Total_Amount']),
                    "payment_mode": str(row['Payment_Mode']),
                    "shipping_address": f"Address in {row['City']}, {row['State']}",
                    "pincode": pincode_str,
                    "phone_number": "+919876543210",
                    "device_order_count_last_24h": int(row['Quantity']) if pd.notnull(row['Quantity']) else 1,
                    "address_mismatch_flag": True if row['Payment_Mode'] == 'COD' and row['Total_Amount'] > 2000 else False,
                    "city": str(row['City']),
                    "state": str(row['State'])
                })
            return {"orders": orders}
        except Exception as e:
            pass

    return {"orders": []}
