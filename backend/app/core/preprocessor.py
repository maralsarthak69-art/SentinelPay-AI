import os
import json
import pandas as pd
from app.schemas import OrderRiskRequest

class Preprocessor:
    def __init__(self):
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
        pincode_path = os.path.join(data_dir, "pincode_risk_index.json")
        self.pincode_dict = {}
        if os.path.exists(pincode_path):
            with open(pincode_path, "r", encoding="utf-8") as f:
                self.pincode_dict = json.load(f)

        # Complete Indian Postal Circle Prefix (First 2 digits) Regional Risk Index
        self.regional_prefix_risk = {
            # Delhi & NCR Circle (11)
            "11": 0.12,
            # Haryana Circle (12, 13)
            "12": 0.38, "13": 0.36,
            # Punjab & Chandigarh Circle (14, 15, 16)
            "14": 0.28, "15": 0.29, "16": 0.22,
            # Himachal Pradesh Circle (17)
            "17": 0.22,
            # Jammu & Kashmir Circle (18, 19)
            "18": 0.35, "19": 0.38,
            # Uttar Pradesh Circle (20 to 28)
            "20": 0.42, "21": 0.44, "22": 0.45, "23": 0.46, "24": 0.41,
            "25": 0.43, "26": 0.44, "27": 0.48, "28": 0.45,
            # Rajasthan Circle (30 to 34)
            "30": 0.32, "31": 0.34, "32": 0.35, "33": 0.33, "34": 0.36,
            # Gujarat Circle (36 to 39)
            "36": 0.18, "37": 0.19, "38": 0.16, "39": 0.17,
            # Maharashtra & Goa Circle (40 to 44)
            "40": 0.12, "41": 0.14, "42": 0.15, "43": 0.18, "44": 0.16,
            # Madhya Pradesh Circle (45 to 48)
            "45": 0.32, "46": 0.31, "47": 0.34, "48": 0.33,
            # Chhattisgarh Circle (49)
            "49": 0.30,
            # Andhra Pradesh & Telangana Circle (50 to 53)
            "50": 0.22, "51": 0.24, "52": 0.25, "53": 0.23,
            # Karnataka Circle (56 to 59)
            "56": 0.12, "57": 0.15, "58": 0.16, "59": 0.17,
            # Tamil Nadu & Puducherry Circle (60 to 64)
            "60": 0.14, "61": 0.16, "62": 0.17, "63": 0.18, "64": 0.15,
            # Kerala Circle (67 to 69)
            "67": 0.20, "68": 0.19, "69": 0.21,
            # West Bengal & Sikkim Circle (70 to 74)
            "70": 0.22, "71": 0.25, "72": 0.27, "73": 0.29, "74": 0.28,
            # Odisha Circle (75 to 77)
            "75": 0.34, "76": 0.35, "77": 0.36,
            # Assam & North East Circle (78, 79)
            "78": 0.40, "79": 0.38,
            # Bihar & Jharkhand Circle (80 to 85)
            "80": 0.48, "81": 0.49, "82": 0.47, "83": 0.45, "84": 0.50, "85": 0.48,
            # Army Postal Service (APS 90 to 99)
            "90": 0.15, "91": 0.15, "92": 0.15
        }

    def get_pincode_risk(self, pincode: str) -> float:
        clean_pin = str(pincode).strip()
        
        # 1. Direct 6-digit exact match in 38,941 indexed PIN codes
        if clean_pin in self.pincode_dict:
            return float(self.pincode_dict[clean_pin].get("risk_index", 0.30))
            
        # 2. Dynamic 2-digit regional postal circle lookup
        prefix_2 = clean_pin[:2]
        if prefix_2 in self.regional_prefix_risk:
            return float(self.regional_prefix_risk[prefix_2])
            
        # 3. Dynamic 1-digit zone fallback
        prefix_1 = clean_pin[:1]
        if prefix_1 in ["1", "3", "4", "5", "6"]:
            return 0.22  # Western/Southern/Metro Zones
        elif prefix_1 in ["2", "7", "8"]:
            return 0.44  # Eastern/Northern Rural Zones
            
        return 0.30

    def compute_address_quality(self, address: str, pincode: str) -> float:
        if not address or len(address.strip()) < 8:
            return 25.0
        
        city_info = self.pincode_dict.get(pincode, {}).get("city", "")
        base_score = 65.0
        
        if city_info and city_info.lower() in address.lower():
            base_score += 20.0
            
        landmarks = ["near", "flat", "plot", "street", "road", "mandir", "nagar", "colony", "opp", "behind", "floor"]
        match_count = sum(1 for lm in landmarks if lm in address.lower())
        base_score += min(15.0, match_count * 5.0)

        if len(set(address)) < 6:
            base_score -= 40.0
            
        return max(10.0, min(100.0, base_score))

    def transform_order_to_features(self, req: OrderRiskRequest) -> pd.DataFrame:
        is_cod_val = 1 if req.payment_mode.upper() == "COD" else 0
        pincode_risk = self.get_pincode_risk(req.pincode)
        addr_score = self.compute_address_quality(req.shipping_address, req.pincode)
        
        v24 = req.device_order_count_last_24h
        v6 = max(0, int(v24 * 0.5))
        v1 = max(0, int(v6 * 0.4))
        
        mismatch_val = 1 if req.address_mismatch_flag else 0
        category_weight = req.category_risk_weight if req.category_risk_weight is not None else 0.35
        
        feature_dict = {
            "cart_value": req.cart_value,
            "is_cod": is_cod_val,
            "pincode_risk_index": pincode_risk,
            "address_quality_score": addr_score,
            "velocity_1h": v1,
            "velocity_6h": v6,
            "velocity_24h": v24,
            "address_mismatch_flag": mismatch_val,
            "category_risk_weight": category_weight
        }
        
        return pd.DataFrame([feature_dict])

preprocessor = Preprocessor()
