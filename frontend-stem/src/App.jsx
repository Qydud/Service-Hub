import { useEffect, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const API = import.meta.env.VITE_API_URL || ''
const SERVICES = ['Клининг', 'Ремонт', 'Электрика', 'Сантехника', 'Транспорт', 'Спецтехника', 'Озеленение']
const STATUS_LABELS = { new: 'Новая', processing: 'В работе', completed: 'Выполнена' }

function Header() {
  return (
    <header className="header">
      <Link className="logo" to="/">ServiceHub</Link>
      <nav>
        <NavLink to="/">Главная</NavLink>
        <NavLink to="/services">Услуги</NavLink>
        <NavLink to="/about">О компании</NavLink>
        <NavLink to="/contacts">Контакты</NavLink>
      </nav>
      <Link className="button button-small" to="/application">Оставить заявку</Link>
    </header>
  )
}

function Footer() {
  return <footer className="footer"><div><strong>ServiceHub</strong><span>Сервисные услуги для бизнеса</span></div><div>© {new Date().getFullYear()} ServiceHub</div></footer>
}

function Layout({ children }) {
  return <><Header />{children}<Footer /></>
}

function Home() {
  return (
    <Layout>
      <main>
        <section className="hero"><div className="hero-content"><p className="eyebrow">Корпоративный сервис</p><h1>ServiceHub</h1><p>Единая точка приёма заявок на сервисные услуги для бизнеса.</p><Link className="button" to="/application">Оставить заявку</Link></div></section>
        <section className="section"><p className="eyebrow">Почему ServiceHub</p><h2>Сервис без лишних процессов</h2><div className="cards three"><article><b>01</b><h3>Одна заявка</h3><p>Все необходимые данные об объекте и задаче собираются в одной форме.</p></article><article><b>02</b><h3>Понятный статус</h3><p>Заявка проходит путь от новой до выполненной с контролем менеджера.</p></article><article><b>03</b><h3>Комплексный подход</h3><p>От клининга и ремонта до транспорта и спецтехники.</p></article></div></section>
        <section className="section section-dark"><p className="eyebrow">Наши услуги</p><h2>Что мы делаем</h2><div className="service-grid">{SERVICES.map((service) => <Link key={service} to={`/application?service=${encodeURIComponent(service)}`} className="service-card">{service}<span>→</span></Link>)}</div></section>
        <section className="section split"><div><p className="eyebrow">Для бизнеса</p><h2>Надёжный сервис для объектов и команд</h2></div><p>ServiceHub создан для централизованного приёма обращений, прозрачной работы с заявками и дальнейшего развития в полноценную сервисную платформу.</p></section>
        <section className="cta"><h2>Нужна услуга?</h2><p>Оставьте заявку — менеджер свяжется с вами.</p><Link className="button button-light" to="/application">Оставить заявку</Link></section>
      </main>
    </Layout>
  )
}

function Services() {
  return <Layout><main className="section page"><p className="eyebrow">Услуги</p><h1>Сервисные направления</h1><div className="cards two">{SERVICES.map((service, i) => <article key={service}><b>0{i + 1}</b><h2>{service}</h2><p>Профессиональное выполнение работ для корпоративных объектов и инфраструктуры.</p><Link className="text-link" to={`/application?service=${encodeURIComponent(service)}`}>Оставить заявку →</Link></article>)}</div></main></Layout>
}

function About() {
  return <Layout><main className="section page"><p className="eyebrow">О компании</p><h1>ServiceHub — корпоративный сервисный центр</h1><div className="prose"><p>Мы принимаем заявки на обслуживание объектов и организуем выполнение сервисных задач в одном рабочем процессе.</p><p>Первая версия сайта сфокусирована на понятной презентации услуг, удобной форме заявки и административной панели для обработки обращений.</p></div></main></Layout>
}

function Contacts() {
  return <Layout><main className="section page"><p className="eyebrow">Контакты</p><h1>Свяжитесь с нами</h1><div className="contact-grid"><div><span>Телефон</span><strong>+7 (___) ___-__-__</strong></div><div><span>Email</span><strong>info@service-hub.kz</strong></div><div><span>Адрес</span><strong>Казахстан</strong></div></div><Link className="button" to="/application">Оставить заявку</Link></main></Layout>
}

function Application() {
  const params = new URLSearchParams(window.location.search)
  const [form, setForm] = useState({ company: '', contact_name: '', phone: '', email: '', object_address: '', service: params.get('service') || '', description: '', photo: null })
  const [photoUrl, setPhotoUrl] = useState('')
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function uploadPhoto(file) {
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    const response = await fetch(`${API}/api/uploads/image`, { method: 'POST', body: data })
    if (!response.ok) throw new Error('Не удалось загрузить фото')
    const result = await response.json()
    setPhotoUrl(result.url)
  }

  async function submit(event) {
    event.preventDefault()
    setState('loading'); setMessage('')
    try {
      const response = await fetch(`${API}/api/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, photo: photoUrl || null }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Проверьте данные формы')
      setState('success'); setMessage(`Заявка №${result.application.id} принята. Мы свяжемся с вами.`)
      setForm({ company: '', contact_name: '', phone: '', email: '', object_address: '', service: '', description: '', photo: null }); setPhotoUrl('')
    } catch (error) { setState('error'); setMessage(error.message) }
  }

  return <Layout><main className="section page"><p className="eyebrow">Форма заявки</p><h1>Оставить заявку</h1><form className="application-form" onSubmit={submit}><label>Компания *<input name="company" value={form.company} onChange={change} required /></label><label>Контактное лицо *<input name="contact_name" value={form.contact_name} onChange={change} required /></label><label>Телефон *<input name="phone" value={form.phone} onChange={change} required /></label><label>Email *<input type="email" name="email" value={form.email} onChange={change} required /></label><label>Адрес объекта *<input name="object_address" value={form.object_address} onChange={change} required /></label><label>Услуга *<select name="service" value={form.service} onChange={change} required><option value="">Выберите услугу</option>{SERVICES.map((service) => <option key={service}>{service}</option>)}</select></label><label>Описание<textarea name="description" value={form.description} onChange={change} rows="6" placeholder="Опишите задачу, объём и пожелания" /></label><label>Фото объекта<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadPhoto(e.target.files?.[0]).catch((err) => setMessage(err.message))} /></label>{photoUrl && <p className="file-ok">Фото загружено</p>}<button className="button" disabled={state === 'loading'}>{state === 'loading' ? 'Отправка…' : 'Отправить заявку'}</button>{message && <div className={state === 'success' ? 'notice success' : 'notice error'}>{message}</div>}</form></main></Layout>
}

function AdminLogin() {
  const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  async function submit(e) { e.preventDefault(); setError(''); const r = await fetch(`${API}/api/admin/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await r.json(); if (!r.ok) return setError(data.detail || 'Ошибка входа'); localStorage.setItem('servicehub_admin_token', data.access_token); navigate('/admin') }
  return <main className="admin-shell"><form className="admin-login" onSubmit={submit}><p className="eyebrow">ServiceHub</p><h1>Администратор</h1><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required /><button className="button">Войти</button>{error && <div className="notice error">{error}</div>}</form></main>
}

function Admin() {
  const navigate = useNavigate(); const [apps, setApps] = useState([]); const [error, setError] = useState('')
  const token = localStorage.getItem('servicehub_admin_token')
  useEffect(() => { if (!token) return navigate('/admin/login'); fetch(`${API}/api/admin/applications`, { headers: { Authorization: `Bearer ${token}` } }).then(async r => { if (r.status === 401 || r.status === 403) { localStorage.removeItem('servicehub_admin_token'); navigate('/admin/login'); return } const data = await r.json(); setApps(data) }).catch(() => setError('Не удалось загрузить заявки')) }, [navigate, token])
  async function status(id, value) { const r = await fetch(`${API}/api/admin/applications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: value }) }); if (r.ok) { const updated = await r.json(); setApps(apps.map(a => a.id === id ? updated : a)) } }
  async function remove(id) { if (!confirm('Удалить заявку?')) return; const r = await fetch(`${API}/api/admin/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setApps(apps.filter(a => a.id !== id)) }
  return <main className="admin-shell admin-page"><div className="admin-top"><div><p className="eyebrow">Панель администратора</p><h1>Заявки</h1></div><button className="button button-ghost" onClick={() => { localStorage.removeItem('servicehub_admin_token'); navigate('/admin/login') }}>Выйти</button></div>{error && <div className="notice error">{error}</div>}<div className="table-wrap"><table><thead><tr><th>ID</th><th>Компания</th><th>Контакт</th><th>Услуга</th><th>Адрес</th><th>Статус</th><th></th></tr></thead><tbody>{apps.map(a => <tr key={a.id}><td>#{a.id}</td><td><strong>{a.company}</strong><br />{a.email}<br />{a.phone}</td><td>{a.contact_name}</td><td>{a.service}</td><td>{a.object_address}</td><td><select value={a.status} onChange={e => status(a.id, e.target.value)}>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td><td><button className="danger" onClick={() => remove(a.id)}>Удалить</button></td></tr>)}</tbody></table>{!apps.length && <p className="empty">Заявок пока нет.</p>}</div></main>
}

export default function App() {
  return <Routes><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<Admin />} /><Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/about" element={<About />} /><Route path="/contacts" element={<Contacts />} /><Route path="/application" element={<Application />} /><Route path="*" element={<Home />} /></Routes>
}
