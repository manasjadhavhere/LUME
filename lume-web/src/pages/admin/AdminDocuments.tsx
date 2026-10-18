import { useState } from 'react';
import { ExternalLink, FileText, Trash2 } from 'lucide-react';
import { API_BASE } from '../../context/AuthContext';

function fileUrl(value: string) {
  try { const url = new URL(value.startsWith('/') ? `${API_BASE}${value}` : value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
export default function AdminDocuments({ certifications, portfolio, busy, onRemove }: { certifications: string[]; portfolio: string[]; busy: boolean; onRemove: (url: string, type: 'certification' | 'portfolio') => void }) {
  const [tab, setTab] = useState<'certification' | 'portfolio'>('certification');
  const files = tab === 'certification' ? certifications : portfolio;
  return <section className="admin-documents"><h3 className="admin-subtitle">Documents & portfolio</h3><div className="admin-document-tabs" role="tablist" aria-label="Artist documents">
    <button type="button" role="tab" aria-selected={tab === 'certification'} onClick={() => setTab('certification')}>Certificates ({certifications.length})</button>
    <button type="button" role="tab" aria-selected={tab === 'portfolio'} onClick={() => setTab('portfolio')}>Portfolio ({portfolio.length})</button>
  </div><div className="admin-document-grid">{files.length ? files.map((value, i) => {
    const url = fileUrl(value);
    const image = url && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
    return <div className="admin-document" key={`${value}-${i}`}>{url ? <a href={url} target="_blank" rel="noopener noreferrer">
      {image ? <img src={url} alt={`${tab === 'certification' ? 'Certificate' : 'Portfolio'} ${i + 1}`} loading="lazy" /> : <div className="admin-document-file"><FileText size={28} /></div>}
      <span>{tab === 'certification' ? 'Certificate' : 'Portfolio'} {i + 1} <ExternalLink size={12} /></span></a> : <span>Invalid document link</span>}
      <button className="admin-text-button admin-text-button--danger" disabled={busy} onClick={() => onRemove(value, tab)} aria-label={`Remove ${tab} ${i + 1}`}><Trash2 size={12} /> Remove</button></div>;
  }) : <p className="admin-muted">No {tab === 'certification' ? 'certificates' : 'portfolio files'} submitted yet.</p>}</div></section>;
}
