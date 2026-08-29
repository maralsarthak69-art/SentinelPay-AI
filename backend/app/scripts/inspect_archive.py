import pandas as pd

p_cust = r"C:\Users\SARTHAK\Downloads\archive\customers.csv"
p_prod = r"C:\Users\SARTHAK\Downloads\archive\products.csv"
p_sales = r"C:\Users\SARTHAK\Downloads\archive\sales.csv"

print("--- CUSTOMERS ---")
df_cust = pd.read_csv(p_cust)
print(df_cust.info())
print(df_cust.head(3))

print("\n--- PRODUCTS ---")
df_prod = pd.read_csv(p_prod)
print(df_prod.info())
print(df_prod.head(3))

print("\n--- SALES (first 1000 rows) ---")
df_sales = pd.read_csv(p_sales, nrows=1000)
print(df_sales.info())
print(df_sales.head(3))
