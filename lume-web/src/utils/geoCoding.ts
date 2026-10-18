export interface GeoLocationResult {
  formattedAddress: string; city: string; sublocality?: string; state?: string; pincode?: string;
  lat?: number; lng?: number; placeId?: string; source: 'google' | 'photon' | 'offline';
}
const base = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
export async function geoRequest<T>(path: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${base}/api/geo/${path}?${new URLSearchParams(params)}`, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || 'Location search is unavailable.');
  return body.data;
}
export function detectLocation(): Promise<GeoLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Location detection is unavailable. Please search for your city.')); return; }
    navigator.geolocation.getCurrentPosition(
      pos => geoRequest<GeoLocationResult>('reverse', { lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }).then(resolve, reject),
      error => reject(new Error(error.code === 1 ? 'Location permission was denied. You can still search for a city or neighbourhood.' : 'Could not detect your location. Please search instead.')),
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: false },
    );
  });
}
const recentKey = 'lume_recent_locations_v1';
export function readRecentLocations(): GeoLocationResult[] {
  try {
    const data = JSON.parse(localStorage.getItem(recentKey) || '[]');
    if (!Array.isArray(data)) return [];
    return data.filter(r => r && typeof r.city === 'string' && typeof r.formattedAddress === 'string' && Date.now() - r.savedAt < 7 * 86400000).slice(0, 3);
  } catch { return []; }
}
export function rememberLocation(location: GeoLocationResult) {
  try {
    const { city, state, sublocality, formattedAddress, source, placeId } = location;
    const recent = readRecentLocations().filter(r => r.formattedAddress !== formattedAddress);
    localStorage.setItem(recentKey, JSON.stringify([{ city, state, sublocality, formattedAddress, source, placeId, savedAt: Date.now() }, ...recent].slice(0, 3)));
  } catch { /* Storage restrictions must not prevent selection. */ }
}
