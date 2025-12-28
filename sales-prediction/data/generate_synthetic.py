# -*- coding: utf-8 -*-
"""
MY FIRST ML PROJECT - SALES PREDICTION
Simple version for beginners
"""

# Step 1: Import tools (like opening different apps)
import pandas as pd
import matplotlib.pyplot as plt

print("🎯 STEP 1: LOADING DATA")
# Step 2: Read our data file
data = pd.read_csv('../data/sales.csv')

# Step 3: Let's see what's in the data
print("s📊 First look at our data:")
print(data.head())

print("\n📈 Basic information:")
print(f"We have {len(data)} months of data")
print(f"Columns: {list(data.columns)}")

print("\n💰 Sales statistics:")
print(f"Highest sales: ₹{data['Sales'].max():,}")
print(f"Lowest sales: ₹{data['Sales'].min():,}")
print(f"Average sales: ₹{data['Sales'].mean():,.0f}")

# Step 4: Let's make some simple graphs
print("\n📊 Creating graphs...")

# Graph 1: Sales over time
plt.figure(figsize=(10, 6))
plt.plot(data['Month'], data['Sales'], marker='o', linewidth=2, markersize=8)
plt.title('Sales Over Time')
plt.xlabel('Month')
plt.ylabel('Sales (₹)')
plt.xticks(rotation=45)
plt.grid(True)
plt.tight_layout()
plt.savefig('../data/sales_trend.png')
plt.show()

# Graph 2: Advertising vs Sales
plt.figure(figsize=(8, 6))
plt.scatter(data['Advertising'], data['Sales'], alpha=0.7, s=100)
plt.title('Advertising vs Sales')
plt.xlabel('Advertising Spend (₹)')
plt.ylabel('Sales (₹)')
plt.grid(True)
plt.tight_layout()
plt.savefig('../data/ads_vs_sales.png')
plt.show()

print("✅ Analysis complete! Check the PNG files in data folder")