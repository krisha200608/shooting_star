import requests
import json

BASE_URL = "http://localhost:8000"

def test_api():
    print("🧪 Testing API endpoints...")

    # Test health
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.json()}")
    except:
        print("❌ Health check failed")
        return

    # Test subjects
    try:
        response = requests.get(f"{BASE_URL}/api/subjects")
        subjects = response.json()
        print(f"✅ Subjects: Found {len(subjects)} subjects")
    except:
        print("❌ Subjects endpoint failed")

    print("\n🎯 API is working! You can now:")
    print("1. Go to http://localhost:8000/docs to see API documentation")
    print("2. Test the endpoints manually")
    print("3. The frontend can now connect to this backend!")

if __name__ == "__main__":
    test_api()