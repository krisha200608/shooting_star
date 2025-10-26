import axios from 'axios'

// For Replit - use current host
const API_BASE_URL = window.location.origin.includes('replit') 
  ? `${window.location.origin}/api` 
  : 'http://localhost:8000/api'

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
    api.post('/auth/login', { email, password }).then(res => res.data),

  register: (userData) => 
    api.post('/auth/register', userData).then(res => res.data),
}

export const lessonService = {
  createLesson: (lessonData) => 
    api.post('/lessons', lessonData).then(res => res.data),

  getLessons: (subjectId) => 
    api.get(`/lessons/${subjectId}`).then(res => res.data)
}

export const assessmentService = {
  generateAssessment: (assessmentData) => 
    api.post('/assessments/generate', assessmentData).then(res => res.data),
}

export const subjectService = {
  getSubjects: () => 
    api.get('/subjects').then(res => res.data)
}

export default api