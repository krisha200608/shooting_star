# -*- coding: utf-8 -*-
"""
USE OUR TRAINED MODEL TO PREDICT SALES
"""

import joblib
import pandas as pd

print("🔮 SALES PREDICTION TOOL")
print("=" * 30)

# Load our trained model
model = joblib.load('../sales-prediction/data/sales_prediction_model.pkl')

print("✅ Model loaded successfully!")

while True:
    print("\nEnter details for prediction:")
    
    try:
        # Get user input
        advertising = float(input("Advertising budget (₹): "))
        price = float(input("Product price (₹): "))
        holiday = int(input("Holiday season? (1=Yes, 0=No): "))
        
        # Make prediction
        prediction = model.predict([[advertising, price, holiday]])
        
        print(f"\n🎯 PREDICTION RESULT:")
        print(f"Advertising: ₹{advertising:,}")
        print(f"Price: ₹{price:,}")
        print(f"Holiday: {'Yes' if holiday == 1 else 'No'}")
        print(f"📈 Predicted Sales: ₹{prediction[0]:,.0f}")
        
        # Ask if user wants to continue
        another = input("\nMake another prediction? (y/n): ").lower()
        if another != 'y':
            break
            
    except ValueError:
        print("❌ Please enter valid numbers!")
    except Exception as e:
        print(f"❌ Error: {e}")

print("\nThanks for using Sales Predictor! 👋")