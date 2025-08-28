import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { importFromExcel, exportToExcel, ImportResult } from '../utils/excelUtils';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'stock' | 'materials' | 'tools';
  data: any[];
  onImport: (data: any[]) => Promise<void>;
  validator: (row: any) => { isValid: boolean; errors: string[]; data?: any };
  formatForExport: (data: any[]) => any[];
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  onImport,
  validator,
  formatForExport
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult<any> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const typeLabels = {
    stock: 'Stock Produits',
    materials: 'Matières',
    tools: 'Outillages'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsProcessing(true);
    try {
      const result = await importFromExcel(importFile, validator);
      setImportResult(result);
      
      if (result.success && result.data.length > 0) {
        await onImport(result.data);
      }
    } catch (error) {
      setImportResult({
        success: false,
        data: [],
        errors: ['Erreur lors du traitement du fichier'],
        totalRows: 0,
        validRows: 0
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const formattedData = formatForExport(data);
    const filename = `${typeLabels[type]}_${new Date().toISOString().split('T')[0]}`;
    const success = exportToExcel(formattedData, filename, typeLabels[type]);
    
    if (success) {
      // Optionnel: afficher un message de succès
      console.log('Export réussi');
    }
  };

  const downloadTemplate = () => {
    let templateData: any[] = [];
    
    switch (type) {
      case 'stock':
        templateData = [{
          reference: 'REF-001',
          description: 'Exemple de produit',
          quantity: 100,
          unit: 'pcs',
          stock_location_id: 'ID_EMPLACEMENT'
        }];
        break;
      case 'materials':
        templateData = [{
          lot_number: 'LOT-EXEMPLE-2024-001',
          diameter: 12,
          cases_count: 5,
          weight_kg: 125.5,
          supplier: 'Fournisseur Exemple',
          alert_threshold: 50,
          material_type_id: 'ID_TYPE_MATIERE'
        }];
        break;
      case 'tools':
        templateData = [{
          reference: 'FOR-HSS-12',
          description: 'Foret HSS 12mm',
          quantity: 10,
          alert_threshold: 5,
          tool_type_id: 'ID_TYPE_OUTIL',
          tool_location_id: 'ID_EMPLACEMENT'
        }];
        break;
    }
    
    exportToExcel(templateData, `Template_${typeLabels[type]}`, 'Template');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Import/Export - {typeLabels[type]}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Import
          </button>
        </div>

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <h4 className="font-medium text-blue-900">Export des données</h4>
                  <p className="text-sm text-blue-700">
                    Exporter {data.length} élément(s) vers un fichier Excel
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleExport}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger le fichier Excel
            </button>
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <h4 className="font-medium text-orange-900">Instructions d'import</h4>
                  <p className="text-sm text-orange-700">
                    Utilisez le template Excel pour formater vos données correctement
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={downloadTemplate}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Télécharger le template Excel
            </button>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Sélectionner un fichier Excel
                    </span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Formats supportés: .xlsx, .xls
                  </p>
                </div>
              </div>
            </div>

            {importFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Fichier sélectionné:</strong> {importFile.name}
                </p>
                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Traitement en cours...' : 'Importer les données'}
                </button>
              </div>
            )}

            {importResult && (
              <div className={`rounded-lg p-4 ${
                importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {importResult.success ? 'Import réussi' : 'Erreurs détectées'}
                    </h4>
                    <p className={`text-sm ${
                      importResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {importResult.validRows} ligne(s) valide(s) sur {importResult.totalRows}
                    </p>
                  </div>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-900 mb-2">Erreurs:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>... et {importResult.errors.length - 10} autres erreurs</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExportModal;