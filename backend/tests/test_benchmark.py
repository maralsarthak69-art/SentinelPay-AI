import pytest
from app.schemas import BenchmarkRequest
from app.api.benchmark import run_benchmark

def test_held_out_benchmark_metrics():
    req = BenchmarkRequest(
        risk_threshold=0.55,
        avg_rto_cost_inr=180.0,
        customer_ltv_cost_inr=650.0
    )
    res = run_benchmark(req)

    assert res.total_records_evaluated == 5000
    
    # Target Evaluation Metrics on Held-Out Test Set:
    # Precision >= 84.5%
    # Recall >= 78.0%
    # FPR <= 2.1%
    assert res.precision >= 0.845, f"Precision {res.precision} is below target 0.845"
    assert res.recall >= 0.780, f"Recall {res.recall} is below target 0.780"
    assert res.false_positive_rate <= 0.021, f"FPR {res.false_positive_rate} is above target 0.021"
    
    assert res.financial_impact.net_margin_saved_inr > 0
