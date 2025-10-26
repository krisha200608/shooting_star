from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from datetime import datetime, timedelta
import sqlite3
from passlib.context import CryptContext
from jose import JWTError, jwt
from typing import List, Optional, Dict, Any

app = FastAPI(title="AI Student-Teacher System")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple database setup
def init_db():
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # Create tables
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password_hash TEXT,
            role TEXT,
            field_of_interest TEXT,
            grade_level TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS subjects (
            subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_name TEXT UNIQUE,
            cbse_curriculum_link TEXT,
            standard_book_reference TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS lessons (
            lesson_id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER,
            teacher_id INTEGER,
            topic_title TEXT,
            summary_content TEXT,
            date_conducted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS assessments (
            assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            lesson_id INTEGER,
            questions TEXT,
            student_answers TEXT,
            ai_feedback TEXT,
            score REAL,
            assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Insert default subjects
    subjects = [
        ('English', 'https://cbseacademic.nic.in/', 'NCERT Flamingo & Vistas'),
        ('Mathematics', 'https://cbseacademic.nic.in/', 'NCERT Mathematics Part I & II'),
        ('Accounts', 'https://cbseacademic.nic.in/', 'NCERT Accountancy Part I & II'),
        ('Economics', 'https://cbseacademic.nic.in/', 'NCERT Introductory Microeconomics & Macroeconomics'),
        ('Business Studies', 'https://cbseacademic.nic.in/', 'NCERT Business Studies Part I & II'),
        ('Physical Education', 'https://cbseacademic.nic.in/', 'NCERT Physical Education')
    ]

    for subject in subjects:
        c.execute("INSERT OR IGNORE INTO subjects (subject_name, cbse_curriculum_link, standard_book_reference) VALUES (?, ?, ?)", subject)

    conn.commit()
    conn.close()

# Initialize database
init_db()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic models
class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = "student"
    field_of_interest: str = "Computer Science"
    grade_level: str = "12"

class UserLogin(BaseModel):
    email: str
    password: str

class LessonCreate(BaseModel):
    subject_id: int
    topic_title: str
    summary_content: str

class AssessmentRequest(BaseModel):
    student_id: int
    lesson_id: int

class StudentAnswer(BaseModel):
    question_id: str
    answer: str

class AssessmentSubmission(BaseModel):
    assessment_id: int
    student_answers: List[StudentAnswer]

# AI Service - FULL VERSION WITH REAL AI
class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.ai_enabled = True
        else:
            self.model = None
            self.ai_enabled = False
            print("⚠️ Gemini API key not found. Using fallback questions.")

    def generate_questions(self, lesson_content: str, subject: str) -> Dict[str, Any]:
        if not self.ai_enabled:
            return self.get_fallback_questions()

        prompt = f"""
        You are an expert CBSE {subject} teacher for Class 12 students. 
        Based on the following lesson content, generate assessment questions in EXACT JSON format.

        LESSON CONTENT:
        {lesson_content}

        Generate:
        - 2 MCQ questions with 4 options each and clear correct answer
        - 1 short answer question (expecting 2-3 sentence answers)
        - 1 long answer question (expecting paragraph answer)

        CRITICAL: Respond ONLY with valid JSON in this exact structure:
        {{
            "mcq": [
                {{
                    "question": "clear question text",
                    "options": ["option A", "option B", "option C", "option D"],
                    "correct_answer": "exact option text",
                    "question_id": "mcq-1"
                }},
                {{
                    "question": "clear question text", 
                    "options": ["option A", "option B", "option C", "option D"],
                    "correct_answer": "exact option text",
                    "question_id": "mcq-2"
                }}
            ],
            "short_answer": [
                {{
                    "question": "clear question text that requires 2-3 sentences",
                    "question_id": "short-1"
                }}
            ],
            "long_answer": {{
                "question": "comprehensive question text that requires a paragraph answer",
                "question_id": "long-1"
            }}
        }}

        Ensure questions are appropriate for Class 12 CBSE level and directly related to the lesson content.
        Make the questions challenging but fair.
        """

        try:
            print(f"🤖 Generating AI questions for {subject}...")
            response = self.model.generate_content(prompt)

            # Clean the response to extract only JSON
            response_text = response.text.strip()
            print(f"📝 Raw AI response: {response_text[:200]}...")

            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()

            questions_data = json.loads(response_text)
            print("✅ AI questions generated successfully!")
            return questions_data

        except Exception as e:
            print(f"❌ AI Error: {e}")
            print("🔄 Using fallback questions...")
            return self.get_fallback_questions(subject)

    def evaluate_answers(self, questions: Dict, student_answers: List[Dict], subject: str) -> Dict[str, Any]:
        if not self.ai_enabled:
            return self.get_fallback_evaluation()

        # Convert student answers to dict for easier processing
        answers_dict = {answer['question_id']: answer['answer'] for answer in student_answers}

        prompt = f"""
        As a CBSE {subject} expert, evaluate the student's answers professionally.

        QUESTIONS:
        {json.dumps(questions, indent=2)}

        STUDENT ANSWERS:
        {json.dumps(answers_dict, indent=2)}

        Provide detailed evaluation in this EXACT JSON format:
        {{
            "scores": {{
                "mcq_score": "X/2",
                "short_answer_score": "Y/1", 
                "long_answer_score": "Z/1",
                "total_score": "Total/4",
                "percentage": "percentage_value%"
            }},
            "detailed_feedback": {{
                "mcq_feedback": [
                    {{
                        "question": "question text",
                        "student_answer": "student's answer",
                        "correct_answer": "correct answer", 
                        "is_correct": true/false,
                        "explanation": "brief explanation"
                    }}
                ],
                "short_answer_feedback": {{
                    "question": "question text",
                    "student_answer": "student's answer", 
                    "score": "X/1",
                    "feedback": "constructive feedback on content and understanding"
                }},
                "long_answer_feedback": {{
                    "question": "question text",
                    "student_answer": "student's answer",
                    "score": "X/1",
                    "feedback": "comprehensive feedback on depth, clarity, and understanding"
                }}
            }},
            "weak_areas": ["area1", "area2"],
            "recommendations": [
                "specific study recommendation 1",
                "specific study recommendation 2"
            ]
        }}

        Be constructive, educational, and encouraging in feedback.
        Calculate percentage based on total_score (e.g., 3/4 = 75%).
        """

        try:
            print("🤖 Evaluating answers with AI...")
            response = self.model.generate_content(prompt)

            response_text = response.text.strip()
            print(f"📝 Raw AI evaluation: {response_text[:200]}...")

            if '```json' in response_text:
                response_text = response_text.split('```json')[1].split('```')[0].strip()
            elif '```' in response_text:
                response_text = response_text.split('```')[1].split('```')[0].strip()

            evaluation = json.loads(response_text)
            print("✅ AI evaluation completed!")
            return evaluation

        except Exception as e:
            print(f"❌ AI Evaluation Error: {e}")
            return self.get_fallback_evaluation()

    def provide_field_guidance(self, field_of_interest: str, student_performance: Dict) -> str:
        if not self.ai_enabled:
            return f"Focus on your {field_of_interest} career path. Develop strong fundamentals in your subjects."

        prompt = f"""
        Provide career guidance for a Class 12 student interested in {field_of_interest}.

        Student Performance: {json.dumps(student_performance, indent=2)}

        Provide comprehensive guidance covering:
        1. Career paths and opportunities in {field_of_interest}
        2. Recommended undergraduate courses
        3. Key skills to develop now
        4. Learning resources and books
        5. Weekly study plan recommendations

        Make it engaging, motivational, and practical for a Class 12 student.
        Keep it under 300 words.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Career guidance for {field_of_interest}. Focus on developing strong fundamentals in your subjects and explore online courses related to your field of interest."

    def get_fallback_questions(self, subject: str = "General") -> Dict[str, Any]:
        return {
            "mcq": [
                {
                    "question": f"What is the main concept discussed in this {subject} lesson?",
                    "options": ["Basic principles", "Advanced theories", "Practical applications", "Historical context"],
                    "correct_answer": "Basic principles",
                    "question_id": "mcq-1"
                },
                {
                    "question": f"Which aspect of {subject} was emphasized in the lesson?",
                    "options": ["Theoretical concepts", "Problem-solving", "Case studies", "Mathematical formulas"],
                    "correct_answer": "Theoretical concepts", 
                    "question_id": "mcq-2"
                }
            ],
            "short_answer": [
                {
                    "question": "Explain the key concept from today's lesson in 2-3 sentences.",
                    "question_id": "short-1"
                }
            ],
            "long_answer": {
                "question": "Discuss the importance and real-world applications of the topics covered in today's lesson.",
                "question_id": "long-1"
            }
        }

    def get_fallback_evaluation(self) -> Dict[str, Any]:
        return {
            "scores": {
                "mcq_score": "1/2",
                "short_answer_score": "0/1",
                "long_answer_score": "0/1", 
                "total_score": "1/4",
                "percentage": "25%"
            },
            "detailed_feedback": {
                "mcq_feedback": [
                    {
                        "question": "Sample question",
                        "student_answer": "Student answer",
                        "correct_answer": "Correct answer",
                        "is_correct": False,
                        "explanation": "Review the lesson materials"
                    }
                ],
                "short_answer_feedback": {
                    "question": "Sample question",
                    "student_answer": "Student answer",
                    "score": "0/1",
                    "feedback": "Please provide more detailed explanation"
                },
                "long_answer_feedback": {
                    "question": "Sample question", 
                    "student_answer": "Student answer",
                    "score": "0/1",
                    "feedback": "Expand your answer with more examples and details"
                }
            },
            "weak_areas": ["Concept understanding", "Detailed explanation"],
            "recommendations": ["Review the lesson materials thoroughly", "Practice writing detailed answers"]
        }

ai_service = AIService()

# Routes
@app.get("/")
def home():
    return {"message": "AI Student-Teacher System is running! 🚀", "ai_enabled": ai_service.ai_enabled}

@app.post("/api/auth/register")
def register(user: UserCreate):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # Check if user exists
    c.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_password = pwd_context.hash(user.password)

    # Insert user
    c.execute(
        "INSERT INTO users (username, email, password_hash, role, field_of_interest, grade_level) VALUES (?, ?, ?, ?, ?, ?)",
        (user.username, user.email, hashed_password, user.role, user.field_of_interest, user.grade_level)
    )
    user_id = c.lastrowid
    conn.commit()
    conn.close()

    return {"message": "User created successfully", "user_id": user_id}

@app.post("/api/auth/login")
def login(user_data: UserLogin):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE email = ?", (user_data.email,))
    user = c.fetchone()
    conn.close()

    if not user or not pwd_context.verify(user_data.password, user[3]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create token
    token_data = {"sub": user[2], "user_id": user[0], "role": user[4]}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user[0],
        "username": user[1],
        "role": user[4],
        "field_of_interest": user[5]
    }

@app.post("/api/lessons")
def create_lesson(lesson: LessonCreate):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # For demo, using teacher_id = 1
    c.execute(
        "INSERT INTO lessons (subject_id, teacher_id, topic_title, summary_content) VALUES (?, ?, ?, ?)",
        (lesson.subject_id, 1, lesson.topic_title, lesson.summary_content)
    )
    lesson_id = c.lastrowid
    conn.commit()
    conn.close()

    return {"message": "Lesson created", "lesson_id": lesson_id}

@app.get("/api/lessons/{subject_id}")
def get_lessons(subject_id: int):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    c.execute("""
        SELECT l.*, s.subject_name 
        FROM lessons l 
        JOIN subjects s ON l.subject_id = s.subject_id 
        WHERE l.subject_id = ?
    """, (subject_id,))
    lessons = c.fetchall()
    conn.close()

    return [
        {
            "lesson_id": lesson[0],
            "subject_id": lesson[1],
            "teacher_id": lesson[2],
            "topic_title": lesson[3],
            "summary_content": lesson[4],
            "date_conducted": lesson[5],
            "subject_name": lesson[6]
        }
        for lesson in lessons
    ]

@app.post("/api/assessments/generate")
def generate_assessment(request: AssessmentRequest):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # Get lesson content with subject name
    c.execute("""
        SELECT l.*, s.subject_name 
        FROM lessons l 
        JOIN subjects s ON l.subject_id = s.subject_id 
        WHERE l.lesson_id = ?
    """, (request.lesson_id,))
    lesson = c.fetchone()

    if not lesson:
        conn.close()
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Generate questions using AI
    questions = ai_service.generate_questions(lesson[4], lesson[6])  # summary_content and subject_name

    # Create assessment record
    c.execute(
        "INSERT INTO assessments (student_id, lesson_id, questions) VALUES (?, ?, ?)",
        (request.student_id, request.lesson_id, json.dumps(questions))
    )
    assessment_id = c.lastrowid
    conn.commit()
    conn.close()

    return {
        "assessment_id": assessment_id,
        "questions": questions,
        "lesson_topic": lesson[3],
        "subject": lesson[6],
        "ai_enabled": ai_service.ai_enabled
    }

@app.post("/api/assessments/submit")
def submit_assessment(submission: AssessmentSubmission):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # Get assessment and questions
    c.execute("""
        SELECT a.*, l.summary_content, s.subject_name 
        FROM assessments a 
        JOIN lessons l ON a.lesson_id = l.lesson_id 
        JOIN subjects s ON l.subject_id = s.subject_id 
        WHERE a.assessment_id = ?
    """, (submission.assessment_id,))
    assessment = c.fetchone()

    if not assessment:
        conn.close()
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = json.loads(assessment[3])  # questions are at index 3

    # Evaluate answers using AI
    evaluation = ai_service.evaluate_answers(questions, submission.student_answers, assessment[7])  # subject_name at index 7

    # Calculate score from percentage
    percentage = float(evaluation["scores"]["percentage"].strip('%'))

    # Update assessment with results
    c.execute(
        "UPDATE assessments SET student_answers = ?, ai_feedback = ?, score = ? WHERE assessment_id = ?",
        (json.dumps(submission.student_answers), json.dumps(evaluation), percentage, submission.assessment_id)
    )
    conn.commit()
    conn.close()

    return {
        "assessment_id": submission.assessment_id,
        "evaluation": evaluation,
        "message": "Assessment submitted and evaluated successfully!"
    }

@app.get("/api/subjects")
def get_subjects():
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    c.execute("SELECT * FROM subjects")
    subjects = c.fetchall()
    conn.close()

    return [
        {
            "subject_id": subject[0],
            "subject_name": subject[1],
            "cbse_curriculum_link": subject[2],
            "standard_book_reference": subject[3]
        }
        for subject in subjects
    ]

@app.get("/api/guidance/{student_id}")
def get_student_guidance(student_id: int):
    conn = sqlite3.connect('ai_education.db')
    c = conn.cursor()

    # Get student info
    c.execute("SELECT * FROM users WHERE user_id = ?", (student_id,))
    student = c.fetchone()

    if not student or student[4] != "student":  # role at index 4
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")

    # Get student performance (simplified)
    c.execute("SELECT AVG(score), COUNT(*) FROM assessments WHERE student_id = ?", (student_id,))
    performance_data = c.fetchone()
    conn.close()

    performance = {
        "average_score": performance_data[0] or 0,
        "total_assessments": performance_data[1] or 0,
        "field_of_interest": student[5]  # field_of_interest at index 5
    }

    # Get AI guidance
    guidance = ai_service.provide_field_guidance(student[5], performance)

    return {
        "field_of_interest": student[5],
        "performance": performance,
        "guidance": guidance,
        "ai_enabled": ai_service.ai_enabled
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "SQLite - Working", 
        "ai_service": "Enabled" if ai_service.ai_enabled else "Disabled - No API Key",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Student-Teacher System...")
    print(f"🤖 AI Service: {'ENABLED' if ai_service.ai_enabled else 'DISABLED - Check GEMINI_API_KEY in secrets'}")
    uvicorn.run(app, host="0.0.0.0", port=8000)