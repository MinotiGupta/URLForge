import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlApi } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowLeft, TrendingUp, Globe, Monitor, Cpu } from 'lucide-react';
import './Analytics.css';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#a78bfa', '#34d399'];

function DataPieChart({ data, title, icon }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 7);
  if (!entries.length) return <div className="chart-empty">No data yet</div>;

  const pieData = entries.map(([name, value]) => ({ name, value }));

  return (
    <div className="chart-card card">
      <h3 className="chart-title">{icon} {title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-primary)' }}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    urlApi.analytics(id)
      .then(({ data }) => { setData(data); setLoading(false); })
      .catch(() => { setError('Failed to load analytics'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="analytics-page page-container">
      <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
    </div>
  );

  if (error) return (
    <div className="analytics-page page-container">
      <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--rose)' }}>{error}</div>
    </div>
  );

  return (
    <div className="analytics-page page-container animate-fade-in">
      <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="analytics-header">
        <h1>Link Analytics</h1>
        <p className="text-muted">Detailed performance data for this link</p>
      </div>

      {/* Top Stats */}
      <div className="analytics-stats">
        <div className="card analytics-stat">
          <div className="analytics-stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--violet-light)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="analytics-stat-value">{data.total_clicks.toLocaleString()}</div>
          <div className="analytics-stat-label">Total clicks</div>
        </div>
        <div className="card analytics-stat">
          <div className="analytics-stat-icon" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="analytics-stat-value">{data.today_clicks}</div>
          <div className="analytics-stat-label">Today</div>
        </div>
        <div className="card analytics-stat">
          <div className="analytics-stat-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--emerald)' }}>
            <Globe size={20} />
          </div>
          <div className="analytics-stat-value">{Object.keys(data.countries || {}).length}</div>
          <div className="analytics-stat-label">Countries</div>
        </div>
        <div className="card analytics-stat">
          <div className="analytics-stat-icon" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--amber)' }}>
            <Monitor size={20} />
          </div>
          <div className="analytics-stat-value">{Object.keys(data.devices || {}).length}</div>
          <div className="analytics-stat-label">Device types</div>
        </div>
      </div>

      {/* Charts */}
      <div className="analytics-charts">
        <DataPieChart data={data.countries} title="Countries" icon={<Globe size={14} />} />
        <DataPieChart data={data.devices} title="Devices" icon={<Monitor size={14} />} />
        <DataPieChart data={data.browsers} title="Browsers" icon={<Cpu size={14} />} />
      </div>

      {/* Bar Charts */}
      <div className="card">
        <h3 className="chart-title"><TrendingUp size={14} /> Clicks by Browser</h3>
        {Object.keys(data.browsers || {}).length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={Object.entries(data.browsers).map(([name, value]) => ({ name, value }))}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="chart-empty">No browser data yet</div>}
      </div>
    </div>
  );
}
