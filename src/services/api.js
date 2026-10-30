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
  // Use professional architectural photos from Unsplash directly
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

function mapProperty(dto) {
  const type = derivePropertyType(dto.title);
  return {
    id: dto.id,
    title: dto.title,
    address: dto.title,
    price: Number(dto.price),
    latitude: dto.latitude,
    longitude: dto.longitude,
    sqft: dto.areaSqft,
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
