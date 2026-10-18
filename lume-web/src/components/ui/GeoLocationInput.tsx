import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LocateFixed, MapPin, LoaderCircle, X } from 'lucide-react';
import { detectLocation, geoRequest, readRecentLocations, rememberLocation } from '../../utils/geoCoding';
import type { GeoLocationResult } from '../../utils/geoCoding';
import { popularLocations, searchOfflineLocations } from '../../data/indianGeoLocations';
import './GeoLocationInput.css';
export type { GeoLocationResult } from '../../utils/geoCoding';
export interface GeoLocationInputProps {
  value: string; onChange: (value: string, details?: GeoLocationResult) => void; onSelect?: (details: GeoLocationResult) => void;
  placeholder?: string; className?: string; variant?: 'hero' | 'filter' | 'form'; showCurrentLocationBtn?: boolean;
  disabled?: boolean; required?: boolean; icon?: ReactNode; id?: string; label?: string;
}
export default function GeoLocationInput({ value, onChange, onSelect, placeholder = 'Search city, neighbourhood or pincode', className = '', variant = 'form', showCurrentLocationBtn = true, disabled, required, icon, id, label = 'Location' }: GeoLocationInputProps) {
  const uid = useId();
  const listId = `${uid}-locations`;
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const session = useRef(crypto.randomUUID());
  const requestVersion = useRef(0);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [recent, setRecent] = useState(readRecentLocations);
  const [busy, setBusy] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [message, setMessage] = useState('');
  const [source, setSource] = useState('');
  const [active, setActive] = useState(-1);
  const showDefaults = value.trim().length < 2;
  const options = showDefaults ? [...recent, ...popularLocations] : results;
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setActive(-1);
    if (!open || value.trim().length < 2 || disabled) { setBusy(false); return; }
    setBusy(true); setMessage('');
    const timer = setTimeout(async () => {
      try {
        const data = await geoRequest<{ results: GeoLocationResult[]; source: string }>('search', { q: value.trim(), sessionToken: session.current }, controller.signal);
        if (controller.signal.aborted) return;
        setResults(data.source === 'offline' ? searchOfflineLocations(value) : data.results); setSource(data.source);
        if (data.source === 'offline') setMessage('Live search is unavailable. Showing saved city data.');
      } catch {
        if (controller.signal.aborted) return;
        setResults(searchOfflineLocations(value)); setSource('offline'); setMessage('Live search is unavailable. Showing saved city data.');
      } finally { if (!controller.signal.aborted) setBusy(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, open, disabled]);
  useEffect(() => () => { requestVersion.current++; }, []);
  const commit = (location: GeoLocationResult) => {
    onChange(location.formattedAddress, location); onSelect?.(location);
    rememberLocation(location); setRecent(readRecentLocations()); session.current = crypto.randomUUID();
    setMessage(''); setOpen(false); setActive(-1);
  };
  const select = async (location: GeoLocationResult) => {
    const version = ++requestVersion.current; setSelecting(true); setMessage('');
    try {
      const resolved = location.source === 'google' && location.placeId
        ? await geoRequest<GeoLocationResult>('place', { placeId: location.placeId, sessionToken: session.current }) : location;
      if (version === requestVersion.current) commit(resolved);
    } catch (err) { if (version === requestVersion.current) { setMessage(err instanceof Error ? err.message : 'Please select another location.'); setOpen(true); } }
    finally { if (version === requestVersion.current) setSelecting(false); }
  };
  const locate = async () => {
    const version = ++requestVersion.current; setSelecting(true); setMessage('');
    try { const location = await detectLocation(); if (version === requestVersion.current) commit(location); }
    catch (err) { if (version === requestVersion.current) { setMessage((err as Error).message); setOpen(true); } }
    finally { if (version === requestVersion.current) setSelecting(false); }
  };
  return <div ref={ref} className={`geo-location location-autocomplete geo-location--${variant} ${className}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <div className="geo-location__input-wrap">{icon}
      <input ref={input} id={id} type="text" role="combobox" aria-label={label} aria-autocomplete="list" aria-expanded={open} aria-controls={open ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} aria-describedby={message ? `${uid}-status` : undefined}
        autoComplete="off" value={value} placeholder={placeholder} disabled={disabled} readOnly={selecting} required={required}
        onFocus={() => setOpen(true)} onChange={event => { requestVersion.current++; onChange(event.target.value); setResults([]); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive(n => options.length ? (n + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length : -1); }
          if (event.key === 'Enter' && open && active >= 0 && options[active]) { event.preventDefault(); void select(options[active]); }
        }} />
      {(busy || selecting) ? <LoaderCircle size={16} className="geo-location__spinner" aria-label="Finding locations" /> : value && !disabled ?
        <button type="button" className="geo-location__clear" aria-label="Clear location" onClick={() => { onChange(''); input.current?.focus(); }}><X size={15} /></button> : null}
    </div>
    {open && !disabled && <div className="geo-location__dropdown">
      {showCurrentLocationBtn && <button type="button" className="geo-location__detect" onClick={locate} disabled={selecting}><LocateFixed size={17} />{selecting ? 'Finding your location…' : 'Use my current location'}</button>}
      {message && <p id={`${uid}-status`} className="geo-location__notice" role="status">{message}</p>}
      {showDefaults && <p className="geo-location__section">{recent.length ? 'Recent locations & popular cities' : 'Popular cities'}</p>}
      <div id={listId} role="listbox" aria-label="Location suggestions" className="geo-location__results" aria-busy={busy}>
        {options.map((location, index) => <button key={`${location.formattedAddress}-${index}`} type="button" role="option" tabIndex={-1} id={`${listId}-${index}`} aria-selected={active === index}
          className={`geo-location__option ${active === index ? 'is-active' : ''}`} onMouseDown={event => event.preventDefault()} onClick={() => void select(location)} disabled={selecting}>
          <MapPin size={16} /><span><strong>{location.sublocality || location.city || location.formattedAddress}</strong><small>{location.sublocality ? `${location.city}${location.state ? `, ${location.state}` : ''}` : location.state || location.formattedAddress}</small></span>
        </button>)}
        {!showDefaults && !busy && options.length === 0 && <p className="geo-location__notice">No locations found. Try a nearby city or a different spelling.</p>}
      </div>
      {source === 'google' && !showDefaults ? <div className="geo-location__credit">Google Maps</div> : <a className="geo-location__credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · {showDefaults || source === 'offline' ? 'Saved city suggestions' : 'Photon search'}</a>}
    </div>}
  </div>;
}
