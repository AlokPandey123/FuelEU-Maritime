import { useState, useEffect, useCallback } from 'react';
import { routeApi } from '../../infrastructure/apiClient';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend, PieChart, Pie, AreaChart, Area,
} from 'recharts';

const VESSEL_COLORS = {
  Container: '#6366f1', BulkCarrier: '#06b6d4', Tanker: '#f59e0b',
  RoRo: '#ef4444', CruiseShip: '#8b5cf6',
};
const FUEL_COLORS = {
  HFO: '#64748b', LNG: '#06b6d4', MGO: '#f97316', VLSFO: '#84cc16',
  Methanol: '#a855f7', Hydrogen: '#10b981', Ammonia: '#0ea5e9',
};

export default function RoutesTab() {
  const [routes, setRoutes] = useState([]);          // ALL filtered routes (for KPI + charts)
  const [tableRows, setTableRows] = useState([]);    // paginated subset (for table)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ vesselType: '', fuelType: '', year: '' });
  const [settingBaseline, setSettingBaseline] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const PAGE_SIZE = 5;

  // Fetch ALL routes (for KPIs + charts — unaffected by pagination)
  const fetchAllRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeApi.getRoutes(filters);
      setRoutes(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch paginated routes (for table only)
  const fetchTablePage = useCallback(async () => {
    try {
      const result = await routeApi.getRoutesPaginated(filters, page, PAGE_SIZE);
      setTableRows(result.data);
      setPagination(result.pagination);
    } catch (err) {
      // fallback: if paginated endpoint not available, slice locally
      const start = (page - 1) * PAGE_SIZE;
      setTableRows(routes.slice(start, start + PAGE_SIZE));
      setPagination({ page, limit: PAGE_SIZE, total: routes.length, totalPages: Math.ceil(routes.length / PAGE_SIZE) });
    }
  }, [filters, page, routes]);

  useEffect(() => { fetchAllRoutes(); setPage(1); }, [fetchAllRoutes]);
  useEffect(() => { if (routes.length > 0) fetchTablePage(); }, [page, routes, fetchTablePage]);

  const handleSetBaseline = async (routeId) => {
    try {
      setSettingBaseline(routeId);
      await routeApi.setBaseline(routeId);
      await fetchAllRoutes();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSettingBaseline(null);
    }
  };

  const vesselTypes = [...new Set(routes.map(r => r.vesselType))];
  const fuelTypes = [...new Set(routes.map(r => r.fuelType))];
  const years = [...new Set(routes.map(r => r.year))].sort();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vessel Type</label>
          <select
            value={filters.vesselType}
            onChange={e => setFilters(f => ({ ...f, vesselType: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
          >
            <option value="">All</option>
            {vesselTypes.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
          <select
            value={filters.fuelType}
            onChange={e => setFilters(f => ({ ...f, fuelType: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
          >
            <option value="">All</option>
            {fuelTypes.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={filters.year}
            onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
          >
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* KPI Summary Cards */}
      {!loading && routes.length > 0 && (() => {
        const avgGHG = Math.round(routes.reduce((s, r) => s + r.ghgIntensity, 0) / routes.length * 100) / 100;
        const totalFuel = routes.reduce((s, r) => s + r.fuelConsumption, 0);
        const totalEmissions = routes.reduce((s, r) => s + r.totalEmissions, 0);
        const totalDist = routes.reduce((s, r) => s + r.distance, 0);
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-xs font-medium text-indigo-200 uppercase">Avg GHG Intensity</div>
              <div className="mt-1 text-2xl font-bold">{avgGHG}</div>
              <div className="text-xs text-indigo-100">gCO₂e/MJ</div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-xs font-medium text-cyan-200 uppercase">Total Fuel</div>
              <div className="mt-1 text-2xl font-bold">{totalFuel.toLocaleString()}</div>
              <div className="text-xs text-cyan-100">tonnes</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-xs font-medium text-amber-200 uppercase">Total Emissions</div>
              <div className="mt-1 text-2xl font-bold">{totalEmissions.toLocaleString()}</div>
              <div className="text-xs text-amber-100">tonnes CO₂</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white">
              <div className="text-xs font-medium text-emerald-200 uppercase">Total Distance</div>
              <div className="mt-1 text-2xl font-bold">{totalDist.toLocaleString()}</div>
              <div className="text-xs text-emerald-100">km</div>
            </div>
          </div>
        );
      })()}

      {/* Charts Row */}
      {!loading && routes.length > 0 && (() => {
        // Scatter: GHG vs Fuel Consumption
        const scatterData = routes.map(r => ({
          x: r.fuelConsumption,
          y: r.ghgIntensity,
          name: r.routeId,
          vessel: r.vesselType,
          fuel: r.fuelType,
          fill: VESSEL_COLORS[r.vesselType] || '#6366f1',
        }));

        // Fuel type pie
        const fuelCounts = {};
        routes.forEach(r => { fuelCounts[r.fuelType] = (fuelCounts[r.fuelType] || 0) + 1; });
        const fuelPieData = Object.entries(fuelCounts).map(([k, v]) => ({
          name: k, value: v, color: FUEL_COLORS[k] || '#64748b',
        }));

        // Year trend area
        const yearMap = {};
        routes.forEach(r => {
          if (!yearMap[r.year]) yearMap[r.year] = { ghgSum: 0, emSum: 0, count: 0 };
          yearMap[r.year].ghgSum += r.ghgIntensity;
          yearMap[r.year].emSum += r.totalEmissions;
          yearMap[r.year].count++;
        });
        const yearTrend = Object.entries(yearMap)
          .sort(([a], [b]) => a - b)
          .map(([yr, d]) => ({
            year: yr,
            avgGHG: Math.round(d.ghgSum / d.count * 100) / 100,
            avgEmissions: Math.round(d.emSum / d.count),
          }));

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scatter Plot */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">GHG vs Fuel Consumption</h3>
              <ResponsiveContainer width="100%" height={240}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="x" name="Fuel (t)" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="y" name="GHG" domain={[55, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, name) => [v, name === 'x' ? 'Fuel (t)' : 'GHG (gCO₂e/MJ)']} />
                  <Scatter data={scatterData} fill="#6366f1">
                    {scatterData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {Object.entries(VESSEL_COLORS).filter(([k]) => routes.some(r => r.vesselType === k)).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v }} /> {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Fuel Type Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Fuel Type Distribution</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={fuelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {fuelPieData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Year Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">GHG Trend by Year</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={yearTrend} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="ghgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgGHG" name="Avg GHG Intensity" stroke="#6366f1" fill="url(#ghgGrad)" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Routes <span className="text-gray-400 font-normal">({pagination.total} total)</span>
          </h3>
          <div className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Route ID', 'Vessel Type', 'Fuel Type', 'Year', 'GHG Intensity (gCO₂e/MJ)', 'Fuel Consumption (t)', 'Distance (km)', 'Total Emissions (t)', 'Baseline', 'Actions'].map(header => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : tableRows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">No routes found</td></tr>
              ) : (
                tableRows.map(route => (
                  <tr key={route.routeId} className={`hover:bg-gray-50 ${route.isBaseline ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.routeId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.vesselType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.fuelType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.ghgIntensity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.fuelConsumption.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.distance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{route.totalEmissions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      {route.isBaseline ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ★ Baseline
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {!route.isBaseline && (
                        <button
                          onClick={() => handleSetBaseline(route.routeId)}
                          disabled={settingBaseline === route.routeId}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 text-xs font-medium rounded-md hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {settingBaseline === route.routeId ? 'Setting...' : 'Set Baseline'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ««
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹ Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="px-2 text-gray-400 text-xs">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        p === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next ›
              </button>
              <button
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
