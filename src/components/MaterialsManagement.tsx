import React, { useState } from 'react';
import { Plus, Search, AlertTriangle, Package2, FileSpreadsheet } from 'lucide-react';
import { useSupabaseData, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '../hooks/useSupabaseData';
import { Material, MaterialType } from '../lib/supabase';
import ImportExportModal from './ImportExportModal';
import { validateMaterial, formatMaterialsForExport } from '../utils/excelUtils';

const MaterialsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    material_type_id: '',
    lotNumber: '',
    diameter: '',
    casesCount: '',
    weightKg: '',
    supplier: '',
    alertThreshold: ''
  });

  // Fetch data from Supabase
  const { data: materials, loading: materialsLoading, refetch: refetchMaterials } = useSupabaseData<Material>('materials');
  const { data: materialTypes, loading: typesLoading } = useSupabaseData<MaterialType>('material_types');
  
  // Supabase operations
  const { insert: insertMaterial, loading: insertLoading } = useSupabaseInsert<Material>('materials');
  const { update: updateMaterial, loading: updateLoading } = useSupabaseUpdate<Material>('materials');
  const { deleteItem: deleteMaterial, loading: deleteLoading } = useSupabaseDelete('materials');

  const handleAdd = async () => {
    if (formData.material_type_id && formData.lotNumber && formData.diameter && formData.casesCount && formData.weightKg && formData.supplier && formData.alertThreshold) {
      const newMaterial = await insertMaterial({
        ...formData,
        lot_number: formData.lotNumber,
        cases_count: parseInt(formData.casesCount),
        weight_kg: parseFloat(formData.weightKg),
        diameter: parseInt(formData.diameter),
        alert_threshold: parseFloat(formData.alertThreshold)
      });
      
      if (newMaterial) {
        refetchMaterials();
        setFormData({
          material_type_id: '',
          lotNumber: '',
          diameter: '',
          casesCount: '',
          weightKg: '',
          supplier: '',
          alertThreshold: ''
        });
        setShowAddModal(false);
      }
    }
  };

  const handleEdit = (material) => {
    setEditingItem(material);
    setFormData({
      material_type_id: material.material_type_id,
      lotNumber: material.lot_number,
      diameter: material.diameter.toString(),
      casesCount: material.cases_count.toString(),
      weightKg: material.weight_kg.toString(),
      supplier: material.supplier,
      alertThreshold: material.alert_threshold.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (formData.material_type_id && formData.lotNumber && formData.diameter && formData.casesCount && formData.weightKg && formData.supplier && formData.alertThreshold) {
      const updated = await updateMaterial(editingItem.id, {
        ...formData,
        lot_number: formData.lotNumber,
        cases_count: parseInt(formData.casesCount),
        weight_kg: parseFloat(formData.weightKg),
        diameter: parseInt(formData.diameter),
        alert_threshold: parseFloat(formData.alertThreshold)
      });
      
      if (updated) {
        refetchMaterials();
        setFormData({
          material_type_id: '',
          lotNumber: '',
          diameter: '',
          casesCount: '',
          weightKg: '',
          supplier: '',
          alertThreshold: ''
        });
        setShowEditModal(false);
        setEditingItem(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
      const success = await deleteMaterial(id);
      if (success) {
        refetchMaterials();
      }
    }
  };

  const handleImport = async (data: any[]) => {
    for (const item of data) {
      await insertMaterial(item);
    }
    refetchMaterials();
  };

  const getMaterialLabel = (typeId: string) => {
    return materialTypes.find(type => type.id === typeId)?.name || typeId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMaterial = selectedMaterial === 'all' || material.material_type_id === selectedMaterial;
    return matchesSearch && matchesMaterial;
  });

  if (materialsLoading || typesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Matières</h2>
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
            Ajouter Matière
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
              placeholder="Rechercher par lot ou fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Package2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tous les matériaux</option>
              {materialTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              {filteredMaterials.length} matière(s) trouvée(s)
            </span>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / N° Lot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diamètre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Réception
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getMaterialLabel(material.material_type_id)}
                      </div>
                      <div className="text-sm text-gray-500">{material.lot_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Ø {material.diameter}mm
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {material.cases_count} caisses
                    </div>
                    <div className="text-sm text-gray-500">
                      {material.weight_kg} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {material.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(material.reception_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(material.status)}`}>
                        {material.status === 'low' ? 'Stock Faible' : 'Normal'}
                      </span>
                      {material.status === 'low' && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(material)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une Matière</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de Matière</label>
                <select 
                  value={formData.material_type_id}
                  onChange={(e) => setFormData({...formData, material_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  {materialTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de Lot/Coulée</label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LOT-XXX-2024-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre (mm)</label>
                <input
                  type="number"
                  value={formData.diameter}
                  onChange={(e) => setFormData({...formData, diameter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nb Caisses</label>
                  <input
                    type="number"
                    value={formData.casesCount}
                    onChange={(e) => setFormData({...formData, casesCount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({...formData, weightKg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="125.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'Alerte (kg)</label>
                <input
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier la Matière</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de Matière</label>
                <select 
                  value={formData.material_type_id}
                  onChange={(e) => setFormData({...formData, material_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  {materialTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">N° de Lot/Coulée</label>
                <input
                  type="text"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LOT-XXX-2024-XXX"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Diamètre (mm)</label>
                <input
                  type="number"
                  value={formData.diameter}
                  onChange={(e) => setFormData({...formData, diameter: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12"
                />
              </div>
              <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nb Caisses</label>
                  <input
                    type="number"
                    value={formData.casesCount}
                    onChange={(e) => setFormData({...formData, casesCount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
              </div>
              <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({...formData, weightKg: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="125.5"
                  />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom du fournisseur"
                />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'Alerte (kg)</label>
                <input
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    material_type_id: '',
                    lotNumber: '',
                    diameter: '',
                    casesCount: '',
                    weightKg: '',
                    supplier: '',
                    alertThreshold: ''
                  });
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
        type="materials"
        data={materials}
        onImport={handleImport}
        validator={validateMaterial}
        formatForExport={formatMaterialsForExport}
      />
    </div>
  );
};

export default MaterialsManagement;