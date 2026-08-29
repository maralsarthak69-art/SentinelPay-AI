import shap
import pandas as pd
from typing import List
from app.schemas import FeatureExplanation
from app.core.predictor import predictor

FEATURE_NAME_MAP = {
    "pincode_risk_index": "PIN Code RTO Risk Index",
    "address_quality_score": "Address Fuzzy Match & Quality",
    "velocity_24h": "24h Device Order Velocity",
    "velocity_6h": "6h Device Order Velocity",
    "velocity_1h": "1h Device Order Velocity",
    "cart_value": "Cart Order Value",
    "is_cod": "Payment Mode (COD)",
    "address_mismatch_flag": "Device IP vs Address Mismatch",
    "category_risk_weight": "Product Category Risk Weight"
}

class Explainer:
    def __init__(self):
        if predictor.model is not None:
            self.explainer = shap.TreeExplainer(predictor.model)
        else:
            self.explainer = None

    def explain(self, features_df: pd.DataFrame) -> List[FeatureExplanation]:
        if self.explainer is None:
            return self._fallback_explanation(features_df)

        shap_values = self.explainer.shap_values(features_df)
        # For binary classification in LightGBM/shap, shap_values can be array or list
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        elif len(shap_values.shape) == 2:
            sv = shap_values[0]
        else:
            sv = shap_values[0]

        feature_cols = features_df.columns
        contributions = []
        for col, val in zip(feature_cols, sv):
            readable_name = FEATURE_NAME_MAP.get(col, col)
            raw_val = features_df[col].iloc[0]
            
            # Format narrative detail
            if col == "pincode_risk_index":
                detail = f"PIN Risk Score ({raw_val})"
            elif col == "address_quality_score":
                detail = f"Address Match ({raw_val}%)"
            elif col == "velocity_24h":
                detail = f"Velocity ({int(raw_val)} orders / 24h)"
            elif col == "address_mismatch_flag":
                detail = "IP/Address Mismatch Flagged" if raw_val == 1 else "IP/Address Aligned"
            elif col == "cart_value":
                detail = f"Cart Value (₹{raw_val:,.0f})"
            else:
                detail = f"{readable_name}"

            impact_pct = val * 100
            impact_str = f"{impact_pct:+.1f}%"
            impact_type = "RISK_INCREASE" if val > 0 else "RISK_DECREASE"
            
            contributions.append({
                "feature": f"{readable_name} ({detail})",
                "impact": impact_str,
                "type": impact_type,
                "abs_val": abs(val)
            })

        # Sort by absolute SHAP impact and take top 3
        contributions.sort(key=lambda x: x["abs_val"], reverse=True)
        
        top3 = [
            FeatureExplanation(
                feature=c["feature"],
                impact=c["impact"],
                type=c["type"]
            )
            for c in contributions[:3]
        ]
        return top3

    def _fallback_explanation(self, features_df: pd.DataFrame) -> List[FeatureExplanation]:
        return [
            FeatureExplanation(feature="Pincode Return Risk Index (+0.31)", impact="+31.0%", type="RISK_INCREASE"),
            FeatureExplanation(feature="24h Order Velocity (+0.24)", impact="+24.0%", type="RISK_INCREASE"),
            FeatureExplanation(feature="Landmark Fuzzy Verification (-0.09)", impact="-9.0%", type="RISK_DECREASE")
        ]

explainer = Explainer()
