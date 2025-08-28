import React, { useState } from 'react';
import { Plus, Search, Filter, Package, MapPin, FileSpreadsheet } from 'lucide-react';
import { useSupabaseData, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '../hooks/useSupabaseData';
import { StockProduct, StockLocation, Subcontractor } from '../lib/supabase';
import ImportExportModal from './ImportExportModal';
import { validateStockProduct, formatStockProductsForExport } from '../utils/excelUtils';

const StockManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    reference: '',
    description: '',
    stock_location_id: '',
    subcontractor_id: '',
    quantity: 0,
    unit: 'pcs'
  });

  // Fetch data from Supabase
  const { data: stockItems, loading: stockLoading, refetch: refetchStock } = useSupabaseData<StockProduct>('stock_products');
  const { data: stockLocations, loading: locationsLoading } = useSupabaseData<StockLocation>('stock_locations');
  const { data: subcontractors, loading: subcontractorsLoading } = useSupabaseData<Subcontractor>('subcontractors');
  
  // Supabase operations
  const { insert: insertStock, loading: insertLoading } = useSupabaseInsert<StockProduct>('stock_products');
  const { update: updateStock, loading: updateLoading } = useSupabaseUpdate<StockProduct>('stock_products');
  const { deleteItem: deleteStock, loading: deleteLoading } = useSupabaseDelete('stock_products');

  const handleAdd = async () => {
    if (formData.reference && formData.description && formData.quantity > 0) {
      const newItem = await insertStock({
        ...formData,
        quantity: parseInt(formData.quantity.toString()),
        subcontractor_id: formData.subcontractor_id || null
      });
      
      if (newItem) {
        refetchStock();
        setFormData({ reference: '', description: '', stock_location_id: '', subcontractor_id: '', quantity: 0, unit: 'pcs' });
        setShowAddModal(false);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      reference: item.reference,
      description: item.description,
      stock_location_id: item.stock_location_id,
      subcontractor_id: item.subcontractor_id || '',
      quantity: item.quantity,
      unit: item.unit
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (formData.reference && formData.description && formData.quantity > 0) {
      const updated = await updateStock(editingItem.id, {
        ...formData,
        quantity: parseInt(formData.quantity.toString()),
        subcontractor_id: formData.subcontractor_id || null
      });
      
      if (updated) {
        refetchStock();
        setFormData({ reference: '', description: '', stock_location_id: '', subcontractor_id: '', quantity: 0, unit: 'pcs' });
        setShowEditModal(false);
        setEditingItem(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      const success = await deleteStock(id);
      if (success) {
        refetchStock();
      }
    }
  };

  const handleImport = async (data: any[]) => {
    for (const item of data) {
      await insertStock(item);
    }
    refetchStock();
  };

  const getLocationLabel = (locationId: string) => {
    return stockLocations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const getSubcontractorLabel = (subcontractorId: string) => {
    if (!subcontractorId) return '';
    return subcontractors.find(sub => sub.id === subcontractorId)?.name || '';
  };

  const isSubcontractingLocation = (locationId: string) => {
    if (!locationId) return false;
    const location = stockLocations.find(loc => loc.id === locationId);
    return location?.name?.toLowerCase().includes('sous-traitance') || false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-800 bg-red-100';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || item.stock_location_id === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  if (stockLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion du Stock Produits</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportExportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Import/Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Produit
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par référence ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tous les emplacements</option>
              {stockLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {filteredItems.length} produit(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière MAJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{item.reference}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div>
                      {getLocationLabel(item.stock_location_id)}
                      {item.subcontractor_id && (
                        <div className="text-xs text-blue-600">
                          → {getSubcontractorLabel(item.subcontractor_id)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status === 'low' ? 'Stock Faible' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.last_update).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Produit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REF-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du produit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select 
                  value={formData.stock_location_id}
                  onChange={(e) => setFormData({...formData, stock_location_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {stockLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              {isSubcontractingLocation(formData.stock_location_id) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-traitant</label>
                  <select 
                    value={formData.subcontractor_id}
                    onChange={(e) => setFormData({...formData, subcontractor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un sous-traitant</option>
                    {subcontractors.map(subcontractor => (
                      <option key={subcontractor.id} value={subcontractor.id}>
                        {subcontractor.name} - {subcontractor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={insertLoading}
              >
                {insertLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier le Produit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REF-XXX"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description du produit"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select 
                  value={formData.stock_location_id}
                  onChange={(e) => setFormData({...formData, stock_location_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {stockLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {isSubcontractingLocation(formData.stock_location_id) && (
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sous-traitant</label>
                  <select 
                    value={formData.subcontractor_id}
                    onChange={(e) => setFormData({...formData, subcontractor_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un sous-traitant</option>
                    {subcontractors.map(subcontractor => (
                      <option key={subcontractor.id} value={subcontractor.id}>
                        {subcontractor.name} - {subcontractor.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                 setFormData({ reference: '', description: '', stock_location_id: '', subcontractor_id: '', quantity: 0, unit: 'pcs' });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={updateLoading}
              >
                {updateLoading ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      <ImportExportModal
        isOpen={showImportExportModal}
        onClose={() => setShowImportExportModal(false)}
        type="stock"
        data={stockItems}
        onImport={handleImport}
        validator={validateStockProduct}
        formatForExport={formatStockProductsForExport}
      />
    </div>
  );
};

export default StockManagement;