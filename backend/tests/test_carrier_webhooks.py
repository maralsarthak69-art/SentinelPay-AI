from app.core.carrier_webhooks import carrier_dispatcher

def test_shiprocket_and_delhivery_webhook_formatting():
    order_id = "ORD-TEST-99"
    decision = "DYNAMIC_INTERVENTION"
    cart_value = 2499.0
    pincode = "411041"
    action = "PROMPT_UPI_ADVANCE"

    res = carrier_dispatcher.dispatch_webhooks(order_id, decision, cart_value, pincode, action)
    
    assert res["order_id"] == "ORD-TEST-99"
    assert res["shiprocket"]["payload"]["payment_method"] == "Prepaid"
    assert res["shiprocket"]["payload"]["sentinelpay_risk_action"] == "PROMPT_UPI_ADVANCE"
    assert res["delhivery"]["payload"]["shipments"][0]["fulfillment_code"] == "HOLD_FOR_UPI_ADVANCE"
    assert res["delhivery"]["payload"]["shipments"][0]["pin"] == "411041"
