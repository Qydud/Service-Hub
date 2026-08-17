import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLoginPage.css'

export default function AdminLoginPage() {
  const { isAuthenticated, isAdmin, loading, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated && isAdmin) navigate('/admin', { replace: true })
  }, [loading, isAuthenticated, isAdmin, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email.trim().toLowerCase(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err?.message || 'Не удалось выполнить вход.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="alog-wrapper"><div className="alog-card"><p className="alog-checking">Проверка сессии…</p></div></div>
  }

  return (
    <main className="alog-wrapper">
      <section className="alog-card" aria-labelledby="admin-login-title">
        <div className="alog-brand">
          <span className="alog-brand-mark">SH</span>
          <span>Service<span>Hub</span></span>
        </div>
        <p className="alog-kicker">ServiceHub / Admin</p>
        <h1 id="admin-login-title">Панель администратора</h1>
        <p className="alog-description">Войдите, чтобы просматривать заявки и менять их статус.</p>

        <form className="alog-form" onSubmit={handleSubmit} noValidate>
          <label className="alog-field">
            <span>Email администратора</span>
            <input
              type="email"
              autoComplete="username"
              placeholder="admin@service-hub.kz"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={submitting}
            />
          </label>

          <label className="alog-field">
            <span>Пароль</span>
            <div className="alog-password">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Введите пароль"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                disabled={submitting}
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </label>

          {error && <div className="alog-error" role="alert">{error}</div>}

          <button className="alog-submit" type="submit" disabled={submitting}>
            {submitting ? 'Вход…' : 'Войти в панель'}
          </button>
        </form>

        <a className="alog-back" href="/">← Вернуться на сайт</a>
      </section>
    </main>
  )
}
