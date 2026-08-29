import os
import pandas as pd
import numpy as np
from fastapi import APIRouter, HTTPException
from sklearn.metrics import confusion_matrix, precision_score, recall_score
from app.schemas import BenchmarkRequest, BenchmarkResponse, ConfusionMatrixData, FinancialImpactData
from app.core.predictor import predictor
from app.config import settings

router = APIRouter()

@router.post("/run", response_model=BenchmarkResponse)
def run_benchmark(req: BenchmarkRequest):
    try:
        data_path = os.path.join(os.path.dirname(__file__), "..", "data", "benchmark_dataset.csv")
        if not os.path.exists(data_path):
            raise HTTPException(status_code=404, detail="Benchmark dataset not found. Please run training script.")

        df = pd.read_csv(data_path)
        feature_cols = [
            "cart_value", "is_cod", "pincode_risk_index", "address_quality_score",
            "velocity_1h", "velocity_6h", "velocity_24h", "address_mismatch_flag",
            "category_risk_weight"
        ]
        
        X = df[feature_cols]
        y_true = df["is_rto"].values

        if predictor.model is not None:
            y_probs = predictor.model.predict_proba(X)[:, 1]
        else:
            y_probs = (
                0.38 * df["pincode_risk_index"] +
                0.24 * ((100.0 - df["address_quality_score"]) / 100.0) +
                0.18 * np.clip(df["velocity_24h"] / 5.0, 0, 1) +
                0.12 * df["address_mismatch_flag"] +
                0.14 * (df["is_cod"] * (df["cart_value"] > 1500).astype(float))
            ).values

        # Exact real decision counts based on model probabilities
        pass_count = int(np.sum(y_probs < settings.LOW_RISK_THRESHOLD))
        intervene_count = int(np.sum((y_probs >= settings.LOW_RISK_THRESHOLD) & (y_probs <= settings.HIGH_RISK_THRESHOLD)))
        block_count = int(np.sum(y_probs > settings.HIGH_RISK_THRESHOLD))

        y_preds = (y_probs >= req.risk_threshold).astype(int)

        tn, fp, fn, tp = confusion_matrix(y_true, y_preds).ravel()
        
        prec = float(precision_score(y_true, y_preds, zero_division=0))
        rec = float(recall_score(y_true, y_preds, zero_division=0))
        fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0

        c_rto = req.avg_rto_cost_inr
        ltv = req.customer_ltv_cost_inr

        gross_fraud_prevented = float(tp * c_rto)
        fp_churn_cost = float(fp * ltv)
        net_saved = float(gross_fraud_prevented - fp_churn_cost - (fn * c_rto))

        return BenchmarkResponse(
            total_records_evaluated=len(df),
            precision=round(prec, 4),
            recall=round(rec, 4),
            false_positive_rate=round(fpr, 4),
            pass_count=pass_count,
            intervene_count=intervene_count,
            block_count=block_count,
            confusion_matrix=ConfusionMatrixData(
                true_positives=int(tp),
                false_positives=int(fp),
                true_negatives=int(tn),
                false_negatives=int(fn)
            ),
            financial_impact=FinancialImpactData(
                gross_fraud_prevented_inr=round(gross_fraud_prevented, 2),
                false_positive_churn_cost_inr=round(fp_churn_cost, 2),
                net_margin_saved_inr=round(net_saved, 2)
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark execution error: {str(e)}")

@router.get("/matrix", response_model=BenchmarkResponse)
def get_default_matrix():
    default_req = BenchmarkRequest(risk_threshold=0.55, avg_rto_cost_inr=180.0, customer_ltv_cost_inr=650.0)
    return run_benchmark(default_req)
