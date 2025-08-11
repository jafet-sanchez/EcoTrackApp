// ===========================================
// SERVICIO EXCEL PARA ECOTRAK 
// ===========================================

/**
 * Configuración del servicio Excel
 */
const EXCEL_CONFIG = {
    fileName: 'Reciclaje_Database.xlsx',
    defaultPath: require('path').join(require('os').homedir(), 'Documents'),
    sheets: {
        registros: 'Registros_Reciclaje',
        salidas: 'Salidas_Despachos'
    }
};

/**
 * Variables para el manejo de Excel
 */
let currentExcelPath = null;
let excelWorkbook = null;
let isExcelLoaded = false;

// ===========================================
// FUNCIONES PRINCIPALES DE EXCEL
// ===========================================

/**
 * Inicializar servicio Excel al cargar la aplicación
 */
async function initializeExcelService() {
    console.log('📊 Inicializando servicio Excel...');
    
    try {
        // Verificar si el archivo existe
        const defaultFilePath = require('path').join(EXCEL_CONFIG.defaultPath, EXCEL_CONFIG.fileName);
        
        if (await fileExists(defaultFilePath)) {
            console.log('📁 Archivo Excel existente encontrado');
            await loadExcelDatabase(defaultFilePath);
        } else {
            console.log('📝 Creando nueva base de datos Excel');
            await createNewExcelDatabase();
        }
        
        console.log('✅ Servicio Excel inicializado correctamente');
        showToast('Excel', 'Base de datos Excel lista', 'success');
        
    } catch (error) {
        console.error('❌ Error inicializando Excel:', error);
        showToast('Error', 'No se pudo inicializar Excel', 'error');
        
        // Crear base de datos en memoria como fallback
        initializeInMemoryData();
    }
}

/**
 * Crear nueva base de datos Excel
 */
async function createNewExcelDatabase() {
    try {
        const XLSX = require('xlsx');
        
        // Crear nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();
        
        // Crear hoja de Registros de Reciclaje
        const registrosData = [
            ['ID', 'Tipo', 'Peso', 'Fecha_Registro', 'Persona', 'Estado', 'Observaciones']
        ];
        const registrosSheet = XLSX.utils.aoa_to_sheet(registrosData);
        
        // Crear hoja de Salidas/Despachos
        const salidasData = [
            ['ID_Salida', 'ID_Registro', 'Tipo', 'Peso', 'Fecha_Despacho', 'Persona_Autoriza', 'Observaciones']
        ];
        const salidasSheet = XLSX.utils.aoa_to_sheet(salidasData);
        
        // Agregar hojas al libro
        XLSX.utils.book_append_sheet(workbook, registrosSheet, EXCEL_CONFIG.sheets.registros);
        XLSX.utils.book_append_sheet(workbook, salidasSheet, EXCEL_CONFIG.sheets.salidas);
        
        // Guardar archivo
        const defaultPath = require('path').join(EXCEL_CONFIG.defaultPath, EXCEL_CONFIG.fileName);
        XLSX.writeFile(workbook, defaultPath);
        
        currentExcelPath = defaultPath;
        excelWorkbook = workbook;
        isExcelLoaded = true;
        
        console.log('✅ Nueva base de datos Excel creada:', defaultPath);
        
        // Cargar datos iniciales de ejemplo
        await addInitialSampleData();
        
    } catch (error) {
        console.error('❌ Error creando base de datos Excel:', error);
        throw error;
    }
}

/**
 * Cargar base de datos Excel existente
 */
async function openDatabase(filePath) {
    console.log('📁 Abrir base de datos:', filePath);
    
    try {
        showLoading('Cargando base de datos Excel...');
        
        await loadExcelDatabase(filePath);
        
        hideLoading();
        showToast('Éxito', `Base de datos cargada: ${require('path').basename(filePath)}`, 'success');
        
        // Actualizar interfaz
        updateDashboard();
        if (currentSection === 'reportes') {
            loadReportesData();
        }
        if (currentSection === 'historial') {
            loadHistorialData();
        }
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error guardando como:', error);
        showToast('Error', 'No se pudo guardar la base de datos', 'error');
    }
}

/**
 * Cargar datos desde Excel a las variables globales
 */
async function loadDataFromExcel() {
    try {
        const XLSX = require('xlsx');
        
        if (!excelWorkbook) {
            throw new Error('No hay libro de Excel cargado');
        }
        
        // Cargar registros de reciclaje
        const registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
        if (registrosSheet) {
            const registrosArray = XLSX.utils.sheet_to_json(registrosSheet);
            registrosData.length = 0; // Limpiar array existente
            registrosData.push(...registrosArray);
            console.log(`📊 ${registrosData.length} registros cargados desde Excel`);
        }
        
        // Cargar salidas/despachos
        const salidasSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas];
        if (salidasSheet) {
            const salidasArray = XLSX.utils.sheet_to_json(salidasSheet);
            // Convertir a formato interno de salidas agrupadas
            salidasData.length = 0; // Limpiar array existente
            
            // Agrupar salidas por ID_Salida
            const salidasGrouped = groupSalidasFromExcel(salidasArray);
            salidasData.push(...salidasGrouped);
            console.log(`📦 ${salidasData.length} salidas cargadas desde Excel`);
        }
        
        // Actualizar interfaz
        updateDashboard();
        
    } catch (error) {
        console.error('❌ Error cargando datos desde Excel:', error);
        throw error;
    }
}

/**
 * Guardar registro en Excel
 */
async function saveRegistroToExcel(registro) {
    try {
        if (!isExcelLoaded || !excelWorkbook) {
            console.warn('⚠️ Excel no está cargado, guardando solo en memoria');
            return;
        }
        
        const XLSX = require('xlsx');
        
        // Obtener hoja de registros
        let registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
        
        // Convertir registro a array para agregar
        const registroArray = [
            registro.ID,
            registro.Tipo,
            registro.Peso,
            registro.Fecha_Registro,
            registro.Persona,
            registro.Estado,
            registro.Observaciones || ''
        ];
        
        // Agregar fila a la hoja
        const registrosData = XLSX.utils.sheet_to_json(registrosSheet, { header: 1 });
        registrosData.push(registroArray);
        
        // Recrear hoja con nuevos datos
        registrosSheet = XLSX.utils.aoa_to_sheet(registrosData);
        excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros] = registrosSheet;
        
        // Guardar archivo
        XLSX.writeFile(excelWorkbook, currentExcelPath);
        
        console.log('💾 Registro guardado en Excel:', registro.ID);
        
    } catch (error) {
        console.error('❌ Error guardando registro en Excel:', error);
        showToast('Error', 'No se pudo guardar en Excel', 'error');
    }
}

/**
 * Guardar salida en Excel (formato expandido)
 */
async function saveSalidaToExcel(salida) {
    try {
        if (!isExcelLoaded || !excelWorkbook) {
            console.warn('⚠️ Excel no está cargado, guardando solo en memoria');
            return;
        }
        
        const XLSX = require('xlsx');
        
        // Obtener hoja de salidas
        let salidasSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas];
        const salidasData = XLSX.utils.sheet_to_json(salidasSheet, { header: 1 });
        
        // Expandir salida grupal a registros individuales para Excel
        if (salida.Detalle_Grupos && salida.Detalle_Grupos.length > 0) {
            // Salida grupal - crear una fila por cada registro
            salida.Detalle_Grupos.forEach(grupo => {
                grupo.ids.forEach(registroId => {
                    const registro = registrosData.find(r => r.ID === registroId);
                    if (registro) {
                        const salidaArray = [
                            salida.ID_Salida,
                            registroId,
                            registro.Tipo,
                            registro.Peso,
                            salida.Fecha_Despacho,
                            salida.Persona_Autoriza,
                            salida.Observaciones || ''
                        ];
                        salidasData.push(salidaArray);
                    }
                });
            });
        } else {
            // Salida individual (compatibilidad)
            const salidaArray = [
                salida.ID_Salida,
                salida.Registros_Procesados || '',
                'Mixto',
                0,
                salida.Fecha_Despacho,
                salida.Persona_Autoriza,
                salida.Observaciones || ''
            ];
            salidasData.push(salidaArray);
        }
        
        // Recrear hoja con nuevos datos
        salidasSheet = XLSX.utils.aoa_to_sheet(salidasData);
        excelWorkbook.Sheets[EXCEL_CONFIG.sheets.salidas] = salidasSheet;
        
        // Guardar archivo
        XLSX.writeFile(excelWorkbook, currentExcelPath);
        
        console.log('💾 Salida guardada en Excel:', salida.ID_Salida);
        
    } catch (error) {
        console.error('❌ Error guardando salida en Excel:', error);
        showToast('Error', 'No se pudo guardar salida en Excel', 'error');
    }
}

/**
 * Actualizar estado de registro en Excel
 */
async function updateRegistroEstadoInExcel(registroId, nuevoEstado) {
    try {
        if (!isExcelLoaded || !excelWorkbook) {
            console.warn('⚠️ Excel no está cargado');
            return;
        }
        
        const XLSX = require('xlsx');
        
        // Obtener datos de la hoja
        const registrosSheet = excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros];
        const registrosArray = XLSX.utils.sheet_to_json(registrosSheet, { header: 1 });
        
        // Encontrar y actualizar registro
        for (let i = 1; i < registrosArray.length; i++) { // Empezar en 1 para saltar headers
            if (registrosArray[i][0] === registroId) { // Columna ID
                registrosArray[i][5] = nuevoEstado; // Columna Estado
                break;
            }
        }
        
        // Recrear hoja
        const newSheet = XLSX.utils.aoa_to_sheet(registrosArray);
        excelWorkbook.Sheets[EXCEL_CONFIG.sheets.registros] = newSheet;
        
        // Guardar archivo
        XLSX.writeFile(excelWorkbook, currentExcelPath);
        
        console.log('🔄 Estado actualizado en Excel:', registroId, '->', nuevoEstado);
        
    } catch (error) {
        console.error('❌ Error actualizando estado en Excel:', error);
    }
}

// ===========================================
// FUNCIONES DE UTILIDAD
// ===========================================

/**
 * Verificar si un archivo existe
 */
async function fileExists(filePath) {
    try {
        const fs = require('fs').promises;
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Agrupar salidas desde Excel al formato interno
 */
function groupSalidasFromExcel(salidasArray) {
    const salidasMap = new Map();
    
    salidasArray.forEach(row => {
        const idSalida = row.ID_Salida;
        
        if (!salidasMap.has(idSalida)) {
            salidasMap.set(idSalida, {
                ID_Salida: idSalida,
                Fecha_Despacho: row.Fecha_Despacho,
                Persona_Autoriza: row.Persona_Autoriza,
                Observaciones: row.Observaciones,
                Registros_Procesados: 0,
                Grupos_Procesados: 0,
                Tipos_Despachados: '',
                Detalle_Grupos: []
            });
        }
        
        const salida = salidasMap.get(idSalida);
        salida.Registros_Procesados++;
        
        // Agrupar por tipo si no existe
        let grupo = salida.Detalle_Grupos.find(g => g.tipo === row.Tipo);
        if (!grupo) {
            grupo = {
                tipo: row.Tipo,
                cantidad: 0,
                peso: 0,
                ids: [],
                personas: []
            };
            salida.Detalle_Grupos.push(grupo);
        }
        
        grupo.cantidad++;
        grupo.peso += row.Peso || 0;
        grupo.ids.push(row.ID_Registro);
        
        // Agregar persona si no existe
        const persona = registrosData.find(r => r.ID === row.ID_Registro)?.Persona;
        if (persona && !grupo.personas.includes(persona)) {
            grupo.personas.push(persona);
        }
    });
    
    // Finalizar datos de salidas
    salidasMap.forEach(salida => {
        salida.Grupos_Procesados = salida.Detalle_Grupos.length;
        salida.Tipos_Despachados = salida.Detalle_Grupos.map(g => g.tipo).join(', ');
    });
    
    return Array.from(salidasMap.values());
}

/**
 * Agregar datos iniciales de ejemplo
 */
async function addInitialSampleData() {
    console.log('📝 Agregando datos de ejemplo...');
    
    // Solo agregar si no hay datos cargados desde Excel
    if (registrosData.length === 0) {
        const sampleData = [
            { ID: 1, Tipo: 'Plástico', Peso: 2.5, Fecha_Registro: '2025-01-08T10:00', Persona: 'Jessi', Estado: 'Despachado' },
            { ID: 2, Tipo: 'Cartón', Peso: 1.8, Fecha_Registro: '2025-01-08T11:00', Persona: 'Juliana', Estado: 'Activo' },
            { ID: 3, Tipo: 'Vidrio', Peso: 3.2, Fecha_Registro: '2025-01-07T09:00', Persona: 'Mauricio', Estado: 'Despachado' },
            { ID: 4, Tipo: 'Metal', Peso: 0.8, Fecha_Registro: '2025-01-06T14:30', Persona: 'Adriana', Estado: 'Activo' },
            { ID: 5, Tipo: 'Otros', Peso: 1.5, Fecha_Registro: '2025-01-06T16:45', Persona: 'Jessi', Estado: 'Despachado' },
            { ID: 6, Tipo: 'Plástico', Peso: 23.0, Fecha_Registro: '2025-01-08T07:56', Persona: 'Mauricio', Estado: 'Activo' }
        ];
        
        // Agregar a registrosData
        registrosData.push(...sampleData);
        
        // Guardar cada registro en Excel
        for (const registro of sampleData) {
            await saveRegistroToExcel(registro);
        }
        
        console.log('✅ Datos de ejemplo agregados');
    }
}

/**
 * Inicializar datos en memoria como fallback
 */
function initializeInMemoryData() {
    console.log('💾 Inicializando datos en memoria...');
    
    registrosData.length = 0;
    salidasData.length = 0;
    
    // Datos de ejemplo
    registrosData.push(
        { ID: 1, Tipo: 'Plástico', Peso: 2.5, Fecha_Registro: '2025-01-08T10:00', Persona: 'Jessi', Estado: 'Despachado' },
        { ID: 2, Tipo: 'Cartón', Peso: 1.8, Fecha_Registro: '2025-01-08T11:00', Persona: 'Juliana', Estado: 'Activo' },
        { ID: 3, Tipo: 'Vidrio', Peso: 3.2, Fecha_Registro: '2025-01-07T09:00', Persona: 'Mauricio', Estado: 'Despachado' },
        { ID: 4, Tipo: 'Metal', Peso: 0.8, Fecha_Registro: '2025-01-06T14:30', Persona: 'Adriana', Estado: 'Activo' },
        { ID: 5, Tipo: 'Otros', Peso: 1.5, Fecha_Registro: '2025-01-06T16:45', Persona: 'Jessi', Estado: 'Despachado' },
        { ID: 6, Tipo: 'Plástico', Peso: 23.0, Fecha_Registro: '2025-01-08T07:56', Persona: 'Mauricio', Estado: 'Activo' }
    );
    
    isExcelLoaded = false;
    console.log('⚠️ Trabajando en modo memoria (sin Excel)');
}

// ===========================================
// FUNCIONES DE INTEGRACIÓN
// ===========================================

/**
 * Función mejorada para guardar nuevo registro (REEMPLAZAR la existente)
 */
async function saveNewRegistro(registroData) {
    try {
        // Agregar a memoria
        registrosData.push(registroData);
        
        // Guardar en Excel
        await saveRegistroToExcel(registroData);
        
        console.log('✅ Registro guardado:', registroData.ID);
        return true;
        
    } catch (error) {
        console.error('❌ Error guardando registro:', error);
        return false;
    }
}

/**
 * Función mejorada para procesar salida (REEMPLAZAR la existente)
 */
async function procesarSalidaCompleta(registrosIds, salidaData) {
    try {
        // Actualizar estados en memoria
        registrosIds.forEach(id => {
            const registro = registrosData.find(r => r.ID === id);
            if (registro) {
                registro.Estado = 'Despachado';
            }
        });
        
        // Agregar salida a memoria
        salidasData.push(salidaData);
        
        // Guardar en Excel
        await saveSalidaToExcel(salidaData);
        
        // Actualizar estados en Excel
        for (const id of registrosIds) {
            await updateRegistroEstadoInExcel(id, 'Despachado');
        }
        
        console.log('✅ Salida procesada:', salidaData.ID_Salida);
        return true;
        
    } catch (error) {
        console.error('❌ Error procesando salida:', error);
        return false;
    }
}

console.log('📊 Servicio Excel para EcoTrak Desktop cargado');