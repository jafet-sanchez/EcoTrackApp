const fechaInput = document.getElementById('fecha-reciclaje');
    if (fechaInput) {
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
      const dd = hoy.getDate().toString().padStart(2, '0');
      fechaInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const form = document.getElementById('form-reciclaje');
    const alerta = document.getElementById('alerta-reciclaje');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        const peso = document.getElementById('peso-reciclaje').value;
        const tipo = document.getElementById('tipo-reciclaje').value;
        const fecha = document.getElementById('fecha-reciclaje').value;
        const persona = document.getElementById('persona-reciclaje').value;

        if (!peso || !tipo || !fecha || !persona) {
          alerta.textContent = 'Todos los campos son obligatorios';
          alerta.className = 'text-red-500';
        } else {
          alerta.textContent = '¡Registro guardado con éxito!';
          alerta.className = 'text-green-500';
          form.reset();
          fechaInput.value = `${yyyy}-${mm}-${dd}`;
        }
      });
    }

// ===========================================
// VARIABLES GLOBALES
// ===========================================

let currentSection = 'dashboard';
let registrosData = [];
let salidasData = [];
let currentPage = 1;
const itemsPerPage = 10;

// Referencias a elementos del DOM
const elements = {
    // Navegación
    navLinks: null,
    sections: null,
    
    // Dashboard
    dashRegistros: null,
    dashPeso: null,
    dashDespachados: null,
    dashSalidas: null,
    
    // Estadísticas sidebar
    totalRegistros: null,
    totalPeso: null,
    totalSalidas: null,
    
    // Formularios
    formRegistro: null,
    formSalida: null,
    
    // Tablas
    tablaHistorial: null,
    tablaSalidas: null,
    
    // Modales
    loadingModal: null,
    confirmModal: null,
    toast: null
};

// ===========================================
// INICIALIZACIÓN
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando EcoTrak Desktop...');
    
    initializeElements();
    setupEventListeners();
    setupNavigation();
    setupForms();
    setupDateTimeInputs();
    
    // Cargar datos iniciales
    loadInitialData();
    
    console.log('✅ EcoTrak Desktop inicializado correctamente');
});

/**
 * Inicializar referencias a elementos del DOM
 */
function initializeElements() {
    console.log('📋 Inicializando elementos del DOM...');
    
    // Navegación
    elements.navLinks = document.querySelectorAll('[data-section]');
    elements.sections = document.querySelectorAll('.content-section');
    
    // Dashboard
    elements.dashRegistros = document.getElementById('dash-registros');
    elements.dashPeso = document.getElementById('dash-peso');
    elements.dashDespachados = document.getElementById('dash-despachados');
    elements.dashSalidas = document.getElementById('dash-salidas');
    
    // Estadísticas sidebar
    elements.totalRegistros = document.getElementById('total-registros');
    elements.totalPeso = document.getElementById('total-peso');
    elements.totalSalidas = document.getElementById('total-salidas');
    
    // Formularios
    elements.formRegistro = document.getElementById('form-registro');
    elements.formSalida = document.getElementById('form-salida');
    
    // Tablas
    elements.tablaHistorial = document.getElementById('tabla-historial');
    elements.tablaSalidas = document.getElementById('tabla-salidas');
    
    // Modales
    elements.loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    elements.confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    elements.toast = new bootstrap.Toast(document.getElementById('toast'));
    
    console.log('✅ Elementos del DOM inicializados');
}

/**
 * Configurar event listeners principales
 */
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Botones del sidebar
    setupSidebarButtons();
    
    // Botones de acción rápida del dashboard
    setupQuickActionButtons();
    
    // Botones de herramientas
    setupToolButtons();
    
    // Listeners para menús de Electron
    setupMenuListeners();
    
    console.log('✅ Event listeners configurados');
}

/**
 * Configurar botones del sidebar
 */
function setupSidebarButtons() {
    const btnNuevoRegistro = document.getElementById('btn-nuevo-registro');
    const btnNuevaSalida = document.getElementById('btn-nueva-salida');
    const btnBackup = document.getElementById('btn-backup');
    const btnExportar = document.getElementById('btn-exportar');
    
    if (btnNuevoRegistro) {
        btnNuevoRegistro.addEventListener('click', () => navigateToSection('registro'));
    }
    
    if (btnNuevaSalida) {
        btnNuevaSalida.addEventListener('click', () => navigateToSection('salidas'));
    }
    
    if (btnBackup) {
        btnBackup.addEventListener('click', createBackup);
    }
    
    if (btnExportar) {
        btnExportar.addEventListener('click', exportData);
    }
}

/**
 * Configurar botones de acción rápida del dashboard
 */
function setupQuickActionButtons() {
    const quickNuevoRegistro = document.getElementById('quick-nuevo-registro');
    const quickVerHistorial = document.getElementById('quick-ver-historial');
    const quickNuevaSalida = document.getElementById('quick-nueva-salida');
    const quickReportes = document.getElementById('quick-reportes');
    
    if (quickNuevoRegistro) {
        quickNuevoRegistro.addEventListener('click', () => navigateToSection('registro'));
    }
    
    if (quickVerHistorial) {
        quickVerHistorial.addEventListener('click', () => navigateToSection('historial'));
    }
    
    if (quickNuevaSalida) {
        quickNuevaSalida.addEventListener('click', () => navigateToSection('salidas'));
    }
    
    if (quickReportes) {
        quickReportes.addEventListener('click', () => navigateToSection('reportes'));
    }
}

/**
 * Configurar botones de herramientas
 */
function setupToolButtons() {
    // Refresh historial
    const refreshHistorial = document.getElementById('refresh-historial');
    if (refreshHistorial) {
        refreshHistorial.addEventListener('click', refreshHistorialData);
    }
    
    // Filtros
    const aplicarFiltros = document.getElementById('aplicar-filtros');
    if (aplicarFiltros) {
        aplicarFiltros.addEventListener('click', applyFilters);
    }
    
    // Exportar reportes
    const exportExcel = document.getElementById('export-excel');
    const exportPdf = document.getElementById('export-pdf');
    const exportCsv = document.getElementById('export-csv');
    
    if (exportExcel) {
        exportExcel.addEventListener('click', () => exportReport('excel'));
    }
    
    if (exportPdf) {
        exportPdf.addEventListener('click', () => exportReport('pdf'));
    }
    
    if (exportCsv) {
        exportCsv.addEventListener('click', () => exportReport('csv'));
    }
}

/**
 * Configurar listeners para menús de Electron
 */
function setupMenuListeners() {
    const { ipcRenderer } = require('electron');
    
    // Listeners para comandos del menú
    ipcRenderer.on('menu-nueva-bd', () => {
        console.log('📁 Crear nueva base de datos');
        createNewDatabase();
    });
    
    ipcRenderer.on('menu-abrir-bd', (event, filePath) => {
        console.log('📁 Abrir base de datos:', filePath);
        openDatabase(filePath);
    });
    
    ipcRenderer.on('menu-guardar', () => {
        console.log('💾 Guardar base de datos');
        saveDatabase();
    });
    
    ipcRenderer.on('menu-guardar-como', (event, filePath) => {
        console.log('💾 Guardar base de datos como:', filePath);
        saveAsDatabase(filePath);
    });
    
    ipcRenderer.on('menu-nuevo-registro', () => {
        navigateToSection('registro');
    });
    
    ipcRenderer.on('menu-ver-historial', () => {
        navigateToSection('historial');
    });
    
    ipcRenderer.on('menu-nueva-salida', () => {
        navigateToSection('salidas');
    });
}

// ===========================================
// NAVEGACIÓN
// ===========================================

/**
 * Configurar sistema de navegación
 */
function setupNavigation() {
    console.log('🧭 Configurando navegación...');
    
    elements.navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Mostrar dashboard por defecto
    navigateToSection('dashboard');
}

/**
 * Navegar a una sección específica
 */
function navigateToSection(sectionName) {
    console.log(`🧭 Navegando a: ${sectionName}`);
    
    // Actualizar navegación activa
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Mostrar sección correspondiente
    elements.sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Cargar datos específicos de la sección
        loadSectionData(sectionName);
    }
}

/**
 * Cargar datos específicos según la sección
 */
function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'historial':
            loadHistorialData();
            break;
        case 'salidas':
            loadSalidasData();
            break;
        case 'reportes':
            loadReportesData();
            break;
        case 'registro':
            resetRegistroForm();
            break;
    }
}

// ===========================================
// FORMULARIOS
// ===========================================

/**
 * Configurar formularios
 */
function setupForms() {
    console.log('📝 Configurando formularios...');
    
    // Formulario de registro
    if (elements.formRegistro) {
        elements.formRegistro.addEventListener('submit', handleRegistroSubmit);
    }
    
    // Formulario de salida
    if (elements.formSalida) {
        elements.formSalida.addEventListener('submit', handleSalidaSubmit);
    }
    
    console.log('✅ Formularios configurados');
}

/**
 * Configurar inputs de fecha y hora con valores actuales
 */
function setupDateTimeInputs() {
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16); // formato YYYY-MM-DDTHH:mm
    
    const fechaRegistro = document.getElementById('fecha-registro');
    const fechaSalida = document.getElementById('fecha-salida');
    
    if (fechaRegistro) {
        fechaRegistro.value = dateTimeString;
    }
    
    if (fechaSalida) {
        fechaSalida.value = dateTimeString;
    }
}

/**
 * Manejar envío del formulario de registro
 */
async function handleRegistroSubmit(e) {
    e.preventDefault();
    
    showLoading('Guardando registro...');
    
    try {
        const formData = new FormData(e.target);
        const registro = {
            tipo: document.getElementById('tipo-material').value,
            peso: parseFloat(document.getElementById('peso-material').value),
            persona: document.getElementById('persona-responsable').value,
            fecha: document.getElementById('fecha-registro').value,
            observaciones: document.getElementById('observaciones-registro').value
        };
        
        // Validar datos
        if (!validateRegistroData(registro)) {
            hideLoading();
            return;
        }
        
        console.log('📝 Guardando registro:', registro);
        
        // Aquí se llamará al servicio Excel cuando esté implementado
        // const resultado = await ExcelService.crearRegistro(registro);
        
        // Por ahora, simular guardado
        const nuevoRegistro = {
            ...registro,
            ID: registrosData.length + 1,
            Estado: 'Activo',
            Fecha_Registro: registro.fecha
        };
        
        registrosData.push(nuevoRegistro);
        
        hideLoading();
        showToast('Éxito', `Registro creado exitosamente con ID: ${nuevoRegistro.ID}`, 'success');
        
        // Limpiar formulario
        resetRegistroForm();
        
        // Actualizar estadísticas
        updateDashboard();
        
        // Navegar al historial
        setTimeout(() => {
            navigateToSection('historial');
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error guardando registro:', error);
        showToast('Error', 'No se pudo guardar el registro', 'error');
    }
}

/**
 * Manejar envío del formulario de salida
 */
async function handleSalidaSubmit(e) {
    e.preventDefault();
    
    const registrosSeleccionados = getSelectedRegistros();
    
    if (registrosSeleccionados.length === 0) {
        showToast('Advertencia', 'Selecciona al menos un registro para procesar', 'warning');
        return;
    }
    
    showLoading('Procesando salida...');
    
    try {
        const salidaData = {
            registrosIds: registrosSeleccionados,
            fechaSalida: document.getElementById('fecha-salida').value,
            personaAutoriza: document.getElementById('persona-autoriza').value,
            observaciones: document.getElementById('observaciones-salida').value
        };
        
        console.log('📤 Procesando salida:', salidaData);
        
        // Aquí se llamará al servicio Excel cuando esté implementado
        // const resultado = await ExcelService.procesarSalida(salidaData);
        
        // Por ahora, simular procesamiento
        registrosSeleccionados.forEach(id => {
            const registro = registrosData.find(r => r.ID === id);
            if (registro) {
                registro.Estado = 'Despachado';
            }
        });
        
        // Crear registro de salida
        const nuevaSalida = {
            ID_Salida: salidasData.length + 1,
            Fecha_Despacho: salidaData.fechaSalida,
            Persona_Autoriza: salidaData.personaAutoriza,
            Registros_Procesados: registrosSeleccionados.length,
            Observaciones: salidaData.observaciones
        };
        
        salidasData.push(nuevaSalida);
        
        hideLoading();
        showToast('Éxito', `Salida procesada exitosamente. ${registrosSeleccionados.length} registros despachados`, 'success');
        
        // Actualizar datos
        updateDashboard();
        loadSalidasData();
        loadRegistrosDisponibles();
        
        // Limpiar formulario
        resetSalidaForm();
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error procesando salida:', error);
        showToast('Error', 'No se pudo procesar la salida', 'error');
    }
}

// ===========================================
// VALIDACIONES
// ===========================================

/**
 * Validar datos del registro
 */
function validateRegistroData(registro) {
    const errores = [];
    
    if (!registro.tipo) {
        errores.push('Tipo de material es requerido');
    }
    
    if (!registro.peso || registro.peso <= 0) {
        errores.push('Peso debe ser mayor a 0');
    }
    
    if (!registro.persona) {
        errores.push('Persona responsable es requerida');
    }
    
    if (!registro.fecha) {
        errores.push('Fecha es requerida');
    }
    
    if (errores.length > 0) {
        showToast('Errores de Validación', errores.join(', '), 'error');
        return false;
    }
    
    return true;
}

// ===========================================
// DATOS Y ESTADÍSTICAS
// ===========================================

/**
 * Cargar datos iniciales
 */
async function loadInitialData() {
    console.log('📊 Cargando datos iniciales...');
    
    try {
        // Aquí se cargarán los datos desde Excel
        // registrosData = await ExcelService.obtenerRegistros();
        // salidasData = await ExcelService.obtenerSalidas();
        
        // Por ahora, datos de ejemplo
        registrosData = [
            { ID: 1, Tipo: 'plastico', Peso: 2.5, Fecha_Registro: '2025-01-08T10:00', Persona: 'Pedro', Estado: 'Activo' },
            { ID: 2, Tipo: 'carton', Peso: 1.8, Fecha_Registro: '2025-01-08T11:00', Persona: 'María', Estado: 'Activo' },
            { ID: 3, Tipo: 'vidrio', Peso: 3.2, Fecha_Registro: '2025-01-07T09:00', Persona: 'Juan', Estado: 'Despachado' }
        ];
        
        salidasData = [
            { ID_Salida: 1, Fecha_Despacho: '2025-01-08T15:00', Persona_Autoriza: 'Supervisor', Registros_Procesados: 1 }
        ];
        
        updateDashboard();
        console.log('✅ Datos iniciales cargados');
        
    } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error);
        showToast('Error', 'Error cargando datos de la base de datos', 'error');
    }
}

/**
 * Actualizar dashboard con estadísticas
 */
function updateDashboard() {
    const registrosActivos = registrosData.filter(r => r.Estado === 'Activo');
    const registrosDespachados = registrosData.filter(r => r.Estado === 'Despachado');
    const pesoTotal = registrosData.reduce((sum, r) => sum + r.Peso, 0);
    
    // Dashboard principal
    if (elements.dashRegistros) elements.dashRegistros.textContent = registrosActivos.length;
    if (elements.dashPeso) elements.dashPeso.textContent = `${pesoTotal.toFixed(1)}kg`;
    if (elements.dashDespachados) elements.dashDespachados.textContent = registrosDespachados.length;
    if (elements.dashSalidas) elements.dashSalidas.textContent = salidasData.length;
    
    // Sidebar
    if (elements.totalRegistros) elements.totalRegistros.textContent = registrosData.length;
    if (elements.totalPeso) elements.totalPeso.textContent = `${pesoTotal.toFixed(1)} kg`;
    if (elements.totalSalidas) elements.totalSalidas.textContent = salidasData.length;
    
    console.log('📊 Dashboard actualizado');
}

/**
 * Cargar datos del historial
 */
function loadHistorialData() {
    console.log('📋 Cargando historial...');
    
    if (!elements.tablaHistorial) return;
    
    elements.tablaHistorial.innerHTML = '';
    
    registrosData.forEach(registro => {
        const row = createHistorialRow(registro);
        elements.tablaHistorial.appendChild(row);
    });
}

/**
 * Crear fila de la tabla de historial
 */
function createHistorialRow(registro) {
    const row = document.createElement('tr');
    
    const estadoClass = registro.Estado === 'Activo' ? 'estado-activo' : 'estado-despachado';
    const tipoIcon = getTipoIcon(registro.Tipo);
    
    row.innerHTML = `
        <td><strong>#${registro.ID}</strong></td>
        <td>${tipoIcon} ${registro.Tipo}</td>
        <td><strong>${registro.Peso}kg</strong></td>
        <td>${formatDateTime(registro.Fecha_Registro)}</td>
        <td>${registro.Persona}</td>
        <td><span class="badge ${estadoClass}">${registro.Estado}</span></td>
        <td>
            ${registro.Estado === 'Activo' ? 
                `<button class="btn btn-warning btn-sm" onclick="procesarRegistro(${registro.ID})">
                    <i class="fas fa-truck"></i> Salida
                </button>` : 
                `<span class="text-muted">Despachado</span>`
            }
        </td>
    `;
    
    return row;
}

/**
 * Cargar datos de salidas
 */
function loadSalidasData() {
    console.log('📦 Cargando salidas...');
    
    if (!elements.tablaSalidas) return;
    
    elements.tablaSalidas.innerHTML = '';
    
    salidasData.forEach(salida => {
        const row = createSalidaRow(salida);
        elements.tablaSalidas.appendChild(row);
    });
    
    // Cargar registros disponibles para nuevas salidas
    loadRegistrosDisponibles();
}

/**
 * Crear fila de la tabla de salidas
 */
function createSalidaRow(salida) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td><strong>#${salida.ID_Salida}</strong></td>
        <td>${formatDateTime(salida.Fecha_Despacho)}</td>
        <td>Mixto</td>
        <td>${salida.Registros_Procesados} reg.</td>
        <td>${salida.Persona_Autoriza}</td>
    `;
    
    return row;
}

/**
 * Cargar registros disponibles para salida
 */
function loadRegistrosDisponibles() {
    const container = document.getElementById('registros-disponibles');
    if (!container) return;
    
    container.innerHTML = '';
    
    const registrosActivos = registrosData.filter(r => r.Estado === 'Activo');
    
    if (registrosActivos.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay registros disponibles para procesar</p>';
        return;
    }
    
    registrosActivos.forEach(registro => {
        const item = createRegistroDisponibleItem(registro);
        container.appendChild(item);
    });
}

/**
 * Crear item de registro disponible
 */
function createRegistroDisponibleItem(registro) {
    const div = document.createElement('div');
    div.className = 'form-check mb-2 p-2 border rounded';
    
    const tipoIcon = getTipoIcon(registro.Tipo);
    
    div.innerHTML = `
        <input class="form-check-input" type="checkbox" value="${registro.ID}" id="reg-${registro.ID}">
        <label class="form-check-label d-flex justify-content-between w-100" for="reg-${registro.ID}">
            <span>${tipoIcon} <strong>${registro.Tipo}</strong> - ${registro.Peso}kg</span>
            <small class="text-muted">${registro.Persona}</small>
        </label>
    `;
    
    return div;
}

// ===========================================
// UTILIDADES
// ===========================================

/**
 * Obtener icono por tipo de material
 */
function getTipoIcon(tipo) {
    const icons = {
        'plastico': '♻️',
        'carton': '📦',
        'vidrio': '🍾',
        'metal': '🔧',
        'otros': '📄'
    };
    return icons[tipo.toLowerCase()] || '📄';
}

/**
 * Formatear fecha y hora para mostrar
 */
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateTimeString;
    }
}

/**
 * Obtener registros seleccionados para salida
 */
function getSelectedRegistros() {
    const checkboxes = document.querySelectorAll('#registros-disponibles input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

/**
 * Resetear formulario de registro
 */
function resetRegistroForm() {
    if (elements.formRegistro) {
        elements.formRegistro.reset();
        setupDateTimeInputs(); // Restaurar fecha actual
    }
}

/**
 * Resetear formulario de salida
 */
function resetSalidaForm() {
    if (elements.formSalida) {
        elements.formSalida.reset();
        setupDateTimeInputs(); // Restaurar fecha actual
        
        // Desmarcar todos los checkboxes
        const checkboxes = document.querySelectorAll('#registros-disponibles input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
    }
}

// ===========================================
// MODALES Y NOTIFICACIONES
// ===========================================

/**
 * Mostrar loading modal
 */
function showLoading(message = 'Procesando...') {
    const messageEl = document.getElementById('loading-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
    if (elements.loadingModal) {
        elements.loadingModal.show();
    }
}

/**
 * Ocultar loading modal
 */
function hideLoading() {
    if (elements.loadingModal) {
        elements.loadingModal.hide();
    }
}

/**
 * Mostrar toast notification
 */
function showToast(title, message, type = 'info') {
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    const toastTime = document.getElementById('toast-time');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    if (toastTime) toastTime.textContent = 'ahora';
    
    // Cambiar color según tipo
    const toastEl = document.getElementById('toast');
    if (toastEl) {
        toastEl.className = 'toast show';
        
        const header = toastEl.querySelector('.toast-header');
        if (header) {
            header.className = 'toast-header';
            switch (type) {
                case 'success':
                    header.classList.add('bg-success', 'text-white');
                    break;
                case 'error':
                    header.classList.add('bg-danger', 'text-white');
                    break;
                case 'warning':
                    header.classList.add('bg-warning', 'text-dark');
                    break;
                default:
                    header.classList.add('bg-info', 'text-white');
            }
        }
    }
    
    if (elements.toast) {
        elements.toast.show();
    }
}

// ===========================================
// FUNCIONES PÚBLICAS (llamadas desde HTML)
// ===========================================

/**
 * Procesar un registro específico para salida
 */
window.procesarRegistro = function(registroId) {
    console.log('📤 Procesando registro:', registroId);
    
    // Navegar a salidas y preseleccionar el registro
    navigateToSection('salidas');
    
    setTimeout(() => {
        const checkbox = document.getElementById(`reg-${registroId}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }, 100);
};

// ===========================================
// FUNCIONES PARA IMPLEMENTAR (EXCEL SERVICE)
// ===========================================

/**
 * Crear nueva base de datos
 */
async function createNewDatabase() {
    console.log('📁 Crear nueva base de datos');
    showToast('Info', 'Función de nueva base de datos - Por implementar', 'info');
}

/**
 * Abrir base de datos existente
 */
async function openDatabase(filePath) {
    console.log('📁 Abrir base de datos:', filePath);
    showToast('Info', `Abrir base de datos: ${filePath} - Por implementar`, 'info');
}

/**
 * Guardar base de datos
 */
async function saveDatabase() {
    console.log('💾 Guardar base de datos');
    showToast('Info', 'Base de datos guardada automáticamente', 'success');
}

/**
 * Guardar como nueva base de datos
 */
async function saveAsDatabase(filePath) {
    console.log('💾 Guardar como:', filePath);
    showToast('Info', `Guardar como: ${filePath} - Por implementar`, 'info');
}

/**
 * Crear backup
 */
async function createBackup() {
    console.log('💾 Crear backup');
    showLoading('Creando backup...');
    
    setTimeout(() => {
        hideLoading();
        showToast('Éxito', 'Backup creado exitosamente', 'success');
    }, 2000);
}

/**
 * Exportar datos
 */
async function exportData() {
    console.log('📤 Exportar datos');
    showToast('Info', 'Exportando datos - Por implementar', 'info');
}

/**
 * Refrescar datos del historial
 */
async function refreshHistorialData() {
    console.log('🔄 Refrescando historial');
    showLoading('Actualizando historial...');
    
    setTimeout(() => {
        loadHistorialData();
        hideLoading();
        showToast('Éxito', 'Historial actualizado', 'success');
    }, 1000);
}

/**
 * Aplicar filtros al historial
 */
function applyFilters() {
    console.log('🔍 Aplicando filtros');
    
    const filtroTipo = document.getElementById('filtro-tipo').value;
    const filtroEstado = document.getElementById('filtro-estado').value;
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde').value;
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta').value;
    
    let registrosFiltrados = [...registrosData];
    
    // Filtrar por tipo
    if (filtroTipo) {
        registrosFiltrados = registrosFiltrados.filter(r => r.Tipo.toLowerCase() === filtroTipo);
    }
    
    // Filtrar por estado
    if (filtroEstado) {
        registrosFiltrados = registrosFiltrados.filter(r => r.Estado === filtroEstado);
    }
    
    // Filtrar por fecha
    if (filtroFechaDesde) {
        registrosFiltrados = registrosFiltrados.filter(r => {
            const fechaRegistro = new Date(r.Fecha_Registro).toISOString().split('T')[0];
            return fechaRegistro >= filtroFechaDesde;
        });
    }
    
    if (filtroFechaHasta) {
        registrosFiltrados = registrosFiltrados.filter(r => {
            const fechaRegistro = new Date(r.Fecha_Registro).toISOString().split('T')[0];
            return fechaRegistro <= filtroFechaHasta;
        });
    }
    
    // Actualizar tabla con registros filtrados
    updateHistorialTable(registrosFiltrados);
    
    showToast('Filtros', `${registrosFiltrados.length} registros encontrados`, 'info');
}

/**
 * Actualizar tabla de historial con registros filtrados
 */
function updateHistorialTable(registros) {
    if (!elements.tablaHistorial) return;
    
    elements.tablaHistorial.innerHTML = '';
    
    registros.forEach(registro => {
        const row = createHistorialRow(registro);
        elements.tablaHistorial.appendChild(row);
    });
}

/**
 * Exportar reportes
 */
async function exportReport(format) {
    console.log(`📊 Exportar reporte en formato: ${format}`);
    
    showLoading(`Generando reporte ${format.toUpperCase()}...`);
    
    setTimeout(() => {
        hideLoading();
        showToast('Éxito', `Reporte ${format.toUpperCase()} generado exitosamente`, 'success');
    }, 2000);
}

/**
 * Cargar datos para reportes
 */
function loadReportesData() {
    console.log('📊 Cargando datos de reportes');
    
    // Aquí se implementarían los gráficos con Chart.js o similar
    // Por ahora solo mostramos un mensaje
    const chartContainers = document.querySelectorAll('canvas[id^="chart-"]');
    chartContainers.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#374151';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gráfico por implementar', canvas.width / 2, canvas.height / 2);
    });
}

/**
 * Limpiar todos los filtros
 */
function clearFilters() {
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-estado').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    
    loadHistorialData();
    showToast('Filtros', 'Filtros limpiados', 'info');
}

/**
 * Buscar registros por texto
 */
function searchRegistros(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
        loadHistorialData();
        return;
    }
    
    const registrosFiltrados = registrosData.filter(registro => {
        return registro.Tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
               registro.Persona.toLowerCase().includes(searchTerm.toLowerCase()) ||
               registro.ID.toString().includes(searchTerm);
    });
    
    updateHistorialTable(registrosFiltrados);
    showToast('Búsqueda', `${registrosFiltrados.length} registros encontrados`, 'info');
}

/**
 * Ordenar tabla por columna
 */
function sortTable(column, order = 'asc') {
    const sortedData = [...registrosData].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
        
        // Convertir a número si es peso o ID
        if (column === 'Peso' || column === 'ID') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }
        
        // Convertir a fecha si es fecha
        if (column === 'Fecha_Registro') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
        }
        
        if (order === 'desc') {
            return valueB > valueA ? 1 : -1;
        }
        return valueA > valueB ? 1 : -1;
    });
    
    updateHistorialTable(sortedData);
}

/**
 * Validar formulario de salida
 */
function validateSalidaForm() {
    const registrosSeleccionados = getSelectedRegistros();
    const personaAutoriza = document.getElementById('persona-autoriza').value;
    const fechaSalida = document.getElementById('fecha-salida').value;
    
    const errores = [];
    
    if (registrosSeleccionados.length === 0) {
        errores.push('Debe seleccionar al menos un registro');
    }
    
    if (!personaAutoriza) {
        errores.push('Debe seleccionar quien autoriza la salida');
    }
    
    if (!fechaSalida) {
        errores.push('Fecha de salida es requerida');
    }
    
    if (errores.length > 0) {
        showToast('Errores de Validación', errores.join(', '), 'error');
        return false;
    }
    
    return true;
}

/**
 * Mostrar confirmación antes de acciones importantes
 */
function showConfirmation(title, message, callback) {
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmAction = document.getElementById('confirmAction');
    
    if (confirmTitle) confirmTitle.textContent = title;
    if (confirmMessage) confirmMessage.textContent = message;
    
    // Limpiar eventos anteriores
    const newConfirmButton = confirmAction.cloneNode(true);
    confirmAction.parentNode.replaceChild(newConfirmButton, confirmAction);
    
    // Agregar nuevo evento
    newConfirmButton.addEventListener('click', () => {
        elements.confirmModal.hide();
        callback();
    });
    
    elements.confirmModal.show();
}

/**
 * Calcular estadísticas avanzadas
 */
function calculateAdvancedStats() {
    const stats = {
        totalRegistros: registrosData.length,
        registrosActivos: registrosData.filter(r => r.Estado === 'Activo').length,
        registrosDespachados: registrosData.filter(r => r.Estado === 'Despachado').length,
        pesoTotal: registrosData.reduce((sum, r) => sum + r.Peso, 0),
        
        // Por tipo
        porTipo: {},
        
        // Por persona
        porPersona: {},
        
        // Por fecha
        porMes: {},
        
        // Promedios
        pesoPromedio: 0,
        registrosPorDia: 0
    };
    
    // Calcular estadísticas por tipo
    registrosData.forEach(registro => {
        const tipo = registro.Tipo;
        if (!stats.porTipo[tipo]) {
            stats.porTipo[tipo] = { cantidad: 0, peso: 0 };
        }
        stats.porTipo[tipo].cantidad++;
        stats.porTipo[tipo].peso += registro.Peso;
    });
    
    // Calcular estadísticas por persona
    registrosData.forEach(registro => {
        const persona = registro.Persona;
        if (!stats.porPersona[persona]) {
            stats.porPersona[persona] = { cantidad: 0, peso: 0 };
        }
        stats.porPersona[persona].cantidad++;
        stats.porPersona[persona].peso += registro.Peso;
    });
    
    // Calcular promedios
    if (registrosData.length > 0) {
        stats.pesoPromedio = stats.pesoTotal / registrosData.length;
    }
    
    return stats;
}

/**
 * Generar resumen de actividad
 */
function generateActivitySummary() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const registrosHoy = registrosData.filter(r => {
        const fechaRegistro = new Date(r.Fecha_Registro).toISOString().split('T')[0];
        return fechaRegistro === today;
    });
    
    const registrosSemana = registrosData.filter(r => {
        const fechaRegistro = new Date(r.Fecha_Registro);
        return fechaRegistro >= thisWeek;
    });
    
    const salidasSemana = salidasData.filter(s => {
        const fechaSalida = new Date(s.Fecha_Despacho);
        return fechaSalida >= thisWeek;
    });
    
    return {
        registrosHoy: registrosHoy.length,
        pesoHoy: registrosHoy.reduce((sum, r) => sum + r.Peso, 0),
        registrosSemana: registrosSemana.length,
        pesoSemana: registrosSemana.reduce((sum, r) => sum + r.Peso, 0),
        salidasSemana: salidasSemana.length
    };
}

/**
 * Actualizar indicadores en tiempo real
 */
function updateRealTimeIndicators() {
    const summary = generateActivitySummary();
    
    // Actualizar badges o indicadores si existen
    const indicatorToday = document.getElementById('indicator-today');
    const indicatorWeek = document.getElementById('indicator-week');
    
    if (indicatorToday) {
        indicatorToday.textContent = `${summary.registrosHoy} registros hoy`;
    }
    
    if (indicatorWeek) {
        indicatorWeek.textContent = `${summary.registrosSemana} registros esta semana`;
    }
}

/**
 * Manejar errores de la aplicación
 */
function handleAppError(error, context = '') {
    console.error(`❌ Error en ${context}:`, error);
    
    let userMessage = 'Ha ocurrido un error inesperado';
    
    if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
            userMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message.includes('permission')) {
            userMessage = 'Error de permisos. Verifica los permisos de archivo.';
        } else if (error.message.includes('file') || error.message.includes('ENOENT')) {
            userMessage = 'Archivo no encontrado. Verifica que la base de datos existe.';
        }
    }
    
    showToast('Error', userMessage, 'error');
}

/**
 * Inicializar configuraciones adicionales
 */
function initializeAdvancedFeatures() {
    // Configurar auto-guardado cada 5 minutos
    setInterval(() => {
        console.log('💾 Auto-guardado ejecutado');
        // Aquí se implementaría el auto-guardado
    }, 5 * 60 * 1000);
    
    // Actualizar indicadores cada 30 segundos
    setInterval(updateRealTimeIndicators, 30 * 1000);
    
    // Configurar atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl+N - Nuevo registro
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            navigateToSection('registro');
        }
        
        // Ctrl+H - Historial
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            navigateToSection('historial');
        }
        
        // Ctrl+S - Guardar (evitar comportamiento por defecto del navegador)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDatabase();
        }
        
        // Escape - Cerrar modales
        if (e.key === 'Escape') {
            hideLoading();
        }
    });
}

// Inicializar características avanzadas cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeAdvancedFeatures, 1000);
});

// ===========================================
// EXPORTAR FUNCIONES GLOBALES
// ===========================================

// Hacer disponibles las funciones que se llaman desde el HTML
window.clearFilters = clearFilters;
window.searchRegistros = searchRegistros;
window.sortTable = sortTable;
window.calculateAdvancedStats = calculateAdvancedStats;

console.log('📱 EcoTrak App JavaScript cargado exitosamente');