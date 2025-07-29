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