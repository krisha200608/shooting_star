from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import auth
import crud
import schemas
from database import get_db
from ai_service import AIService

app = FastAPI(title="AI Student-Teacher System", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI service
ai_service = AIService()

# Authentication endpoints
@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/auth/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

# Lesson endpoints
@app.post("/api/lessons", response_model=schemas.LessonResponse)
def create_lesson(lesson: schemas.LessonCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create lessons")
    return crud.create_lesson(db=db, lesson=lesson, teacher_id=current_user.user_id)

@app.get("/api/lessons/{subject_id}", response_model=List[schemas.LessonResponse])
def get_lessons(subject_id: int, db: Session = Depends(get_db)):
    return crud.get_lessons_by_subject(db, subject_id=subject_id)

# Assessment endpoints
@app.post("/api/assessments/generate")
def generate_assessment(request: schemas.AssessmentRequest, db: Session = Depends(get_db)):
    # Get lesson content
    lesson = crud.get_lesson(db, request.lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Generate questions using AI
    questions = ai_service.generate_questions(lesson.summary_content, lesson.subject.subject_name)

    # Create assessment record
    assessment = crud.create_assessment(
        db=db, 
        student_id=request.student_id,
        lesson_id=request.lesson_id,
        questions=questions
    )

    return {
        "assessment_id": assessment.assessment_id,
        "questions": questions,
        "lesson_topic": lesson.topic_title
    }

@app.post("/api/assessments/submit")
def submit_assessment(submission: schemas.AssessmentSubmission, db: Session = Depends(get_db)):
    # Get assessment and questions
    assessment = crud.get_assessment(db, submission.assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Evaluate answers using AI
    evaluation = ai_service.evaluate_answers(
        assessment.questions, 
        submission.student_answers,
        assessment.lesson.subject.subject_name
    )

    # Update assessment with results
    updated_assessment = crud.update_assessment_results(
        db=db,
        assessment_id=submission.assessment_id,
        student_answers=submission.student_answers,
        ai_feedback=evaluation,
        score=float(evaluation["scores"]["percentage"].strip('%'))
    )

    # Generate progress report
    progress_report = crud.create_progress_report(
        db=db,
        student_id=assessment.student_id,
        subject_id=assessment.lesson.subject_id,
        evaluation_data=evaluation
    )

    return {
        "assessment_id": updated_assessment.assessment_id,
        "evaluation": evaluation,
        "progress_report_id": progress_report.report_id
    }

# Guidance endpoint
@app.get("/api/guidance/{student_id}")
def get_student_guidance(student_id: int, db: Session = Depends(get_db)):
    student = crud.get_user(db, student_id)
    if not student or student.role != "student":
        raise HTTPException(status_code=404, detail="Student not found")

    # Get student performance data
    performance = crud.get_student_performance(db, student_id)

    # Get field guidance
    guidance = ai_service.provide_field_guidance(
        student.field_of_interest,
        performance
    )

    return {
        "field_of_interest": student.field_of_interest,
        "performance_summary": performance,
        "guidance": guidance
    }

@app.get("/")
def read_root():
    return {"message": "AI Student-Teacher System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)