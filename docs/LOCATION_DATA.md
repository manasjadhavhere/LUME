# Location data and providers

`lume-web/src/data/indianCities.json` is an India-only extraction (4,242 cities, state names and coordinates) from the Countries States Cities Database by dr5hn and contributors, distributed through country-state-city 3.2.1. Source: https://github.com/dr5hn/countries-states-cities-database . Database license: https://opendatacommons.org/licenses/odbl/1-0/ . This extracted database is also made available under ODbL 1.0. The country-state-city library itself is GPL-3.0 and is used only as a development-time data export tool; application code does not import it.

The hand-curated metropolitan locality names in `indianGeoLocations.ts` supplement that dataset. Offline entries are suggestions and city centroids, not precise street addresses. Pincode lookup and new neighbourhoods require a live provider.

Google Places (New) provides production autocomplete and selected-place details when `GOOGLE_MAPS_API_KEY` is configured on the API. Photon provides live OpenStreetMap search and reverse geocoding. OpenStreetMap attribution: https://www.openstreetmap.org/copyright . Photon documentation: https://github.com/komoot/photon . Public Photon usage must stay modest; configure a private/managed instance for sustained production traffic. Public Nominatim must not be used for autocomplete.
