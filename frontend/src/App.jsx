import { useState } from 'react';
import RoutesTab from './adapters/ui/RoutesTab';
import CompareTab from './adapters/ui/CompareTab';
import BankingTab from './adapters/ui/BankingTab';
import PoolingTab from './adapters/ui/PoolingTab';

const TABS = [
  { id: 'routes', label: 'Routes', icon: '🚢' },
  { id: 'compare', label: 'Compare', icon: '📊' },
  { id: 'banking', label: 'Banking', icon: '🏦' },
  { id: 'pooling', label: 'Pooling', icon: '🤝' },
];

function App() {
  const [activeTab, setActiveTab] = useState('routes');

  const renderTab = () => {
    switch (activeTab) {
      case 'routes': return <RoutesTab />;
      case 'compare': return <CompareTab />;
      case 'banking': return <BankingTab />;
      case 'pooling': return <PoolingTab />;
      default: return <RoutesTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-blue-700 to-indigo-700 shadow-md">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 rounded-lg p-2">
                <span className="text-2xl">⛽</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">FuelEU Maritime</h1>
                <p className="text-[11px] text-blue-200">Compliance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-lg px-3 py-1.5">
                <span className="text-xs text-blue-200">Target (2025)</span>
                <span className="text-sm font-bold text-white">89.3368</span>
                <span className="text-[10px] text-blue-200">gCO₂e/MJ</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-6">
          <nav className="flex space-x-1" aria-label="Tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 py-5">
        {renderTab()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="w-full px-6 py-3">
          <p className="text-center text-xs text-gray-400">
            FuelEU Maritime Compliance Platform — Based on EU Regulation 2023/1805
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
