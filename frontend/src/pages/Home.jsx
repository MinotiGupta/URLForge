import { Link } from 'react-router-dom';
import { Zap, BarChart2, Shield, Clock, Tag, QrCode, ArrowRight } from 'lucide-react';
import ShortenForm from '../components/ShortenForm';
import './Home.css';

const FEATURES = [
  { icon: <Zap size={20} />, title: 'Redis Caching', desc: '99% of redirects never touch PostgreSQL. Sub-millisecond response times.' },
  { icon: <BarChart2 size={20} />, title: 'Deep Analytics', desc: 'Track clicks, devices, browsers, countries and referrers in real-time.' },
  { icon: <Shield size={20} />, title: 'Rate Limiting', desc: 'Abuse prevention with per-IP rate limiting built into every endpoint.' },
  { icon: <Clock size={20} />, title: 'Link Expiry', desc: 'Set links to expire in 1, 7, 30 or 90 days. Background cleanup runs hourly.' },
  { icon: <Tag size={20} />, title: 'Custom Aliases', desc: 'short.ly/portfolio, short.ly/github — your brand, your links.' },
  { icon: <QrCode size={20} />, title: 'QR Codes', desc: 'Every link auto-generates a scannable QR code, instantly downloadable.' },
];

const STATS = [
  { value: '< 5ms', label: 'Median redirect' },
  { value: '99%', label: 'Cache hit rate' },
  { value: '100/min', label: 'Rate limit' },
  { value: '10+', label: 'API endpoints' },
];

export default function Home() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="page-container">
          <div className="hero-badge">
            <span className="badge badge-violet animate-pulse-glow">
              <Zap size={10} /> Production-ready
            </span>
          </div>

          <h1 className="hero-title">
            Forge short links.<br />
            <span className="gradient-text">Measure everything.</span>
          </h1>

          <p className="hero-subtitle">
            A production-grade URL shortener built with FastAPI, Redis, PostgreSQL &amp; Docker.
            Analytics, rate limiting, QR codes and Celery workers — all included.
          </p>

          <div className="hero-form card-glass">
            <ShortenForm />
          </div>

          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create free account <ArrowRight size={16} />
            </Link>
            <a href="https://github.com/MinotiGupta/URLForge" target="_blank" rel="noopener" className="btn btn-secondary btn-lg">
              ⭐ View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="page-container">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-value gradient-text">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="page-container">
          <div className="section-header text-center">
            <h2>Everything production needs</h2>
            <p className="text-muted">Built to impress — not just function.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="arch-section">
        <div className="page-container">
          <div className="arch-card card-glass">
            <div className="arch-content">
              <h2>Built like a real system</h2>
              <p className="text-muted">
                Not just a weekend project. URLForge is designed with the same architecture
                patterns used at scale — load balancing, cache layers, background workers, and full observability.
              </p>
              <ul className="arch-list">
                <li><span className="badge badge-violet">FastAPI</span> Async Python backend with OAuth2 JWT auth</li>
                <li><span className="badge badge-cyan">Redis</span> Write-through cache layer for redirect lookups</li>
                <li><span className="badge badge-emerald">PostgreSQL</span> Persistent storage with SQLAlchemy ORM</li>
                <li><span className="badge badge-amber">Celery</span> Scheduled worker to purge expired links</li>
                <li><span className="badge badge-rose">Prometheus</span> Metrics endpoint at /metrics</li>
              </ul>
            </div>
            <div className="arch-diagram">
              <pre className="arch-pre">{`
         Users
           │
       Nginx (80)
      /         \\
 Frontend    FastAPI
              /     \\
          Redis    PostgreSQL
              \\
          Celery Worker`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="page-container text-center">
          <h2>Start forging links</h2>
          <p className="text-muted">Free to use. No credit card. Full features.</p>
          <div className="flex justify-center gap-3 mt-6">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
