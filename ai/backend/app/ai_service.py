import google.generativeai as genai
import json
import os
from typing import Dict, List, Any
from .config import settings

class AIService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')

    def generate_questions(self, lesson_content: str, subject: str) -> Dict[str, Any]:
        prompt = f"""
        You are an expert CBSE {subject} teacher for Class 12 students. 
        Based on the following lesson content, generate assessment questions in EXACT JSON format.

        LESSON CONTENT:
        {lesson_content}

        Generate:
        - 5 MCQ questions with 4 options each and clear correct answer
        - 2 short answer questions (expecting 2-3 sentence answers) with expected keywords
        - 1 long answer question (expecting paragraph answer) with evaluation criteria

        CRITICAL: Respond ONLY with valid JSON in this exact structure:
        {{
            "mcq": [
                {{
                    "question": "clear question text",
                    "options": ["option A", "option B", "option C", "option D"],
                    "correct_answer": "exact option text"
                }}
            ],
            "short_answer": [
                {{
                    "question": "clear question text", 
                    "expected_keywords": ["keyword1", "keyword2", "keyword3"]
                }}
            ],
            "long_answer": {{
                "question": "comprehensive question text",
                "evaluation_criteria": ["criterion1", "criterion2", "criterion3", "criterion4"]
            }}
        }}

        Ensure questions are appropriate for Class 12 CBSE level and directly related to the lesson content.
        """

        try:
            response = self.model.generate_content(prompt)
            # Clean the response to extract only JSON
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith('```'):
                response_text = response_text[3:-3].strip()

            return json.loads(response_text)
        except Exception as e:
            print(f"Error generating questions: {e}")
            return self._get_fallback_questions(subject)

    def evaluate_answers(self, questions: Dict, student_answers: Dict, subject: str) -> Dict[str, Any]:
        prompt = f"""
        As a CBSE {subject} expert, evaluate the student's answers professionally.

        QUESTIONS:
        {json.dumps(questions, indent=2)}

        STUDENT ANSWERS:
        {json.dumps(student_answers, indent=2)}

        Provide detailed evaluation in this EXACT JSON format:
        {{
            "scores": {{
                "mcq_score": "X/5",
                "short_answer_score": "Y/2", 
                "long_answer_score": "Z/1",
                "total_score": "Total/8",
                "percentage": "percentage_value"
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
                "short_answer_feedback": [
                    {{
                        "question": "question text",
                        "student_answer": "student's answer", 
                        "keywords_matched": ["matched", "keywords"],
                        "keywords_missed": ["missed", "keywords"],
                        "score": "X/1",
                        "feedback": "constructive feedback"
                    }}
                ],
                "long_answer_feedback": {{
                    "question": "question text",
                    "student_answer": "student's answer",
                    "criteria_evaluation": [
                        {{
                            "criterion": "criterion name",
                            "score": "X/1", 
                            "feedback": "specific feedback"
                        }}
                    ],
                    "overall_feedback": "comprehensive feedback",
                    "total_score": "X/4"
                }}
            }},
            "weak_areas": ["area1", "area2", "area3"],
            "recommendations": [
                "specific study recommendation 1",
                "specific study recommendation 2", 
                "specific study recommendation 3"
            ]
        }}

        Be constructive, educational, and encouraging in feedback.
        """

        try:
            response = self.model.generate_content(prompt)
            response_text = response.text.strip()
            if response_text.startswith('```json'):
                response_text = response_text[7:-3].strip()
            elif response_text.startswith('```'):
                response_text = response_text[3:-3].strip()

            return json.loads(response_text)
        except Exception as e:
            print(f"Error evaluating answers: {e}")
            return self._get_fallback_evaluation()

    def provide_field_guidance(self, field_of_interest: str, performance_data: Dict) -> str:
        prompt = f"""
        Provide career guidance for a Class 12 student interested in {field_of_interest}.

        Student Performance Summary:
        {json.dumps(performance_data, indent=2)}

        Provide comprehensive guidance covering:
        1. Career paths and opportunities in {field_of_interest}
        2. Recommended undergraduate courses
        3. Key skills to develop now
        4. Learning resources and books
        5. Weekly study plan recommendations
        6. Competitive exams to prepare for

        Make it engaging, motivational, and practical for a Class 12 student.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Career guidance for {field_of_interest}. Focus on developing strong fundamentals in your subjects and explore online courses related to your field of interest."

    def _get_fallback_questions(self, subject: str) -> Dict[str, Any]:
        return {
            "mcq": [
                {
                    "question": f"What is the main concept discussed in the {subject} lesson?",
                    "options": ["Basic principles", "Advanced theories", "Practical applications", "Historical context"],
                    "correct_answer": "Basic principles"
                }
            ],
            "short_answer": [
                {
                    "question": "Explain the key concept in 2-3 sentences.",
                    "expected_keywords": ["concept", "explanation", "example"]
                }
            ],
            "long_answer": {
                "question": "Discuss the importance and applications of today's lesson topics.",
                "evaluation_criteria": ["Understanding", "Clarity", "Examples", "Completeness"]
            }
        }

    def _get_fallback_evaluation(self) -> Dict[str, Any]:
        return {
            "scores": {
                "mcq_score": "0/1",
                "short_answer_score": "0/1",
                "long_answer_score": "0/1",
                "total_score": "0/3",
                "percentage": "0%"
            },
            "detailed_feedback": {
                "mcq_feedback": [],
                "short_answer_feedback": [],
                "long_answer_feedback": {}
            },
            "weak_areas": ["Need to review lesson content"],
            "recommendations": ["Review the lesson materials thoroughly"]
        }