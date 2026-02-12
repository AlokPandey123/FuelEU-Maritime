import { useState, useEffect } from 'react';
import { complianceApi, bankingApi } from '../../infrastructure/apiClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts';

const CB_COLORS = { surplus: '#10b981', deficit: '#ef4444' };

export default function BankingTab() {
  const [year, setYear] = useState('2024');
  const [cbData, setCbData] = useState(null);
  const [bankRecords, setBankRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [applyForm, setApplyForm] = useState({ shipId: '', amount: '' });
  const [availableSurplus, setAvailableSurplus] = useState(0);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cb = await complianceApi.getCB(year);
      setCbData(Array.isArray(cb) ? cb : [cb]);
      const records = await bankingApi.getRecords(null, year);
      setBankRecords(records);
      const avail = await bankingApi.getAvailable();
      setAvailableSurplus(avail.available ?? 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBank = async (shipId) => {
    try {
      setActionLoading(shipId);
      setError(null);
      setSuccess(null);
      const result = await bankingApi.bankSurplus(shipId, parseInt(year));
      setSuccess(`Banked ${result.bankedAmount.toLocaleString()} gCO₂eq for ${shipId}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      setActionLoading('apply');
      setError(null);
      setSuccess(null);
      const result = await bankingApi.applyBanked(applyForm.shipId, parseInt(year), parseFloat(applyForm.amount));
      setSuccess(`Applied ${result.applied.toLocaleString()} gCO₂eq to ${applyForm.shipId}. CB: ${result.cbBefore.toLocaleString()} → ${result.cbAfter.toLocaleString()}`);
      setApplyForm({ shipId: '', amount: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <label className="text-sm font-medium text-gray-700">Year:</label>
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
        >
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* CB Charts */}
      {cbData && cbData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CB Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Compliance Balance by Ship</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cbData.map(d => ({ name: d.shipId, cb: Math.round(d.cbGco2eq), fill: d.cbGco2eq > 0 ? CB_COLORS.surplus : CB_COLORS.deficit }))} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="cbGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="cbRed" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'gCO₂eq', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip formatter={(v) => [v.toLocaleString() + ' gCO₂eq', 'CB']} />
                <Bar dataKey="cb" name="Compliance Balance" radius={[6, 6, 0, 0]} barSize={36}>
                  {cbData.map((entry, i) => (
                    <Cell key={i} fill={entry.cbGco2eq > 0 ? 'url(#cbGreen)' : 'url(#cbRed)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Surplus vs Deficit Pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Surplus vs Deficit</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Surplus Ships', value: cbData.filter(d => d.cbGco2eq > 0).length, color: '#10b981' },
                    { name: 'Deficit Ships', value: cbData.filter(d => d.cbGco2eq <= 0).length, color: '#ef4444' },
                  ]}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={5} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}
                >
                  <Cell fill="#10b981" stroke="none" />
                  <Cell fill="#ef4444" stroke="none" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{cbData.filter(d => d.cbGco2eq > 0).length}</div>
                <div className="text-xs text-green-700">Surplus Ships</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{cbData.filter(d => d.cbGco2eq <= 0).length}</div>
                <div className="text-xs text-red-700">Deficit Ships</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CB Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Compliance Balance — {year}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Ship ID', 'GHG Intensity', 'Fuel Consumption (t)', 'CB (gCO₂eq)', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : !cbData || cbData.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No compliance data. Fetch CB first.</td></tr>
              ) : (
                cbData.map(item => (
                  <tr key={item.shipId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.shipId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.ghgIntensity}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.fuelConsumption?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={item.cbGco2eq > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.cbGco2eq?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.isSurplus ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Surplus</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Deficit</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleBank(item.shipId)}
                        disabled={item.cbGco2eq <= 0 || actionLoading === item.shipId}
                        className="inline-flex items-center px-3 py-1.5 border border-green-600 text-green-600 text-xs font-medium rounded-md hover:bg-green-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {actionLoading === item.shipId ? 'Banking...' : 'Bank Surplus'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Banked Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Apply Banked Surplus</h3>
          <div className="text-sm">
            <span className="text-gray-500">Available pool: </span>
            <span className={`font-bold ${availableSurplus > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {availableSurplus.toLocaleString()} gCO₂eq
            </span>
          </div>
        </div>
        {availableSurplus <= 0 ? (
          <p className="text-sm text-gray-500">No banked surplus available. Bank a surplus ship first using the table above.</p>
        ) : (
        <form onSubmit={handleApply} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ship ID</label>
            <select
              value={applyForm.shipId}
              onChange={e => setApplyForm(f => ({ ...f, shipId: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
              required
            >
              <option value="">Select ship...</option>
              {cbData?.filter(i => i.cbGco2eq < 0).map(i => (
                <option key={i.shipId} value={i.shipId}>{i.shipId} (Deficit: {i.cbGco2eq.toLocaleString()})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (gCO₂eq)</label>
            <input
              type="number"
              value={applyForm.amount}
              onChange={e => setApplyForm(f => ({ ...f, amount: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 border"
              required
              min="0"
              step="0.01"
            />
          </div>
          <button
            type="submit"
            disabled={actionLoading === 'apply'}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'apply' ? 'Applying...' : 'Apply'}
          </button>
        </form>
        )}
      </div>

      {/* Bank Records */}
      {bankRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Banking Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Ship ID', 'Year', 'Amount (gCO₂eq)', 'Type', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bankRecords.map((rec, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{rec.shipId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{rec.year}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={rec.amountGco2eq > 0 ? 'text-green-600' : 'text-orange-600'}>
                        {rec.amountGco2eq > 0 ? '+' : ''}{rec.amountGco2eq.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{rec.amountGco2eq > 0 ? 'Banked' : 'Applied'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(rec.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
