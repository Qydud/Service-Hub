import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'

const API = import.meta.env.VITE_API_URL || ''
const SERVICES = [
  { name: 'Клининг', text: 'Регулярная и разовая уборка корпоративных объектов.' },
  { name: 'Ремонт', text: 'Текущий ремонт, обслуживание и восстановление помещений.' },
  { name: 'Электрика', text: 'Монтаж, диагностика и техническое обслуживание.' },
  { name: 'Сантехника', text: 'Установка, ремонт и профилактика инженерных систем.' },
  { name: 'Транспорт', text: 'Организация перевозок и сервисных выездов.' },
  { name: 'Спецтехника', text: 'Техника и оборудование для задач на объектах.' },
  { name: 'Озеленение', text: 'Уход за территорией и благоустройство объектов.' },
]
const STATUS_LABELS = { new: 'Новая', processing: 'В работе', completed: 'Выполнена' }

function Header() {
  return (
    <header className="header">
      <Link className="logo" to="/" aria-label="ServiceHub — главная">
        <span className="logo-mark">S</span>
        <span>Service<span>Hub</span></span>
      </Link>
      <nav aria-label="Основная навигация">
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
  return (
    <footer className="footer">
      <div className="footer-brand">
        <Link className="logo" to="/"><span className="logo-mark">S</span><span>Service<span>Hub</span></span></Link>
        <span>Сервисные услуги для бизнеса</span>
      </div>
      <div className="footer-links">
        <Link to="/services">Услуги</Link>
        <Link to="/contacts">Контакты</Link>
        <span>© {new Date().getFullYear()} ServiceHub</span>
      </div>
    </footer>
  )
}

function Layout({ children }) {
  return <><Header />{children}<Footer /></>
}

function Home() {
  return (
    <Layout>
      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Корпоративный сервис • Казахстан</p>
            <h1>Сервис, который <span>работает</span> на бизнес.</h1>
            <p className="hero-lead">ServiceHub принимает и организует сервисные заявки для объектов, офисов и инфраструктуры — от одной задачи до комплексного обслуживания.</p>
            <div className="hero-actions">
              <Link className="button button-large" to="/application">Оставить заявку <span>→</span></Link>
              <Link className="button-link" to="/services">Посмотреть услуги <span>↓</span></Link>
            </div>
            <div className="hero-note"><span className="status-dot" /> Ответим на заявку и согласуем следующий шаг</div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="visual-grid" />
            <div className="visual-card visual-card-main"><span>01</span><strong>Заявка</strong><small>Принята в работу</small><div className="progress"><i /></div></div>
            <div className="visual-card visual-card-side"><span>ServiceHub</span><strong>Один центр</strong><small>для сервисных задач</small></div>
            <div className="visual-number">SH<span>24</span></div>
          </div>
        </section>

        <section className="trust-strip">
          <div><strong>7</strong><span>сервисных направлений</span></div>
          <div><strong>01</strong><span>единая форма заявки</span></div>
          <div><strong>03</strong><span>понятных статуса</span></div>
          <div><strong>24/7</strong><span>приём обращений онлайн</span></div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div><p className="eyebrow">Почему ServiceHub</p><h2>Всё необходимое<br />для объекта — в одном месте.</h2></div>
            <p>Мы превращаем разрозненные сервисные задачи в понятный процесс: заявка, назначение работы, выполнение и контроль результата.</p>
          </div>
          <div className="cards three feature-cards">
            <article><span className="feature-icon">01</span><h3>Одна заявка</h3><p>Все данные об объекте, задаче и контакте собираются в одной форме.</p></article>
            <article><span className="feature-icon">02</span><h3>Понятный статус</h3><p>Заявка проходит путь от новой до выполненной без лишней переписки.</p></article>
            <article><span className="feature-icon">03</span><h3>Комплексный подход</h3><p>Клининг, ремонт, инженерия, транспорт и другие направления под одной системой.</p></article>
          </div>
        </section>

        <section className="section section-dark">
          <div className="section-heading section-heading-light">
            <div><p className="eyebrow">Наши услуги</p><h2>Под задачу.<br />Под объект.</h2></div>
            <Link className="button button-light" to="/services">Все услуги →</Link>
          </div>
          <div className="service-grid">
            {SERVICES.map((service, index) => (
              <Link key={service.name} to={`/application?service=${encodeURIComponent(service.name)}`} className="service-card">
                <span className="service-index">0{index + 1}</span>
                <div><strong>{service.name}</strong><p>{service.text}</p></div>
                <span className="service-arrow">↗</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section about-preview">
          <div className="about-panel">
            <div className="about-panel-top"><span>О компании</span><span>ServiceHub / 01</span></div>
            <div className="about-panel-title">SERVICE<br /><span>HUB</span></div>
            <div className="about-panel-bottom">Сервисные решения<br />для бизнеса</div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">Для бизнеса</p>
            <h2>Надёжный сервис для объектов и команд.</h2>
            <p>ServiceHub создан для централизованного приёма обращений и прозрачной работы с сервисными задачами. Первая версия сайта фокусируется на удобной заявке и понятной обработке обращений.</p>
            <Link className="text-link" to="/about">Подробнее о компании →</Link>
          </div>
        </section>

        <section className="cta">
          <div><p className="eyebrow">Начнём с задачи</p><h2>Нужна сервисная услуга?</h2><p>Опишите задачу — мы свяжемся с вами и обсудим детали.</p></div>
          <Link className="button button-light button-large" to="/application">Оставить заявку <span>→</span></Link>
        </section>
      </main>
    </Layout>
  )
}

function Services() {
  return <Layout><main className="section page"><p className="eyebrow">Услуги</p><h1>Сервисные<br /><span className="accent-text">направления</span></h1><p className="page-lead">Комплексные решения для корпоративных объектов, офисов и инфраструктуры.</p><div className="cards services-list">{SERVICES.map((service, i) => <article key={service.name}><span className="feature-icon">0{i + 1}</span><h2>{service.name}</h2><p>{service.text}</p><Link className="text-link" to={`/application?service=${encodeURIComponent(service.name)}`}>Оставить заявку →</Link></article>)}</div></main></Layout>
}

function About() {
  return <Layout><main className="section page about-page"><p className="eyebrow">О компании</p><h1>ServiceHub — корпоративный сервисный центр.</h1><p className="page-lead">Единая точка приёма заявок на сервисные услуги для бизнеса.</p><div className="about-content"><div className="prose"><p>Мы принимаем заявки на обслуживание объектов и организуем выполнение сервисных задач в одном рабочем процессе.</p><p>Наша задача — сделать взаимодействие с сервисом простым, понятным и управляемым: от первого обращения до завершения работы.</p></div><div className="about-facts"><div><strong>7</strong><span>направлений</span></div><div><strong>1</strong><span>единая форма</span></div><div><strong>3</strong><span>статуса заявки</span></div></div></div></main></Layout>
}

function Contacts() {
  return <Layout><main className="section page"><p className="eyebrow">Контакты</p><h1>Свяжитесь<br /><span className="accent-text">с нами</span></h1><p className="page-lead">Расскажите о задаче удобным способом или сразу оставьте заявку.</p><div className="contact-grid"><div><span>Телефон</span><strong>+7 (___) ___-__-__</strong><small>Пн–Пт, рабочее время</small></div><div><span>Email</span><strong>info@service-hub.kz</strong><small>Ответим на ваше обращение</small></div><div><span>Адрес</span><strong>Казахстан</strong><small>Работаем с корпоративными объектами</small></div></div><Link className="button button-large" to="/application">Оставить заявку →</Link></main></Layout>
}

function Application() {
  const params = new URLSearchParams(window.location.search)
  const [form, setForm] = useState({ company: '', contact_name: '', phone: '', email: '', object_address: '', service: params.get('service') || '', description: '', photo: null })
  const [photoUrl, setPhotoUrl] = useState('')
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true); setMessage('')
    try {
      const data = new FormData(); data.append('file', file)
      const response = await fetch(`${API}/api/uploads/image`, { method: 'POST', body: data })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Не удалось загрузить фото')
      setPhotoUrl(result.url)
    } catch (error) { setMessage(error.message) } finally { setUploading(false) }
  }

  async function submit(event) {
    event.preventDefault(); setState('loading'); setMessage('')
    try {
      const response = await fetch(`${API}/api/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, photo: photoUrl || null }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Проверьте данные формы')
      setState('success'); setMessage(`Заявка №${result.application.id} принята. Мы свяжемся с вами.`)
      setForm({ company: '', contact_name: '', phone: '', email: '', object_address: '', service: '', description: '', photo: null }); setPhotoUrl('')
    } catch (error) { setState('error'); setMessage(error.message) }
  }

  return <Layout><main className="section page application-page"><div className="application-intro"><p className="eyebrow">Форма заявки</p><h1>Расскажите<br /><span className="accent-text">о задаче.</span></h1><p>Заполните форму — менеджер получит заявку и свяжется с вами для уточнения деталей.</p></div><form className="application-form" onSubmit={submit}><div className="form-section"><span>01</span><h2>Контактные данные</h2></div><label>Компания *<input name="company" value={form.company} onChange={change} required placeholder="Название компании" /></label><label>Контактное лицо *<input name="contact_name" value={form.contact_name} onChange={change} required placeholder="Имя и фамилия" /></label><label>Телефон *<input name="phone" value={form.phone} onChange={change} required placeholder="+7 (___) ___-__-__" /></label><label>Email *<input type="email" name="email" value={form.email} onChange={change} required placeholder="name@company.kz" /></label><div className="form-section"><span>02</span><h2>Данные объекта</h2></div><label>Адрес объекта *<input name="object_address" value={form.object_address} onChange={change} required placeholder="Город, улица, объект" /></label><label>Услуга *<select name="service" value={form.service} onChange={change} required><option value="">Выберите услугу</option>{SERVICES.map((service) => <option key={service.name}>{service.name}</option>)}</select></label><label>Описание задачи<textarea name="description" value={form.description} onChange={change} rows="7" placeholder="Опишите задачу, объём работ и пожелания" /></label><label>Фото объекта<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadPhoto(e.target.files?.[0])} /></label>{uploading && <p className="file-ok">Загрузка фото…</p>}{photoUrl && !uploading && <p className="file-ok">✓ Фото загружено</p>}<div className="form-submit"><button className="button button-large" disabled={state === 'loading' || uploading}>{state === 'loading' ? 'Отправка…' : 'Отправить заявку →'}</button><span>Нажимая кнопку, вы отправляете данные для обработки заявки.</span></div>{message && <div className={state === 'success' ? 'notice success' : 'notice error'}>{message}</div>}</form></main></Layout>
}

function AdminLogin() {
  const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  async function submit(e) { e.preventDefault(); setError(''); try { const r = await fetch(`${API}/api/admin/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }); const data = await r.json(); if (!r.ok) throw new Error(data.detail || 'Ошибка входа'); localStorage.setItem('servicehub_admin_token', data.access_token); navigate('/admin') } catch (error) { setError(error.message) } }
  return <main className="admin-shell"><form className="admin-login" onSubmit={submit}><p className="eyebrow">ServiceHub</p><h1>Администратор</h1><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required /><input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required /><button className="button">Войти</button>{error && <div className="notice error">{error}</div>}</form></main>
}

function Admin() {
  const navigate = useNavigate(); const [apps, setApps] = useState([]); const [query, setQuery] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('servicehub_admin_token')
  useEffect(() => { if (!token) { navigate('/admin/login'); return } fetch(`${API}/api/admin/applications`, { headers: { Authorization: `Bearer ${token}` } }).then(async r => { if (r.status === 401 || r.status === 403) { localStorage.removeItem('servicehub_admin_token'); navigate('/admin/login'); return null } const data = await r.json(); if (!r.ok) throw new Error(data.detail || 'Не удалось загрузить заявки'); return data }).then(data => { if (data) setApps(data) }).catch(() => setError('Не удалось загрузить заявки')).finally(() => setLoading(false)) }, [navigate, token])
  const filteredApps = useMemo(() => { const value = query.trim().toLowerCase(); if (!value) return apps; return apps.filter(a => [a.id, a.company, a.contact_name, a.phone, a.email, a.object_address, a.service, a.status_label].some(field => String(field ?? '').toLowerCase().includes(value))) }, [apps, query])
  async function status(id, value) { const r = await fetch(`${API}/api/admin/applications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: value }) }); if (r.ok) { const updated = await r.json(); setApps(current => current.map(a => a.id === id ? updated : a)) } }
  async function remove(id) { if (!window.confirm('Удалить заявку?')) return; const r = await fetch(`${API}/api/admin/applications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (r.ok) setApps(current => current.filter(a => a.id !== id)) }
  return <main className="admin-shell admin-page"><div className="admin-top"><div><p className="eyebrow">Панель администратора</p><h1>Заявки</h1></div><button className="button button-ghost" onClick={() => { localStorage.removeItem('servicehub_admin_token'); navigate('/admin/login') }}>Выйти</button></div>{error && <div className="notice error">{error}</div>}<div className="admin-toolbar"><input className="admin-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск по компании, контакту, телефону, email, услуге или адресу" /><span className="admin-count">Найдено: {filteredApps.length}</span></div><div className="table-wrap">{loading ? <p className="empty">Загрузка заявок…</p> : <><table><thead><tr><th>ID</th><th>Компания</th><th>Контакт</th><th>Услуга</th><th>Адрес</th><th>Статус</th><th></th></tr></thead><tbody>{filteredApps.map(a => <tr key={a.id}><td>#{a.id}</td><td><strong>{a.company}</strong><br />{a.email}<br />{a.phone}</td><td>{a.contact_name}</td><td>{a.service}</td><td>{a.object_address}<br />{a.description && <small>{a.description}</small>}</td><td><select value={a.status} onChange={e => status(a.id, e.target.value)}>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></td><td><button className="danger" onClick={() => remove(a.id)}>Удалить</button></td></tr>)}</tbody></table>{!filteredApps.length && <p className="empty">Заявок по вашему запросу нет.</p>}</>}</div></main>
}

export default function App() {
  return <Routes><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<Admin />} /><Route path="/" element={<Home />} /><Route path="/services" element={<Services />} /><Route path="/about" element={<About />} /><Route path="/contacts" element={<Contacts />} /><Route path="/application" element={<Application />} /><Route path="*" element={<Home />} /></Routes>
}
