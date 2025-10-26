from app.database import engine, Base
from app.models import User, Subject, Lesson, Assessment, ProgressReport
from sqlalchemy.orm import Session

def setup_database():
    print("🚀 Setting up SQLite database...")

    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created!")

    # Add default subjects
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Check if subjects already exist
        existing_subjects = db.query(Subject).count()
        if existing_subjects == 0:
            subjects = [
                Subject(subject_name="English", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Flamingo & Vistas"),
                Subject(subject_name="Mathematics", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Mathematics Part I & II"),
                Subject(subject_name="Accounts", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Accountancy Part I & II"),
                Subject(subject_name="Economics", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Introductory Microeconomics & Macroeconomics"),
                Subject(subject_name="Business Studies", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Business Studies Part I & II"),
                Subject(subject_name="Physical Education", cbse_curriculum_link="https://cbseacademic.nic.in/", standard_book_reference="NCERT Physical Education"),
            ]
            db.add_all(subjects)
            db.commit()
            print("✅ Default subjects added!")
        else:
            print("✅ Database already has subjects")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    setup_database()