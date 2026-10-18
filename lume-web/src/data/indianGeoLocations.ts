import cities from './indianCities.json';
import type { GeoLocationResult } from '../utils/geoCoding';
// country-state-city data (ODbL); attribution: docs/LOCATION_DATA.md.
const aliases: Record<string, string> = { bangalore: 'bengaluru', gurgaon: 'gurugram', bombay: 'mumbai', calcutta: 'kolkata', madras: 'chennai', 'delhi ncr': 'new delhi', pondicherry: 'puducherry' };
export const normalizeLocation = (s: string) => {
  let text = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  Object.entries(aliases).forEach(([from, to]) => { text = text.replaceAll(from, to); });
  return text;
};
const localities: [string, string, string][] = [
  ['Bandra West', 'Mumbai', 'Maharashtra'], ['Bandra East', 'Mumbai', 'Maharashtra'], ['Andheri West', 'Mumbai', 'Maharashtra'],
  ['Andheri East', 'Mumbai', 'Maharashtra'], ['Juhu', 'Mumbai', 'Maharashtra'], ['Powai', 'Mumbai', 'Maharashtra'], ['Colaba', 'Mumbai', 'Maharashtra'],
  ['Worli', 'Mumbai', 'Maharashtra'], ['Dadar', 'Mumbai', 'Maharashtra'], ['Versova', 'Mumbai', 'Maharashtra'],
  ['Indiranagar', 'Bengaluru', 'Karnataka'], ['Koramangala', 'Bengaluru', 'Karnataka'], ['Whitefield', 'Bengaluru', 'Karnataka'],
  ['HSR Layout', 'Bengaluru', 'Karnataka'], ['Jayanagar', 'Bengaluru', 'Karnataka'], ['Electronic City', 'Bengaluru', 'Karnataka'],
  ['Connaught Place', 'New Delhi', 'Delhi'], ['Hauz Khas', 'New Delhi', 'Delhi'], ['Dwarka', 'New Delhi', 'Delhi'], ['Saket', 'New Delhi', 'Delhi'],
  ['Greater Kailash', 'New Delhi', 'Delhi'], ['Karol Bagh', 'New Delhi', 'Delhi'], ['Koregaon Park', 'Pune', 'Maharashtra'],
  ['Baner', 'Pune', 'Maharashtra'], ['Viman Nagar', 'Pune', 'Maharashtra'], ['Kothrud', 'Pune', 'Maharashtra'],
  ['Banjara Hills', 'Hyderabad', 'Telangana'], ['Jubilee Hills', 'Hyderabad', 'Telangana'], ['Gachibowli', 'Hyderabad', 'Telangana'],
  ['Madhapur', 'Hyderabad', 'Telangana'], ['T Nagar', 'Chennai', 'Tamil Nadu'], ['Adyar', 'Chennai', 'Tamil Nadu'],
  ['Anna Nagar', 'Chennai', 'Tamil Nadu'], ['Velachery', 'Chennai', 'Tamil Nadu'], ['Salt Lake', 'Kolkata', 'West Bengal'],
  ['Park Street', 'Kolkata', 'West Bengal'], ['Ballygunge', 'Kolkata', 'West Bengal'], ['Vaishali Nagar', 'Jaipur', 'Rajasthan'],
];
export const indianGeoLocations: GeoLocationResult[] = [
  ...localities.map(([sublocality, city, state]) => ({ formattedAddress: `${sublocality}, ${city}, ${state}`, city, state, sublocality, source: 'offline' as const })),
  ...cities.map(c => ({ ...c, formattedAddress: `${c.city}, ${c.state}`, source: 'offline' as const })),
  { city: 'Delhi NCR', state: 'Delhi', formattedAddress: 'Delhi NCR', source: 'offline' },
  { city: 'Goa', state: 'Goa', formattedAddress: 'Goa', source: 'offline' },
];
export const popularLocations = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Goa', 'Chandigarh']
  .map(name => indianGeoLocations.find(c => !c.sublocality && normalizeLocation(c.city) === normalizeLocation(name)))
  .filter((c): c is GeoLocationResult => !!c);
export function searchOfflineLocations(query: string) {
  const terms = normalizeLocation(query).split(/[\s,]+/).filter(Boolean);
  return indianGeoLocations.filter(c => terms.every(t => normalizeLocation(c.formattedAddress).includes(t)))
    .sort((a, b) => Number(!!a.sublocality) - Number(!!b.sublocality) || a.formattedAddress.length - b.formattedAddress.length).slice(0, 8);
}
