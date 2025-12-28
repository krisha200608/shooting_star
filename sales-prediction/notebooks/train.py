# -*- coding: utf-8 -*-
"""
TRAINING OUR SALES PREDICTION MODEL
"""

print("🚀 STARTING MACHINE LEARNING TRAINING")

# Import ML tools
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
import joblib

# Load data
data = pd.read_csv('../sales-prediction/data/sales.csv')

print("📊 Our data:")
print(data.head())

# Step 1: Prepare data for ML
print("\n🎯 STEP 1: PREPARING DATA")

# We'll use these to predict sales
features = data[['Advertising', 'Price', 'Holiday']]
target = data['Sales']

print(f"Features we're using: {list(features.columns)}")
print(f"What we're predicting: Sales")
print(f"Feature data shape: {features.shape}")
print(f"Target data shape: {target.shape}")

# Step 2: Split data (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(
    features, target, test_size=0.5, random_state=42
)

print(f"\n📁 Data split:")
print(f"Training samples: {len(X_train)} months")
print(f"Testing samples: {len(X_test)} months")

# Step 3: Create and train the model
print("\n🧠 STEP 2: TRAINING THE MODEL")

# Create a Linear Regression model (simplest ML model)
model = LinearRegression()

# Train the model (this is where learning happens!)
model.fit(X_train, y_train)

print("✅ Model training complete!")

# Step 4: Check how good our model is
print("\n📊 STEP 3: TESTING THE MODEL")

# Make predictions on test data
predictions = model.predict(X_test)

# Calculate accuracy
mae = mean_absolute_error(y_test, predictions)
accuracy_percentage = (1 - mae/y_test.mean()) * 100

print(f"Model Performance:")
print(f"Mean Absolute Error: ₹{mae:,.0f}")
print(f"Average Sales: ₹{y_test.mean():,.0f}")
print(f"Accuracy: {accuracy_percentage:.1f}%")

# Step 5: Show what the model learned
print(f"\n🔍 What the model learned:")
print(f"Intercept: ₹{model.intercept_:,.0f}")
for i, col in enumerate(features.columns):
    print(f"{col} coefficient: {model.coef_[i]:.2f}")

# Step 6: Save the model for future use
joblib.dump(model, '../sales-prediction/data/sales_prediction_model.pkl')
print("\n💾 Model saved as 'sales_prediction_model.pkl'")

# Step 7: Make a prediction
print("\n🔮 STEP 4: MAKING PREDICTIONS")

# Let's predict sales for a new scenario
new_data = [[3000, 85, 1]]  # ₹3000 ads, ₹85 price, holiday season
prediction = model.predict(new_data)

print(f"Prediction for: Ads=₹3000, Price=₹85, Holiday=Yes")
print(f"Expected Sales: ₹{prediction[0]:,.0f}")

print("\n🎉 CONGRATULATIONS! YOU BUILT YOUR FIRST ML MODEL!")