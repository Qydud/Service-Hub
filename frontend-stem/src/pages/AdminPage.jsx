import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminDeleteApplication, adminGetApplications, adminUpdateApplicationStatus } from '../api/adminApi'
import './AdminPage.css'

const STATUS = {
  new: { label: 'Новая', className: 'status-new' },
  processing: { label: 'В работе', className: 'status-processing' },
  completed: { label: 'Выполнена', className: 'status-completed' },
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(String(value).replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export default function AdminPage() {
  const { user, logout, isAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [loadingApps, setLoadingApps] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const loadApplications = useCallback(async () => {
    setLoadingApps(true)
    setError('')
    try {
      const data = await adminGetApplications()
      setApplications(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err.message.includes('Сессия')) {
        logout()
        navigate('/admin/login', { replace: true })
      } else setError(err.message)
    } finally {
      setLoadingApps(false)
    }
  }, [logout, navigate])

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/admin/login', { replace: true })
  }, [loading, isAdmin, navigate])

  useEffect(() => {
    if (!loading && isAdmin) loadApplications()
  }, [loading, isAdmin, loadApplications])

  const counts = useMemo(() => ({
    all: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    processing: applications.filter(a => a.status === 'processing').length,
    completed: applications.filter(a => a.status === 'completed').length,
  }), [applications])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applications.filter((item) => {
      if (filter !== 'all' && item.status !== filter) return false
      if (!query) return true
      return [item.company, item.contact_name, item.phone, item.email, item.object_address, item.service]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(query))
    })
  }, [applications, filter, search])

  async function changeStatus(id, status) {
    setUpdatingId(id)
    setError('')
    try {
      const updated = await adminUpdateApplicationStatus(id, status)
      setApplications(items => items.map(item => item.id === id ? updated : item))
      setSelected(item => item?.id === id ? updated : item)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function removeApplication(id) {
    if (!window.confirm(`Удалить заявку №${id}? Это действие нельзя отменить.`)) return
    setUpdatingId(id)
    try {
      await adminDeleteApplication(id)
      setApplications(items => items.filter(item => item.id !== id))
      setSelected(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading || (!isAdmin && !error)) return <div className="admin-screen"><div className="admin-loading">Проверка доступа…</div></div>

  return (
    <div className="admin-screen">
      <header className="admin-topbar">
        <div className="admin-brand"><span className="admin-brand-mark">SH</span><div><strong>ServiceHub</strong><small>Панель администратора</small></div></div>
        <div className="admin-user"><span>{user?.email}</span><button onClick={() => { logout(); navigate('/admin/login', { replace: true }) }}>Выйти</button></div>
      </header>

      <main className="admin-main">
        <div className="admin-heading">
          <div><p className="admin-kicker">Управление заявками</p><h1>Заявки</h1><p>Все обращения с сайта в одном рабочем списке.</p></div>
          <button className="admin-refresh" onClick={loadApplications} disabled={loadingApps}>{loadingApps ? 'Обновление…' : '↻ Обновить'}</button>
        </div>

        <div className="admin-stats">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}><b>{counts.all}</b><span>Все заявки</span></button>
          <button className={filter === 'new' ? 'active' : ''} onClick={() => setFilter('new')}><b>{counts.new}</b><span>Новые</span></button>
          <button className={filter === 'processing' ? 'active' : ''} onClick={() => setFilter('processing')}><b>{counts.processing}</b><span>В работе</span></button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}><b>{counts.completed}</b><span>Выполненные</span></button>
        </div>

        <div className="admin-toolbar">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по компании, контакту, телефону…" />
          <span>{visible.length} из {applications.length}</span>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <section className="admin-table-card">
          {loadingApps ? <div className="admin-empty">Загрузка заявок…</div> : visible.length === 0 ? <div className="admin-empty"><strong>Заявок не найдено</strong><span>Измените фильтр или отправьте новую заявку с сайта.</span></div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>№</th><th>Дата</th><th>Компания / контакт</th><th>Услуга</th><th>Объект</th><th>Статус</th><th /></tr></thead>
                <tbody>
                  {visible.map(item => {
                    const status = STATUS[item.status] || STATUS.new
                    return <tr key={item.id} onClick={() => setSelected(item)}>
                      <td><b>#{item.id}</b></td>
                      <td>{formatDate(item.created_at)}</td>
                      <td><strong>{item.company || '—'}</strong><small>{item.contact_name || item.phone || '—'}</small></td>
                      <td>{item.service || '—'}</td>
                      <td>{item.object_address || '—'}</td>
                      <td onClick={e => e.stopPropagation()}><select className={`admin-status ${status.className}`} value={item.status} disabled={updatingId === item.id} onChange={e => changeStatus(item.id, e.target.value)}><option value="new">Новая</option><option value="processing">В работе</option><option value="completed">Выполнена</option></select></td>
                      <td><button className="row-open" onClick={() => setSelected(item)}>Открыть</button></td>
                    </tr>
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div className="admin-modal-backdrop" onMouseDown={() => setSelected(null)}>
          <aside className="admin-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="admin-modal-head"><div><span>Заявка #{selected.id}</span><h2>{selected.service || 'Сервисная заявка'}</h2></div><button onClick={() => setSelected(null)}>×</button></div>
            <div className="admin-detail-status"><span>Статус</span><select value={selected.status} disabled={updatingId === selected.id} onChange={e => changeStatus(selected.id, e.target.value)}><option value="new">Новая</option><option value="processing">В работе</option><option value="completed">Выполнена</option></select></div>
            <div className="admin-details">
              <div><span>Компания</span><strong>{selected.company || '—'}</strong></div>
              <div><span>Контактное лицо</span><strong>{selected.contact_name || '—'}</strong></div>
              <div><span>Телефон</span><strong>{selected.phone || '—'}</strong></div>
              <div><span>Email</span><strong>{selected.email || '—'}</strong></div>
              <div><span>Адрес объекта</span><strong>{selected.object_address || '—'}</strong></div>
              <div><span>Создана</span><strong>{formatDate(selected.created_at)}</strong></div>
            </div>
            <div className="admin-description"><span>Описание задачи</span><p>{selected.description || 'Описание не указано.'}</p></div>
            {selected.photo && <a className="admin-photo" href={selected.photo} target="_blank" rel="noreferrer">Открыть прикреплённое фото →</a>}
            <div className="admin-modal-actions"><button className="danger" disabled={updatingId === selected.id} onClick={() => removeApplication(selected.id)}>Удалить заявку</button><button onClick={() => setSelected(null)}>Закрыть</button></div>
          </aside>
        </div>
      )}
    </div>
  )
}
