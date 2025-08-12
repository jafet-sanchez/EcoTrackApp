console.log('🚀 PRELOAD.JS CARGÁNDOSE...');
const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔧 Preload script iniciando...');

// Configuración de Excel
const EXCEL_CONFIG = {
    fileName: 'Reciclaje_Database.xlsx',
    defaultPath: path.join(os.homedir(), 'Documents'),
    sheets: {
        registros: 'Registros_Reciclaje',
        salidas: 'Salidas_Despachos'
    }
};

// Variables del servicio Excel
let currentExcelPath = null;
let excelWorkbook = null;
let isExcelLoaded = false;

// Función para verificar si XLSX está disponible
function getXLSX() {
    try {
        return require('xlsx');
    } catch (error) {
        console.error('❌ XLSX no está instalado:', error);
        return null;
    }
}

// Exponer APIs al renderer
contextBridge.exposeInMainWorld('electronAPI', {
    async initializeExcelService() {
        try {
            console.log('📊 Inicializando servicio Excel desde preload...');
            
            const XLSX = getXLSX();
            if (!XLSX) {
                return { success: false, message: 'XLSX no está instalado' };
            }
            
            const defaultFilePath = path.join(EXCEL_CONFIG.defaultPath, EXCEL_CONFIG.fileName);
            console.log('📁 Buscando archivo en:', defaultFilePath);
            
            // Verificar si el archivo existe
            if (fs.existsSync(defaultFilePath)) {
                console.log('📁 Archivo Excel encontrado, cargando...');
                try {
                    excelWorkbook = XLSX.readFile(defaultFilePath);
                    currentExcelPath = defaultFilePath;
                    isExcelLoaded = true;
                    console.log('✅ Excel cargado correctamente');
                    return { success: true, message: 'Excel cargado correctamente' };
                } catch (readError) {
                    console.error('❌ Error leyendo archivo Excel:', readError);
                    return { success: false, message: 'Error leyendo archivo Excel: ' + readError.message };
                }
            } else {
                console.log('📝 Archivo no existe, creando nueva base de datos...');
                
                try {
                    // Crear directorio si no existe
                    const dir = path.dirname(defaultFilePath);
                    if (!fs.existsSync(dir)) {
                        console.log('📁 Creando directorio:', dir);
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    
                    // Crear nuevo workbook
                    const workbook = XLSX.utils.book_new();
                    
                    // Crear hojas con headers
                    const registrosHeaders = [['ID', 'Tipo', 'Peso', 'Fecha_Registro', 'Persona', 'Estado', 'Observaciones']];
                    const salidasHeaders = [['ID_Salida', 'ID_Registro', 'Tipo', 'Peso', 'Fecha_Despacho', 'Persona_Autoriza', 'Observaciones']];
                    
                    const registrosSheet = XLSX.utils.aoa_to_sheet(registrosHeaders);
                    const salidasSheet = XLSX.utils.aoa_to_sheet(salidasHeaders);
                    
                    XLSX.utils.book_append_sheet(workbook, registrosSheet, EXCEL_CONFIG.sheets.registros);
                    XLSX.utils.book_append_sheet(workbook, salidasSheet, EXCEL_CONFIG.sheets.salidas);
                    
                    // Guardar archivo
                    console.log('💾 Guardando nuevo archivo Excel...');
                    XLSX.writeFile(workbook, defaultFilePath);
                    
                    currentExcelPath = defaultFilePath;
                    excelWorkbook = workbook;
                    isExcelLoaded = true;
                    
                    console.log('✅ Nueva base de datos Excel creada');
                    return { success: true, message: 'Nueva base de datos Excel creada exitosamente' };
                    
                } catch (createError) {
                    console.error('❌ Error creando archivo Excel:', createError);
                    return { success: false, message: 'Error creando archivo Excel: ' + createError.message };
                }
            }
        } catch (error) {
            console.error('❌ Error general en initializeExcelService:', error);
            return { success: false, message: 'Error general: ' + error.message };
        }
    },

    async saveNewRegistro(registroData) {
        try {
            console.log('💾 Guardando registro:', registroData.ID);
            
            if (!isExcelLoaded || !excelWorkbook) {
                console.warn('⚠️ Excel no está cargado');
                return { success: false, message: 'Excel no está cargado' };
            }

            const XLSX = getXLSX();
            if (!XLSX) {
                return { success: false, message: 'XLSX no disponible' };
            }
            
            // Obtener hoja de registros
            let registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
            if (!registrosSheet) {
                console.error('❌ Hoja de registros no encontrada');
                return { success: false, message: 'Hoja de registros no encontrada' };
            }
            
            // Convertir registro a array
            const registroArray = [
                registroData.ID,
                registroData.Tipo,
                registroData.Peso,
                registroData.Fecha_Registro,
                registroData.Persona,
                registroData.Estado,
                registroData.Observaciones || ''
            ];
            
            // Obtener datos actuales y agregar nueva fila
            const currentData = XLSX.utils.sheet_to_json(registrosSheet, { header: 1 });
            currentData.push(registroArray);
            
            // Recrear hoja
            registrosSheet = XLSX.utils.aoa_to_sheet(currentData);
            excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros] = registrosSheet;
            
            // Guardar archivo
            XLSX.writeFile(excelWorkbook, currentExcelPath);
            
            console.log('✅ Registro guardado en Excel:', registroData.ID);
            return { success: true, message: 'Registro guardado en Excel' };
            
        } catch (error) {
            console.error('❌ Error guardando registro en preload:', error);
            return { success: false, message: 'Error guardando: ' + error.message };
        }
    },

    async procesarSalidaCompleta(registrosIds, salidaData) {
        try {
            console.log('📤 Procesando salida:', salidaData.ID_Salida);
            
            if (!isExcelLoaded || !excelWorkbook) {
                console.warn('⚠️ Excel no está cargado');
                return { success: false, message: 'Excel no está cargado' };
            }

            const XLSX = getXLSX();
            if (!XLSX) {
                return { success: false, message: 'XLSX no disponible' };
            }
            
            // Procesar salidas
            let salidasSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas];
            if (!salidasSheet) {
                console.error('❌ Hoja de salidas no encontrada');
                return { success: false, message: 'Hoja de salidas no encontrada' };
            }
            
            const currentSalidasData = XLSX.utils.sheet_to_json(salidasSheet, { header: 1 });
            
            // Expandir salida grupal
            if (salidaData.Detalle_Grupos && salidaData.Detalle_Grupos.length > 0) {
                salidaData.Detalle_Grupos.forEach(grupo => {
                    grupo.ids.forEach(registroId => {
                        const salidaArray = [
                            salidaData.ID_Salida,
                            registroId,
                            grupo.tipo,
                            (grupo.peso / grupo.ids.length).toFixed(2),
                            salidaData.Fecha_Despacho,
                            salidaData.Persona_Autoriza,
                            salidaData.Observaciones || ''
                        ];
                        currentSalidasData.push(salidaArray);
                    });
                });
            }
            
            // Recrear hoja de salidas
            salidasSheet = XLSX.utils.aoa_to_sheet(currentSalidasData);
            excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas] = salidasSheet;
            
            // Actualizar estados en registros
            let registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
            const registrosArray = XLSX.utils.sheet_to_json(registrosSheet, { header: 1 });
            
            for (let i = 1; i < registrosArray.length; i++) {
                if (registrosIds.includes(registrosArray[i][0])) {
                    registrosArray[i][5] = 'Despachado'; // Columna Estado
                }
            }
            
            // Recrear hoja de registros
            registrosSheet = XLSX.utils.aoa_to_sheet(registrosArray);
            excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros] = registrosSheet;
            
            // Guardar archivo
            XLSX.writeFile(excelWorkbook, currentExcelPath);
            
            console.log('✅ Salida procesada en Excel:', salidaData.ID_Salida);
            return { success: true, message: 'Salida procesada correctamente' };
            
        } catch (error) {
            console.error('❌ Error procesando salida en preload:', error);
            return { success: false, message: 'Error procesando salida: ' + error.message };
        }
    },

    async loadDataFromExcel() {
        try {
          console.log('📊 Cargando datos desde Excel...');
        
          if (!isExcelLoaded || !excelWorkbook) {
            console.warn('⚠️ Excel no está cargado');
            return { success: false, message: 'Excel no está cargado' };
          }

          const XLSX = getXLSX();
          if (!XLSX) {
            return { success: false, message: 'XLSX no disponible' };
          }
        
          const data = {
            registros: [],
            salidas: []
          };
        
          // Leer registros
          const registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
          if (registrosSheet) {
            const registrosArray = XLSX.utils.sheet_to_json(registrosSheet);
            data.registros = registrosArray;
            console.log(`📊 ${registrosArray.length} registros cargados desde Excel`);
          }
        
         // Leer salidas
          const salidasSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas];
          if (salidasSheet) {
             const salidasArray = XLSX.utils.sheet_to_json(salidasSheet);
             data.salidas = salidasArray;
             console.log(`📦 ${salidasArray.length} salidas cargadas desde Excel`);
          }
        
          return { success: true, data: data };
        
        } catch (error) {
           console.error('❌ Error cargando datos desde Excel:', error);
           return { success: false, message: error.message };
        }
    },
    
    // Estados
    get isExcelLoaded() { return isExcelLoaded; },
    get currentExcelPath() { return currentExcelPath; }
});

console.log('✅ Preload script configurado exitosamente');