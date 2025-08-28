import React, { useState } from 'react';
import { Save, Plus, Trash2, MapPin, Users, Building, Settings } from 'lucide-react';
import { useSupabaseData, useSupabaseInsert, useSupabaseUpdate, useSupabaseDelete } from '../hooks/useSupabaseData';
import { StockLocation, ToolLocation, Subcontractor, Machine } from '../lib/supabase';

const SettingsPanel = () => {
  const [activeSection, setActiveSection] = useState('locations');

  // Fetch data from Supabase
  const { data: stockLocations, loading: stockLoading, refetch: refetchStock } = useSupabaseData<StockLocation>('stock_locations');
  const { data: toolLocations, loading: toolsLoading, refetch: refetchTools } = useSupabaseData<ToolLocation>('tool_locations');
  const { data: subcontractors, loading: subcontractorsLoading, refetch: refetchSubcontractors } = useSupabaseData<Subcontractor>('subcontractors');
  const { data: machines, loading: machinesLoading, refetch: refetchMachines } = useSupabaseData<Machine>('machines');
  
  // Supabase operations
  const { insert: insertStockLocation, loading: insertStockLoading } = useSupabaseInsert<StockLocation>('stock_locations');
  const { update: updateStockLocation, loading: updateStockLoading } = useSupabaseUpdate<StockLocation>('stock_locations');
  const { deleteItem: deleteStockLocation } = useSupabaseDelete('stock_locations');
  
  const { insert: insertToolLocation, loading: insertToolLoading } = useSupabaseInsert<ToolLocation>('tool_locations');
  const { update: updateToolLocation, loading: updateToolLoading } = useSupabaseUpdate<ToolLocation>('tool_locations');
  const { deleteItem: deleteToolLocation } = useSupabaseDelete('tool_locations');
  
  const { insert: insertSubcontractor, loading: insertSubcontractorLoading } = useSupabaseInsert<Subcontractor>('subcontractors');
  const { update: updateSubcontractor, loading: updateSubcontractorLoading } = useSupabaseUpdate<Subcontractor>('subcontractors');
  const { deleteItem: deleteSubcontractor } = useSupabaseDelete('subcontractors');
  
  const { insert: insertMachine, loading: insertMachineLoading } = useSupabaseInsert<Machine>('machines');
  const { update: updateMachine, loading: updateMachineLoading } = useSupabaseUpdate<Machine>('machines');
  const { deleteItem: deleteMachine } = useSupabaseDelete('machines');

  // États pour les modales et formulaires
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const sections = [
    { id: 'locations', label: 'Emplacements Stock', icon: MapPin },
    { id: 'tools', label: 'Emplacements Outillages', icon: Building },
    { id: 'subcontractors', label: 'Sous-traitants', icon: Users },
    { id: 'machines', label: 'Machines', icon: Settings },
  ];

  const handleAdd = async () => {
    let success = false;
    
    if (activeSection === 'locations') {
      const result = await insertStockLocation(formData);
      if (result) {
        refetchStock();
        success = true;
      }
    } else if (activeSection === 'tools') {
      const result = await insertToolLocation(formData);
      if (result) {
        refetchTools();
        success = true;
      }
    } else if (activeSection === 'subcontractors') {
      const result = await insertSubcontractor(formData);
      if (result) {
        refetchSubcontractors();
        success = true;
      }
    } else if (activeSection === 'machines') {
      const result = await insertMachine(formData);
      if (result) {
        refetchMachines();
        success = true;
      }
    }
    
    if (success) {
      setFormData({});
      setShowAddModal(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    let success = false;
    
    if (activeSection === 'locations') {
      const result = await updateStockLocation(editingItem.id, formData);
      if (result) {
        refetchStock();
        success = true;
      }
    } else if (activeSection === 'tools') {
      const result = await updateToolLocation(editingItem.id, formData);
      if (result) {
        refetchTools();
        success = true;
      }
    } else if (activeSection === 'subcontractors') {
      const result = await updateSubcontractor(editingItem.id, formData);
      if (result) {
        refetchSubcontractors();
        success = true;
      }
    } else if (activeSection === 'machines') {
      const result = await updateMachine(editingItem.id, formData);
      if (result) {
        refetchMachines();
        success = true;
      }
    }
    
    if (success) {
      setFormData({});
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      let success = false;
      
      if (activeSection === 'locations') {
        success = await deleteStockLocation(id);
        if (success) refetchStock();
      } else if (activeSection === 'tools') {
        success = await deleteToolLocation(id);
        if (success) refetchTools();
      } else if (activeSection === 'subcontractors') {
        success = await deleteSubcontractor(id);
        if (success) refetchSubcontractors();
      } else if (activeSection === 'machines') {
        success = await deleteMachine(id);
        if (success) refetchMachines();
      }
    }
  };

  const renderLocationSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Emplacements de Stock</h3>
        <button 
          onClick={() => {
            setFormData({ name: '', description: '' });
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>
      
      <div className="space-y-3">
        {stockLocations.map((location) => (
          <div key={location.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{location.name}</h4>
              <p className="text-sm text-gray-600">{location.description}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(location)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Modifier
              </button>
              <button 
                onClick={() => handleDelete(location.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderToolSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Emplacements d'Outillages</h3>
        <button 
          onClick={() => {
            setFormData({ name: '', description: '' });
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>
      
      <div className="space-y-3">
        {toolLocations.map((location) => (
          <div key={location.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{location.name}</h4>
              <p className="text-sm text-gray-600">{location.description}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(location)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Modifier
              </button>
              <button 
                onClick={() => handleDelete(location.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubcontractorSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sous-traitants</h3>
        <button 
          onClick={() => {
            setFormData({ name: '', specialty: '', contact: '' });
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>
      
      <div className="space-y-3">
        {subcontractors.map((subcontractor) => (
          <div key={subcontractor.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{subcontractor.name}</h4>
              <p className="text-sm text-gray-600">{subcontractor.specialty}</p>
              <p className="text-sm text-gray-500">{subcontractor.contact}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(subcontractor)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Modifier
              </button>
              <button 
                onClick={() => handleDelete(subcontractor.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMachineSettings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Machines</h3>
        <button 
          onClick={() => {
            setFormData({ name: '', type: '', description: '' });
            setShowAddModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </button>
      </div>
      
      <div className="space-y-3">
        {machines.map((machine) => (
          <div key={machine.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{machine.name}</h4>
              <p className="text-sm text-gray-600">{machine.type}</p>
              <p className="text-sm text-gray-500">{machine.description}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => handleEdit(machine)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Modifier
              </button>
              <button 
                onClick={() => handleDelete(machine.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'locations':
        return renderLocationSettings();
      case 'tools':
        return renderToolSettings();
      case 'subcontractors':
        return renderSubcontractorSettings();
      case 'machines':
        return renderMachineSettings();
      default:
        return renderLocationSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-gray-600 mt-1">Configuration des emplacements et partenaires</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ajouter {activeSection === 'locations' ? 'un Emplacement' : 
                      activeSection === 'tools' ? 'un Emplacement d\'Outillage' : 
                      activeSection === 'subcontractors' ? 'un Sous-traitant' :
                      activeSection === 'machines' ? 'une Machine' : ''}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom"
                />
              </div>
              {activeSection === 'subcontractors' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Spécialité"
                  />
                </div>
              )}
              {activeSection === 'subcontractors' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={formData.contact || ''}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email ou téléphone"
                  />
                </div>
              )}
              {activeSection === 'machines' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Tour CNC">Tour CNC</option>
                    <option value="Centre d'usinage">Centre d'usinage</option>
                    <option value="Tour automatique">Tour automatique</option>
                    <option value="Fraiseuse">Fraiseuse</option>
                    <option value="Rectifieuse">Rectifieuse</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({});
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleAdd}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={insertStockLoading || insertToolLoading || insertSubcontractorLoading || insertMachineLoading}
              >
                {(insertStockLoading || insertToolLoading || insertSubcontractorLoading || insertMachineLoading) ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Modifier {activeSection === 'locations' ? 'l\'Emplacement' : 
                        activeSection === 'tools' ? 'l\'Emplacement d\'Outillage' : 
                        activeSection === 'subcontractors' ? 'le Sous-traitant' :
                        activeSection === 'machines' ? 'la Machine' : ''}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom"
                />
              </div>
              {activeSection === 'subcontractors' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
                  <input
                    type="text"
                    value={formData.specialty || ''}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Spécialité"
                  />
                </div>
              )}
              {activeSection === 'subcontractors' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={formData.contact || ''}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email ou téléphone"
                  />
                </div>
              )}
              {activeSection === 'machines' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Tour CNC">Tour CNC</option>
                    <option value="Centre d'usinage">Centre d'usinage</option>
                    <option value="Tour automatique">Tour automatique</option>
                    <option value="Fraiseuse">Fraiseuse</option>
                    <option value="Rectifieuse">Rectifieuse</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Description"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={updateStockLoading || updateToolLoading || updateSubcontractorLoading || updateMachineLoading}
              >
                {(updateStockLoading || updateToolLoading || updateSubcontractorLoading || updateMachineLoading) ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {(stockLoading || toolsLoading || subcontractorsLoading || machinesLoading) && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Chargement...</div>
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;