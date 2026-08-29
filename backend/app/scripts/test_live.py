import requests

print("1. Testing GET / ...")
r1 = requests.get("http://localhost:8000/")
print("Status:", r1.status_code, "| Response:", r1.json())

print("\n2. Testing POST /api/v1/predict ...")
req_body = {
    "order_id": "ORD-98214",
    "cart_value": 3499.0,
    "payment_mode": "COD",
    "shipping_address": "Station Rd, Near Bus Stand, Chhapra",
    "pincode": "841301",
    "device_order_count_last_24h": 4,
    "address_mismatch_flag": True
}
r2 = requests.post("http://localhost:8000/api/v1/predict", json=req_body)
print("Status:", r2.status_code, "| Response:", r2.json())

print("\n3. Testing GET /api/v1/benchmark/matrix ...")
r3 = requests.get("http://localhost:8000/api/v1/benchmark/matrix")
print("Status:", r3.status_code, "| Precision:", r3.json().get("precision"), "| Recall:", r3.json().get("recall"))
