export interface GeoLocationResult {
  formattedAddress: string;
  city: string;
  sublocality?: string;
  state?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  source: 'google' | 'photon' | 'offline';
}

type Feature = { geometry: { coordinates: number[] }; properties: Record<string, string> };
const photonCache = new Map<string, { expires: number; results: GeoLocationResult[] }>();
const unique = (items: (string | undefined)[]) => [...new Set(items.filter(Boolean))].join(', ');
const key = () => process.env.GOOGLE_MAPS_API_KEY;

async function json(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Location provider is unavailable');
  return response.json();
}

export function fromPhoton(feature: Feature): GeoLocationResult | null {
  const p = feature.properties;
  if (p.countrycode?.toLowerCase() !== 'in') return null;
  const city = p.city || p.town || p.village || p.name;
  if (!city) return null;
  const sublocality = p.district || (p.name !== city ? p.name : undefined);
  return {
    formattedAddress: unique([sublocality, city, p.state, p.postcode]), city, sublocality,
    state: p.state, pincode: p.postcode,
    lng: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1], source: 'photon',
  };
}

async function photon(path: string, params: Record<string, string>) {
  const base = (process.env.PHOTON_BASE_URL || 'https://photon.komoot.io').replace(/\/$/, '');
  const url = `${base}/${path}?${new URLSearchParams({ ...params, lang: 'en', limit: '8' })}`;
  const cached = photonCache.get(url);
  if (cached && cached.expires > Date.now()) return cached.results;
  const data = await json(url) as { features?: Feature[] };
  const results = (data.features || []).map(fromPhoton).filter((p): p is GeoLocationResult => !!p);
  const deduped = [...new Map(results.map(p => [p.formattedAddress, p])).values()];
  if (photonCache.size >= 300) photonCache.delete(photonCache.keys().next().value!);
  photonCache.set(url, { results: deduped, expires: Date.now() + 300_000 });
  return deduped;
}

export async function searchLocations(query: string, sessionToken: string) {
  if (key()) {
    try {
      const data = await json('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key()! },
        body: JSON.stringify({ input: query, includedRegionCodes: ['in'], languageCode: 'en', sessionToken }),
      }) as { suggestions?: { placePrediction?: { placeId: string; text: { text: string } } }[] };
      const results = (data.suggestions || []).flatMap(s => s.placePrediction ? [{
        formattedAddress: s.placePrediction.text.text, city: '', placeId: s.placePrediction.placeId,
        source: 'google' as const,
      }] : []);
      return { results, source: 'google' };
    } catch { /* Provider errors fall back to OpenStreetMap, never expose API keys. */ }
  }
  try {
    return { results: await photon('api/', { q: query, countrycode: 'in' }), source: 'photon' };
  } catch {
    return { results: [], source: 'offline' };
  }
}

type AddressComponent = { longText: string; shortText: string; types: string[] };
export function fromGoogle(data: { formattedAddress: string; addressComponents?: AddressComponent[]; location?: { latitude: number; longitude: number }; id?: string }): GeoLocationResult {
  const parts = data.addressComponents || [];
  const part = (type: string) => parts.find(p => p.types.includes(type))?.longText;
  if (parts.find(p => p.types.includes('country'))?.shortText !== 'IN') throw new Error('Please select a location in India.');
  const city = part('locality') || part('administrative_area_level_3') || part('administrative_area_level_2');
  if (!city) throw new Error('Please choose a city or neighbourhood.');
  return { formattedAddress: data.formattedAddress, city,
    sublocality: part('sublocality_level_1') || part('sublocality'), state: part('administrative_area_level_1'),
    pincode: part('postal_code'), lat: data.location?.latitude, lng: data.location?.longitude,
    placeId: data.id, source: 'google' };
}

export async function resolvePlace(placeId: string, sessionToken: string) {
  if (!key()) throw new Error('Location provider is not configured. Please search again.');
  const data = await json(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${new URLSearchParams({ sessionToken, languageCode: 'en' })}`, {
    headers: { 'X-Goog-Api-Key': key()!, 'X-Goog-FieldMask': 'id,formattedAddress,addressComponents,location' },
  });
  return fromGoogle(data as Parameters<typeof fromGoogle>[0]);
}

export async function reverseLocation(lat: number, lng: number) {
  // Photon provides both search and reverse lookup without a second Google API.
  const results = await photon('reverse', { lat: String(lat), lon: String(lng) });
  if (!results[0]) throw new Error('No Indian location found here. Please search for your city.');
  return results[0];
}
