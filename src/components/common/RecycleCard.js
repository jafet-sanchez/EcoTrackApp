import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CustomButton from './CustomButton';
import { formatDateTime, getColorByType, getIconByType } from '../../utils/helpers';


export default function RecycleCard({ registro, onSalida }) {

  const getEstadoStyle = (estado) => {
    return estado === 'Activo' 
      ? { backgroundColor: '#dcfce7', color: '#16a34a' }
      : { backgroundColor: '#fef3c7', color: '#d97706' };
  };

  const formatearPeso = (peso) => {
    return peso >= 1000 
      ? `${(peso / 1000).toFixed(1)}t` 
      : `${peso}kg`;
  };

  const tipoColor = getColorByType(registro.tipo);
  const tipoIcon = getIconByType(registro.tipo);
  const estadoStyle = getEstadoStyle(registro.estado);
  const puedeProcesamSalida = registro.estado === 'Activo';

  return (
    <View style={styles.card}>
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.tipoContainer}>
          <View style={[styles.tipoIcon, { backgroundColor: tipoColor + '20' }]}>
            <Text style={styles.tipoIconText}>{tipoIcon}</Text>
          </View>
          <View style={styles.tipoInfo}>
            <Text style={[styles.tipoText, { color: tipoColor }]}>
              {registro.tipo}
            </Text>
            <Text style={styles.pesoText}>
              {formatearPeso(registro.peso)}
            </Text>
          </View>
        </View>
        
        <View style={[styles.estadoBadge, estadoStyle]}>
          <Text style={[styles.estadoText, { color: estadoStyle.color }]}>
            {registro.estado}
          </Text>
        </View>
      </View>

      {/* Información secundaria */}
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📅 Fecha:</Text>
          <Text style={styles.infoValue}>
            {formatDateTime(registro.fecha)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Registrado por:</Text>
          <Text style={styles.infoValue}>{registro.persona}</Text>
        </View>
      </View>

      {/* Acciones */}
      {puedeProcesamSalida && (
        <View style={styles.cardActions}>
          <CustomButton
            title="Procesar Salida"
            onPress={onSalida}
            variant="success"
            icon="📤"
            style={styles.actionButton}
          />
        </View>
      )}
    </View>
  );
}

/**
 * ESTILOS DEL COMPONENTE
 */
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    overflow: 'hidden',
  },
  
  // Header styles
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tipoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipoIconText: {
    fontSize: 20,
  },
  tipoInfo: {
    flex: 1,
  },
  tipoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pesoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Body styles
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  
  // Actions styles
  cardActions: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    marginBottom: 0,
  },
});