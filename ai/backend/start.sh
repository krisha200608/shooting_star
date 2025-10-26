#!/bin/bash

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install requirements
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload