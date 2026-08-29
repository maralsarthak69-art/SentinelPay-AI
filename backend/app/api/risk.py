import time
from fastapi import APIRouter, HTTPException
from app.schemas import OrderRiskRequest, OrderRiskResponse
from app.core.preprocessor import preprocessor
from app.core.predictor import predictor
from app.core.explainer import explainer

router = APIRouter()

@router.post("/predict", response_model=OrderRiskResponse)
def predict_order_risk(req: OrderRiskRequest):
    try:
        features_df = preprocessor.transform_order_to_features(req)
        rto_prob = predictor.predict_rto_prob(features_df)
        decision, action, advance_amt = predictor.evaluate_decision_tier(rto_prob)
        explanations = explainer.explain(features_df)
        
        return OrderRiskResponse(
            order_id=req.order_id,
            rto_probability=round(rto_prob, 3),
            decision=decision,
            action_required=action,
            advance_amount=advance_amt,
            explanation=explanations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk prediction error: {str(e)}")
