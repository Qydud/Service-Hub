import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const TOKEN_KEY = 'servicehub_admin_token'

function getErrorMessage(detail, status) {
  if (typeof detail === 'string' && detail.trim()) return detail

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const message = item.msg || item.message || item.detail
          const location = Array.isArray(item.loc) ? item.loc.join('.') : ''
          if (message && location) return `${location}: ${message}`
          if (message) return message
          try {
            return JSON.stringify(item)
          } catch {
            return null
          }
        }
        return null
      })
      .filter(Boolean)

    if (messages.length) return messages.join('; ')
  }

  if (detail && typeof detail === 'object') {
    const message = detail.msg || detail.message || detail.detail
    if (typeof message === 'string' && message.trim()) return message

    try {
      return JSON.stringify(detail)
    } catch {
      return `Ошибка ${status}`
    }
  }

  return `Ошибка ${status}`
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error('Сервер вернул неожиданный ответ.')
  }

  if (!response.ok) throw new Error(getErrorMessage(data?.detail, response.status))
  return data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadCurrentAdmin = async (token) => {
    const data = await request('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!data?.is_admin) throw new Error('Доступ запрещён.')
    setUser(data)
    return data
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    loadCurrentAdmin(token)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await request('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(TOKEN_KEY, data.access_token)
    return loadCurrentAdmin(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isAdmin: user?.is_admin === true,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
