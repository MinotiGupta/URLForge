import { useState } from 'react';
import { urlApi } from '../api';
import { Link2, Sparkles, Calendar, Tag, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './ShortenForm.css';

export default function ShortenForm({ onCreated }) {
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [expiry, setExpiry] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const payload = { original_url: url };
      if (alias.trim()) payload.custom_alias = alias.trim();
      if (expiry) payload.expires_in_days = parseInt(expiry);

      const { data } = await urlApi.shorten(payload);
      setResult(data);
      onCreated?.(data);
      toast.success('Link forged successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.short_url);
    toast.success('Copied to clipboard!');
  };

  const handleNew = () => {
    setResult(null);
    setUrl('');
    setAlias('');
    setExpiry('');
  };

  if (result) {
    return (
      <div className="shorten-result animate-fade-in">
        <div className="result-success-icon">
          <Sparkles size={28} />
        </div>
        <h3>Your link is ready!</h3>
        <div className="result-url-box">
          <a href={result.short_url} target="_blank" rel="noopener noreferrer" className="result-short-url">
            {result.short_url}
          </a>
          <button className="btn btn-primary btn-sm" onClick={handleCopy}>Copy</button>
        </div>
        <p className="result-original">↳ {result.original_url.length > 60 ? result.original_url.slice(0, 60) + '…' : result.original_url}</p>

        {result.qr_code && (
          <div className="result-qr">
            <img src={`data:image/png;base64,${result.qr_code}`} alt="QR Code" />
            <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Scan to visit</p>
          </div>
        )}

        <button className="btn btn-secondary btn-sm mt-4" onClick={handleNew}>
          Forge another link
        </button>
      </div>
    );
  }

  return (
    <form className="shorten-form" onSubmit={handleSubmit}>
      <div className="shorten-input-row">
        <div className="shorten-input-wrap">
          <Link2 size={18} className="shorten-input-icon" />
          <input
            className="shorten-input"
            type="url"
            placeholder="Paste any long URL…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            autoFocus
          />
        </div>
        <button className="btn btn-primary btn-lg shorten-btn" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : <><Sparkles size={16} /> Forge it</>}
        </button>
      </div>

      <button
        type="button"
        className="advanced-toggle"
        onClick={() => setAdvanced(!advanced)}
      >
        {advanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Advanced options
      </button>

      {advanced && (
        <div className="advanced-fields animate-fade-in">
          <div className="form-group">
            <label className="form-label"><Tag size={12} /> Custom alias</label>
            <input
              className="input input-mono"
              placeholder="e.g. my-portfolio"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, hyphens and underscores only"
            />
          </div>
          <div className="form-group">
            <label className="form-label"><Calendar size={12} /> Expires in</label>
            <select
              className="input"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            >
              <option value="">Never</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
        </div>
      )}
    </form>
  );
}
