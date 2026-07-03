import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Copy, Trash2, ExternalLink, BarChart2, Edit2, Check, X, Clock, QrCode } from 'lucide-react';
import { urlApi } from '../api';
import toast from 'react-hot-toast';
import './LinkCard.css';

export default function LinkCard({ link, onDelete, onUpdate }) {
  const [showQR, setShowQR] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(link.original_url);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const shortUrl = link.short_url || `http://localhost:8000/${link.short_code}`;
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

  const copy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied!');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this link?')) return;
    try {
      await urlApi.delete(link.id);
      onDelete(link.id);
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { data } = await urlApi.update(link.id, { original_url: editUrl });
      onUpdate(data);
      setEditing(false);
      toast.success('Link updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`link-card card ${isExpired ? 'link-card-expired' : ''}`}>
      <div className="link-card-header">
        <div className="link-short">
          <Link2 size={14} />
          <a href={shortUrl} target="_blank" rel="noopener" className="link-short-text">
            {shortUrl.replace(/^https?:\/\//, '')}
          </a>
          {isExpired && <span className="badge badge-rose">Expired</span>}
          {link.custom_alias && <span className="badge badge-violet">Custom</span>}
        </div>

        <div className="link-card-actions">
          <button className="btn btn-icon btn-ghost" onClick={copy} data-tooltip="Copy">
            <Copy size={14} />
          </button>
          <button className="btn btn-icon btn-ghost" onClick={() => setShowQR(!showQR)} data-tooltip="QR Code">
            <QrCode size={14} />
          </button>
          <button className="btn btn-icon btn-ghost" onClick={() => navigate(`/analytics/${link.id}`)} data-tooltip="Analytics">
            <BarChart2 size={14} />
          </button>
          <button className="btn btn-icon btn-ghost" onClick={() => setEditing(!editing)} data-tooltip="Edit">
            <Edit2 size={14} />
          </button>
          <button className="btn btn-icon btn-danger" onClick={handleDelete} data-tooltip="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="link-edit-row">
          <input
            className="input"
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            type="url"
            autoFocus
          />
          <button className="btn btn-primary btn-sm" onClick={handleUpdate} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Check size={14} />}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="link-original">
          <ExternalLink size={12} />
          {link.original_url.length > 80 ? link.original_url.slice(0, 80) + '…' : link.original_url}
        </p>
      )}

      <div className="link-card-footer">
        <span className="link-meta">
          <BarChart2 size={12} />
          {link.click_count} click{link.click_count !== 1 ? 's' : ''}
        </span>
        {link.expires_at && (
          <span className="link-meta">
            <Clock size={12} />
            {isExpired ? 'Expired' : `Expires ${new Date(link.expires_at).toLocaleDateString()}`}
          </span>
        )}
        <span className="link-meta link-meta-date">
          {new Date(link.created_at).toLocaleDateString()}
        </span>
      </div>

      {showQR && link.qr_code && (
        <div className="link-qr animate-fade-in">
          <img src={`data:image/png;base64,${link.qr_code}`} alt="QR Code" />
        </div>
      )}
    </div>
  );
}
