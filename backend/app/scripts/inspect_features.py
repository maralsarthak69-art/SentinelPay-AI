import pandas as pd

p_cust = r"C:\Users\SARTHAK\Downloads\archive\customers.csv"
p_prod = r"C:\Users\SARTHAK\Downloads\archive\products.csv"
p_sales = r"C:\Users\SARTHAK\Downloads\archive\sales.csv"

df_sales = pd.read_csv(p_sales)
df_cust = pd.read_csv(p_cust)
df_prod = pd.read_csv(p_prod)

print("Cross-tab of Payment_Mode vs Order_Status:")
print(pd.crosstab(df_sales['Payment_Mode'], df_sales['Order_Status'], margins=True))

print("\nJoining sales with customers and products...")
merged = df_sales.merge(df_cust[['Customer_ID', 'Pincode', 'Customer_Tier', 'Total_Orders']], on='Customer_ID', how='left')
merged = merged.merge(df_prod[['Product_ID', 'Category', 'Weight_kg', 'Avg_Rating']], on='Product_ID', how='left')

print("\nMerged columns:")
print(merged.columns.tolist())

# Target definition: RTO / High Risk Order (Returned or Cancelled, especially COD)
merged['is_rto'] = merged['Order_Status'].apply(lambda x: 1 if x in ['Returned', 'Cancelled'] else 0)

print("\nTarget 'is_rto' distribution:")
print(merged['is_rto'].value_counts(normalize=True))

print("\nRTO rate by Payment Mode:")
print(merged.groupby('Payment_Mode')['is_rto'].mean())

print("\nRTO rate by Category:")
print(merged.groupby('Category')['is_rto'].mean())

print("\nRTO rate by Customer Tier:")
print(merged.groupby('Customer_Tier')['is_rto'].mean())
