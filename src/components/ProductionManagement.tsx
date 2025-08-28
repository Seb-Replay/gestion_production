import React, { useState } from 'react';
import { Plus, Search, Play, Pause, Settings } from 'lucide-react';

const ProductionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    machineNumber: '',
    cadence: '',
    materialType: '',
    materialLot: '',
    reference: '',
    orderNumber: '',
    quantity: '',
    produced: ''
  });
  const [productions, setProductions] = useState([
    {
      id: 1,
      machineNumber: 'machine-1',
      cadence: 120,
      materialType: 'Inox',
      materialLot: 'LOT-INOX-2024-001',
      reference: 'REF-001',
      orderNumber: 'OF-2024-001',
      quantity: 500,
      produced: 350,
      startTime: '08:00',
      estimatedEnd: '14:30',
      status: 'running'
    },
    {
      id: 2,
      machineNumber: 'machine-2',
      cadence: 95,
      materialType: 'Titane',
      materialLot: 'LOT-TI-2024-002',
      reference: 'REF-002',
      orderNumber: 'OF-2024-002',
      quantity: 250,
      produced: 180,
      startTime: '09:15',
      estimatedEnd: '15:45',
      status: 'running'
    },
    {
      id: 3,
      machineNumber: 'machine-3',
      cadence: 0,
      materialType: 'Acier',
      materialLot: 'LOT-AC-2024-003',
      reference: 'REF-003',
      orderNumber: 'OF-2024-003',
      quantity: 800,
      produced: 0,
      startTime: '',
      estimatedEnd: '',
      status: 'stopped'
    },
  ]);

  const machines = [
    { id: 'machine-1', label: 'Machine 1' },
    { id: 'machine-2', label: 'Machine 2' },
    { id: 'machine-3', label: 'Machine 3' },
    { id: 'machine-4', label: 'Machine 4' },
    { id: 'machine-5', label: 'Machine 5' },
  ];

  const handleAdd = () => {
    if (formData.machineNumber && formData.cadence && formData.materialType && formData.materialLot && formData.reference && formData.orderNumber && formData.quantity) {
      const newProduction = {
        id: Date.now(),
        ...formData,
        cadence: parseInt(formData.cadence),
        quantity: parseInt(formData.quantity),
        produced: 0,
        startTime: '',
        estimatedEnd: '',
        status: 'stopped'
      };
      setProductions([...productions, newProduction]);
      setFormData({
        machineNumber: '',
        cadence: '',
        materialType: '',
        materialLot: '',
        reference: '',
        orderNumber: '',
        quantity: ''
      });
      setShowAddModal(false);
    }
  };

  const handleEdit = (production) => {
    setEditingItem(production);
    setFormData({
      machineNumber: production.machineNumber,
      cadence: production.cadence.toString(),
      materialType: production.materialType,
      materialLot: production.materialLot,
      reference: production.reference,
      orderNumber: production.orderNumber,
      quantity: production.quantity.toString(),
      produced: production.produced.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    if (formData.machineNumber && formData.cadence && formData.materialType && formData.materialLot && formData.reference && formData.orderNumber && formData.quantity) {
      setProductions(productions.map(production => 
        production.id === editingItem.id 
          ? { 
              ...production, 
              ...formData,
              cadence: parseInt(formData.cadence),
              quantity: parseInt(formData.quantity),
              produced: parseInt(formData.produced)
            }
          : production
      ));
      setFormData({
        machineNumber: '',
        cadence: '',
        materialType: '',
        materialLot: '',
        reference: '',
        orderNumber: '',
        quantity: '',
        produced: ''
      });
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette production ?')) {
      setProductions(productions.filter(production => production.id !== id));
    }
  };

  const getMachineLabel = (machineId: string) => {
    return machines.find(machine => machine.id === machineId)?.label || machineId;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-orange-600 bg-orange-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'running': return 'En Marche';
      case 'paused': return 'En Pause';
      case 'stopped': return 'Arrêtée';
      default: return status;
    }
  };

  const getProgressPercentage = (produced: number, quantity: number) => {
    return Math.round((produced / quantity) * 100);
  };

  const handleToggleStatus = (productionId: number) => {
    setProductions(productions.map(prod => {
      if (prod.id === productionId) {
        if (prod.status === 'running') {
          return { ...prod, status: 'paused' };
        } else {
          const now = new Date();
          const startTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          const remainingQuantity = prod.quantity - prod.produced;
          const hoursToComplete = remainingQuantity / prod.cadence;
          const endTime = new Date(now.getTime() + hoursToComplete * 60 * 60 * 1000);
          const estimatedEnd = endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          
          return { 
            ...prod, 
            status: 'running',
            startTime: startTime,
            estimatedEnd: estimatedEnd
          };
        }
      }
      return prod;
    }));
  };

  const filteredProductions = productions.filter(prod => {
    const matchesSearch = prod.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prod.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prod.materialLot.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMachine = selectedMachine === 'all' || prod.machineNumber === selectedMachine;
    return matchesSearch && matchesMachine;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion de la Production</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Production
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par référence, OF ou lot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">Toutes les machines</option>
              {machines.map(machine => (
                <option key={machine.id} value={machine.id}>
                  {machine.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              {filteredProductions.length} production(s) trouvée(s)
            </span>
          </div>
        </div>
      </div>

      {/* Production Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProductions.map((production) => (
          <div key={production.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {getMachineLabel(production.machineNumber)}
                </h3>
                <p className="text-sm text-gray-500">{production.reference} - {production.orderNumber}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(production.status)}`}>
                {getStatusLabel(production.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Matière:</span>
                  <p className="font-medium">{production.materialType}</p>
                  <p className="text-xs text-gray-400">{production.materialLot}</p>
                </div>
                <div>
                  <span className="text-gray-500">Cadence:</span>
                  <p className="font-medium">{production.cadence} pcs/h</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progression</span>
                  <span className="font-medium">
                    {production.produced.toLocaleString()} / {production.quantity.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(production.produced, production.quantity)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getProgressPercentage(production.produced, production.quantity)}% terminé
                </div>
              </div>

              {production.status === 'running' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Début:</span>
                    <p className="font-medium">{production.startTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fin estimée:</span>
                    <p className="font-medium">{production.estimatedEnd}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-3 border-t border-gray-100">
                {production.status === 'running' ? (
                  <button 
                    onClick={() => handleToggleStatus(production.id)}
                    className="flex items-center px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </button>
                ) : (
                  <button 
                    onClick={() => handleToggleStatus(production.id)}
                    className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Démarrer
                  </button>
                )}
                <button 
                  onClick={() => handleEdit(production)}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button 
                  onClick={() => handleDelete(production.id)}
                  className="flex items-center px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Production</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                <select 
                  value={formData.machineNumber}
                  onChange={(e) => setFormData({...formData, machineNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>
                      {machine.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cadence (pcs/h)</label>
                <input
                  type="number"
                  value={formData.cadence}
                  onChange={(e) => setFormData({...formData, cadence: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de Matière</label>
                <select 
                  value={formData.materialType}
                  onChange={(e) => setFormData({...formData, materialType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="inox">Inox</option>
                  <option value="titane">Titane</option>
                  <option value="acier">Acier</option>
                  <option value="finemack">Finemack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Matière</label>
                <input
                  type="text"
                  value={formData.materialLot}
                  onChange={(e) => setFormData({...formData, materialLot: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LOT-XXX-2024-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence à Produire</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REF-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° OF</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="OF-2024-XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifier la Production</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                <select 
                  value={formData.machineNumber}
                  onChange={(e) => setFormData({...formData, machineNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une machine</option>
                  {machines.map(machine => (
                    <option key={machine.id} value={machine.id}>
                      {machine.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cadence (pcs/h)</label>
                <input
                  type="number"
                  value={formData.cadence}
                  onChange={(e) => setFormData({...formData, cadence: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de Matière</label>
                <select 
                  value={formData.materialType}
                  onChange={(e) => setFormData({...formData, materialType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un type</option>
                  <option value="inox">Inox</option>
                  <option value="titane">Titane</option>
                  <option value="acier">Acier</option>
                  <option value="finemack">Finemack</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lot Matière</label>
                <input
                  type="text"
                  value={formData.materialLot}
                  onChange={(e) => setFormData({...formData, materialLot: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="LOT-XXX-2024-XXX"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence à Produire</label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="REF-XXX"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">N° OF</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="OF-2024-XXX"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité Produite</label>
                <input
                  type="number"
                  value={formData.produced}
                  onChange={(e) => setFormData({...formData, produced: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setFormData({
                    machineNumber: '',
                    cadence: '',
                    materialType: '',
                    materialLot: '',
                    reference: '',
                    orderNumber: '',
                    quantity: '',
                    produced: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionManagement;