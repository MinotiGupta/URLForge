import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { urlApi } from '../api';
import { useAuth } from '../context/AuthContext';
import ShortenForm from '../components/ShortenForm';
import LinkCard from '../components/LinkCard';
import { Link2, Plus, Search, TrendingUp, Clock, Zap } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    urlApi.list().then(({ data }) => {
      setLinks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = links.filter(
    (l) =>
      l.original_url.toLowerCase().includes(search.toLowerCase()) ||
      l.short_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalClicks = links.reduce((a, l) => a + l.click_count, 0);
  const activeLinks = links.filter((l) => !l.expires_at || new Date(l.expires_at) > new Date()).length;
  const recentLinks = links.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return (now - d) / 1000 / 60 / 60 / 24 <= 7;
  }).length;

  const onCreated = (link) => {
    setLinks((prev) => [link, ...prev]);
    setShowForm(false);
  };

  return (
    <div className="dashboard page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted">Welcome back, <strong>{user?.email}</strong></p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New link
        </button>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="dash-stat card">
          <div className="dash-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--violet-light)' }}>
            <Link2 size={18} />
          </div>
          <div>
            <div className="dash-stat-value">{links.length}</div>
            <div className="dash-stat-label">Total links</div>
          </div>
        </div>
        <div className="dash-stat card">
          <div className="dash-stat-icon" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)' }}>
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="dash-stat-value">{totalClicks.toLocaleString()}</div>
            <div className="dash-stat-label">Total clicks</div>
          </div>
        </div>
        <div className="dash-stat card">
          <div className="dash-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--emerald)' }}>
            <Zap size={18} />
          </div>
          <div>
            <div className="dash-stat-value">{activeLinks}</div>
            <div className="dash-stat-label">Active links</div>
          </div>
        </div>
        <div className="dash-stat card">
          <div className="dash-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)' }}>
            <Clock size={18} />
          </div>
          <div>
            <div className="dash-stat-value">{recentLinks}</div>
            <div className="dash-stat-label">This week</div>
          </div>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="card animate-fade-in" style={{ padding: 24 }}>
          <ShortenForm onCreated={onCreated} />
        </div>
      )}

      {/* Search & Links */}
      <div className="dash-links-header">
        <h2>Your links <span className="badge badge-violet">{links.length}</span></h2>
        <div className="search-wrap">
          <Search size={14} className="search-icon" />
          <input
            className="input search-input"
            placeholder="Search links…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="links-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="links-empty card">
          <Link2 size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <p>{search ? 'No links match your search.' : "You haven't created any links yet."}</p>
          {!search && (
            <button className="btn btn-primary btn-sm mt-4" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Create your first link
            </button>
          )}
        </div>
      ) : (
        <div className="links-list">
          {filtered.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onDelete={(id) => setLinks((prev) => prev.filter((l) => l.id !== id))}
              onUpdate={(updated) => setLinks((prev) => prev.map((l) => l.id === updated.id ? updated : l))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
