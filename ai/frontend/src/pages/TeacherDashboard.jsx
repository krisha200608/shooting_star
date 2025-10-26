import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { lessonService } from '../services/api'

const SUBJECTS = [
  { id: 1, name: 'English' },
  { id: 2, name: 'Mathematics' },
  { id: 3, name: 'Accounts' },
  { id: 4, name: 'Economics' },
  { id: 5, name: 'Business Studies' },
  { id: 6, name: 'Physical Education' }
]

export default function TeacherDashboard() {
  const { currentUser } = useAuth()
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [formData, setFormData] = useState({
    subject_id: 1,
    topic_title: '',
    summary_content: '',
    keywords: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await lessonService.createLesson({
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim())
      })
      alert('Lesson created successfully!')
      setFormData({
        subject_id: 1,
        topic_title: '',
        summary_content: '',
        keywords: ''
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Teacher Dashboard
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Welcome, {currentUser?.username}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => setShowLessonForm(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create New Lesson
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-200">
              View Student Progress
            </button>
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition duration-200">
              Generate Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="font-medium">Mathematics Assessment</p>
              <p className="text-sm text-gray-600">25 students completed</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium">Economics Lesson</p>
              <p className="text-sm text-gray-600">Created 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Creation Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Create New Lesson</h2>
                <button
                  onClick={() => setShowLessonForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
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
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {SUBJECTS.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., demand, supply, market equilibrium, elasticity"
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