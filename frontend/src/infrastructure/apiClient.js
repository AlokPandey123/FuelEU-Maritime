import axios from 'axios';

// In production, use the deployed backend URL; in dev, Vite proxy handles it
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Route API Client - implements RouteServicePort
 */
export const routeApi = {
  async getRoutes(filters = {}) {
    const params = new URLSearchParams();
    if (filters.vesselType) params.append('vesselType', filters.vesselType);
    if (filters.fuelType) params.append('fuelType', filters.fuelType);
    if (filters.year) params.append('year', filters.year);
    const { data } = await api.get(`/routes?${params}`);
    return data;
  },

  async getRoutesPaginated(filters = {}, page = 1, limit = 10) {
    const params = new URLSearchParams();
    if (filters.vesselType) params.append('vesselType', filters.vesselType);
    if (filters.fuelType) params.append('fuelType', filters.fuelType);
    if (filters.year) params.append('year', filters.year);
    params.append('page', page);
    params.append('limit', limit);
    const { data } = await api.get(`/routes?${params}`);
    return data;
  },

  async setBaseline(routeId) {
    const { data } = await api.post(`/routes/${routeId}/baseline`);
    return data;
  },

  async getComparison() {
    const { data } = await api.get('/routes/comparison');
    return data;
  },
};

/**
 * Compliance API Client - implements ComplianceServicePort
 */
export const complianceApi = {
  async getCB(year, shipId) {
    const params = new URLSearchParams({ year });
    if (shipId) params.append('shipId', shipId);
    const { data } = await api.get(`/compliance/cb?${params}`);
    return data;
  },

  async getAdjustedCB(year, shipId) {
    const params = new URLSearchParams({ year });
    if (shipId) params.append('shipId', shipId);
    const { data } = await api.get(`/compliance/adjusted-cb?${params}`);
    return data;
  },
};

/**
 * Banking API Client - implements BankingServicePort
 */
export const bankingApi = {
  async getRecords(shipId, year) {
    const params = new URLSearchParams();
    if (shipId) params.append('shipId', shipId);
    if (year) params.append('year', year);
    const { data } = await api.get(`/banking/records?${params}`);
    return data;
  },

  async bankSurplus(shipId, year) {
    const { data } = await api.post('/banking/bank', { shipId, year });
    return data;
  },

  async applyBanked(shipId, year, amount) {
    const { data } = await api.post('/banking/apply', { shipId, year, amount });
    return data;
  },

  async getAvailable() {
    const { data } = await api.get('/banking/available');
    return data;
  },
};

/**
 * Pool API Client - implements PoolServicePort
 */
export const poolApi = {
  async createPool(year, members) {
    const { data } = await api.post('/pools', { year, members });
    return data;
  },

  async getPools(year) {
    const params = year ? `?year=${year}` : '';
    const { data } = await api.get(`/pools${params}`);
    return data;
  },
};
