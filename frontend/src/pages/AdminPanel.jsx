import { useEffect, useState } from 'react';
import { dashboardApi } from '../api';
import { Users, Link2, TrendingUp, Clock, Trophy, Shield } from 'lucide-react';
import './AdminPanel.css';

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.get()
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch((err) => {
        setError(err.response?.status === 403 ? 'Admin access required' : 'Failed to load');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="admin-page page-container">
      {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
    </div>
  );

  if (error) return (
    <div className="admin-page page-container">
      <div className="card admin-error">
        <Shield size={40} style={{ color: 'var(--rose)' }} />
        <h2>{error}</h2>
        <p className="text-muted">This page is restricted to admin users.</p>
      </div>
    </div>
  );

  const stats = [
    { icon: <Users size={18} />, label: 'Total users', value: data.total_users, color: 'var(--violet-light)', bg: 'rgba(99,102,241,0.15)' },
    { icon: <Link2 size={18} />, label: 'Active links', value: data.active_links, color: 'var(--cyan)', bg: 'rgba(34,211,238,0.12)' },
    { icon: <TrendingUp size={18} />, label: 'Total clicks', value: data.total_clicks.toLocaleString(), color: 'var(--emerald)', bg: 'rgba(16,185,129,0.12)' },
    { icon: <Clock size={18} />, label: 'Expired links', value: data.expired_links, color: 'var(--rose)', bg: 'rgba(244,63,94,0.12)' },
  ];

  return (
    <div className="admin-page page-container animate-fade-in">
      <div className="admin-header">
        <div className="admin-badge">
          <Shield size={16} /> Admin Panel
        </div>
        <h1>System Overview</h1>
        <p className="text-muted">Real-time system metrics and top performing links</p>
      </div>

      <div className="admin-stats">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat card">
            <div className="admin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="admin-stat-value">{s.value}</div>
            <div className="admin-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card admin-top-links">
        <div className="admin-section-header">
          <Trophy size={16} style={{ color: 'var(--amber)' }} />
          <h2>Top 10 Links by Clicks</h2>
        </div>
        {data.top_links.length === 0 ? (
          <div className="admin-empty">No links yet</div>
        ) : (
          <div className="admin-links-table">
            <div className="table-head">
              <span>#</span>
              <span>Short code</span>
              <span>Original URL</span>
              <span>Clicks</span>
            </div>
            {data.top_links.map((link, i) => (
              <div key={link.short_code} className="table-row">
                <span className="table-rank">#{i + 1}</span>
                <a
                  href={`http://localhost:8000/${link.short_code}`}
                  target="_blank"
                  rel="noopener"
                  className="table-short-code"
                >
                  {link.short_code}
                </a>
                <span className="table-original">{link.original_url.length > 50 ? link.original_url.slice(0, 50) + '…' : link.original_url}</span>
                <span className="table-clicks">
                  <TrendingUp size={12} /> {link.clicks.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
