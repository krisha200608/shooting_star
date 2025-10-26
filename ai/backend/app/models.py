from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(20))  # student/teacher
    field_of_interest = Column(String(100))
    grade_level = Column(String(10))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lessons = relationship("Lesson", back_populates="teacher")
    assessments = relationship("Assessment", back_populates="student")

class Subject(Base):
    __tablename__ = "subjects"

    subject_id = Column(Integer, primary_key=True, index=True)
    subject_name = Column(String(50), unique=True)
    cbse_curriculum_link = Column(String(255))
    standard_book_reference = Column(String(255))

    lessons = relationship("Lesson", back_populates="subject")

class Lesson(Base):
    __tablename__ = "lessons"

    lesson_id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"))
    teacher_id = Column(Integer, ForeignKey("users.user_id"))
    topic_title = Column(String(255))
    summary_content = Column(Text)
    keywords = Column(JSON)  # Store keywords for AI question generation
    date_conducted = Column(DateTime(timezone=True), server_default=func.now())

    subject = relationship("Subject", back_populates="lessons")
    teacher = relationship("User", back_populates="lessons")
    assessments = relationship("Assessment", back_populates="lesson")

class Assessment(Base):
    __tablename__ = "assessments"

    assessment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.user_id"))
    lesson_id = Column(Integer, ForeignKey("lessons.lesson_id"))
    questions = Column(JSON)  # Store generated questions
    student_answers = Column(JSON)  # Store student's answers
    ai_feedback = Column(JSON)  # Store AI evaluation
    score = Column(Float)
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("User", back_populates="assessments")
    lesson = relationship("Lesson", back_populates="assessments")

class ProgressReport(Base):
    __tablename__ = "progress_reports"

    report_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.user_id"))
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"))
    overall_score = Column(Float)
    weak_areas = Column(JSON)
    recommendations = Column(JSON)
    generated_date = Column(DateTime(timezone=True), server_default=func.now())