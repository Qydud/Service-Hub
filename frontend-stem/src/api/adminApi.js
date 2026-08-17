const TOKEN_KEY = 'servicehub_admin_token'

function headers() {
  const token = localStorage.getItem(TOKEN_KEY)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function adminFetch(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { ...headers(), ...(options.headers || {}) } })
  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { throw new Error('Сервер вернул неожиданный ответ.') }

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    throw new Error('Сессия администратора истекла. Войдите снова.')
  }
  if (!response.ok) throw new Error(data?.detail || `Ошибка ${response.status}`)
  return data
}

export function adminGetApplications() {
  return adminFetch('/api/admin/applications')
}

export function adminUpdateApplicationStatus(id, status) {
  return adminFetch(`/api/admin/applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function adminDeleteApplication(id) {
  return adminFetch(`/api/admin/applications/${id}`, { method: 'DELETE' })
}
