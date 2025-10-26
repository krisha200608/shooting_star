import React, { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      setCurrentUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify({
      user_id: response.user_id,
      username: response.username,
      role: response.role
    }))
    setCurrentUser({
      user_id: response.user_id,
      username: response.username,
      role: response.role
    })
    return response
  }

  const register = async (userData) => {
    const response = await authService.register(userData)
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
  }

  const value = {
    currentUser,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}