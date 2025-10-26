import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
        # SQLite database - COMPLETELY FREE!
        DATABASE_URL: str = "sqlite:///./ai_education.db"

        # Your Gemini API key
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "AIzaSyCbY7gQ53oUDHc3S4D-0WU5BbUQ4kHLWwU")

        # Secret key for JWT tokens
        SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-replit")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()