import React, { useState } from 'react';
import { Package, Wrench, Factory, BarChart3, Settings, Plus } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import MaterialsManagement from './components/MaterialsManagement';
import ToolsManagement from './components/ToolsManagement';
import ReferencesManagement from './components/ReferencesManagement';
import ProductionManagement from './components/ProductionManagement';
import SettingsPanel from './components/SettingsPanel';

type TabType = 'dashboard' | 'stock' | 'materials' | 'tools' | 'references' | 'production' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
    { id: 'stock', label: 'Stock Produits', icon: Package },
    { id: 'materials', label: 'Matières', icon: Factory },
    { id: 'tools', label: 'Outillages', icon: Wrench },
    { id: 'references', label: 'Références', icon: Plus },
    { id: 'production', label: 'Production', icon: Factory },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'stock':
        return <StockManagement />;
      case 'materials':
        return <MaterialsManagement />;
      case 'tools':
        return <ToolsManagement />;
      case 'references':
        return <ReferencesManagement />;
      case 'production':
        return <ProductionManagement />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Factory className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Gestion Production & Stock - Décolletage de Précision
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Système de gestion simplifié
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;