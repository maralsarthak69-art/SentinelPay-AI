import pandas as pd

p_sales = r"C:\Users\SARTHAK\Downloads\archive\sales.csv"
print("Reading sales.csv full dataframe...")
df_sales = pd.read_csv(p_sales)
print(f"Total sales records: {len(df_sales)}")
print("Order_Status value counts:")
print(df_sales['Order_Status'].value_counts(dropna=False))

print("\nPayment_Mode value counts:")
print(df_sales['Payment_Mode'].value_counts(dropna=False))

print("\nSample rows of sales:")
print(df_sales[['Order_ID', 'Customer_ID', 'Product_ID', 'Total_Amount', 'Payment_Mode', 'Order_Status']].head(10))
