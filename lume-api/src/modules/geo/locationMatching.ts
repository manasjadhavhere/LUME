const stateNames = new Set('andhra pradesh|arunachal pradesh|assam|bihar|chhattisgarh|goa|gujarat|haryana|himachal pradesh|jharkhand|karnataka|kerala|madhya pradesh|maharashtra|manipur|meghalaya|mizoram|nagaland|odisha|orissa|punjab|rajasthan|sikkim|tamil nadu|telangana|tripura|uttar pradesh|uttarakhand|west bengal|andaman and nicobar islands|chandigarh|dadra and nagar haveli and daman and diu|delhi|jammu and kashmir|ladakh|lakshadweep|puducherry|india|in'.split('|'));
const aliases = [['Mumbai', 'Bombay', 'Navi Mumbai', 'Thane'], ['Bengaluru', 'Bangalore'], ['Kolkata', 'Calcutta'], ['Chennai', 'Madras'], ['Gurugram', 'Gurgaon'], ['New Delhi', 'Delhi'], ['Puducherry', 'Pondicherry']];

// Locality-to-city radius resolution: when a client selects a locality, the parent city acts as the diameter radius for artist filtering
const localityCityMap: Record<string, string> = {
  // Mumbai MMR
  bandra: 'Mumbai', 'bandra west': 'Mumbai', 'bandra east': 'Mumbai',
  andheri: 'Mumbai', 'andheri west': 'Mumbai', 'andheri east': 'Mumbai',
  juhu: 'Mumbai', powai: 'Mumbai', colaba: 'Mumbai', worli: 'Mumbai',
  dadar: 'Mumbai', versova: 'Mumbai', malad: 'Mumbai', borivali: 'Mumbai',
  goregaon: 'Mumbai', thane: 'Mumbai', 'navi mumbai': 'Mumbai', chembur: 'Mumbai',
  santacruz: 'Mumbai', 'vile parle': 'Mumbai', ghatkopar: 'Mumbai', kurla: 'Mumbai',
  'lower parel': 'Mumbai', byculla: 'Mumbai', khar: 'Mumbai', mulund: 'Mumbai',
  kandivali: 'Mumbai', dahisar: 'Mumbai', bhayandar: 'Mumbai', 'mira road': 'Mumbai',
  'marine drive': 'Mumbai', 'nariman point': 'Mumbai', 'breach candy': 'Mumbai',
  mahalaxmi: 'Mumbai', prabhadevi: 'Mumbai', sion: 'Mumbai', wadala: 'Mumbai',
  matunga: 'Mumbai', vikhroli: 'Mumbai', bhandup: 'Mumbai', kalyan: 'Mumbai',
  dombivli: 'Mumbai', panvel: 'Mumbai', vashi: 'Mumbai', nerul: 'Mumbai',
  belapur: 'Mumbai', kharghar: 'Mumbai',
  // Bengaluru
  indiranagar: 'Bengaluru', koramangala: 'Bengaluru', whitefield: 'Bengaluru',
  'hsr layout': 'Bengaluru', hsr: 'Bengaluru', jayanagar: 'Bengaluru',
  'electronic city': 'Bengaluru', bellandur: 'Bengaluru', marathahalli: 'Bengaluru',
  hebbal: 'Bengaluru', malleshwaram: 'Bengaluru', yelahanka: 'Bengaluru',
  'jp nagar': 'Bengaluru', 'btm layout': 'Bengaluru', btm: 'Bengaluru',
  rajajinagar: 'Bengaluru', banashankari: 'Bengaluru', basavanagudi: 'Bengaluru',
  sarjapur: 'Bengaluru', ulsoor: 'Bengaluru', 'frazer town': 'Bengaluru',
  'kalyan nagar': 'Bengaluru', 'richmond town': 'Bengaluru',
  // Delhi NCR
  'connaught place': 'Delhi', 'hauz khas': 'Delhi', dwarka: 'Delhi',
  saket: 'Delhi', 'greater kailash': 'Delhi', gk: 'Delhi', 'karol bagh': 'Delhi',
  'vasant kunj': 'Delhi', 'lajpat nagar': 'Delhi', 'chandni chowk': 'Delhi',
  rohini: 'Delhi', noida: 'Delhi', gurgaon: 'Delhi', gurugram: 'Delhi',
  faridabad: 'Delhi', ghaziabad: 'Delhi', pitampura: 'Delhi', janakpuri: 'Delhi',
  'defence colony': 'Delhi', 'south extension': 'Delhi', 'new friends colony': 'Delhi',
  chanakyapuri: 'Delhi', 'nehru place': 'Delhi', okhla: 'Delhi', 'mayur vihar': 'Delhi',
  'laxmi nagar': 'Delhi', 'model town': 'Delhi', 'civil lines': 'Delhi',
  // Pune
  'koregaon park': 'Pune', baner: 'Pune', 'viman nagar': 'Pune', kothrud: 'Pune',
  aundh: 'Pune', wakad: 'Pune', hinjawadi: 'Pune', hinjewadi: 'Pune',
  shivajinagar: 'Pune', 'kalyani nagar': 'Pune', hadapsar: 'Pune', lonavala: 'Pune',
  magarpatta: 'Pune', bavdhan: 'Pune', pashan: 'Pune', pimpri: 'Pune',
  chinchwad: 'Pune', pcmc: 'Pune', swargate: 'Pune',
  // Hyderabad
  'banjara hills': 'Hyderabad', 'jubilee hills': 'Hyderabad', gachibowli: 'Hyderabad',
  madhapur: 'Hyderabad', 'hitec city': 'Hyderabad', kondapur: 'Hyderabad',
  secunderabad: 'Hyderabad', kukatpally: 'Hyderabad', begumpet: 'Hyderabad',
  somajiguda: 'Hyderabad', panjagutta: 'Hyderabad', ameerpet: 'Hyderabad',
  'film nagar': 'Hyderabad', manikonda: 'Hyderabad', miyapur: 'Hyderabad',
  // Chennai
  't nagar': 'Chennai', adyar: 'Chennai', 'anna nagar': 'Chennai', velachery: 'Chennai',
  mylapore: 'Chennai', 'besant nagar': 'Chennai', nungambakkam: 'Chennai',
  alwarpet: 'Chennai', thiruvanmiyur: 'Chennai', egmore: 'Chennai', kilpauk: 'Chennai',
  omr: 'Chennai', ecr: 'Chennai', perungudi: 'Chennai', guindy: 'Chennai',
  // Kolkata
  'salt lake': 'Kolkata', 'park street': 'Kolkata', ballygunge: 'Kolkata',
  'new town': 'Kolkata', alipore: 'Kolkata', bhawanipore: 'Kolkata', howrah: 'Kolkata',
  tollygunge: 'Kolkata', jadavpur: 'Kolkata',
  // Jaipur
  'vaishali nagar': 'Jaipur', 'c scheme': 'Jaipur', 'malviya nagar': 'Jaipur',
  mansarovar: 'Jaipur', 'tonk road': 'Jaipur', 'raja park': 'Jaipur',
  // Goa
  calangute: 'Goa', panaji: 'Goa', candolim: 'Goa', anjuna: 'Goa', margao: 'Goa',
  baga: 'Goa', vagator: 'Goa', morjim: 'Goa', siolim: 'Goa', assagao: 'Goa',
  porvorim: 'Goa', mapusa: 'Goa', vasco: 'Goa',
  // Chandigarh
  'sector 17': 'Chandigarh', 'sector 35': 'Chandigarh', mohali: 'Chandigarh',
  panchkula: 'Chandigarh', zirakpur: 'Chandigarh',
};

export function locationSearchTerms(query: string): string[] {
  const raw = query.split(',').map(v => v.trim()).filter(Boolean).slice(0, 8);
  const meaningful = raw.filter((p, i) => !/^(india|in)$/i.test(p) && (raw.length === 1 || i === 0 || !stateNames.has(p.toLowerCase())));

  const resolvedCities: string[] = [];
  const normalizedQuery = query.toLowerCase().trim();

  // Direct piece check
  for (const p of meaningful) {
    const key = p.toLowerCase();
    if (localityCityMap[key]) resolvedCities.push(localityCityMap[key]);
  }
  if (localityCityMap[normalizedQuery]) resolvedCities.push(localityCityMap[normalizedQuery]);

  // Substring locality match for compound queries (e.g. "Near Bandra West")
  if (resolvedCities.length === 0) {
    for (const [locality, parentCity] of Object.entries(localityCityMap)) {
      if (normalizedQuery.includes(locality)) {
        resolvedCities.push(parentCity);
        break;
      }
    }
  }

  const terms = meaningful.flatMap(term => {
    if (/^delhi ncr$/i.test(term)) return ['Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad'];
    return aliases.find(group => group.some(a => a.toLowerCase() === term.toLowerCase())) || [term];
  });

  // Include parent city radius and aliases so all artists in the city diameter match
  for (const c of resolvedCities) {
    const group = aliases.find(g => g.some(a => a.toLowerCase() === c.toLowerCase())) || [c];
    terms.push(...group);
    if (/^delhi$/i.test(c)) terms.push('Noida', 'Gurgaon', 'Gurugram', 'Faridabad', 'Ghaziabad');
  }

  return [...new Set(terms)].slice(0, 16);
}

export function locationCity(location: string): string {
  const parts = location.split(',').map(v => v.trim()).filter(Boolean);
  const meaningful = parts.filter((p, i) => !/^(india|in|\d{6})$/i.test(p) && (parts.length === 1 || i === 0 || !stateNames.has(p.toLowerCase())));
  let city = meaningful[meaningful.length - 1] || 'Not specified';
  const fromMap = localityCityMap[city.toLowerCase()];
  if (fromMap) city = fromMap;
  return aliases.find(group => group.some(a => a.toLowerCase() === city.toLowerCase()))?.[0] || city;
}

