import { useScrollLock } from '../../hooks/useScrollLock';
import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Navigation,
  Plus,
  Check,
  Home,
  Sparkles,
  Building2,
  Bookmark,
  ExternalLink,
  X,
  Link2,
  AlertCircle,
} from 'lucide-react';
import GeoLocationInput from '../ui/GeoLocationInput';
import { useSaveClientProfile } from '../../hooks/useSaveClientProfile';
import { createPortal } from 'react-dom';
import type { GeoLocationResult } from '../../utils/geoCoding';
import {

  useAuth,
  type ClientSavedAddress,
} from '../../context/AuthContext';
import {
  buildGoogleMapsUrl,
  formatSavedAddressLine,
  hasExactGeoAddress,
  parseGoogleMapsCoordinates,
} from '../../utils/bookingTime';
import './BookingLocationModal.css';

export interface BookingLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAddress?: ClientSavedAddress | null;
  savedAddresses?: ClientSavedAddress[];
  onSelectAddress: (address: ClientSavedAddress, updatedList: ClientSavedAddress[]) => void;
  initialMode?: 'list' | 'form';
  editingAddress?: ClientSavedAddress | null;
  title?: string;
  confirmButtonLabel?: string;
}

const ADDRESS_LABELS: ClientSavedAddress['label'][] = [
  'Home',
  'Wedding Venue',
  'Hotel / Studio',
  'Other',
];

const BookingLocationModal: React.FC<BookingLocationModalProps> = ({
  isOpen,
  onClose,
  selectedAddress,
  savedAddresses: propAddresses,
  onSelectAddress,
  initialMode,
  editingAddress = null,
  title = 'Select Booking Location',
  confirmButtonLabel = 'Confirm Location & Map Pin',
}) => {
  const { user } = useAuth();
  useScrollLock(isOpen);
  const saveProfile = useSaveClientProfile();

  const existingAddresses = useMemo(
    () => propAddresses ?? user?.clientProfile?.savedAddresses ?? [],
    [propAddresses, user?.clientProfile?.savedAddresses]
  );

  const [mode, setMode] = useState<'list' | 'form'>('list');
  const [label, setLabel] = useState<ClientSavedAddress['label']>('Home');
  const [apartment, setApartment] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [geoSearchText, setGeoSearchText] = useState('');
  const [mapsLinkInput, setMapsLinkInput] = useState('');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [makeDefault, setMakeDefault] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const populateForm = (addr?: ClientSavedAddress | null) => {
    if (addr) {
      setEditingId(addr.id);
      setLabel(addr.label || 'Home');
      setApartment(addr.apartment || '');
      setStreet(addr.street || '');
      setLandmark(addr.landmark || '');
      setCity(addr.city || '');
      setPincode(addr.pincode || '');
      setGeoSearchText(addr.formattedGeoAddress || [addr.street, addr.city].filter(Boolean).join(', '));
      setLat(typeof addr.lat === 'number' && Number.isFinite(addr.lat) ? addr.lat : undefined);
      setLng(typeof addr.lng === 'number' && Number.isFinite(addr.lng) ? addr.lng : undefined);
      setMapsLinkInput(typeof addr.lat === 'number' && typeof addr.lng === 'number' ? buildGoogleMapsUrl(addr.lat, addr.lng) : '');
      setMakeDefault(Boolean(addr.isDefault));
      setSaveForFuture(true);
    } else {
      setEditingId(null);
      setLabel('Home');
      setApartment('');
      setStreet('');
      setLandmark('');
      setCity('');
      setPincode('');
      setGeoSearchText('');
      setLat(undefined);
      setLng(undefined);
      setMapsLinkInput('');
      setMakeDefault(existingAddresses.length === 0);
      setSaveForFuture(true);
    }
    setError('');
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editingAddress) {
      populateForm(editingAddress);
      setMode('form');
    } else if (initialMode === 'form' || existingAddresses.length === 0) {
      populateForm(null);
      setMode('form');
    } else {
      setMode('list');
      setError('');
    }
  }, [isOpen, editingAddress, initialMode, existingAddresses.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, saving]);

  if (!isOpen) return null;

  const hasValidCoords =
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng);

  const handleGeoSelect = (details: GeoLocationResult) => {
    setError('');
    setGeoSearchText(details.formattedAddress);
    if (details.city) setCity(details.city);
    if (details.pincode && /^\d{6}$/.test(details.pincode)) {
      setPincode(details.pincode);
    }
    if (!street.trim() && (details.sublocality || details.formattedAddress)) {
      setStreet(details.sublocality || details.formattedAddress);
    }
    setLat(undefined); setLng(undefined); setMapsLinkInput('');
    if (details.source !== 'offline' && typeof details.lat === 'number' && typeof details.lng === 'number') {
      const cleanLat = Number(details.lat.toFixed(6));
      const cleanLng = Number(details.lng.toFixed(6));
      setLat(cleanLat);
      setLng(cleanLng);
      setMapsLinkInput(buildGoogleMapsUrl(cleanLat, cleanLng));
    }
  };

  const handleUseCurrentGps = async () => {
    setLocatingGps(true);
    setError('');
    if (!navigator.geolocation) {
      setError('GPS is unavailable. Paste coordinates or select a place.');
      setLocatingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      setLat(lat); setLng(lng); setMapsLinkInput(buildGoogleMapsUrl(lat, lng)); setGeoSearchText('');
      setLocatingGps(false);
    }, () => {
      setError('Could not get your location. Paste the venue coordinates or select a place.');
      setLocatingGps(false);
    }, { enableHighAccuracy: true, timeout: 12000 });
  };

  const handleMapsLinkChange = (val: string) => {
    setMapsLinkInput(val);
    const parsed = parseGoogleMapsCoordinates(val);
    setLat(parsed?.lat); setLng(parsed?.lng);
    setError(!parsed && val.trim() ? 'Paste the coordinates from your pin, or a full Maps URL containing them.' : '');
  };

  const handleChooseSaved = (addr: ClientSavedAddress) => {
    if (!hasExactGeoAddress(addr)) {
      populateForm(addr);
      setMode('form');
      setError('Please pin this address on Google Maps once to use it for booking.');
      return;
    }
    onSelectAddress(addr, existingAddresses);
    onClose();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || locatingGps) return;
    if (!hasValidCoords || lat === undefined || lng === undefined) {
      setError('Please select a Google Maps geo-location (search area, use GPS, or paste a Google Maps link).');
      return;
    }
    if (!apartment.trim()) {
      setError('Please enter your Flat / House No. / Building / Venue Name.');
      return;
    }
    if (!street.trim()) {
      setError('Please enter your Street / Area / Locality.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your City.');
      return;
    }
    if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Pincode.');
      return;
    }

    setSaving(true);
    setError('');
    const newAddr: ClientSavedAddress = {
      id: editingId || crypto.randomUUID(),
      label,
      recipientName: user?.name || 'Client',
      apartment: apartment.trim(),
      street: street.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault: makeDefault || existingAddresses.length === 0,
      lat,
      lng,
      googleMapsUrl: buildGoogleMapsUrl(lat, lng),
      formattedGeoAddress: geoSearchText.trim() || `${street.trim()}, ${city.trim()}`,
    };

    let nextList = [...existingAddresses];
    if (saveForFuture || editingId) {
      if (newAddr.isDefault) {
        nextList = nextList.map((a) => ({ ...a, isDefault: false }));
      }
      if (editingId && nextList.some((a) => a.id === editingId)) {
        nextList = nextList.map((a) => (a.id === editingId ? newAddr : a));
      } else {
        nextList = [newAddr, ...nextList];
      }
      try {
        await saveProfile({ savedAddresses: nextList });
      } catch (err) {
        setSaving(false);
        setError(err instanceof Error ? err.message : 'Could not save this address.');
        return;
      }
    }

    setSaving(false);
    onSelectAddress(newAddr, nextList);
    onClose();
  };

  const getLabelIcon = (lbl: ClientSavedAddress['label']) => {
    if (lbl === 'Home') return <Home size={15} />;
    if (lbl === 'Wedding Venue') return <Sparkles size={15} />;
    if (lbl === 'Hotel / Studio') return <Building2 size={15} />;
    return <Bookmark size={15} />;
  };

  return createPortal(
    <div
      className="lume-loc-modal__backdrop"
      data-lenis-prevent
      onClick={() => !saving && onClose()}
    >
      <div
        className="lume-loc-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lume-loc-modal-title"
        data-lenis-prevent
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lume-loc-modal__header">
          <div>
            <span className="lume-loc-modal__eyebrow">
              <MapPin size={13} /> DOORSTEP &amp; VENUE LOCATION
            </span>
            <h2 id="lume-loc-modal-title">{title}</h2>
          </div>
          <button
            type="button"
            className="lume-loc-modal__close"
            onClick={onClose}
            aria-label="Close location modal"
          >
            <X size={18} />
          </button>
        </div>

        { !initialMode && existingAddresses.length > 0 && (
          <div className="lume-loc-modal__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'list'}
              className={`lume-loc-modal__tab ${mode === 'list' ? 'is-active' : ''}`}
              onClick={() => {
                setMode('list');
                setError('');
              }}
            >
              Saved Addresses ({existingAddresses.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'form'}
              className={`lume-loc-modal__tab ${mode === 'form' ? 'is-active' : ''}`}
              onClick={() => {
                populateForm(null);
                setMode('form');
              }}
            >
              <Plus size={14} /> Add New Address
            </button>
          </div>
        )}

        {error && (
          <div className="lume-loc-modal__error" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {mode === 'list' ? (
          <div className="lume-loc-modal__list-view">
            <p className="lume-loc-modal__subtext">
              Choose a saved venue with a Google Maps pin or add a new address.
            </p>
            <div className="lume-loc-modal__saved-list">
              {existingAddresses.map((addr) => {
                const isSelected = selectedAddress?.id === addr.id;
                const isPinned = hasExactGeoAddress(addr);
                return (
                  <div
                    key={addr.id}
                    className={`lume-loc-modal__saved-card ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="lume-loc-modal__saved-top">
                      <div className="lume-loc-modal__saved-badges">
                        <span className="lume-loc-modal__type-pill">
                          {getLabelIcon(addr.label)} {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="lume-loc-modal__default-pill">Default</span>
                        )}
                        {isPinned ? (
                          <span className="lume-loc-modal__pin-pill is-ok">
                            <MapPin size={12} /> Google Maps Pinned
                          </span>
                        ) : (
                          <span className="lume-loc-modal__pin-pill is-missing">
                            Map Pin Needed
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="lume-loc-modal__edit-link"
                        onClick={() => {
                          populateForm(addr);
                          setMode('form');
                        }}
                      >
                        Edit
                      </button>
                    </div>

                    <p className="lume-loc-modal__saved-address">
                      {formatSavedAddressLine(addr)}
                    </p>

                    <div className="lume-loc-modal__saved-actions">
                      {isPinned && addr.lat !== undefined && addr.lng !== undefined && (
                        <a
                          href={buildGoogleMapsUrl(addr.lat, addr.lng)}
                          target="_blank"
                          rel="noreferrer"
                          className="lume-loc-modal__map-ext"
                        >
                          View on Google Maps <ExternalLink size={12} />
                        </a>
                      )}
                      <button
                        type="button"
                        className="lume-loc-modal__choose-btn"
                        onClick={() => handleChooseSaved(addr)}
                      >
                        {isPinned ? (
                          <>
                            <Check size={15} /> Deliver Service Here
                          </>
                        ) : (
                          <>
                            <MapPin size={15} /> Pin on Google Maps &amp; Select
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="lume-loc-modal__add-new-cta"
              onClick={() => {
                populateForm(null);
                setMode('form');
              }}
            >
              <Plus size={16} /> Add a New Address &amp; Google Maps Location
            </button>
          </div>
        ) : (
          <form className="lume-loc-modal__form" onSubmit={handleSubmitForm}>
            {/* Step 1: Google Maps Geo-Location */}
            <div className="lume-loc-modal__geo-section">
              <div className="lume-loc-modal__section-head">
                <span className="lume-loc-modal__step-num">1</span>
                <div>
                  <h3>Pin Exact Geo-Location on Google Maps *</h3>
                  <p>Choose your venue, use your current location, or paste coordinates from a Google Maps pin.</p>
                </div>
              </div>

              <div className="lume-loc-modal__geo-controls">
                <GeoLocationInput
                  value={geoSearchText}
                  onChange={(val, details) => {
                    setGeoSearchText(val);
                    if (details) handleGeoSelect(details);
                    else { setLat(undefined); setLng(undefined); setMapsLinkInput(''); }
                  }}
                  showCurrentLocationBtn={false}
                  saveRecent={false}
                  placeholder="Search area, society, hotel or landmark…"
                  label="Search Google Maps location"
                  icon={<MapPin size={16} />}
                />

                <button
                  type="button"
                  className="lume-loc-modal__gps-btn"
                  onClick={handleUseCurrentGps}
                  disabled={locatingGps}
                >
                  <Navigation size={15} />
                  <span>{locatingGps ? 'Detecting GPS…' : 'Use Current GPS'}</span>
                </button>
              </div>

              <div className="lume-loc-modal__maps-link-row">
                <div className="lume-loc-modal__maps-link-input">
                  <Link2 size={15} />
                  <input
                    type="text"
                    placeholder="Or paste Google Maps link / coordinates (e.g. 19.0596, 72.8295)"
                    value={mapsLinkInput}
                    onChange={(e) => handleMapsLinkChange(e.target.value)}
                    aria-label="Google Maps link or coordinates"
                  />
                </div>
              </div>

              {hasValidCoords && lat !== undefined && lng !== undefined ? (
                <div className="lume-loc-modal__map-preview">
                  <div className="lume-loc-modal__map-status">
                    <span className="lume-loc-modal__map-verified">
                      <Check size={14} /> Selected map pin ({lat.toFixed(4)}, {lng.toFixed(4)})
                    </span>
                    <a
                      href={buildGoogleMapsUrl(lat, lng)}
                      target="_blank"
                      rel="noreferrer"
                      className="lume-loc-modal__map-open"
                    >
                      Open in Google Maps <ExternalLink size={12} />
                    </a>
                  </div>
                  <iframe
                    title="Selected Google Maps Location"
                    className="lume-loc-modal__iframe"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`}
                  />
                </div>
              ) : (
                <div className="lume-loc-modal__map-placeholder">
                  <MapPin size={20} />
                  <span>Select a location above or use GPS to lock your Google Maps pin</span>
                </div>
              )}
            </div>

            {/* Step 2: Complete Doorstep / Venue Details (No phone field anywhere) */}
            <div className="lume-loc-modal__details-section">
              <div className="lume-loc-modal__section-head">
                <span className="lume-loc-modal__step-num">2</span>
                <div>
                  <h3>Complete Address Details *</h3>
                  <p>Include the building or venue and the entrance your artist should use.</p>
                </div>
              </div>

              <div className="lume-loc-modal__label-chips" role="group" aria-label="Address label">
                {ADDRESS_LABELS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`lume-loc-modal__label-chip ${label === item ? 'is-active' : ''}`}
                    onClick={() => setLabel(item)}
                  >
                    {getLabelIcon(item)}
                    <span>{item}</span>
                  </button>
                ))}
              </div>

              <div className="lume-loc-modal__grid">
                <div className="lume-loc-modal__field lume-loc-modal__field--full">
                  <label htmlFor="loc-apartment">Flat / House No. / Floor / Venue Name *</label>
                  <input
                    id="loc-apartment"
                    type="text"
                    placeholder="e.g. Suite 402, Taj Lands End / Flat 12B, Oberoi Springs"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    required
                  />
                </div>

                <div className="lume-loc-modal__field lume-loc-modal__field--full">
                  <label htmlFor="loc-street">Street / Area / Locality *</label>
                  <input
                    id="loc-street"
                    type="text"
                    placeholder="e.g. Bandstand Road, Bandra West"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>

                <div className="lume-loc-modal__field lume-loc-modal__field--full">
                  <label htmlFor="loc-landmark">Nearby Landmark (Optional)</label>
                  <input
                    id="loc-landmark"
                    type="text"
                    placeholder="e.g. Opposite Mehboob Studio"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                <div className="lume-loc-modal__field">
                  <label htmlFor="loc-city">City *</label>
                  <input
                    id="loc-city"
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div className="lume-loc-modal__field">
                  <label htmlFor="loc-pincode">6-Digit Pincode *</label>
                  <input
                    id="loc-pincode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="e.g. 400050"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
              </div>

              <div className="lume-loc-modal__checkboxes">
                {!initialMode && !editingId && <label className="lume-loc-modal__check">
                  <input
                    type="checkbox"
                    checked={saveForFuture}
                    onChange={(e) => setSaveForFuture(e.target.checked)}
                  />
                  <span>Save to my addresses for faster future bookings</span>
                </label>}

                {saveForFuture && (
                  <label className="lume-loc-modal__check">
                    <input
                      type="checkbox"
                      checked={makeDefault}
                      onChange={(e) => setMakeDefault(e.target.checked)}
                    />
                    <span>Set as my default booking address</span>
                  </label>
                )}
              </div>
            </div>

            <div className="lume-loc-modal__footer">
              {!initialMode && existingAddresses.length > 0 && !editingAddress && (
                <button
                  type="button"
                  className="lume-loc-modal__cancel-btn"
                  onClick={() => setMode('list')}
                >
                  Back to Saved
                </button>
              )}
              <button
                type="submit"
                className="lume-loc-modal__submit-btn"
                disabled={saving || locatingGps}
              >
                <MapPin size={16} />
                <span>{saving ? 'Saving Location…' : confirmButtonLabel}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>, document.body
  );
};

export default BookingLocationModal;

