import os

class Settings:
    PROJECT_NAME: str = "SentinelPay Risk & Friendly-Fraud Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Financial Cost Defaults (in INR ₹)
    DEFAULT_RTO_COST_INR: float = 180.0
    DEFAULT_CUSTOMER_LTV_INR: float = 650.0
    DEFAULT_RISK_THRESHOLD: float = 0.55
    
    # Decision Tier Thresholds
    LOW_RISK_THRESHOLD: float = 0.35
    HIGH_RISK_THRESHOLD: float = 0.70
    
    # Optional Gemini VLM API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
