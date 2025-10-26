import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { lessonService, subjectService } from '../services/api'

export default function TeacherDashboard() {
  const { currentUser, logout } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [formData, setFormData] = useState({
    subject_id: '',
    topic_title: '',
    summary_content: ''
  })

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      const subjectsData = await subjectService.getSubjects()
      setSubjects(subjectsData)
      if (subjectsData.length > 0) {
        setFormData(prev => ({ ...prev, subject_id: subjectsData[0].subject_id }))
      }
    } catch (error) {
      console.error('Error loading subjects:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await lessonService.createLesson(formData)
      alert('Lesson created successfully!')
      setFormData({
        subject_id: subjects[0]?.subject_id || '',
        topic_title: '',
        summary_content: ''
      })
      setShowLessonForm(false)
    } catch (error) {
      console.error('Error creating lesson:', error)
      alert('Error creating lesson. Please try again.')
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {currentUser?.username}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowLessonForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Lesson
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Subjects</h3>
              <p className="text-3xl font-bold text-blue-600">{subjects.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Students</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Lessons Created</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>

          {/* Subjects List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Available Subjects</h2>
            </div>
            <div className="p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map(subject => (
                  <div key={subject.subject_id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg">{subject.subject_name}</h3>
                    <p className="text-gray-600 text-sm mt-1">Class 12 - CBSE</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Creation Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Lesson</h2>
                <button
                  onClick={() => setShowLessonForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(subject => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic Title
                  </label>
                  <input
                    type="text"
                    name="topic_title"
                    value={formData.topic_title}
                    onChange={handleChange}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the topic title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Summary
                  </label>
                  <textarea
                    name="summary_content"
                    value={formData.summary_content}
                    onChange={handleChange}
                    required
                    rows="8"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide a detailed summary of what was taught in class. This will be used by AI to generate assessment questions..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLessonForm(false)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}