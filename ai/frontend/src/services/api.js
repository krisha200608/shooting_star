import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }).then(res => res.data),

  register: (userData) => 
    api.post('/api/auth/register', userData).then(res => res.data),

  verifyToken: (token) => 
    api.get('/api/auth/me').then(res => res.data)
}

export const lessonService = {
  createLesson: (lessonData) => 
    api.post('/api/lessons', lessonData).then(res => res.data),

  getLessons: (subjectId) => 
    api.get(`/api/lessons/${subjectId}`).then(res => res.data)
}

export const assessmentService = {
  generateAssessment: (assessmentData) => 
    api.post('/api/assessments/generate', assessmentData).then(res => res.data),

  submitAssessment: (submissionData) => 
    api.post('/api/assessments/submit', submissionData).then(res => res.data)
}

export const guidanceService = {
  getGuidance: (studentId) => 
    api.get(`/api/guidance/${studentId}`).then(res => res.data)
}

export default api