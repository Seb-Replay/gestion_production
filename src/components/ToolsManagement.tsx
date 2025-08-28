import React, { useState } from 'react';
import { Plus, Search, Wrench, MapPin, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useSupabaseData, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '../hooks/useSupabaseData';
import { Tool, ToolType, ToolLocation } from '../lib/supabase';
import ImportExportModal from './ImportExportModal';
import { validateTool, formatToolsForExport } from '../utils/excelUtils';

const ToolsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    tool_type_id: '',
    reference: '',
    description: '',
    quantity: '',
    tool_location_id: '',
    alertThreshold: ''
  });

  // Fetch data from Supabase
  const { data: tools, loading: toolsLoading, refetch: refetchTools } = useSupabaseData<Tool>('tools');
  const { data: toolTypes, loading: typesLoading } = useSupabaseData<ToolType>('tool_types');
  const { data: toolLocations, loading: locationsLoading } = useSupabaseData<ToolLocation>('tool_locations');
  
  // Supabase operations
  const { insert: insertTool, loading: insertLoading } = useSupabaseInsert<Tool>('tools');
  const { update: updateTool, loading: updateLoading } = useSupabaseUpdate<Tool>('tools');
  const { deleteItem: deleteTool, loading: deleteLoading } = useSupabaseDelete('tools');

  const handleAdd = async () => {
    if (formData.tool_type_id && formData.reference && formData.description && formData.quantity && formData.tool_location_id && formData.alertThreshold) {
      const newTool = await insertTool({
        ...formData,
        quantity: parseInt(formData.quantity),
        alert_threshold: parseInt(formData.alertThreshold)
      });
      
      if (newTool) {
        refetchTools();
        setFormData({
          tool_type_id: '',
          reference: '',
          description: '',
          quantity: '',
          tool_location_id: '',
          alertThreshold: ''
        });
        setShowAddModal(false);
      }
    }
  };

  const handleEdit = (tool) => {
    setEditingItem(tool);
    setFormData({
      tool_type_id: tool.tool_type_id,
      reference: tool.reference,
      description: tool.description,
      quantity: tool.quantity.toString(),
      tool_location_id: tool.tool_location_id,
      alertThreshold: tool.alert_threshold.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (formData.tool_type_id && formData.reference && formData.description && formData.quantity && formData.tool_location_id && formData.alertThreshold) {
      const updated = await updateTool(editingItem.id, {
        ...formData,
        quantity: parseInt(formData.quantity),
        alert_threshold: parseInt(formData.alertThreshold)
      });
      
      if (updated) {
        refetchTools();
        setFormData({
          tool_type_id: '',
          reference: '',
          description: '',
          quantity: '',
          tool_location_id: '',
          alertThreshold: ''
        });
        setShowEditModal(false);
        setEditingItem(null);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet outillage ?')) {
      const success = await deleteTool(id);
      if (success) {
        refetchTools();
      }
    }
  };

  const handleImport = async (data: any[]) => {
    for (const item of data) {
      await insertTool(item);
    }
    refetchTools();
  };

  const getTypeLabel = (typeId: string) => {
    return toolTypes.find(type => type.id === typeId)?.name || typeId;
  };

  const getLocationLabel = (locationId: string) => {
    return toolLocations.find(loc => loc.id === locationId)?.name || locationId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || tool.tool_type_id === selectedType;
    return matchesSearch && matchesType;
  });

  if (toolsLoading || typesLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Outillages</h2>
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
            Ajouter Outillage
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
            <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Tous les types</option>
              {toolTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              {filteredTools.length} outillage(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type / Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emplacement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seuil Alerte
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
              {filteredTools.map((tool) => (
                <tr key={tool.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getTypeLabel(tool.tool_type_id)}
                      </div>
                      <div className="text-sm text-gray-500">{tool.reference}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tool.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">{tool.quantity}</span>
                      {tool.quantity <= tool.alert_threshold && (
                        <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {getLocationLabel(tool.tool_location_id)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tool.alert_threshold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tool.status)}`}>
                      {tool.status === 'low' ? 'Stock Faible' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(tool)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(tool.id)}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un Outillage</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={formData.tool_type_id}
                  onChange={(e) => setFormData({...formData, tool_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  {toolTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="FOR-HSS-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description de l'outillage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select 
                  value={formData.tool_location_id}
                  onChange={(e) => setFormData({...formData, tool_location_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {toolLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'Alerte</label>
                <input
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier l'Outillage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={formData.tool_type_id}
                  onChange={(e) => setFormData({...formData, tool_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  {toolTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="FOR-HSS-12"
                />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description de l'outillage"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Emplacement</label>
                <select 
                  value={formData.tool_location_id}
                  onChange={(e) => setFormData({...formData, tool_location_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {toolLocations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'Alerte</label>
                <input
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    tool_type_id: '',
                    reference: '',
                    description: '',
                    quantity: '',
                    tool_location_id: '',
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
        type="tools"
        data={tools}
        onImport={handleImport}
        validator={validateTool}
        formatForExport={formatToolsForExport}
      />
    </div>
  );
};

export default ToolsManagement;