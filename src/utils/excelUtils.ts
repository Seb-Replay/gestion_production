import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Types pour l'import/export
export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

// Export vers Excel
export const exportToExcel = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Data'
) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Générer le fichier Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, `${filename}.xlsx`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    return false;
  }
};

// Import depuis Excel
export const importFromExcel = <T>(
  file: File,
  validator: (row: any) => { isValid: boolean; errors: string[]; data?: T }
): Promise<ImportResult<T>> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const result: ImportResult<T> = {
          success: true,
          data: [],
          errors: [],
          totalRows: jsonData.length,
          validRows: 0
        };
        
        jsonData.forEach((row, index) => {
          const validation = validator(row);
          if (validation.isValid && validation.data) {
            result.data.push(validation.data);
            result.validRows++;
          } else {
            result.errors.push(`Ligne ${index + 2}: ${validation.errors.join(', ')}`);
          }
        });
        
        result.success = result.validRows > 0;
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [`Erreur lors de la lecture du fichier: ${error}`],
          totalRows: 0,
          validRows: 0
        });
      }
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Validateurs pour chaque type de données
export const validateStockProduct = (row: any) => {
  const errors: string[] = [];
  
  if (!row.reference || typeof row.reference !== 'string') {
    errors.push('Référence manquante ou invalide');
  }
  if (!row.description || typeof row.description !== 'string') {
    errors.push('Description manquante ou invalide');
  }
  if (!row.quantity || isNaN(Number(row.quantity))) {
    errors.push('Quantité manquante ou invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      reference: row.reference,
      description: row.description,
      quantity: Number(row.quantity),
      unit: row.unit || 'pcs',
      stock_location_id: row.stock_location_id || null
    } : undefined
  };
};

export const validateMaterial = (row: any) => {
  const errors: string[] = [];
  
  if (!row.lot_number || typeof row.lot_number !== 'string') {
    errors.push('Numéro de lot manquant ou invalide');
  }
  if (!row.diameter || isNaN(Number(row.diameter))) {
    errors.push('Diamètre manquant ou invalide');
  }
  if (!row.cases_count || isNaN(Number(row.cases_count))) {
    errors.push('Nombre de caisses manquant ou invalide');
  }
  if (!row.weight_kg || isNaN(Number(row.weight_kg))) {
    errors.push('Poids manquant ou invalide');
  }
  if (!row.supplier || typeof row.supplier !== 'string') {
    errors.push('Fournisseur manquant ou invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      lot_number: row.lot_number,
      diameter: Number(row.diameter),
      cases_count: Number(row.cases_count),
      weight_kg: Number(row.weight_kg),
      supplier: row.supplier,
      alert_threshold: Number(row.alert_threshold) || 50,
      material_type_id: row.material_type_id || null
    } : undefined
  };
};

export const validateTool = (row: any) => {
  const errors: string[] = [];
  
  if (!row.reference || typeof row.reference !== 'string') {
    errors.push('Référence manquante ou invalide');
  }
  if (!row.description || typeof row.description !== 'string') {
    errors.push('Description manquante ou invalide');
  }
  if (!row.quantity || isNaN(Number(row.quantity))) {
    errors.push('Quantité manquante ou invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      reference: row.reference,
      description: row.description,
      quantity: Number(row.quantity),
      alert_threshold: Number(row.alert_threshold) || 5,
      tool_type_id: row.tool_type_id || null,
      tool_location_id: row.tool_location_id || null
    } : undefined
  };
};

// Fonction pour formater les données pour l'export
export const formatStockProductsForExport = (products: any[]) => {
  return products.map(product => ({
    'Référence': product.reference,
    'Description': product.description,
    'Quantité': product.quantity,
    'Unité': product.unit,
    'Emplacement': product.stock_location_id,
    'Statut': product.status,
    'Dernière MAJ': new Date(product.last_update).toLocaleDateString('fr-FR'),
    'Date Création': new Date(product.created_at).toLocaleDateString('fr-FR')
  }));
};

export const formatMaterialsForExport = (materials: any[]) => {
  return materials.map(material => ({
    'N° Lot': material.lot_number,
    'Diamètre (mm)': material.diameter,
    'Nb Caisses': material.cases_count,
    'Poids (kg)': material.weight_kg,
    'Fournisseur': material.supplier,
    'Seuil Alerte': material.alert_threshold,
    'Statut': material.status,
    'Date Réception': new Date(material.reception_date).toLocaleDateString('fr-FR'),
    'Type Matière': material.material_type_id
  }));
};

export const formatToolsForExport = (tools: any[]) => {
  return tools.map(tool => ({
    'Référence': tool.reference,
    'Description': tool.description,
    'Quantité': tool.quantity,
    'Seuil Alerte': tool.alert_threshold,
    'Statut': tool.status,
    'Type Outillage': tool.tool_type_id,
    'Emplacement': tool.tool_location_id,
    'Date Création': new Date(tool.created_at).toLocaleDateString('fr-FR')
  }));
};