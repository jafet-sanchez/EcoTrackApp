// Formatear fecha para mostrar
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obtener fecha actual en formato YYYY-MM-DD
export const getCurrentDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Validar formulario de registro
export const validateRegistroForm = (formData) => {
  const errors = {};
  
  if (!formData.peso || parseFloat(formData.peso) <= 0) {
    errors.peso = 'El peso debe ser mayor a 0';
  }
  
  if (!formData.tipo) {
    errors.tipo = 'Debe seleccionar un tipo de reciclaje';
  }
  
  if (!formData.persona) {
    errors.persona = 'Debe seleccionar una persona';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validar formulario de salida
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

// Obtener color por tipo de reciclaje
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

// Obtener icono por tipo de reciclaje
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