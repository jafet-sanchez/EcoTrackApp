// Datos simulados para el historial
export const mockHistorialData = [
  {
    id: 1,
    tipo: 'Plástico',
    peso: 2.5,
    fecha: '2024-07-20T10:30',
    persona: 'Juan',
    estado: 'Activo',
  },
  {
    id: 2,
    tipo: 'Cartón',
    peso: 5.0,
    fecha: '2024-07-22T14:15',
    persona: 'Ana',
    estado: 'Despachado',
  },
  {
    id: 3,
    tipo: 'Vidrio',
    peso: 3.2,
    fecha: '2024-07-25T09:45',
    persona: 'Pedro',
    estado: 'Activo',
  },
  {
    id: 4,
    tipo: 'Metal',
    peso: 1.8,
    fecha: '2024-07-26T16:20',
    persona: 'Laura',
    estado: 'Activo',
  },
  {
    id: 5,
    tipo: 'Metal',
    peso: 4.4,
    fecha: '2025-07-31T16:20',
    persona: 'Pedro',
    estado: 'Activo',
  },
  {
    id: 6,
    tipo: 'Otros',
    peso: 4.4,
    fecha: '2025-07-31T16:20',
    persona: 'Juan',
    estado: 'Activo',
  },
  {
    id: 7,
    tipo: 'Otros',
    peso: 2,
    fecha: '2025-07-31T16:20',
    persona: 'Pedro',
    estado: 'Despachado',
  },
];

// Opciones para los dropdowns
export const tiposReciclajeOptions = [
  { label: 'Plástico', value: 'Plástico', icon: '♻️' },
  { label: 'Cartón', value: 'Cartón', icon: '📦' },
  { label: 'Vidrio', value: 'Vidrio', icon: '🍾' },
  { label: 'Metal', value: 'Metal', icon: '🔧' },
  { label: 'Otros', value: 'Otros', icon: '📄' },
];

export const personasOptions = [
  { label: 'Juan', value: 'Juan', icon: '👨' },
  { label: 'Ana', value: 'Ana', icon: '👩' },
  { label: 'Pedro', value: 'Pedro', icon: '👨‍💼' },
  { label: 'Laura', value: 'Laura', icon: '👩‍💼' },
];

export const estadosFilterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Activo', value: 'Activo' },
  { label: 'Despachado', value: 'Despachado' },
];