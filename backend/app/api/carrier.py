from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
from app.core.carrier_webhooks import carrier_dispatcher

router = APIRouter()

class DispatchWebhookRequest(BaseModel):
    order_id: str = "ORD-84920"
    decision: str = "DYNAMIC_INTERVENTION"
    cart_value: float = 2499.0
    pincode: str = "411041"
    action: str = "PROMPT_UPI_ADVANCE"

@router.post("/dispatch-webhook")
def dispatch_3pl_webhook(req: DispatchWebhookRequest) -> Dict[str, Any]:
    return carrier_dispatcher.dispatch_webhooks(
        order_id=req.order_id,
        decision=req.decision,
        cart_value=req.cart_value,
        pincode=req.pincode,
        action=req.action
    )
