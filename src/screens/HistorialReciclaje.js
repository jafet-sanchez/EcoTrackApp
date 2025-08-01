import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '../components/common/CustomButton';
import RecycleCard from '../components/common/RecycleCard';
// Importar Google Sheets Service en lugar de mockData
import GoogleSheetsService from '../services/googleSheetsService';
import { formatDateTime, getColorByType, getIconByType } from '../utils/helpers';

export default function HistorialReciclaje({ navigation }) {
  // Estados para los datos
  const [registros, setRegistros] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  // NUEVO: Estado para manejar errores de conexión
  const [error, setError] = useState(null);

  // CAMBIO: Cargar datos desde Google Sheets
  useEffect(() => {
    loadDataFromGoogleSheets();
  }, []);

  // NUEVA FUNCIÓN: Cargar datos desde Google Sheets
  const loadDataFromGoogleSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Cargando datos desde Google Sheets...');
      
      // Probar conexión primero
      const conexionExitosa = await GoogleSheetsService.probarConexion();
      if (!conexionExitosa) {
        throw new Error('No se pudo conectar con Google Sheets');
      }
      
      // Obtener registros
      const registrosDesdeSheet = await GoogleSheetsService.obtenerRegistros();
      setRegistros(registrosDesdeSheet);
      
      console.log('✅ Datos cargados exitosamente:', registrosDesdeSheet.length, 'registros');
      
    } catch (error) {
      console.error('❌ Error cargando datos desde Google Sheets:', error);
      setError(error.message);
      
      // Mostrar alerta de error
      Alert.alert(
        '❌ Error de conexión',
        'No se pudieron cargar los datos desde Google Sheets. Verifica tu conexión a internet.',
        [
          { text: 'Reintentar', onPress: () => loadDataFromGoogleSheets() },
          { text: 'Cancelar' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // CAMBIO: Función de refresh actualizada
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDataFromGoogleSheets();
    setRefreshing(false);
  };

  // Usar todos los registros sin filtros
  const registrosFiltrados = useMemo(() => {
    console.log('📊 Usando todos los registros sin filtros:', registros.length);
    return [...registros];
  }, [registros]);

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

  // Calcular peso máximo por tipo DESDE LOS GRUPOS
  const pesoMaximoPorTipo = useMemo(() => {
    console.log('🧮 Calculando peso máximo por tipo desde grupos...');
    
    const maximos = {};
    registrosAgrupados.forEach(grupo => {
      maximos[grupo.tipo] = grupo.peso; // El peso total del grupo
    });
    
    console.log('📏 Pesos máximos de grupos:', maximos);
    return maximos;
  }, [registrosAgrupados]);

  const tiposUnicos = useMemo(() => {
    const tipos = registrosAgrupados.map(grupo => grupo.tipo);
    console.log('🏷️ Tipos únicos de grupos:', tipos);
    return tipos;
  }, [registrosAgrupados]);

  // DEBUG: console.logs para verificar agrupación
  console.log('🔍 DEBUG AGRUPACIÓN:');
  console.log('📊 Registros filtrados individuales:', registrosFiltrados.length);
  console.log('📦 Grupos creados:', registrosAgrupados.length);
  console.log('📋 Detalle de grupos:', registrosAgrupados);

  // FUNCIÓN ACTUALIZADA: Navegación con Google Sheets data
  const handleSalida = (grupo) => {
    console.log('📤 Procesando salida de grupo:', grupo.tipo);
    console.log('📋 DATOS COMPLETOS DEL GRUPO:', grupo);
    console.log('🔢 Cantidad de registros activos:', grupo.cantidadActivos);
    
    if (grupo.cantidadActivos === 0) {
      console.log('⚠️ No hay registros activos en este grupo');
      Alert.alert(
        'Sin registros activos',
        'Este grupo no tiene registros disponibles para procesar.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Pasar datos serializables + función de callback para actualizar datos
    const parametrosSerializables = {
      esGrupo: true,
      grupoTipo: grupo.tipo,
      registrosActivosIds: grupo.registrosActivos.map(r => r.id),
      todosLosRegistrosIds: grupo.registrosOriginales.map(r => r.id),
      pesoTotal: grupo.registrosActivos.reduce((sum, r) => sum + r.peso, 0),
      cantidadRegistros: grupo.cantidadActivos,
      // ✅ NUEVO: Callback para refrescar datos después del despacho
      onDespachoCompleto: () => {
        console.log('🔄 Despacho completado, recargando datos...');
        loadDataFromGoogleSheets();
      }
    };
    
    console.log('✅ PARÁMETROS SERIALIZABLES:', parametrosSerializables);
    console.log(`🚀 Navegando a salida con ${grupo.cantidadActivos} registro(s) activo(s)`);
    
    // Navegar con datos actualizados
    navigation.navigate('Salida', parametrosSerializables);
  };

  const renderRegistro = ({ item: grupo }) => (
    <RecycleCard 
      registro={grupo}
      onSalida={() => handleSalida(grupo)}
      esGrupo={true}
    />
  );

  // COMPONENTE ACTUALIZADO: Estado vacío con opción de recargar
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>
        {error ? '⚠️' : '📭'}
      </Text>
      <Text style={styles.emptyTitle}>
        {error ? 'Error de conexión' : 'No hay registros'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {error 
          ? 'No se pudieron cargar los datos desde Google Sheets'
          : 'Aún no has registrado ningún material'
        }
      </Text>
      <View style={styles.emptyButtons}>
        {error && (
          <CustomButton
            title="Reintentar"
            onPress={loadDataFromGoogleSheets}
            variant="outline"
            icon="🔄"
            style={styles.emptyButton}
          />
        )}
        <CustomButton
          title="Registrar Material"
          onPress={() => navigation.navigate('Registro')}
          variant="primary"
          icon="🌱"
          style={styles.emptyButton}
        />
      </View>
    </View>
  );

  // COMPONENTE ACTUALIZADO: Loading con mensaje de Google Sheets
  const LoadingState = () => (
    <View style={styles.loadingState}>
      <Text style={styles.loadingText}>🔄 Cargando desde Google Sheets...</Text>
      <Text style={styles.loadingSubtext}>Conectando con la base de datos</Text>
    </View>
  );

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
        
        {/* NUEVO: Indicador de conexión */}
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            📊 Conectado a Google Sheets
          </Text>
        </View>
        
        {/* Solo mostrar Peso Total */}
        <View style={styles.statsContainer}>
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

      {/* Lista de registros agrupados */}
      <FlatList
        data={registrosAgrupados}
        renderItem={renderRegistro}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#16a34a']}
            tintColor="#16a34a"
            title="Actualizando desde Google Sheets..."
          />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón fijo en la parte inferior */}
      <View style={styles.floatingButton}>
        <CustomButton
          title="🌱 Nuevo Registro"
          onPress={() => navigation.navigate('Registro')}
          variant="primary"
          style={styles.newRecordButton}
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
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 0,
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
    marginBottom: 8,
  },
  // NUEVO: Estilos para indicador de conexión
  connectionStatus: {
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  statsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  
  listContainer: {
    padding: 16,
    paddingBottom: 120,
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
  // ✅ NUEVO: Estilos para múltiples botones en estado vacío
  emptyButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyButton: {
    minWidth: 140,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  // ✅ NUEVO: Subtexto en loading
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  newRecordButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});