import { useState, useEffect } from 'react';
import { complianceApi, poolApi } from '../../infrastructure/apiClient';

export default function PoolingTab() {
  const [year, setYear] = useState('2024');
  const [adjustedCB, setAdjustedCB] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // First ensure CB is computed
      await complianceApi.getCB(year);
      const cbData = await complianceApi.getAdjustedCB(year);
      setAdjustedCB(Array.isArray(cbData) ? cbData : [cbData]);
      const poolData = await poolApi.getPools(year);
      setPools(poolData);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (shipId) => {
    setSelectedMembers(prev =>
      prev.includes(shipId)
        ? prev.filter(id => id !== shipId)
        : [...prev, shipId]
    );
  };

  const selectedCBs = adjustedCB.filter(cb => selectedMembers.includes(cb.shipId));
  const poolSum = selectedCBs.reduce((sum, cb) => sum + (cb.adjustedCB ?? cb.originalCB ?? 0), 0);
  const isPoolValid = selectedMembers.length >= 2 && poolSum >= 0;

  const handleCreatePool = async () => {
    try {
      setCreating(true);
      setError(null);
      setSuccess(null);
      const result = await poolApi.createPool(parseInt(year), selectedMembers);
      setSuccess(`Pool created with ${result.members.length} members. Total CB: ${result.totalCBAfter.toLocaleString()}`);
      setSelectedMembers([]);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setCreating(false);
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

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">{success}</div>}

      {/* Pool Sum Indicator */}
      {selectedMembers.length > 0 && (
        <div className={`p-4 rounded-lg border-2 ${poolSum >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Pool Sum (CB): </span>
              <span className={`text-lg font-bold ${poolSum >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {poolSum.toLocaleString()} gCO₂eq
              </span>
            </div>
            <div className={`text-sm font-medium ${poolSum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {poolSum >= 0 ? '✅ Valid Pool' : '❌ Invalid — Sum must be ≥ 0'}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
          </div>
        </div>
      )}

      {/* Adjusted CB Table with Member Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Ships — Adjusted Compliance Balance ({year})</h3>
          <button
            onClick={handleCreatePool}
            disabled={!isPoolValid || creating}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Pool'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Select', 'Ship ID', 'Year', 'Original CB', 'Banked Available', 'Adjusted CB', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : adjustedCB.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No compliance data for this year</td></tr>
              ) : (
                adjustedCB.map(item => (
                  <tr key={item.shipId} className={`hover:bg-gray-50 ${selectedMembers.includes(item.shipId) ? 'bg-indigo-50' : ''}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(item.shipId)}
                        onChange={() => toggleMember(item.shipId)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.shipId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.year}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={item.originalCB > 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.originalCB?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.bankedAvailable?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={(item.adjustedCB ?? item.originalCB) > 0 ? 'text-green-600' : 'text-red-600'}>
                        {(item.adjustedCB ?? item.originalCB)?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {(item.adjustedCB ?? item.originalCB) > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Surplus</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Deficit</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Existing Pools */}
      {pools.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Existing Pools ({year})</h3>
          </div>
          {pools.map((pool, idx) => (
            <div key={pool._id || idx} className="border-b border-gray-100 last:border-b-0">
              <div className="px-5 py-3 bg-gray-50 text-sm font-medium text-gray-700">
                Pool #{idx + 1} — Created: {new Date(pool.createdAt).toLocaleDateString()}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Ship ID', 'CB Before', 'CB After', 'Change'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pool.members.map(m => (
                      <tr key={m.shipId}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{m.shipId}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={m.cbBefore > 0 ? 'text-green-600' : 'text-red-600'}>{m.cbBefore?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={m.cbAfter > 0 ? 'text-green-600' : 'text-red-600'}>{m.cbAfter?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={m.cbAfter - m.cbBefore >= 0 ? 'text-green-600' : 'text-orange-600'}>
                            {(m.cbAfter - m.cbBefore) >= 0 ? '+' : ''}{(m.cbAfter - m.cbBefore)?.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
