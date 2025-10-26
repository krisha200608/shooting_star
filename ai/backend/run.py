import uvicorn
from setup import setup_database

if __name__ == "__main__":
    print("🎓 Starting AI Student-Teacher System...")

    # Setup database
    setup_database()

    # Start server
    print("🚀 Starting FastAPI server at http://localhost:8000")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )