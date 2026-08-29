import os
import joblib
import pandas as pd
from app.config import settings

class Predictor:
    def __init__(self):
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        model_path = os.path.join(data_dir, "models", "lightgbm_rto.pkl")
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = None

    def predict_rto_prob(self, features_df: pd.DataFrame) -> float:
        if self.model is None:
            # Fallback heuristic calculation if model file missing
            p_index = features_df["pincode_risk_index"].iloc[0]
            v24 = features_df["velocity_24h"].iloc[0]
            addr_q = features_df["address_quality_score"].iloc[0]
            prob = 0.40 * p_index + 0.30 * ((100 - addr_q) / 100) + 0.30 * min(1.0, v24 / 5.0)
            return float(max(0.01, min(0.99, prob)))
        
        prob = self.model.predict_proba(features_df)[0][1]
        return float(prob)

    def evaluate_decision_tier(self, prob: float):
        if prob < settings.LOW_RISK_THRESHOLD:
            return "PASS", "FULFILL_COD", 0.0
        elif prob <= settings.HIGH_RISK_THRESHOLD:
            return "DYNAMIC_INTERVENTION", "PROMPT_UPI_ADVANCE", 50.0
        else:
            return "BLOCK_COD", "ENFORCE_PREPAYMENT", 0.0

predictor = Predictor()
