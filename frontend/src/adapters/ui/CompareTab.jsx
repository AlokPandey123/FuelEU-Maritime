import { useState, useEffect } from 'react';
import { routeApi } from '../../infrastructure/apiClient';
import { getTargetIntensity } from '../../core/domain/ComplianceConstants';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b',
  '#a855f7', '#0ea5e9', '#84cc16', '#e11d48', '#22d3ee', '#d946ef', '#fb923c', '#4ade80', '#818cf8', '#fbbf24'];

export default function CompareTab() {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, []);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await routeApi.getComparison();
      setComparison(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading comparison data...</div>;
  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {error}
    </div>
  );
  if (!comparison) return <div className="text-center py-12 text-gray-500">No comparison data available</div>;

  const target = getTargetIntensity(2025);
  const allRoutes = [comparison.baseline, ...comparison.comparisons];

  // Bar chart data
  const barData = allRoutes.map(c => ({
    name: c.routeId,
    ghgIntensity: c.ghgIntensity,
    target: target,
    fill: c.compliant ? '#10b981' : '#ef4444',
  }));

  // Compliance pie
  const compliantCount = comparison.comparisons.filter(c => c.compliant).length + (comparison.baseline.compliant ? 1 : 0);
  const nonCompliantCount = allRoutes.length - compliantCount;
  const pieData = [
    { name: 'Compliant', value: compliantCount, color: '#10b981' },
    { name: 'Non-Compliant', value: nonCompliantCount, color: '#ef4444' },
  ];

  // Fuel type breakdown
  const fuelGroups = {};
  allRoutes.forEach(r => {
    if (!fuelGroups[r.fuelType]) fuelGroups[r.fuelType] = { count: 0, totalIntensity: 0 };
    fuelGroups[r.fuelType].count++;
    fuelGroups[r.fuelType].totalIntensity += r.ghgIntensity;
  });
  const fuelBreakdown = Object.entries(fuelGroups).map(([fuel, data], i) => ({
    name: fuel,
    avgIntensity: Math.round((data.totalIntensity / data.count) * 100) / 100,
    count: data.count,
    color: COLORS[i % COLORS.length],
  }));

  // Radar chart — vessel types
  const vesselGroups = {};
  allRoutes.forEach(r => {
    if (!vesselGroups[r.vesselType]) vesselGroups[r.vesselType] = { totalIntensity: 0, count: 0 };
    vesselGroups[r.vesselType].totalIntensity += r.ghgIntensity;
    vesselGroups[r.vesselType].count++;
  });
  const radarData = Object.entries(vesselGroups).map(([vessel, data]) => ({
    vessel,
    intensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
    fullMark: 100,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 shadow-xl">
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm" style={{ color: p.color }}>
            {p.name}: <span className="font-medium">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider">Baseline</div>
          <div className="mt-1 text-2xl font-bold">{comparison.baseline.routeId}</div>
          <div className="mt-1 text-sm text-indigo-100">{comparison.baseline.vesselType} · {comparison.baseline.fuelType}</div>
        </div>
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-xs font-medium text-cyan-200 uppercase tracking-wider">Baseline GHG</div>
          <div className="mt-1 text-2xl font-bold">{comparison.baseline.ghgIntensity}</div>
          <div className="mt-1 text-sm text-cyan-100">gCO₂e/MJ</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-xs font-medium text-blue-200 uppercase tracking-wider">Target (2025)</div>
          <div className="mt-1 text-2xl font-bold">{target}</div>
          <div className="mt-1 text-sm text-blue-100">gCO₂e/MJ</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider">Compliant</div>
          <div className="mt-1 text-2xl font-bold">{compliantCount} / {allRoutes.length}</div>
          <div className="mt-1 text-sm text-emerald-100">{Math.round(compliantCount / allRoutes.length * 100)}% pass</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
          <div className="text-xs font-medium text-amber-200 uppercase tracking-wider">Routes Compared</div>
          <div className="mt-1 text-2xl font-bold">{comparison.comparisons.length}</div>
          <div className="mt-1 text-sm text-amber-100">vs baseline</div>
        </div>
      </div>

      {/* Charts Row 1: Bar + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">GHG Intensity by Route</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="barRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'gCO₂e/MJ', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={target} stroke="#6366f1" strokeDasharray="8 4" strokeWidth={2} label={{ value: `Target: ${target}`, position: 'top', fontSize: 11, fill: '#6366f1', fontWeight: 600 }} />
              <Bar dataKey="ghgIntensity" name="GHG Intensity" radius={[6, 6, 0, 0]} barSize={32}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill === '#10b981' ? 'url(#barGreen)' : 'url(#barRed)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-gray-600">{d.name}: <strong>{d.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Fuel Breakdown + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg. GHG Intensity by Fuel Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fuelBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} width={70} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={target} stroke="#6366f1" strokeDasharray="8 4" strokeWidth={2} />
              <Bar dataKey="avgIntensity" name="Avg Intensity" radius={[0, 6, 6, 0]} barSize={24}>
                {fuelBreakdown.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Vessel Type Intensity Profile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="vessel" tick={{ fontSize: 11, fill: '#475569' }} />
              <PolarRadiusAxis angle={30} domain={[60, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Radar name="Avg GHG" dataKey="intensity" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Detailed Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Route ID', 'Vessel Type', 'Fuel Type', 'Year', 'GHG Intensity', '% Difference', 'Compliant'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Baseline row */}
              <tr className="bg-blue-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{comparison.baseline.routeId} <span className="text-blue-600">(Baseline)</span></td>
                <td className="px-4 py-3 text-sm text-gray-700">{comparison.baseline.vesselType}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{comparison.baseline.fuelType}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{comparison.baseline.year}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{comparison.baseline.ghgIntensity}</td>
                <td className="px-4 py-3 text-sm text-gray-400">—</td>
                <td className="px-4 py-3 text-sm">
                  {comparison.baseline.compliant ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Yes</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ No</span>
                  )}
                </td>
              </tr>
              {/* Comparison rows */}
              {comparison.comparisons.map(c => (
                <tr key={c.routeId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.routeId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.vesselType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.fuelType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.ghgIntensity}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`font-medium ${c.percentDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {c.percentDiff > 0 ? '+' : ''}{c.percentDiff}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.compliant ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✅ Yes</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">❌ No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
