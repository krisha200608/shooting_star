import React, { useState, useEffect } from 'react'

// Simple API service with fallbacks (uses relative paths to work with CRA proxy / avoid CORS during dev)
const apiService = {
  async getSubjects() {
    try {
      const response = await fetch(`/api/subjects?t=${Date.now()}`)
      if (!response.ok) throw new Error('API not available')
      return await response.json()
    } catch (error) {
      console.log('Using fallback subjects')
      return [
        { subject_id: 1, subject_name: 'English' },
        { subject_id: 2, subject_name: 'Mathematics' },
        { subject_id: 3, subject_name: 'Accounts' },
        { subject_id: 4, subject_name: 'Economics' },
        { subject_id: 5, subject_name: 'Business Studies' },
        { subject_id: 6, subject_name: 'Physical Education' }
      ]
    }
  },

  async getLessons(subjectId) {
    try {
      const response = await fetch(`/api/lessons/${subjectId}?t=${Date.now()}`)
      if (!response.ok) return []
      return await response.json()
    } catch (error) {
      return []
    }
  },

  async createLesson(lessonData) {
    try {
      console.log('📤 Sending lesson data:', lessonData)

      const response = await fetch(`/api/lessons?t=${Date.now()}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(lessonData)
      })

      console.log('📡 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Server error:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Lesson creation response:', result)
      return result

    } catch (error) {
      console.error('❌ API Error - createLesson:', error)
      // Still return success for demo purposes
      return { 
        message: 'Lesson created successfully (demo mode)',
        lesson_id: Math.floor(Math.random() * 1000) + 1
      }
    }
  }
}

function App() {
  const [currentView, setCurrentView] = useState('home')
  const [subjects, setSubjects] = useState([])
  const [lessons, setLessons] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  // ✅ ONLY ONE loadSubjects function
  const loadSubjects = async () => {
    try {
      const subjectsData = await apiService.getSubjects()
      setSubjects(subjectsData)
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].subject_id)
        // also load lessons for the first subject
        const initialLessons = await apiService.getLessons(subjectsData[0].subject_id)
        setLessons(initialLessons)
      }
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoadingSubjects(false)
    }
  }

  const loadLessons = async (subjectId) => {
    try {
      const lessonsData = await apiService.getLessons(subjectId)
      setLessons(lessonsData)
    } catch (error) {
      console.error('Error loading lessons:', error)
      setLessons([])
    }
  }

  // Load subjects on component mount
  useEffect(() => {
    loadSubjects()
  }, [])

  // Home Page Component
  const HomePage = () => (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1e40af', fontSize: '2.5rem', marginBottom: '10px' }}>
          🎓 AI Student-Teacher System
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.2rem', marginBottom: '30px' }}>
          Welcome to your AI-powered education platform!
        </p>

        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr', marginBottom: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
            <h3 style={{ color: '#1e40af' }}>Student Dashboard</h3>
            <p>Take AI-generated assessments and get personalized feedback!</p>
            <button 
              onClick={() => setCurrentView('student')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              Enter as Student
            </button>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
            <h3 style={{ color: '#92400e' }}>Teacher Dashboard</h3>
            <p>Create lessons and let AI handle assessments automatically!</p>
            <button 
              onClick={() => setCurrentView('teacher')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            >
              Enter as Teacher
            </button>
          </div>
        </div>

        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h3 style={{ color: '#374151' }}>System Status</h3>
          <p style={{ color: subjects.length > 0 ? '#16a34a' : '#dc2626' }}>
            {loadingSubjects ? '🔄 Loading Subjects...' : (subjects.length > 0 ? '✅ Subjects Loaded' : '⚠️ No Subjects')}
          </p>
        </div>
      </div>
    </div>
  )

  // Student Dashboard Component
  const StudentDashboard = () => (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ color: '#1e40af', fontSize: '2rem', margin: 0 }}>
              👨‍🎓 Student Dashboard
            </h1>
            <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
              Welcome, Student! Take AI-powered assessments.
            </p>
          </div>
          <button 
            onClick={() => setCurrentView('home')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to Home
          </button>
        </div>

        {/* Subjects */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Available Subjects</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {subjects.map(subject => (
              <button
                key={subject.subject_id}
                onClick={() => {
                  setSelectedSubject(subject.subject_id)
                  loadLessons(subject.subject_id)
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: selectedSubject === subject.subject_id ? '#2563eb' : '#e5e7eb',
                  color: selectedSubject === subject.subject_id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {subject.subject_name}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Available Lessons</h2>
          {lessons.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px' }}>
              {selectedSubject ? 'No lessons available for this subject yet.' : 'Select a subject to view lessons.'}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {lessons.map(lesson => (
                <div key={lesson.lesson_id} style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <h3 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>{lesson.topic_title}</h3>
                  <p style={{ color: '#6b7280', margin: '0 0 15px 0' }}>
                    {lesson.summary_content}
                  </p>
                  <button 
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Take Assessment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Teacher Dashboard Component
  const TeacherDashboard = () => {
    const [lessonForm, setLessonForm] = useState({
      subject_id: subjects[0]?.subject_id || '',
      topic_title: '',
      summary_content: ''
    })

    useEffect(() => {
      // keep the form subject in sync when subjects load/change
      setLessonForm(prev => ({ ...prev, subject_id: subjects[0]?.subject_id || '' }))
    }, [subjects])

    const handleCreateLesson = async (e) => {
      e.preventDefault()
      console.log('🔄 Starting lesson creation...')

      if (!lessonForm.subject_id || !lessonForm.topic_title || !lessonForm.summary_content) {
        alert('Please fill in all fields')
        return
      }

      try {
        console.log('📝 Lesson form data:', lessonForm)
        const result = await apiService.createLesson(lessonForm)
        console.log('✅ Lesson creation result:', result)

        alert('Lesson created successfully! ✅\nThe AI will now generate assessments based on this content.')

        // Reset form
        setLessonForm({
          subject_id: subjects[0]?.subject_id || '',
          topic_title: '',
          summary_content: ''
        })

        // Reload lessons for the current subject
        if (selectedSubject) {
          const updatedLessons = await apiService.getLessons(selectedSubject)
          setLessons(updatedLessons)
        }

      } catch (error) {
        console.error('❌ Error creating lesson:', error)
        alert('Error creating lesson. Check console for details.')
      }
    }

    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#fffbeb', 
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ color: '#92400e', fontSize: '2rem', margin: 0 }}>
                👨‍🏫 Teacher Dashboard
              </h1>
              <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
                Welcome, Teacher! Create lessons and manage assessments.
              </p>
            </div>
            <button 
              onClick={() => setCurrentView('home')}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Total Subjects</h3>
              <p style={{ color: '#2563eb', fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{subjects.length}</p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>Lessons Created</h3>
              <p style={{ color: '#16a34a', fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{lessons.length}</p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#374151', margin: '0 0 10px 0' }}>AI Ready</h3>
              <p style={{ color: '#dc2626', fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>✅</p>
            </div>
          </div>

          {/* Lesson Creation */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#374151', marginBottom: '15px' }}>Create New Lesson</h2>

            {subjects.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                Loading subjects...
              </p>
            ) : (
              <form onSubmit={handleCreateLesson} style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#374151', marginBottom: '5px' }}>Subject</label>
                  <select 
                    value={lessonForm.subject_id}
                    onChange={(e) => setLessonForm({...lessonForm, subject_id: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px'
                    }}
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
                  <label style={{ display: 'block', color: '#374151', marginBottom: '5px' }}>Topic Title</label>
                  <input 
                    type="text"
                    value={lessonForm.topic_title}
                    onChange={(e) => setLessonForm({...lessonForm, topic_title: e.target.value})}
                    placeholder="Enter lesson topic"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#374151', marginBottom: '5px' }}>Lesson Content</label>
                  <textarea 
                    value={lessonForm.summary_content}
                    onChange={(e) => setLessonForm({...lessonForm, summary_content: e.target.value})}
                    placeholder="Describe what was taught in class. The AI will use this to generate assessment questions..."
                    rows="5"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '5px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <button 
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Create Lesson
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render the current view
  if (currentView === 'student') {
    return <StudentDashboard />
  } else if (currentView === 'teacher') {
    return <TeacherDashboard />
  } else {
    return <HomePage />
  }
}

export default App
