from fastapi import APIRouter, HTTPException, Response
from app.schemas import VerifyReturnRequest, VerifyReturnResponse, DossierGenerationRequest
from app.core.vlm_auditor import vlm_auditor
from app.core.dossier_builder import dossier_builder

router = APIRouter()

@router.post("/verify-return", response_model=VerifyReturnResponse)
def verify_return(req: VerifyReturnRequest):
    try:
        return vlm_auditor.verify_return_claim(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Return verification failed: {str(e)}")

@router.post("/generate-dossier")
def generate_dossier(req: DossierGenerationRequest):
    try:
        pdf_bytes = dossier_builder.generate_pdf_bytes(req)
        filename = f"SentinelPay_Dossier_{req.order_id}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dossier generation failed: {str(e)}")
