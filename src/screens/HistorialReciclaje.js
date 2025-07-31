import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/common/CustomButton';
import CustomPicker from '../components/common/CustomPicker';
import RecycleCard from '../components/common/RecycleCard';
import { 
  mockHistorialData, 
  estadosFilterOptions 
} from '../data/mockData';
import { formatDateTime, getColorByType, getIconByType } from '../utils/helpers';

export default function HistorialReciclaje({ navigation }) {
  // Estados para los datos y filtros
  const [registros, setRegistros] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [filtroFecha, setFiltroFecha] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simular carga inicial de datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simular llamada a API con delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Copiar datos mock (evita mutaciones directas)
      setRegistros([...mockHistorialData]);
      console.log('📊 Datos cargados:', mockHistorialData.length, 'registros');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const registrosFiltrados = useMemo(() => {
    let filtrados = [...registros];

    // Filtro por estado
    if (filtroEstado !== 'all') {
      filtrados = filtrados.filter(registro => registro.estado === filtroEstado);
    }

    // Filtro por fecha (últimos 7 días, 30 días, etc.)
    if (filtroFecha !== 'all') {
      const ahora = new Date();
      const diasAtras = filtroFecha === '7d' ? 7 : filtroFecha === '30d' ? 30 : 0;
      
      if (diasAtras > 0) {
        const fechaLimite = new Date(ahora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
        filtrados = filtrados.filter(registro => {
          const fechaRegistro = new Date(registro.fecha);
          return fechaRegistro >= fechaLimite;
        });
      }
    }

    console.log(`🔍 Filtros aplicados: Estado=${filtroEstado}, Fecha=${filtroFecha}`);
    console.log(`📊 Registros filtrados: ${filtrados.length}/${registros.length}`);
    
    return filtrados;
  }, [registros, filtroEstado, filtroFecha]);

  const registrosAgrupados = useMemo(() => {
    console.log('🔄 Agrupando registros por tipo...');
    
    const agrupados = registrosFiltrados.reduce((acc, registro) => {
      const tipo = registro.tipo;
      
      if (!acc[tipo]) {
        // Primer registro de este tipo - inicializar grupo
        acc[tipo] = {
          id: `grupo-${tipo}`,
          tipo: tipo,
          peso: 0,
          registrosOriginales: [], // Todos los registros originales
          registrosActivos: [],    // Solo registros activos
          registrosDespachados: [], // Solo registros despachados
          cantidadTotal: 0,
          cantidadActivos: 0,
          cantidadDespachados: 0,
          personas: new Set(), // Set para evitar duplicados
          fechaUltima: registro.fecha,
          estado: 'Activo' // Por defecto activo, se determina después
        };
      }
      
      // Agregar registro al grupo
      acc[tipo].registrosOriginales.push(registro);
      acc[tipo].peso += registro.peso;
      acc[tipo].cantidadTotal++;
      acc[tipo].personas.add(registro.persona);
      
      // Actualizar fecha si es más reciente
      if (new Date(registro.fecha) > new Date(acc[tipo].fechaUltima)) {
        acc[tipo].fechaUltima = registro.fecha;
      }
      
      // Separar por estado
      if (registro.estado === 'Activo') {
        acc[tipo].registrosActivos.push(registro);
        acc[tipo].cantidadActivos++;
      } else if (registro.estado === 'Despachado') {
        acc[tipo].registrosDespachados.push(registro);
        acc[tipo].cantidadDespachados++;
      }
      
      return acc;
    }, {});
    
    // Convertir a array y determinar estado final
    const gruposArray = Object.values(agrupados).map(grupo => {
      // Convertir Set de personas a string
      grupo.personasTexto = Array.from(grupo.personas).join(', ');
      
      // AGREGAR: Campos compatibles con RecycleCard individual
      grupo.fecha = grupo.fechaUltima; // Para compatibilidad
      grupo.persona = grupo.personasTexto; // Para compatibilidad
      
      // Determinar estado del grupo 
      if (grupo.cantidadActivos > 0) {
        grupo.estado = 'Activo'; // Si tiene activos, mostrar como Activo
      } else {
        grupo.estado = 'Despachado'; // Si solo tiene despachados
      }
      
      // Información adicional para mostrar
      grupo.infoDetalle = `${grupo.cantidadTotal} registro${grupo.cantidadTotal > 1 ? 's' : ''}`;
      
      return grupo;
    });
    
    console.log('📦 Registros agrupados:', gruposArray);
    return gruposArray;
  }, [registrosFiltrados]);

  // Calcular peso máximo por tipo DESDE LOS GRUPOS (no registros individuales)
  const pesoMaximoPorTipo = useMemo(() => {
    console.log('🧮 Calculando peso máximo por tipo desde grupos...');
    
    const maximos = {};
    registrosAgrupados.forEach(grupo => {
      maximos[grupo.tipo] = grupo.peso; // El peso total del grupo
    });
    
    console.log('📏 Pesos máximos de grupos:', maximos);
    return maximos;
  }, [registrosAgrupados]); // CAMBIO: Depende de registrosAgrupados, no registrosFiltrados

  const tiposUnicos = useMemo(() => {
    const tipos = registrosAgrupados.map(grupo => grupo.tipo);
    console.log('🏷️ Tipos únicos de grupos:', tipos);
    return tipos;
  }, [registrosAgrupados]); // CAMBIO: Usar registrosAgrupados

  // DEBUG: console.logs para verificar agrupación
  console.log('🔍 DEBUG AGRUPACIÓN:');
  console.log('📊 Registros filtrados individuales:', registrosFiltrados.length);
  console.log('📦 Grupos creados:', registrosAgrupados.length);
  console.log('📋 Detalle de grupos:', registrosAgrupados);

  const handleSalida = (grupo) => {
    console.log('📤 Procesando salida de grupo:', grupo.tipo);
    console.log('📋 DATOS COMPLETOS DEL GRUPO:', grupo);
    console.log('🔢 Cantidad de registros activos:', grupo.cantidadActivos);
    console.log('📊 REGISTROS ACTIVOS A PROCESAR:');
    
    grupo.registrosActivos.forEach((registro, index) => {
      console.log(`   ${index + 1}. ID: ${registro.id}, Peso: ${registro.peso}kg, Persona: ${registro.persona}, Fecha: ${registro.fecha}`);
    });
    
    if (grupo.cantidadActivos === 0) {
      console.log('⚠️ No hay registros activos en este grupo');
      return;
    }
    
    console.log(`✅ Navegando a salida con ${grupo.cantidadActivos} registro(s) activo(s)`);
    
    // Navegar con el grupo completo y los registros activos
    navigation.navigate('Salida', { 
      esGrupo: true,               // Indicar que es un grupo
      grupo: grupo,                // Datos del grupo completo
      registrosParaProcesar: grupo.registrosActivos, // Solo los activos
      tipoMaterial: grupo.tipo,    // Tipo de material
      pesoTotal: grupo.registrosActivos.reduce((sum, r) => sum + r.peso, 0), // Peso total de activos
      cantidadRegistros: grupo.cantidadActivos // Cantidad de registros
    });
  };

  const updateRegistroEstado = (id, nuevoEstado) => {
    setRegistros(prevRegistros => 
      prevRegistros.map(registro => 
        registro.id === id 
          ? { ...registro, estado: nuevoEstado }
          : registro
      )
    );
    console.log(`✅ Estado actualizado: Registro ${id} -> ${nuevoEstado}`);
  };

  const renderRegistro = ({ item: grupo }) => (
    <RecycleCard 
      registro={grupo} // Ahora es un grupo, no un registro individual
      onSalida={() => handleSalida(grupo)}
      esGrupo={true} // Indicar que es un grupo para que RecycleCard se adapte
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No hay registros</Text>
      <Text style={styles.emptySubtitle}>
        {filtroEstado !== 'all' || filtroFecha !== 'all' 
          ? 'Intenta cambiar los filtros' 
          : 'Aún no has registrado ningún material'}
      </Text>
      <CustomButton
        title="Registrar Material"
        onPress={() => navigation.navigate('Registro')}
        variant="primary"
        icon="🌱"
        style={styles.emptyButton}
      />
    </View>
  );

  const LoadingState = () => (
    <View style={styles.loadingState}>
      <Text style={styles.loadingText}>🔄 Cargando registros...</Text>
    </View>
  );

  // Opciones para filtro de fecha
  const fechaFilterOptions = [
    { label: 'Todas las fechas', value: 'all' },
    { label: 'Últimos 7 días', value: '7d' },
    { label: 'Últimos 30 días', value: '30d' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Historial de Reciclaje</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{registros.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {registros.filter(r => r.estado === 'Activo').length}
            </Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {registros.reduce((sum, r) => sum + r.peso, 0).toFixed(1)}kg
            </Text>
            <Text style={styles.statLabel}>Peso Total</Text>
          </View>
        </View>

        {/* Sección de peso máximo por tipo */}
        {tiposUnicos.length > 0 && (
          <View style={styles.maxWeightSection}>
            <Text style={styles.maxWeightTitle}>📏 Peso Máximo por Tipo:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.maxWeightContainer}
            >
              {tiposUnicos.map((tipo) => (
                <View key={tipo} style={styles.maxWeightItem}>
                  <Text style={styles.maxWeightIcon}>{getIconByType(tipo)}</Text>
                  <Text style={styles.maxWeightType}>{tipo}</Text>
                  <Text style={styles.maxWeightValue}>
                    {pesoMaximoPorTipo[tipo]}kg
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <CustomPicker
            label="Estado"
            selectedValue={filtroEstado}
            onValueChange={setFiltroEstado}
            items={estadosFilterOptions}
            style={styles.filterPicker}
          />
          <CustomPicker
            label="Fecha"
            selectedValue={filtroFecha}
            onValueChange={setFiltroFecha}
            items={fechaFilterOptions}
            style={styles.filterPicker}
          />
        </View>
      </View>

      {/* Lista de registros agrupados */}
      <FlatList
        data={registrosAgrupados} // CAMBIO CRÍTICO: usar registrosAgrupados en lugar de registrosFiltrados
        renderItem={renderRegistro}
        keyExtractor={(item) => item.id} // Ahora usa el id del grupo
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
            tintColor="#16a34a"
          />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <CustomButton
          title="Nuevo Registro"
          onPress={() => navigation.navigate('Registro')}
          variant="primary"
          icon="🌱"
          style={styles.actionButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // NUEVOS ESTILOS: Sección de peso máximo por tipo
  maxWeightSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  maxWeightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  maxWeightContainer: {
    paddingHorizontal: 8,
  },
  maxWeightItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    minWidth: 70,
  },
  maxWeightIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  maxWeightType: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
    fontWeight: '500',
  },
  maxWeightValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  
  filtersContainer: {
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterPicker: {
    flex: 1,
    marginBottom: 0,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    minWidth: 200,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  actionButton: {
    marginBottom: 8,
  },
});