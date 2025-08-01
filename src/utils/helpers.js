/**
 * Obtiene la fecha y hora actual en formato legible
 * @returns {string} Fecha y hora en formato: "29/07/2024 - 15:30"
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  
  // Obtener componentes de fecha
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  
  // Obtener componentes de hora
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  
  // Retornar fecha y hora formateada
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

/**
 * Obtiene la fecha actual en formato ISO para almacenamiento
 * @returns {string} Fecha en formato ISO
 */
export const getCurrentDateISO = () => {
  return new Date().toISOString();
};

/**
 * Formatea una fecha ISO a formato legible
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} - ${hours}:${minutes}`;
};

/**
 * Valida si un peso es válido
 * @param {string} peso - Peso a validar
 * @returns {boolean} True si es válido
 */
export const validatePeso = (peso) => {
  const num = parseFloat(peso);
  return !isNaN(num) && num > 0;
};

/**
 * Formatea el peso para mostrar
 * @param {number} peso - Peso a formatear
 * @returns {string} Peso formateado
 */
export const formatPeso = (peso) => {
  return `${peso} kg`;
};

/**
 * Valida el formulario de registro de reciclaje
 * @param {Object} formData - Datos del formulario
 * @returns {Object} Resultado de la validación
 */
export const validateRegistroForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Validar peso
  if (!formData.peso) {
    errors.peso = 'El peso es requerido';
    isValid = false;
  } else if (isNaN(parseFloat(formData.peso)) || parseFloat(formData.peso) <= 0) {
    errors.peso = 'El peso debe ser un número mayor a 0';
    isValid = false;
  }

  // Validar tipo
  if (!formData.tipo) {
    errors.tipo = 'El tipo de material es requerido';
    isValid = false;
  }

  // Validar persona
  if (!formData.persona) {
    errors.persona = 'La persona que registra es requerida';
    isValid = false;
  }

  return {
    isValid,
    errors
  };
};

// ===== FUNCIONES ADICIONALES PARA RecycleCard =====

/**
 * Formatea fecha y hora para mostrar (alias de formatDate para compatibilidad)
 * @param {string} dateTimeString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDateTime = (dateTimeString) => {
  return formatDate(dateTimeString);
};

/**
 * Obtener fecha actual en formato YYYY-MM-DDTHH:mm
 * @returns {string} Fecha actual en formato ISO truncado
 */
export const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
};

/**
 * Obtener color por tipo de reciclaje
 * @param {string} tipo - Tipo de material
 * @returns {string} Color hexadecimal
 */
export const getColorByType = (tipo) => {
  const colors = {
    'Plástico': '#3B82F6',
    'Cartón': '#F59E0B',
    'Vidrio': '#10B981',
    'Metal': '#6B7280',
    'Otros': '#8B5CF6',
  };
  return colors[tipo] || '#6B7280';
};

/**
 * Obtener icono por tipo de reciclaje
 * @param {string} tipo - Tipo de material
 * @returns {string} Emoji del icono
 */
export const getIconByType = (tipo) => {
  const icons = {
    'Plástico': '♻️',
    'Cartón': '📦',
    'Vidrio': '🍾',
    'Metal': '🔧',
    'Otros': '📄',
  };
  return icons[tipo] || '📄';
};

/**
 * Validar formulario de salida
 * @param {Object} formData - Datos del formulario de salida
 * @returns {Object} Resultado de la validación
 */
export const validateSalidaForm = (formData) => {
  const errors = {};
  
  if (!formData.fechaSalida) {
    errors.fechaSalida = 'Debe seleccionar una fecha de salida';
  }
  
  if (!formData.personaAutoriza) {
    errors.personaAutoriza = 'Debe seleccionar quién autoriza la salida';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

//  ===== FUNCIONES NUEVAS PARA MANEJO DE DATOS SERIALIZABLES =====

/**
 * Buscar registros por IDs desde los datos mock
 * @param {Array} registrosIds - Array de IDs a buscar
 * @param {Array} todosLosRegistros - Array completo de registros (opcional, usa mockData por defecto)
 * @returns {Array} Array de registros encontrados
 */
export const buscarRegistrosPorIds = (registrosIds, todosLosRegistros = null) => {
  console.log('🔍 Buscando registros con IDs:', registrosIds);
  
  // Si no se pasan todos los registros, importar mockData
  if (!todosLosRegistros) {
    const { mockHistorialData } = require('../data/mockData');
    todosLosRegistros = mockHistorialData;
  }
  
  const registrosEncontrados = todosLosRegistros.filter(registro => 
    registrosIds.includes(registro.id)
  );
  
  console.log('✅ Registros encontrados:', registrosEncontrados.length);
  return registrosEncontrados;
};

/**
 * Crear grupo a partir de registros filtrados por tipo
 * @param {string} tipo - Tipo de material
 * @param {Array} registrosDeTipo - Registros del mismo tipo
 * @returns {Object} Objeto grupo con toda la información necesaria
 */
export const crearGrupoDesdeRegistros = (tipo, registrosDeTipo) => {
  console.log('🏗️ Creando grupo para tipo:', tipo, 'con', registrosDeTipo.length, 'registros');
  
  const registrosActivos = registrosDeTipo.filter(r => r.estado === 'Activo');
  const registrosDespachados = registrosDeTipo.filter(r => r.estado === 'Despachado');
  const pesoTotal = registrosDeTipo.reduce((sum, r) => sum + r.peso, 0);
  const personas = [...new Set(registrosDeTipo.map(r => r.persona))];
  
  // Encontrar fecha más reciente
  const fechaUltima = registrosDeTipo.reduce((maxFecha, registro) => {
    return new Date(registro.fecha) > new Date(maxFecha) ? registro.fecha : maxFecha;
  }, registrosDeTipo[0]?.fecha || new Date().toISOString());

  const grupo = {
    id: `grupo-${tipo}`,
    tipo: tipo,
    peso: pesoTotal,
    registrosOriginales: registrosDeTipo,
    registrosActivos: registrosActivos,
    registrosDespachados: registrosDespachados,
    cantidadTotal: registrosDeTipo.length,
    cantidadActivos: registrosActivos.length,
    cantidadDespachados: registrosDespachados.length,
    personas: personas,
    personasTexto: personas.join(', '),
    fechaUltima: fechaUltima,
    fecha: fechaUltima, // Para compatibilidad con RecycleCard
    persona: personas.join(', '), // Para compatibilidad con RecycleCard
    estado: registrosActivos.length > 0 ? 'Activo' : 'Despachado',
    infoDetalle: `${registrosDeTipo.length} registro${registrosDeTipo.length > 1 ? 's' : ''}`
  };
  
  console.log('✅ Grupo creado:', grupo);
  return grupo;
};

/**
 * Reconstruir grupo a partir de parámetros serializables
 * @param {Object} params - Parámetros de navegación
 * @returns {Object} Grupo reconstruido con todos los datos
 */
export const reconstruirGrupoDesdeParams = (params) => {
  console.log('🔄 Reconstruyendo grupo desde parámetros:', params);
  
  const { grupoTipo, registrosActivosIds, todosLosRegistrosIds } = params;
  
  // Buscar todos los registros del grupo
  const todosLosRegistros = buscarRegistrosPorIds(todosLosRegistrosIds);
  
  // Crear el grupo completo
  const grupoReconstruido = crearGrupoDesdeRegistros(grupoTipo, todosLosRegistros);
  
  console.log('✅ Grupo reconstruido exitosamente:', grupoReconstruido);
  return grupoReconstruido;
};

/**
 * Buscar un registro individual por ID
 * @param {number} registroId - ID del registro a buscar
 * @param {Array} todosLosRegistros - Array completo de registros (opcional)
 * @returns {Object|null} Registro encontrado o null
 */
export const buscarRegistroPorId = (registroId, todosLosRegistros = null) => {
  console.log('🔍 Buscando registro individual con ID:', registroId);
  
  if (!todosLosRegistros) {
    const { mockHistorialData } = require('../data/mockData');
    todosLosRegistros = mockHistorialData;
  }
  
  const registro = todosLosRegistros.find(r => r.id === registroId);
  
  if (registro) {
    console.log('✅ Registro encontrado:', registro);
  } else {
    console.log('❌ Registro no encontrado');
  }
  
  return registro || null;
};

/**
 * Validación para parámetros de navegación
 * @param {Object} params - Parámetros de navegación
 * @returns {Object} Resultado de la validación
 */
export const validarParametrosNavegacion = (params) => {
  console.log('🔍 Validando parámetros de navegación:', params);
  
  const errores = [];
  
  if (params.esGrupo) {
    // Validaciones para grupo
    if (!params.grupoTipo) {
      errores.push('Falta grupoTipo');
    }
    if (!params.registrosActivosIds || !Array.isArray(params.registrosActivosIds)) {
      errores.push('Falta registrosActivosIds o no es array');
    }
    if (!params.todosLosRegistrosIds || !Array.isArray(params.todosLosRegistrosIds)) {
      errores.push('Falta todosLosRegistrosIds o no es array');
    }
    if (params.registrosActivosIds && params.registrosActivosIds.length === 0) {
      errores.push('No hay registros activos para procesar');
    }
  } else {
    // Validaciones para registro individual
    if (!params.registroId && !params.registro) {
      errores.push('Falta registroId o registro para registro individual');
    }
  }
  
  const resultado = {
    esValido: errores.length === 0,
    errores
  };
  
  if (!resultado.esValido) {
    console.log('❌ Parámetros inválidos:', errores);
  } else {
    console.log('✅ Parámetros válidos');
  }
  
  return resultado;
};

/**
 * Crear parámetros serializables para navegación a grupo
 * @param {Object} grupo - Objeto grupo completo
 * @returns {Object} Parámetros serializables
 */
export const crearParametrosGrupo = (grupo) => {
  console.log('📦 Creando parámetros serializables para grupo:', grupo.tipo);
  
  const parametros = {
    esGrupo: true,
    grupoTipo: grupo.tipo,
    registrosActivosIds: grupo.registrosActivos.map(r => r.id),
    todosLosRegistrosIds: grupo.registrosOriginales.map(r => r.id),
    pesoTotal: grupo.registrosActivos.reduce((sum, r) => sum + r.peso, 0),
    cantidadRegistros: grupo.cantidadActivos
  };
  
  console.log('✅ Parámetros serializables creados:', parametros);
  return parametros;
};

/**
 * Crear parámetros serializables para navegación a registro individual
 * @param {Object} registro - Objeto registro individual
 * @returns {Object} Parámetros serializables
 */
export const crearParametrosRegistro = (registro) => {
  console.log('📋 Creando parámetros serializables para registro:', registro.id);
  
  const parametros = {
    esGrupo: false,
    registroId: registro.id
  };
  
  console.log('✅ Parámetros serializables creados:', parametros);
  return parametros;
};