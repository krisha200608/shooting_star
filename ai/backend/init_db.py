import os
import sys
from sqlalchemy import create_engine
from app.database import Base, engine
from app.models import User, Subject, Lesson, Assessment, ProgressReport
from app.config import settings

def init_database():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("✅ Database tables created successfully!")

    # Initialize default subjects
    init_default_data()

def init_default_data():
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Check if subjects already exist
        existing_subjects = db.query(Subject).count()
        if existing_subjects == 0:
            # Create default subjects
            subjects = [
                Subject(
                    subject_name="English",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html",
                    standard_book_reference="NCERT Flamingo & Vistas"
                ),
                Subject(
                    subject_name="Mathematics",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html", 
                    standard_book_reference="NCERT Mathematics Part I & II"
                ),
                Subject(
                    subject_name="Accounts",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html",
                    standard_book_reference="NCERT Accountancy Part I & II"
                ),
                Subject(
                    subject_name="Economics",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html",
                    standard_book_reference="NCERT Introductory Microeconomics & Macroeconomics"
                ),
                Subject(
                    subject_name="Business Studies",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html", 
                    standard_book_reference="NCERT Business Studies Part I & II"
                ),
                Subject(
                    subject_name="Physical Education",
                    cbse_curriculum_link="https://cbseacademic.nic.in/curriculum_2024.html",
                    standard_book_reference="NCERT Physical Education"
                )
            ]

            db.add_all(subjects)
            db.commit()
            print("✅ Default subjects added successfully!")
        else:
            print("✅ Subjects already exist in database.")

    except Exception as e:
        print(f"❌ Error initializing default data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()