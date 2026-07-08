import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import ShortenForm from '../components/ShortenForm';
import './Home.css';

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
    </main>
  );
}
