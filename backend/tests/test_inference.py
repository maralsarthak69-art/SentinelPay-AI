import time
import pytest
from app.schemas import OrderRiskRequest
from app.core.preprocessor import preprocessor
from app.core.predictor import predictor
from app.core.explainer import explainer

def test_inference_latency_and_decision_tiers():
    req = OrderRiskRequest(
        order_id="TEST-001",
        cart_value=4999.0,
        payment_mode="COD",
        shipping_address="Near Temple, Chhapra",
        pincode="841301",
        device_order_count_last_24h=5,
        address_mismatch_flag=True
    )
    
    start_time = time.time()
    features_df = preprocessor.transform_order_to_features(req)
    rto_prob = predictor.predict_rto_prob(features_df)
    decision, action, advance_amt = predictor.evaluate_decision_tier(rto_prob)
    explanations = explainer.explain(features_df)
    latency_ms = (time.time() - start_time) * 1000.0

    print(f"Inference latency: {latency_ms:.2f} ms")
    
    # Requirement: Tabular scoring latency < 45ms
    assert latency_ms < 45.0, f"Inference latency {latency_ms:.2f}ms exceeds 45ms target!"
    assert 0.0 <= rto_prob <= 1.0
    assert decision in ["PASS", "DYNAMIC_INTERVENTION", "BLOCK_COD"]
    assert len(explanations) == 3
