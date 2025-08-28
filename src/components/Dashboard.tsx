import React from 'react';
import { Package, AlertTriangle, TrendingUp, Factory } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { StockProduct, Material, Tool, Production } from '../lib/supabase';

const Dashboard = () => {
  // Fetch data from Supabase
  const { data: stockProducts, loading: stockLoading } = useSupabaseData<StockProduct>('stock_products');
  const { data: materials, loading: materialsLoading } = useSupabaseData<Material>('materials');
  const { data: tools, loading: toolsLoading } = useSupabaseData<Tool>('tools');
  const { data: productions, loading: productionsLoading } = useSupabaseData<Production>('productions');

  // Calculate stats from real data
  const totalStock = stockProducts.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockAlerts = [...materials.filter(m => m.status === 'low' || m.status === 'critical'),
                          ...tools.filter(t => t.status === 'low' || t.status === 'critical')].length;
  const dailyProduction = productions.filter(p => p.status === 'running')
                                   .reduce((sum, p) => sum + p.produced, 0);
  const activeMachines = productions.filter(p => p.status === 'running').length;
  const totalMachines = 15; // This could come from machines table

  const stats = [
    {
      title: 'Stock Produits Finis',
      value: totalStock.toLocaleString(),
      change: '+12%',
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Alertes Stock',
      value: lowStockAlerts.toString(),
      change: '-2',
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Production Journalière',
      value: dailyProduction.toLocaleString(),
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-green-500',
    },
    {
      title: 'Machines Actives',
      value: `${activeMachines}/${totalMachines}`,
      change: `${Math.round((activeMachines / totalMachines) * 100)}%`,
      icon: Factory,
      color: 'bg-purple-500',
    },
  ];

  // Generate recent activity from real data
  const recentActivity = [
    ...productions.filter(p => p.status === 'running').slice(0, 2).map(p => ({
      id: `prod-${p.id}`,
      action: 'Production en cours',
      reference: p.reference,
      quantity: p.produced,
      time: p.start_time || 'En cours'
    })),
    ...materials.filter(m => m.status === 'low').slice(0, 1).map(m => ({
      id: `mat-${m.id}`,
      action: 'Alerte stock matière',
      reference: m.lot_number,
      quantity: Math.round(m.weight_kg),
      time: 'Maintenant'
    })),
    ...tools.filter(t => t.status === 'low').slice(0, 1).map(t => ({
      id: `tool-${t.id}`,
      action: 'Alerte stock outillage',
      reference: t.reference,
      quantity: t.quantity,
      time: 'Maintenant'
    }))
  ].slice(0, 4);

  if (stockLoading || materialsLoading || toolsLoading || productionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de Bord</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.reference} - Qté: {activity.quantity}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                Aucune activité récente
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Nouvelle Production
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Ajouter Matière
            </button>
            <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Contrôle Qualité
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertes</h3>
          <div className="space-y-3">
            {materials.filter(m => m.status === 'low' || m.status === 'critical').slice(0, 2).map(material => (
              <div key={material.id} className="flex items-center text-sm text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stock faible: {material.lot_number}
              </div>
            ))}
            {tools.filter(t => t.status === 'low' || t.status === 'critical').slice(0, 2).map(tool => (
              <div key={tool.id} className="flex items-center text-sm text-orange-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Stock faible: {tool.reference}
              </div>
            ))}
            {lowStockAlerts === 0 && (
              <div className="text-center text-gray-500 py-4">
                Aucune alerte active
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production du Jour</h3>
          <div className="space-y-3">
            {productions.filter(p => p.status === 'running').slice(0, 3).map(production => (
              <div key={production.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{production.reference}</span>
                <span className="font-medium">{production.produced}/{production.quantity}</span>
              </div>
            ))}
            {productions.filter(p => p.status === 'running').length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Aucune production en cours
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;