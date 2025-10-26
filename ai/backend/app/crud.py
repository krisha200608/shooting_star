from sqlalchemy.orm import Session
from . import models, schemas, auth
from typing import List, Optional

# User operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not auth.verify_password(password, user.password_hash):
        return False
    return user

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
        role=user.role,
        field_of_interest=user.field_of_interest,
        grade_level=user.grade_level
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Lesson operations
def create_lesson(db: Session, lesson: schemas.LessonCreate, teacher_id: int):
    db_lesson = models.Lesson(**lesson.dict(), teacher_id=teacher_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

def get_lesson(db: Session, lesson_id: int):
    return db.query(models.Lesson).filter(models.Lesson.lesson_id == lesson_id).first()

def get_lessons_by_subject(db: Session, subject_id: int):
    return db.query(models.Lesson).filter(models.Lesson.subject_id == subject_id).all()

# Assessment operations
def create_assessment(db: Session, student_id: int, lesson_id: int, questions: dict):
    db_assessment = models.Assessment(
        student_id=student_id,
        lesson_id=lesson_id,
        questions=questions
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

def get_assessment(db: Session, assessment_id: int):
    return db.query(models.Assessment).filter(models.Assessment.assessment_id == assessment_id).first()

def update_assessment_results(db: Session, assessment_id: int, student_answers: dict, ai_feedback: dict, score: float):
    assessment = get_assessment(db, assessment_id)
    assessment.student_answers = student_answers
    assessment.ai_feedback = ai_feedback
    assessment.score = score
    db.commit()
    db.refresh(assessment)
    return assessment

# Progress report operations
def create_progress_report(db: Session, student_id: int, subject_id: int, evaluation_data: dict):
    db_report = models.ProgressReport(
        student_id=student_id,
        subject_id=subject_id,
        overall_score=evaluation_data["scores"]["percentage"],
        weak_areas=evaluation_data["weak_areas"],
        recommendations=evaluation_data["recommendations"]
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_student_performance(db: Session, student_id: int):
    assessments = db.query(models.Assessment).filter(models.Assessment.student_id == student_id).all()

    performance = {
        "total_assessments": len(assessments),
        "average_score": sum(a.score for a in assessments) / len(assessments) if assessments else 0,
        "subject_breakdown": {},
        "recent_assessments": []
    }

    return performance