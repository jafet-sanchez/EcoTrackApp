import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/common/CustomButton';
import CustomPicker from '../components/common/CustomPicker';
import RecycleCard from '../components/common/RecycleCard';
import { 
  mockHistorialData, 
  estadosFilterOptions 
} from '../data/mockData';
import { formatDateTime } from '../utils/helpers';

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

  const handleSalida = (registro) => {
    if (registro.estado !== 'Activo') {
      console.log('⚠️ Intento de salida en registro no activo');
      return;
    }

    console.log('📤 Navegando a salida con registro:', registro.id);
    navigation.navigate('Salida', { 
      registro: registro 
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

  const renderRegistro = ({ item }) => (
    <RecycleCard 
      registro={item}
      onSalida={() => handleSalida(item)}
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

      {/* Lista de registros */}
      <FlatList
        data={registrosFiltrados}
        renderItem={renderRegistro}
        keyExtractor={(item) => item.id.toString()}
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