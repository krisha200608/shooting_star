from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str
    field_of_interest: str
    grade_level: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    subject_id: int
    topic_title: str
    summary_content: str
    keywords: List[str]

class LessonCreate(LessonBase):
    pass

class LessonResponse(LessonBase):
    lesson_id: int
    teacher_id: int
    date_conducted: datetime

    class Config:
        from_attributes = True

class AssessmentRequest(BaseModel):
    student_id: int
    lesson_id: int
    subject: str

class Question(BaseModel):
    question: str
    type: str  # mcq, short_answer, long_answer

class MCQQuestion(Question):
    options: List[str]
    correct_answer: str

class ShortAnswerQuestion(Question):
    expected_keywords: List[str]

class LongAnswerQuestion(Question):
    evaluation_criteria: List[str]

class AssessmentQuestions(BaseModel):
    mcq: List[MCQQuestion]
    short_answer: List[ShortAnswerQuestion]
    long_answer: LongAnswerQuestion

class StudentAnswer(BaseModel):
    question_id: str
    answer: str

class AssessmentSubmission(BaseModel):
    assessment_id: int
    student_answers: List[StudentAnswer]

class AssessmentResponse(BaseModel):
    assessment_id: int
    questions: AssessmentQuestions
    score: Optional[float] = None
    feedback: Optional[Dict[str, Any]] = None

class Token(BaseModel):
    access_token: str
    token_type: str