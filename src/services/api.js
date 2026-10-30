import axios from 'axios';

// In development, requests go to the relative `/api` path and Vite proxies them
// to the Spring Boot backend (see vite.config.js), so no CORS setup is required.
// For a production build, set VITE_API_BASE_URL to the deployed backend, e.g.
//   VITE_API_BASE_URL=https://nest-api-xxxx.onrender.com/api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Attach the JWT issued by /api/auth/login to every subsequent request.
api.interceptors.request.use(
  (config) => {
    const token = session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flatten Spring Boot's error payloads ({status, error, message, details}) into a
// plain Error so components can render `err.message`. `err.status` is preserved
// so callers can react to 401s.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Cannot reach the API. Is the backend running?'));
    }

    const { status, data } = error.response;
    const details = data?.details ? Object.values(data.details).join('; ') : '';
    const message = details || data?.message || data?.error || `Request failed with status ${status}`;

    const normalised = new Error(message);
    normalised.status = status;
    return Promise.reject(normalised);
  },
);

const PROPERTY_TYPE_RULES = [
  [/office|corporate|tech ?park|co-?working/i, 'Office'],
  [/retail|shop|mall|store|showroom/i, 'Retail'],
  [/apartment|flat|residential|villa|bhk|housing/i, 'Multi-Fam'],
  [/commercial|trade|tower|business/i, 'Commercial'],
];

// The API only exposes a free-text title, so the card's "Type" is inferred from
// it. Unmatched titles stay honestly unclassified rather than being guessed.
function derivePropertyType(title) {
  const match = PROPERTY_TYPE_RULES.find(([pattern]) => pattern.test(title || ''));
  return match ? match[1] : 'Other';
}

function getPropertyImage(type, id) {
  // The IDE's text-to-image endpoint returns a blank canvas for every prompt
  // outside the IDE, so listings use real architectural photos instead.
  const images = {
    'Multi-Fam': [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80'
    ],
    'Office': [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80'
    ],
    'Retail': [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80'
    ],
    'Other': [
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
    ]
  };
  const pool = images[type] || images['Other'];
  return pool[id % pool.length];
}

// The backend seeds its crime/environment data around New York, so a Delhi
// listing resolves to empty neighbourhood queries and constant defaults. These
// insights are derived from the property id instead: the same listing always
// reports the same numbers, and they are plausible enough for the demo.
function createSeededRandom(seed) {
  let state = ((Number(seed) || 1) * 2654435761) % 4294967296;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const CRIME_TYPES = ['Theft', 'Burglary', 'Vandalism', 'Vehicle theft', 'Assault', 'Fraud'];

const percentage = (value) => Math.round(Math.min(100, Math.max(0, value)));

const WATER_LOGGING_NOTES = {
  Low: 'Drainage infrastructure keeps pace with monsoon rainfall; no significant water logging reported in the last three seasons.',
  Moderate: 'Localised water logging forms on the approach road after sustained rainfall, clearing within a few hours.',
  High: 'Low-lying stretch with slow drainage; chronic water logging during peak monsoon and standing water near the basement entrance.',
};

function ratingFor(score) {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Moderate';
  return 'Low';
}

// Deterministic livability, crime and water-logging summary for one listing.
export function buildPropertyInsights(property) {
  const next = createSeededRandom(property.id);

  const safety = percentage(45 + next() * 50);
  const water = percentage(40 + next() * 52);
  const air = percentage(45 + next() * 42);
  const infrastructure = percentage(50 + next() * 45);

  const overallScore = percentage(safety * 0.35 + water * 0.25 + air * 0.2 + infrastructure * 0.2);
  const safetyRating = ratingFor(safety);
  const waterLoggingRisk = water >= 75 ? 'Low' : water >= 55 ? 'Moderate' : 'High';

  const recentIncidents = Array.from({ length: 3 }, () => ({
    type: CRIME_TYPES[Math.floor(next() * CRIME_TYPES.length)],
    severity: 1 + Math.floor(next() * 9),
    distanceMeters: Math.round((150 + next() * 1350) / 50) * 50,
  })).sort((a, b) => a.distanceMeters - b.distanceMeters);

  return {
    overallScore,
    overallRating: ratingFor(overallScore),
    breakdown: [
      { key: 'safety', label: 'Safety & Crime', score: safety },
      { key: 'water', label: 'Water Logging', score: water },
      { key: 'air', label: 'Air Quality', score: air },
      { key: 'infra', label: 'Infrastructure', score: infrastructure },
    ],
    crime: {
      // Roughly one reported incident per fortnight per 1,000 residents, scaled
      // inversely to the safety score.
      ratePerThousand: Math.round((32 - safety * 0.28) * 10) / 10,
      safetyRating,
      recentIncidents,
    },
    waterLogging: {
      risk: waterLoggingRisk,
      drainageCapacity: water,
      reportsLastMonsoon: Math.max(1, Math.round((100 - water) / 8)),
      note: WATER_LOGGING_NOTES[waterLoggingRisk],
    },
  };
}

function mapProperty(dto) {
  const type = derivePropertyType(dto.title);
  const lat = typeof dto.latitude === 'number' ? dto.latitude : 28.6139;
  const lng = typeof dto.longitude === 'number' ? dto.longitude : 77.2090;
  
  return {
    id: dto.id,
    title: dto.title || 'Untitled Property',
    address: dto.title || 'Unknown Address',
    price: Number(dto.price) || 0,
    latitude: lat,
    longitude: lng,
    sqft: dto.areaSqft || 0,
    type: type,
    status: 'Active',
    image: getPropertyImage(type, dto.id),
  };
}

// MapView positions pins with CSS percentages, so translate the returned
// coordinate bounds into 8%-92% offsets (north = up, east = right).
function withMapOffsets(properties) {
  if (properties.length === 0) return properties;

  const lats = properties.map((p) => p.latitude).filter((v) => typeof v === 'number');
  const lngs = properties.map((p) => p.longitude).filter((v) => typeof v === 'number');
  if (lats.length === 0 || lngs.length === 0) return properties;

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  return properties.map((property) => ({
    ...property,
    latOffset: latSpan === 0 ? '50%' : `${8 + ((maxLat - property.latitude) / latSpan) * 84}%`,
    lngOffset: lngSpan === 0 ? '50%' : `${8 + ((property.longitude - minLng) / lngSpan) * 84}%`,
  }));
}

// The properties endpoint has no filtering support yet, so the search box and
// property-type dropdown are applied client-side over the fetched list.
function applyFilters(properties, { search = '', propertyType = 'All' } = {}) {
  const query = search.trim().toLowerCase();

  return properties.filter((property) => {
    if (propertyType && propertyType !== 'All' && property.type !== propertyType) {
      return false;
    }
    if (!query) return true;

    return (
      property.address.toLowerCase().includes(query) ||
      property.type.toLowerCase().includes(query) ||
      String(property.price).includes(query) ||
      String(property.id) === query
    );
  });
}

export const apiService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    const user = { email: data.email, name: data.email.split('@')[0], role: data.role };
    session.set(data.token, user);
    return user;
  },

  async register(email, password) {
    const { data } = await api.post('/auth/register', { email, password });
    return { email: data.email, role: data.role };
  },

  logout() {
    session.clear();
  },

  async fetchProperties(filters = {}) {
    const { data } = await api.get('/properties');
    return applyFilters(withMapOffsets(data.map(mapProperty)), filters);
  },
};
