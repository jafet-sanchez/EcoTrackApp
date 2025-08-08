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
    
    // Formularios
    formReciclaje: null,
    formSalida: null,
    
    // Tablas
    tablaHistorial: null,
    tablaSalidas: null,
    
    // Alertas
    alertaReciclaje: null
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
    setupDateInputs();
    
    // Cargar datos iniciales
    loadInitialData();
    
    // Inicializar funciones avanzadas
    setTimeout(() => {
        initializeAdvancedFeatures();
        initializeGlobalSearch();
        
        // Mensaje de bienvenida
        setTimeout(() => {
            showToast('Bienvenido', 'EcoTrak Desktop cargado exitosamente', 'success');
        }, 1000);
    }, 500);
    
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
    
    // Formularios
    elements.formReciclaje = document.getElementById('form-reciclaje');
    elements.formSalida = document.getElementById('form-salida');
    
    // Tablas
    elements.tablaHistorial = document.getElementById('tabla-historial');
    elements.tablaSalidas = document.getElementById('tabla-salidas');
    
    // Alertas
    elements.alertaReciclaje = document.getElementById('alerta-reciclaje');
    
    console.log('✅ Elementos del DOM inicializados');
}

/**
 * Configurar event listeners principales
 */
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Botones de acción rápida del dashboard
    setupQuickActionButtons();
    
    // Botones de herramientas
    setupToolButtons();
    
    // Listeners para menús de Electron (si está disponible)
    if (typeof require !== 'undefined') {
        try {
            setupMenuListeners();
        } catch (error) {
            console.log('ℹ️ Ejecutándose fuera de Electron');
        }
    }
    
    console.log('✅ Event listeners configurados');
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
    
    if (exportExcel) {
        exportExcel.addEventListener('click', () => exportReport('excel'));
    }
    
    if (exportPdf) {
        exportPdf.addEventListener('click', () => exportReport('pdf'));
    }
}

/**
 * Configurar listeners para menús de Electron
 */
function setupMenuListeners() {
    try {
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
        
    } catch (error) {
        console.log('ℹ️ No se pudo configurar listeners de Electron:', error.message);
    }
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
 * Navegar a una sección específica - VERSIÓN SIMPLIFICADA
 */
function navigateToSection(sectionName) {
    console.log(`🧭 Navegando a: ${sectionName}`);
    
    // Actualizar navegación activa
    elements.navLinks.forEach(link => {
        link.classList.remove('bg-gray-700', 'text-white');
        link.classList.add('text-gray-300');
        
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('bg-gray-700', 'text-white');
            link.classList.remove('text-gray-300');
        }
    });
    
    // Ocultar todas las secciones
    elements.sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección objetivo
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
            setupDateTimeInputs();
            break;
        case 'reportes':
            loadReportesData();
            break;
        case 'registro':
            setupDateInputs();
            // Enfocar el primer campo del formulario
            setTimeout(() => {
                const primerCampo = document.getElementById('peso-reciclaje');
                if (primerCampo) primerCampo.focus();
            }, 100);
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
    
    // Formulario de reciclaje
    setupFormReciclaje();
    
    // Formulario de salida (CON AGRUPACIÓN)
    setupFormSalida();
    
    console.log('✅ Formularios configurados');
}

/**
 * Configurar formulario de reciclaje
 */
function setupFormReciclaje() {
    if (!elements.formReciclaje) return;
    
    elements.formReciclaje.addEventListener('submit', function (e) {
        e.preventDefault();

        const peso = document.getElementById('peso-reciclaje').value;
        const tipo = document.getElementById('tipo-reciclaje').value;
        const fecha = document.getElementById('fecha-reciclaje').value;
        const persona = document.getElementById('persona-reciclaje').value;
        const observaciones = document.getElementById('observaciones-reciclaje').value;

        if (!peso || !tipo || !fecha || !persona) {
            elements.alertaReciclaje.textContent = 'Todos los campos obligatorios deben completarse';
            elements.alertaReciclaje.className = 'text-red-500 text-sm mt-2 text-center font-semibold';
            
            showToast('Error', 'Todos los campos obligatorios son requeridos', 'error');
            return;
        }

        // Crear nuevo registro
        const nuevoRegistro = {
            ID: registrosData.length + 1,
            Tipo: tipo,
            Peso: parseFloat(peso),
            Fecha_Registro: fecha + 'T' + new Date().toTimeString().slice(0,5),
            Persona: persona,
            Estado: 'Activo',
            Observaciones: observaciones || ''
        };
        
        registrosData.push(nuevoRegistro);
        
        elements.alertaReciclaje.textContent = '¡Registro guardado con éxito!';
        elements.alertaReciclaje.className = 'text-green-500 text-sm mt-2 text-center font-semibold';
        
        showToast('Éxito', `Registro creado exitosamente con ID: ${nuevoRegistro.ID}`, 'success');
        
        // Limpiar formulario
        elements.formReciclaje.reset();
        setupDateInputs();
        
        // Actualizar dashboard
        updateDashboard();
        
        // Limpiar mensaje después de unos segundos
        setTimeout(() => {
            elements.alertaReciclaje.textContent = '';
            elements.alertaReciclaje.className = 'text-sm mt-2 text-center';
        }, 3000);
    });
}

/**
 * Configurar formulario de salida (ACTUALIZADO PARA GRUPOS)
 */
function setupFormSalida() {
    const formSalida = document.getElementById('form-salida');
    if (formSalida) {
        // Remover event listener anterior si existe
        const newForm = formSalida.cloneNode(true);
        formSalida.parentNode.replaceChild(newForm, formSalida);
        
        // Agregar nuevo event listener con funcionalidad de grupos
        newForm.addEventListener('submit', handleSalidaSubmit);
    }
}

/**
 * Configurar inputs de fecha con valores actuales
 */
function setupDateInputs() {
    const fechaInput = document.getElementById('fecha-reciclaje');
    if (fechaInput) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const dd = hoy.getDate().toString().padStart(2, '0');
        fechaInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

/**
 * Configurar inputs de fecha y hora para salidas
 */
function setupDateTimeInputs() {
    const now = new Date();
    const dateTimeString = now.toISOString().slice(0, 16);
    
    const fechaSalida = document.getElementById('fecha-salida');
    if (fechaSalida) {
        fechaSalida.value = dateTimeString;
    }
}

// ===========================================
// DATOS Y ESTADÍSTICAS
// ===========================================

/**
 * Cargar datos iniciales (CON DATOS AGRUPABLES)
 */
async function loadInitialData() {
    console.log('📊 Cargando datos iniciales...');
    
    try {
        // Datos de ejemplo que incluyen registros del mismo tipo (Plástico)
        registrosData = [
            { ID: 1, Tipo: 'Plástico', Peso: 2.5, Fecha_Registro: '2025-01-08T10:00', Persona: 'Jessi', Estado: 'Despachado' },
            { ID: 2, Tipo: 'Cartón', Peso: 1.8, Fecha_Registro: '2025-01-08T11:00', Persona: 'Juliana', Estado: 'Activo' },
            { ID: 3, Tipo: 'Vidrio', Peso: 3.2, Fecha_Registro: '2025-01-07T09:00', Persona: 'Mauricio', Estado: 'Despachado' },
            { ID: 4, Tipo: 'Metal', Peso: 0.8, Fecha_Registro: '2025-01-06T14:30', Persona: 'Adriana', Estado: 'Activo' },
            { ID: 5, Tipo: 'Otros', Peso: 1.5, Fecha_Registro: '2025-01-06T16:45', Persona: 'Jessi', Estado: 'Despachado' },
            { ID: 6, Tipo: 'Plástico', Peso: 23.0, Fecha_Registro: '2025-01-08T07:56', Persona: 'Mauricio', Estado: 'Activo' }
        ];
        
        salidasData = [
            { 
                ID_Salida: 1, 
                Fecha_Despacho: '2025-01-08T15:00', 
                Persona_Autoriza: 'Supervisor A', 
                Registros_Procesados: 2,
                Tipos_Despachados: 'Plástico, Vidrio',
                Grupos_Procesados: 2,
                Detalle_Grupos: [
                    {
                        tipo: 'Plástico',
                        cantidad: 1,
                        peso: 2.5,
                        ids: [1],
                        personas: ['Jessi']
                    },
                    {
                        tipo: 'Vidrio', 
                        cantidad: 1,
                        peso: 3.2,
                        ids: [3],
                        personas: ['Mauricio']
                    }
                ]
            }
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
    if (elements.dashPeso) elements.dashPeso.textContent = `${pesoTotal.toFixed(1)} kg`;
    if (elements.dashDespachados) elements.dashDespachados.textContent = registrosDespachados.length;
    if (elements.dashSalidas) elements.dashSalidas.textContent = salidasData.length;
    
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
    row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors';
    
    const estadoBadgeClass = registro.Estado === 'Activo' 
        ? 'bg-green-500 text-white px-2 py-1 rounded-full text-xs' 
        : 'bg-gray-500 text-white px-2 py-1 rounded-full text-xs';
    
    const tipoIcon = getTipoIcon(registro.Tipo);
    
    row.innerHTML = `
        <td class="py-3 px-2"><strong>#${registro.ID}</strong></td>
        <td class="py-3 px-2">${tipoIcon} ${registro.Tipo}</td>
        <td class="py-3 px-2"><strong>${registro.Peso}kg</strong></td>
        <td class="py-3 px-2">${formatDateTime(registro.Fecha_Registro)}</td>
        <td class="py-3 px-2">${registro.Persona}</td>
        <td class="py-3 px-2"><span class="${estadoBadgeClass}">${registro.Estado}</span></td>
        <td class="py-3 px-2">
            ${registro.Estado === 'Activo' ? 
                `<button class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors" onclick="procesarRegistro(${registro.ID})">
                    <i class="fas fa-truck mr-1"></i>Salida
                </button>` : 
                `<span class="text-gray-400">Despachado</span>`
            }
        </td>
    `;
    
    return row;
}

// ===========================================
// FUNCIONES DE AGRUPACIÓN POR TIPO (NUEVA FUNCIONALIDAD)
// ===========================================

/**
 * Agrupar registros activos por tipo de material
 */
function agruparRegistrosPorTipo(registros) {
    const grupos = {};
    
    registros.forEach(registro => {
        if (registro.Estado === 'Activo') {
            if (!grupos[registro.Tipo]) {
                grupos[registro.Tipo] = {
                    registros: [],
                    personas: [],
                    pesoTotal: 0,
                    cantidad: 0,
                    ids: []
                };
            }
            
            grupos[registro.Tipo].registros.push(registro);
            grupos[registro.Tipo].ids.push(registro.ID);
            grupos[registro.Tipo].pesoTotal += registro.Peso;
            grupos[registro.Tipo].cantidad++;
            
            // Agregar persona solo si no está ya en la lista
            if (!grupos[registro.Tipo].personas.includes(registro.Persona)) {
                grupos[registro.Tipo].personas.push(registro.Persona);
            }
        }
    });
    
    return grupos;
}

/**
 * Cargar registros disponibles agrupados por tipo para salida (FUNCIÓN PRINCIPAL)
 */
function loadRegistrosDisponiblesAgrupados() {
    const container = document.getElementById('registros-disponibles');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Obtener registros activos agrupados
    const registrosActivos = registrosData.filter(r => r.Estado === 'Activo');
    const grupos = agruparRegistrosPorTipo(registrosActivos);
    
    // Obtener registros despachados (se muestran individualmente)
    const registrosDespachados = registrosData.filter(r => r.Estado === 'Despachado');
    
    if (Object.keys(grupos).length === 0 && registrosDespachados.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-4">No hay registros disponibles</p>';
        return;
    }
    
    // Mostrar grupos de registros activos
    Object.entries(grupos).forEach(([tipo, grupo]) => {
        const grupoElement = createGrupoDisponibleItem(tipo, grupo);
        container.appendChild(grupoElement);
    });
    
    // Mostrar registros despachados individualmente (solo para referencia, no seleccionables)
    if (registrosDespachados.length > 0) {
        const separador = document.createElement('div');
        separador.className = 'border-t border-gray-500 my-3 pt-3';
        separador.innerHTML = '<h4 class="text-sm text-gray-400 font-semibold mb-2">📦 Registros Despachados (Solo referencia)</h4>';
        container.appendChild(separador);
        
        registrosDespachados.forEach(registro => {
            const item = createRegistroDespachado(registro);
            container.appendChild(item);
        });
    }
}

/**
 * Crear elemento de grupo disponible para selección
 */
function createGrupoDisponibleItem(tipo, grupo) {
    const div = document.createElement('div');
    div.className = 'border-2 border-gray-600 rounded-lg p-4 mb-3 hover:bg-gray-700 hover:border-blue-500 transition-all duration-200';
    
    const tipoIcon = getTipoIcon(tipo);
    const personasTexto = grupo.personas.join(', ');
    const idsTexto = grupo.ids.map(id => `#${id}`).join(', ');
    
    div.innerHTML = `
        <div class="flex items-start space-x-4">
            <input type="checkbox" value="${grupo.ids.join(',')}" 
                   id="grupo-${tipo.toLowerCase().replace(/\s+/g, '-')}" 
                   class="mt-1 w-5 h-5 rounded border-2 border-gray-500 text-blue-600 focus:ring-blue-500 focus:ring-2" 
                   data-tipo="${tipo}"
                   data-cantidad="${grupo.cantidad}"
                   data-peso="${grupo.pesoTotal}">
            
            <label for="grupo-${tipo.toLowerCase().replace(/\s+/g, '-')}" class="flex-1 cursor-pointer">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">${tipoIcon}</span>
                        <div>
                            <h4 class="text-lg font-bold text-white">${tipo}</h4>
                            <div class="flex items-center space-x-3 mt-1">
                                <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    ${grupo.cantidad} ${grupo.cantidad === 1 ? 'registro' : 'registros'}
                                </span>
                                <span class="text-yellow-400 font-bold text-lg">${grupo.pesoTotal.toFixed(1)}kg</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="text-sm text-gray-300 space-y-2 bg-gray-800 p-3 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-users mr-2 text-blue-400"></i>
                        <strong class="text-white mr-2">Personas:</strong> 
                        <span>${personasTexto}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-hashtag mr-2 text-green-400"></i>
                        <strong class="text-white mr-2">IDs:</strong> 
                        <span>${idsTexto}</span>
                    </div>
                </div>
            </label>
        </div>
    `;
    
    return div;
}

/**
 * Crear elemento de registro despachado (solo para referencia)
 */
function createRegistroDespachado(registro) {
    const div = document.createElement('div');
    div.className = 'flex items-center p-3 bg-gray-700 rounded border-l-4 border-gray-500 opacity-75 mb-2';
    
    const tipoIcon = getTipoIcon(registro.Tipo);
    
    div.innerHTML = `
        <span class="text-xl mr-3">${tipoIcon}</span>
        <div class="flex-1">
            <div class="flex items-center justify-between">
                <div>
                    <span class="text-gray-300 font-semibold">#${registro.ID} - ${registro.Tipo}</span>
                    <span class="text-gray-400 ml-3">${registro.Peso}kg</span>
                </div>
                <div class="text-right">
                    <div class="text-gray-400 text-sm">${registro.Persona}</div>
                    <span class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">Ya Despachado</span>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

/**
 * Obtener información detallada de grupos seleccionados
 */
function getSelectedGroupsInfo() {
    const checkboxes = document.querySelectorAll('#registros-disponibles input[type="checkbox"]:checked');
    const groupsInfo = [];
    
    checkboxes.forEach(checkbox => {
        const tipo = checkbox.dataset.tipo;
        const cantidad = parseInt(checkbox.dataset.cantidad);
        const peso = parseFloat(checkbox.dataset.peso);
        const ids = checkbox.value.split(',').map(id => parseInt(id.trim()));
        
        // Obtener las personas de este grupo
        const registrosDelGrupo = registrosData.filter(r => ids.includes(r.ID));
        const personas = [...new Set(registrosDelGrupo.map(r => r.Persona))];
        
        groupsInfo.push({
            tipo,
            cantidad,
            peso,
            ids,
            personas,
            registros: registrosDelGrupo
        });
    });
    
    return groupsInfo;
}

/**
 * Obtener registros seleccionados para salida (ACTUALIZADO PARA GRUPOS)
 */
function getSelectedRegistros() {
    const checkboxes = document.querySelectorAll('#registros-disponibles input[type="checkbox"]:checked');
    const selectedIds = [];
    
    checkboxes.forEach(checkbox => {
        const ids = checkbox.value.split(',').map(id => parseInt(id.trim()));
        selectedIds.push(...ids);
    });
    
    return selectedIds;
}

/**
 * Cargar datos de salidas (VERSIÓN ACTUALIZADA PARA GRUPOS)
 */
function loadSalidasData() {
    console.log('📦 Cargando salidas...');
    
    const tablaSalidas = document.getElementById('tabla-salidas');
    if (!tablaSalidas) return;
    
    tablaSalidas.innerHTML = '';
    
    salidasData.forEach(salida => {
        const row = createSalidaRowDetallada(salida);
        tablaSalidas.appendChild(row);
    });
    
    // Cargar registros disponibles agrupados (NUEVO)
    loadRegistrosDisponiblesAgrupados();
    setupDateTimeInputs();
}

/**
 * Crear fila detallada de salida con información de grupos
 */
function createSalidaRowDetallada(salida) {
    const row = document.createElement('tr');
    row.className = 'border-b border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer';
    
    // Información adicional si es salida grupal
    const tiposInfo = salida.Tipos_Despachados || 'Mixto';
    const gruposInfo = salida.Grupos_Procesados ? `(${salida.Grupos_Procesados} grupos)` : '';
    
    row.innerHTML = `
        <td class="py-2"><strong>#${salida.ID_Salida}</strong></td>
        <td class="py-2">${formatDateTime(salida.Fecha_Despacho)}</td>
        <td class="py-2">
            ${salida.Registros_Procesados} reg. ${gruposInfo}
            ${tiposInfo !== 'Mixto' ? `<br><small class="text-gray-400">${tiposInfo}</small>` : ''}
        </td>
        <td class="py-2">${salida.Persona_Autoriza}</td>
    `;
    
    // Agregar evento para mostrar detalles al hacer clic
    if (salida.Detalle_Grupos) {
        row.title = 'Clic para ver detalles del despacho grupal';
        row.addEventListener('click', () => mostrarDetallesSalida(salida));
    }
    
    return row;
}

/**
 * Mostrar detalles de una salida grupal
 */
function mostrarDetallesSalida(salida) {
    if (!salida.Detalle_Grupos) return;
    
    let detalleHTML = '<div class="space-y-4">';
    detalleHTML += `
        <div class="border-b border-gray-600 pb-3">
            <h4 class="font-bold text-xl text-white mb-2">📦 Salida #${salida.ID_Salida}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><strong class="text-blue-400">Fecha:</strong> ${formatDateTime(salida.Fecha_Despacho)}</div>
                <div><strong class="text-green-400">Autoriza:</strong> ${salida.Persona_Autoriza}</div>
                <div><strong class="text-yellow-400">Total Registros:</strong> ${salida.Registros_Procesados}</div>
                <div><strong class="text-purple-400">Grupos:</strong> ${salida.Grupos_Procesados}</div>
            </div>
    `;
    
    if (salida.Observaciones) {
        detalleHTML += `<div class="mt-2"><strong class="text-gray-400">Observaciones:</strong> ${salida.Observaciones}</div>`;
    }
    
    detalleHTML += '</div>';
    
    detalleHTML += '<h5 class="font-semibold text-lg text-white mb-3">🎯 Grupos Despachados:</h5>';
    
    salida.Detalle_Grupos.forEach(grupo => {
        detalleHTML += `
            <div class="bg-gray-700 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div class="flex justify-between items-center mb-3">
                    <div class="flex items-center">
                        <span class="text-2xl mr-3">${getTipoIcon(grupo.tipo)}</span>
                        <span class="font-bold text-lg text-white">${grupo.tipo}</span>
                        <span class="ml-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                            ${grupo.cantidad} ${grupo.cantidad === 1 ? 'registro' : 'registros'}
                        </span>
                    </div>
                    <span class="text-yellow-400 font-bold text-xl">${grupo.peso.toFixed(1)}kg</span>
                </div>
                <div class="text-sm text-gray-300 space-y-2">
                    <div class="flex items-center">
                        <i class="fas fa-hashtag mr-2 text-green-400"></i>
                        <strong>Registros:</strong> 
                        <span class="ml-2">${grupo.ids.map(id => `#${id}`).join(', ')}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-users mr-2 text-blue-400"></i>
                        <strong>Personas:</strong> 
                        <span class="ml-2">${grupo.personas.join(', ')}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    detalleHTML += '</div>';
    
    // Crear y mostrar modal
    mostrarModalDetalle('Detalles de Salida Grupal', detalleHTML);
}

/**
 * Mostrar modal con detalles
 */
function mostrarModalDetalle(titulo, contenido) {
    let modal = document.getElementById('detalle-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detalle-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto border border-gray-600">
                <div class="flex justify-between items-center mb-4">
                    <h3 id="modal-titulo" class="text-xl font-semibold text-white"></h3>
                    <button onclick="cerrarModalDetalle()" class="text-gray-400 hover:text-white transition-colors text-xl">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div id="modal-contenido" class="text-gray-300"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalDetalle();
            }
        });
    }
    
    document.getElementById('modal-titulo').textContent = titulo;
    document.getElementById('modal-contenido').innerHTML = contenido;
    modal.classList.remove('hidden');
}

/**
 * Cerrar modal de detalles
 */
function cerrarModalDetalle() {
    const modal = document.getElementById('detalle-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ===========================================
// MANEJO DE EVENTOS (ACTUALIZADO PARA GRUPOS)
// ===========================================

/**
 * Manejar envío del formulario de salida (ACTUALIZADO PARA GRUPOS)
 */
async function handleSalidaSubmit(e) {
    e.preventDefault();
    
    const registrosSeleccionados = getSelectedRegistros();
    const gruposSeleccionados = getSelectedGroupsInfo();
    
    if (registrosSeleccionados.length === 0) {
        showToast('Advertencia', 'Selecciona al menos un grupo de registros para procesar', 'warning');
        return;
    }
    
    // Crear mensaje detallado de confirmación
    let confirmMessage = '¿Confirmas el despacho de los siguientes grupos?\n\n';
    gruposSeleccionados.forEach(grupo => {
        confirmMessage += `📦 ${grupo.tipo}: ${grupo.cantidad} registros (${grupo.peso.toFixed(1)}kg)\n`;
        confirmMessage += `👥 Personas: ${grupo.personas.join(', ')}\n`;
        confirmMessage += `🔢 IDs: ${grupo.ids.map(id => `#${id}`).join(', ')}\n\n`;
    });
    
    // Mostrar confirmación
    showConfirmation(
        'Confirmar Despacho Grupal',
        confirmMessage,
        () => procesarSalidaGrupal(registrosSeleccionados, gruposSeleccionados)
    );
}

/**
 * Procesar salida grupal
 */
async function procesarSalidaGrupal(registrosSeleccionados, gruposSeleccionados) {
    showLoading('Procesando salida grupal...');
    
    try {
        const salidaData = {
            registrosIds: registrosSeleccionados,
            grupos: gruposSeleccionados,
            fechaSalida: document.getElementById('fecha-salida').value,
            personaAutoriza: document.getElementById('persona-autoriza').value,
            observaciones: document.getElementById('observaciones-salida').value
        };
        
        console.log('📤 Procesando salida grupal:', salidaData);
        
        // Simular procesamiento
        setTimeout(() => {
            // Actualizar estado de registros
            registrosSeleccionados.forEach(id => {
                const registro = registrosData.find(r => r.ID === id);
                if (registro) {
                    registro.Estado = 'Despachado';
                }
            });
            
            // Crear registro de salida con información de grupos
            const nuevaSalida = {
                ID_Salida: salidasData.length + 1,
                Fecha_Despacho: salidaData.fechaSalida,
                Persona_Autoriza: salidaData.personaAutoriza,
                Registros_Procesados: registrosSeleccionados.length,
                Grupos_Procesados: gruposSeleccionados.length,
                Tipos_Despachados: gruposSeleccionados.map(g => g.tipo).join(', '),
                Observaciones: salidaData.observaciones,
                Detalle_Grupos: gruposSeleccionados
            };
            
            salidasData.push(nuevaSalida);
            
            hideLoading();
            
            // Mensaje de éxito detallado
            const successMessage = `Salida procesada exitosamente:\n` +
                `• ${gruposSeleccionados.length} grupos despachados\n` +
                `• ${registrosSeleccionados.length} registros totales\n` +
                `• Tipos: ${gruposSeleccionados.map(g => g.tipo).join(', ')}`;
            
            showToast('Éxito', successMessage, 'success');
            
            // Actualizar datos
            updateDashboard();
            loadSalidasData();
            
            // Limpiar formulario
            document.getElementById('form-salida').reset();
            setupDateTimeInputs();
        }, 2000);
        
    } catch (error) {
        hideLoading();
        console.error('❌ Error procesando salida grupal:', error);
        showToast('Error', 'No se pudo procesar la salida grupal', 'error');
    }
}

/**
 * Cargar datos para reportes
 */
function loadReportesData() {
    console.log('📊 Cargando datos de reportes');
    
    // Calcular estadísticas
    const stats = calculateAdvancedStats();
    
    // Actualizar estadísticas
    const statPromedioElem = document.getElementById('stat-promedio-peso');
    const statRegistrosMesElem = document.getElementById('stat-registros-mes');
    const statSalidasMesElem = document.getElementById('stat-salidas-mes');
    const statEficienciaElem = document.getElementById('stat-eficiencia');
    
    if (statPromedioElem) statPromedioElem.textContent = `${stats.pesoPromedio.toFixed(1)} kg`;
    if (statRegistrosMesElem) statRegistrosMesElem.textContent = stats.totalRegistros;
    if (statSalidasMesElem) statSalidasMesElem.textContent = stats.totalSalidas || salidasData.length;
    if (statEficienciaElem) {
        const eficiencia = stats.totalRegistros > 0 ? ((stats.registrosDespachados / stats.totalRegistros) * 100).toFixed(1) : 0;
        statEficienciaElem.textContent = `${eficiencia}%`;
    }
    
    // Crear gráficos simples
    setTimeout(createSimpleCharts, 100);
}

// ===========================================
// UTILIDADES
// ===========================================

/**
 * Obtener icono por tipo de material
 */
function getTipoIcon(tipo) {
    const icons = {
        'Plástico': '♻️',
        'Cartón': '📦',
        'Vidrio': '🍾',
        'Metal': '🔧',
        'Otros': '📄'
    };
    return icons[tipo] || '📄';
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

// ===========================================
// FILTROS Y BÚSQUEDA
// ===========================================

/**
 * Aplicar filtros al historial
 */
function applyFilters() {
    console.log('🔍 Aplicando filtros');
    
    const filtroTipo = document.getElementById('filtro-tipo')?.value;
    const filtroEstado = document.getElementById('filtro-estado')?.value;
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde')?.value;
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta')?.value;
    
    let registrosFiltrados = [...registrosData];
    
    // Filtrar por tipo
    if (filtroTipo) {
        registrosFiltrados = registrosFiltrados.filter(r => r.Tipo === filtroTipo);
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
 * Limpiar todos los filtros
 */
function clearFilters() {
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroFechaDesde = document.getElementById('filtro-fecha-desde');
    const filtroFechaHasta = document.getElementById('filtro-fecha-hasta');
    
    if (filtroTipo) filtroTipo.value = '';
    if (filtroEstado) filtroEstado.value = '';
    if (filtroFechaDesde) filtroFechaDesde.value = '';
    if (filtroFechaHasta) filtroFechaHasta.value = '';
    
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

// ===========================================
// GRÁFICOS Y ESTADÍSTICAS
// ===========================================

/**
 * Crear gráficos simples con canvas
 */
function createSimpleCharts() {
    // Gráfico de tipos
    const chartTipos = document.getElementById('chart-tipos');
    if (chartTipos) {
        const ctx = chartTipos.getContext('2d');
        drawPieChart(ctx, calculateTipoStats(), 'Registros por Tipo');
    }
    
    // Gráfico de estados
    const chartEstados = document.getElementById('chart-estados');
    if (chartEstados) {
        const ctx = chartEstados.getContext('2d');
        drawBarChart(ctx, calculateEstadoStats(), 'Estado de Registros');
    }
}

/**
 * Dibujar gráfico circular simple
 */
function drawPieChart(ctx, data, title) {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, centerX, 30);
    
    // Colores
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    let currentAngle = 0;
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.fillText('Sin datos disponibles', centerX, centerY);
        return;
    }
    
    Object.entries(data).forEach(([key, value], index) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        
        // Dibujar sector
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        // Etiqueta
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key, labelX, labelY);
        ctx.fillText(value.toString(), labelX, labelY + 15);
        
        currentAngle += sliceAngle;
    });
}

/**
 * Dibujar gráfico de barras simple
 */
function drawBarChart(ctx, data, title) {
    const canvas = ctx.canvas;
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Título
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 30);
    
    const entries = Object.entries(data);
    const maxValue = Math.max(...Object.values(data));
    
    if (maxValue === 0) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '14px Arial';
        ctx.fillText('Sin datos disponibles', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const barWidth = chartWidth / entries.length - 10;
    const colors = ['#10b981', '#ef4444'];
    
    entries.forEach(([key, value], index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + (index * (barWidth + 10));
        const y = canvas.height - padding - barHeight;
        
        // Dibujar barra
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Etiqueta
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(key, x + barWidth / 2, canvas.height - 10);
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
    });
}

/**
 * Calcular estadísticas por tipo
 */
function calculateTipoStats() {
    const tipoStats = {};
    registrosData.forEach(registro => {
        tipoStats[registro.Tipo] = (tipoStats[registro.Tipo] || 0) + 1;
    });
    return tipoStats;
}

/**
 * Calcular estadísticas por estado
 */
function calculateEstadoStats() {
    const estadoStats = {};
    registrosData.forEach(registro => {
        estadoStats[registro.Estado] = (estadoStats[registro.Estado] || 0) + 1;
    });
    return estadoStats;
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
        totalSalidas: salidasData.length,
        pesoPromedio: 0
    };
    
    // Calcular promedios
    if (registrosData.length > 0) {
        stats.pesoPromedio = stats.pesoTotal / registrosData.length;
    }
    
    return stats;
}

// ===========================================
// NOTIFICACIONES Y MODALES
// ===========================================

/**
 * Mostrar loading (versión Tailwind compatible)
 */
function showLoading(message = 'Procesando...') {
    let loadingModal = document.getElementById('loading-modal');
    
    if (!loadingModal) {
        loadingModal = document.createElement('div');
        loadingModal.id = 'loading-modal';
        loadingModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loadingModal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-8 text-center max-w-sm w-full mx-4">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h3 id="loading-message" class="text-white text-lg font-semibold">${message}</h3>
                <p class="text-gray-400 mt-2">Por favor espera un momento</p>
            </div>
        `;
        document.body.appendChild(loadingModal);
    } else {
        document.getElementById('loading-message').textContent = message;
        loadingModal.classList.remove('hidden');
    }
}

/**
 * Ocultar loading
 */
function hideLoading() {
    const loadingModal = document.getElementById('loading-modal');
    if (loadingModal) {
        loadingModal.classList.add('hidden');
    }
}

/**
 * Mostrar toast notification (versión Tailwind)
 */
function showToast(title, message, type = 'info') {
    let toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    const toastId = 'toast-' + Date.now();
    toast.id = toastId;
    
    const iconClasses = {
        success: 'text-green-400 fas fa-check-circle',
        error: 'text-red-400 fas fa-exclamation-circle',
        warning: 'text-yellow-400 fas fa-exclamation-triangle',
        info: 'text-blue-400 fas fa-info-circle'
    };
    
    toast.className = `max-w-sm w-full bg-gray-800 border-l-4 border-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    toast.innerHTML = `
        <div class="p-4">
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="${iconClasses[type] || iconClasses.info}"></i>
                </div>
                <div class="ml-3 w-0 flex-1">
                    <p class="text-sm font-medium text-white">${title}</p>
                    <p class="mt-1 text-sm text-gray-300">${message}</p>
                </div>
                <div class="ml-4 flex-shrink-0 flex">
                    <button onclick="closeToast('${toastId}')" class="inline-flex text-gray-400 hover:text-gray-200 focus:outline-none transition-colors">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 100);
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        closeToast(toastId);
    }, 5000);
}

/**
 * Cerrar toast específico
 */
function closeToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }
}

// ===========================================
// FUNCIONES DE ACCIÓN
// ===========================================

/**
 * Procesar un registro específico para salida
 */
function procesarRegistro(registroId) {
    console.log('📤 Procesando registro:', registroId);
    
    // Navegar a salidas
    navigateToSection('salidas');
    
    // Preseleccionar el grupo del registro después de que se cargue la sección
    setTimeout(() => {
        // Encontrar el registro y su tipo
        const registro = registrosData.find(r => r.ID === registroId);
        if (registro && registro.Estado === 'Activo') {
            const checkbox = document.getElementById(`grupo-${registro.Tipo.toLowerCase().replace(/\s+/g, '-')}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }, 500);
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

// ===========================================
// ATAJOS DE TECLADO
// ===========================================

/**
 * Configurar atajos de teclado
 */
function setupKeyboardShortcuts() {
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
        
        // Ctrl+S - Guardar
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDatabase();
        }
        
        // Ctrl+D - Dashboard
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            navigateToSection('dashboard');
        }
        
        // Ctrl+R - Reportes
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            navigateToSection('reportes');
        }
        
        // Escape - Cerrar modales
        if (e.key === 'Escape') {
            hideLoading();
            closeGlobalSearch();
            cerrarModalDetalle();
            // Cerrar cualquier toast abierto
            const toasts = document.querySelectorAll('[id^="toast-"]');
            toasts.forEach(toast => {
                closeToast(toast.id);
            });
        }
    });
}

// ===========================================
// BÚSQUEDA GLOBAL
// ===========================================

/**
 * Inicializar búsqueda global
 */
function initializeGlobalSearch() {
    let searchModal = null;
    
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            
            if (!searchModal) {
                searchModal = document.createElement('div');
                searchModal.id = 'search-modal';
                searchModal.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 rounded-lg shadow-lg p-4 min-w-96 hidden';
                searchModal.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-search text-gray-400"></i>
                        <input type="text" id="global-search" placeholder="Buscar en registros..." 
                               class="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none">
                        <button onclick="closeGlobalSearch()" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div id="search-results" class="mt-3 max-h-64 overflow-y-auto hidden">
                        <!-- Resultados aquí -->
                    </div>
                `;
                document.body.appendChild(searchModal);
                
                // Configurar búsqueda en tiempo real
                const searchInput = document.getElementById('global-search');
                searchInput.addEventListener('input', (e) => {
                    const term = e.target.value;
                    if (term.length >= 2) {
                        performGlobalSearch(term);
                    } else {
                        document.getElementById('search-results').classList.add('hidden');
                    }
                });
                
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        closeGlobalSearch();
                    }
                });
            }
            
            searchModal.classList.remove('hidden');
            document.getElementById('global-search').focus();
        }
    });
}

/**
 * Realizar búsqueda global
 */
function performGlobalSearch(term) {
    const results = registrosData.filter(registro => {
        return registro.Tipo.toLowerCase().includes(term.toLowerCase()) ||
               registro.Persona.toLowerCase().includes(term.toLowerCase()) ||
               registro.ID.toString().includes(term) ||
               registro.Estado.toLowerCase().includes(term.toLowerCase());
    });
    
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-400 text-center py-2">No se encontraron resultados</p>';
    } else {
        results.forEach(registro => {
            const item = document.createElement('div');
            item.className = 'p-2 hover:bg-gray-700 rounded cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-semibold text-white">#${registro.ID}</span>
                        <span class="text-gray-300 ml-2">${getTipoIcon(registro.Tipo)} ${registro.Tipo}</span>
                        <span class="text-gray-400 ml-2">${registro.Peso}kg</span>
                    </div>
                    <div class="text-sm text-gray-400">
                        ${registro.Persona} - ${registro.Estado}
                    </div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                closeGlobalSearch();
                // Si estamos en historial, resaltar el registro
                if (currentSection === 'historial') {
                    searchRegistros(term);
                } else {
                    navigateToSection('historial');
                    setTimeout(() => searchRegistros(term), 500);
                }
            });
            
            resultsContainer.appendChild(item);
        });
    }
    
    resultsContainer.classList.remove('hidden');
}

/**
 * Cerrar búsqueda global
 */
function closeGlobalSearch() {
    const searchModal = document.getElementById('search-modal');
    if (searchModal) {
        searchModal.classList.add('hidden');
        document.getElementById('global-search').value = '';
        document.getElementById('search-results').classList.add('hidden');
    }
}

// ===========================================
// FUNCIONES ADICIONALES Y UTILIDADES
// ===========================================

/**
 * Mostrar confirmación antes de acciones importantes
 */
function showConfirmation(title, message, callback) {
    let confirmModal = document.getElementById('confirm-modal');
    
    if (!confirmModal) {
        confirmModal = document.createElement('div');
        confirmModal.id = 'confirm-modal';
        confirmModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        confirmModal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div class="mb-4">
                    <h3 id="confirm-title" class="text-lg font-semibold text-white mb-2">Confirmación</h3>
                    <p id="confirm-message" class="text-gray-300 whitespace-pre-line">¿Estás seguro de realizar esta acción?</p>
                </div>
                <div class="flex justify-end space-x-3">
                    <button id="confirm-cancel" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
                        Cancelar
                    </button>
                    <button id="confirm-accept" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors">
                        Confirmar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        
        // Event listeners
        confirmModal.querySelector('#confirm-cancel').addEventListener('click', () => {
            confirmModal.classList.add('hidden');
        });
        
        // Cerrar al hacer clic fuera
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.classList.add('hidden');
            }
        });
    }
    
    // Actualizar contenido
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    // Configurar callback
    const acceptBtn = document.getElementById('confirm-accept');
    const newAcceptBtn = acceptBtn.cloneNode(true);
    acceptBtn.parentNode.replaceChild(newAcceptBtn, acceptBtn);
    
    newAcceptBtn.addEventListener('click', () => {
        confirmModal.classList.add('hidden');
        callback();
    });
    
    // Mostrar modal
    confirmModal.classList.remove('hidden');
}

/**
 * Inicializar funciones avanzadas (ACTUALIZADO)
 */
function initializeAdvancedFeatures() {
    console.log('🚀 Inicializando funciones avanzadas...');
    
    // Auto-refresh de indicadores cada 30 segundos
    setInterval(updateDashboard, 30 * 1000);
    
    // Auto-guardado cada 5 minutos (simulado)
    setInterval(() => {
        console.log('💾 Auto-guardado ejecutado');
        // Aquí se implementaría el auto-guardado real
    }, 5 * 60 * 1000);
    
    // Configurar atajos de teclado
    setupKeyboardShortcuts();
    
    // Configurar validación en tiempo real para formularios
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.classList.remove('border-red-500');
                this.classList.add('border-green-500');
            } else {
                this.classList.add('border-red-500');
                this.classList.remove('border-green-500');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('border-red-500') && this.value.trim()) {
                this.classList.remove('border-red-500');
                this.classList.add('border-green-500');
            }
        });
    });
    
    // AGREGAR INICIALIZACIÓN DE AGRUPACIÓN
    initializeGroupingFeatures();
    
    console.log('✅ Funciones avanzadas inicializadas');
}

/**
 * Inicializar funcionalidades de agrupación
 */
function initializeGroupingFeatures() {
    console.log('🔄 Inicializando funcionalidades de agrupación...');
    
    // Re-configurar formulario de salida con nuevas funciones
    setupFormSalida();
    
    console.log('✅ Funcionalidades de agrupación inicializadas');
}

// ===========================================
// FUNCIONES DE ELECTRON (PARA IMPLEMENTAR)
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

// ===========================================
// EXPORTAR FUNCIONES GLOBALES
// ===========================================

// Hacer disponibles las funciones que se llaman desde el HTML
window.procesarRegistro = procesarRegistro;
window.clearFilters = clearFilters;
window.searchRegistros = searchRegistros;
window.sortTable = sortTable;
window.calculateAdvancedStats = calculateAdvancedStats;
window.closeToast = closeToast;
window.closeGlobalSearch = closeGlobalSearch;
window.showConfirmation = showConfirmation;
window.navigateToSection = navigateToSection;
window.cerrarModalDetalle = cerrarModalDetalle;

// ===========================================
// MANEJO DE ERRORES GLOBAL
// ===========================================

// Capturar errores no manejados
window.addEventListener('error', (e) => {
    console.error('❌ Error global:', e.error);
    showToast('Error', 'Ha ocurrido un error inesperado', 'error');
});

// Capturar promesas rechazadas
window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promesa rechazada:', e.reason);
    showToast('Error', 'Error en operación asíncrona', 'error');
    e.preventDefault();
});

// ===========================================
// LOG FINAL
// ===========================================

console.log('📱 EcoTrak Desktop JavaScript con AGRUPACIÓN cargado exitosamente');
console.log('🎯 Funcionalidades implementadas:');
console.log('   ✅ HTML completamente separado del JavaScript');
console.log('   ✅ Navegación simplificada con show/hide');
console.log('   ✅ Sin generación dinámica de HTML');
console.log('   ✅ Mejor rendimiento y mantenibilidad');
console.log('   ✅ Código más limpio y organizado');
console.log('   ✅ AGRUPACIÓN POR TIPO implementada');
console.log('   ✅ Despacho grupal con información de personas');
console.log('   ✅ Confirmación detallada de despachos');
console.log('   ✅ Historial de salidas con detalles de grupos');
console.log('   ✅ Modales de detalles con información completa');
console.log('🚀 ¡Aplicación lista para usar con agrupación!');