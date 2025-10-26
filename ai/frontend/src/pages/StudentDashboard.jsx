import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { lessonService, assessmentService, guidanceService } from '../services/api'

const SUBJECTS = [
  { id: 1, name: 'English' },
  { id: 2, name: 'Mathematics' },
  { id: 3, name: 'Accounts' },
  { id: 4, name: 'Economics' },
  { id: 5, name: 'Business Studies' },
  { id: 6, name: 'Physical Education' }
]

export default function StudentDashboard() {
  const { currentUser } = useAuth()
  const [lessons, setLessons] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(1)
  const [currentAssessment, setCurrentAssessment] = useState(null)
  const [guidance, setGuidance] = useState('')

  useEffect(() => {
    loadLessons(selectedSubject)
    loadGuidance()
  }, [selectedSubject])

  const loadLessons = async (subjectId) => {
    try {
      const lessonsData = await lessonService.getLessons(subjectId)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Error loading lessons:', error)
    }
  }

  const loadGuidance = async () => {
    try {
      const guidanceData = await guidanceService.getGuidance(currentUser.user_id)
      setGuidance(guidanceData.guidance)
    } catch (error) {
      console.error('Error loading guidance:', error)
    }
  }

  const startAssessment = async (lessonId) => {
    try {
      const assessment = await assessmentService.generateAssessment({
        student_id: currentUser.user_id,
        lesson_id: lessonId,
        subject: SUBJECTS.find(s => s.id === selectedSubject)?.name
      })
      setCurrentAssessment(assessment)
    } catch (error) {
      console.error('Error starting assessment:', error)
    }
  }

  const submitAssessment = async (answers) => {
    try {
      const result = await assessmentService.submitAssessment({
        assessment_id: currentAssessment.assessment_id,
        student_answers: answers
      })
      setCurrentAssessment(null)
      alert('Assessment submitted! Check your progress report.')
    } catch (error) {
      console.error('Error submitting assessment:', error)
    }
  }

  if (currentAssessment) {
    return (
      <AssessmentComponent 
        assessment={currentAssessment}
        onSubmit={submitAssessment}
        onCancel={() => setCurrentAssessment(null)}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {currentUser?.username}!
        </h1>
        <p className="text-lg text-blue-600 mt-2">
          Field of Interest: {currentUser?.field_of_interest}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Subjects & Lessons</h2>

            {/* Subject Selection */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {SUBJECTS.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedSubject === subject.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {subject.name}
                </button>
              ))}
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
              {lessons.map(lesson => (
                <div key={lesson.lesson_id} className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{lesson.topic_title}</h3>
                  <p className="text-gray-600 mb-4">{lesson.summary_content}</p>
                  <button
                    onClick={() => startAssessment(lesson.lesson_id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Take Assessment
                  </button>
                </div>
              ))}
              {lessons.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No lessons available for this subject yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Guidance Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Career Guidance</h2>
          <div className="prose max-w-none">
            {guidance ? (
              <div className="text-gray-700 whitespace-pre-wrap">
                {guidance}
              </div>
            ) : (
              <p className="text-gray-500">Loading guidance...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Assessment Component
function AssessmentComponent({ assessment, onSubmit, onCancel }) {
  const [answers, setAnswers] = useState({})

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      question_id: questionId,
      answer: answer
    }))
    onSubmit(formattedAnswers)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Assessment: {assessment.lesson_topic}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        {/* MCQ Questions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Multiple Choice Questions</h3>
          {assessment.questions.mcq.map((q, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <p className="font-medium mb-3">{index + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={`mcq-${index}`}
                      value={option}
                      onChange={(e) => handleAnswerChange(`mcq-${index}`, e.target.value)}
                      className="text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Short Answer Questions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Short Answer Questions</h3>
          {assessment.questions.short_answer.map((q, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <p className="font-medium mb-3">{index + 1}. {q.question}</p>
              <textarea
                rows="3"
                onChange={(e) => handleAnswerChange(`short-${index}`, e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your answer here (2-3 sentences)..."
              />
            </div>
          ))}
        </div>

        {/* Long Answer Question */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Long Answer Question</h3>
          <div className="p-4 border rounded-lg">
            <p className="font-medium mb-3">{assessment.questions.long_answer.question}</p>
            <textarea
              rows="6"
              onChange={(e) => handleAnswerChange('long', e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your detailed answer here..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  )
}