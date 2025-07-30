import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomInput from '../components/common/CustomInput';
import CustomPicker from '../components/common/CustomPicker';
import CustomButton from '../components/common/CustomButton';
import { personasOptions } from '../data/mockData';
import { 
  getCurrentDateTime, 
  validateSalidaForm, 
  formatDateTime,
  getColorByType,
  getIconByType 
} from '../utils/helpers';

export default function SalidaReciclaje({ route, navigation }) {
  // Obtener datos del registro desde los parámetros de navegación
  const { registro } = route.params || {};
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    fechaSalida: getCurrentDateTime(),
    personaAutoriza: '',
    observaciones: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('📤 SalidaReciclaje montado');
    console.log('📋 Datos del registro:', registro);
    
    if (!registro) {
      Alert.alert(
        'Error',
        'No se encontraron datos del registro',
        [
          { 
            text: 'Volver al Historial', 
            onPress: () => navigation.navigate('Historial') 
          }
        ]
      );
      return;
    }

    if (registro.estado !== 'Activo') {
      Alert.alert(
        'Registro no disponible',
        `Este registro ya está en estado: ${registro.estado}`,
        [
          { 
            text: 'Volver al Historial', 
            onPress: () => navigation.navigate('Historial') 
          }
        ]
      );
      return;
    }
  }, [registro, navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Procesando salida del registro:', registro.id);
    
    const validation = validateSalidaForm(formData);
    
    if (!validation.isValid) {
      console.log('❌ Formulario de salida inválido:', validation.errors);
      setErrors(validation.errors);
      Alert.alert(
        'Errores en el formulario',
        'Por favor, corrige los errores antes de continuar',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    
    try {
      // Simular procesamiento de salida
      console.log('💾 Simulando actualización de estado...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Datos completos de la salida
      const salidaCompleta = {
        registroId: registro.id,
        tipo: registro.tipo,
        peso: registro.peso,
        fechaRegistro: registro.fecha,
        personaRegistro: registro.persona,
        fechaSalida: formData.fechaSalida,
        personaAutoriza: formData.personaAutoriza,
        observaciones: formData.observaciones,
        estadoAnterior: 'Activo',
        estadoNuevo: 'Despachado'
      };
      
      console.log('✅ Salida procesada exitosamente:', salidaCompleta);
      
      // Mostrar confirmación detallada
      Alert.alert(
        '🎉 ¡Salida Procesada!',
        `Material despachado exitosamente:\n\n` +
        `📦 ${registro.tipo}: ${registro.peso}kg\n` +
        `📅 Autorizado: ${formData.fechaSalida}\n` +
        `👤 Por: ${formData.personaAutoriza}` +
        (formData.observaciones ? `\n📝 Observaciones: ${formData.observaciones}` : ''),
        [
          {
            text: 'Ver Historial',
            onPress: () => {
              console.log('📋 Navegando al historial después de salida exitosa');
              navigation.navigate('Historial');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error procesando salida:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo procesar la salida. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Si no hay registro, mostrar error
  if (!registro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>
            No se encontraron datos del registro
          </Text>
          <CustomButton
            title="Volver al Historial"
            onPress={() => navigation.navigate('Historial')}
            variant="primary"
            icon="📋"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Datos del registro para mostrar
  const tipoColor = getColorByType(registro.tipo);
  const tipoIcon = getIconByType(registro.tipo);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📤 Salida de Material</Text>
            <Text style={styles.subtitle}>
              Completar información para despacho
            </Text>
          </View>

          {/* Información del registro (solo lectura) */}
          <View style={styles.registroInfo}>
            <Text style={styles.sectionTitle}>📋 Información del Registro</Text>
            
            <View style={styles.registroCard}>
              <View style={styles.registroHeader}>
                <View style={styles.tipoContainer}>
                  <View style={[styles.tipoIcon, { backgroundColor: tipoColor + '20' }]}>
                    <Text style={styles.tipoIconText}>{tipoIcon}</Text>
                  </View>
                  <View style={styles.tipoInfo}>
                    <Text style={[styles.tipoText, { color: tipoColor }]}>
                      {registro.tipo}
                    </Text>
                    <Text style={styles.pesoText}>{registro.peso}kg</Text>
                  </View>
                </View>
                
                <View style={styles.estadoBadge}>
                  <Text style={styles.estadoText}>{registro.estado}</Text>
                </View>
              </View>
              
              <View style={styles.registroDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📅 Registrado:</Text>
                  <Text style={styles.detailValue}>
                    {formatDateTime(registro.fecha)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👤 Por:</Text>
                  <Text style={styles.detailValue}>{registro.persona}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Formulario de salida */}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>📝 Datos de Salida</Text>
            
            <CustomInput
              label="Fecha y Hora de Salida"
              icon="📅"
              value={formData.fechaSalida}
              onChangeText={(value) => handleInputChange('fechaSalida', value)}
              placeholder="DD/MM/YYYY - HH:mm"
              editable={false}
            />

            <CustomPicker
              label="Persona que Autoriza"
              icon="✅"
              selectedValue={formData.personaAutoriza}
              onValueChange={(value) => handleInputChange('personaAutoriza', value)}
              items={personasOptions}
              placeholder="Seleccionar quien autoriza"
              error={errors.personaAutoriza}
            />

            <CustomInput
              label="Observaciones (Opcional)"
              icon="📝"
              value={formData.observaciones}
              onChangeText={(value) => handleInputChange('observaciones', value)}
              placeholder="Comentarios adicionales sobre la salida..."
              multiline={true}
              numberOfLines={3}
            />
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Cancelar"
              onPress={() => navigation.goBack()}
              variant="outline"
              icon="❌"
              style={styles.button}
            />
            
            <CustomButton
              title={loading ? "Procesando..." : "Confirmar Salida"}
              onPress={handleSubmit}
              disabled={loading}
              variant="success"
              icon={loading ? "⏳" : "✅"}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  
  // Header styles
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Section styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  
  // Registro info styles
  registroInfo: {
    marginBottom: 24,
  },
  registroCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
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
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  registroDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  
  // Form styles
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  
  // Button styles
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    marginBottom: 8,
  },
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});