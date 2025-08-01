import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomInput from '../components/common/CustomInput';
import CustomPicker from '../components/common/CustomPicker';
import CustomButton from '../components/common/CustomButton';
import { tiposReciclajeOptions, personasOptions } from '../data/mockData';
import { getCurrentDateTime, validateRegistroForm } from '../utils/helpers';
// NUEVO: Importar Google Sheets Service
import GoogleSheetsService from '../services/googleSheetsService';

export default function RegistroReciclaje({ navigation }) {
  const [formData, setFormData] = useState({
    peso: '',
    tipo: '',
    fecha: getCurrentDateTime(),
    persona: '',
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  // FUNCIÓN ACTUALIZADA: Guardar en Google Sheets
  const handleSubmit = async () => {
    console.log('🚀 Iniciando handleSubmit con Google Sheets');
    console.log('📋 Datos del formulario:', formData);
    
    const validation = validateRegistroForm(formData);
    console.log('✅ Resultado de validación:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Formulario inválido, mostrando errores');
      setErrors(validation.errors);
      Alert.alert(
        'Errores en el formulario',
        'Por favor, corrige los errores antes de continuar',
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('⏳ Iniciando proceso de guardado en Google Sheets');
    setLoading(true);
    
    try {
      // NUEVO: Preparar registro para Google Sheets
      const nuevoRegistro = {
        tipo: formData.tipo,
        peso: parseFloat(formData.peso),
        fecha: getCurrentDateTime(), // Fecha y hora actual al momento de guardar
        persona: formData.persona,
      };

      console.log('📊 Registro a guardar en Google Sheets:', nuevoRegistro);
      
      // NUEVO: Guardar en Google Sheets
      const registroGuardado = await GoogleSheetsService.crearRegistro(nuevoRegistro);
      
      console.log('🎉 Guardado exitoso en Google Sheets:', registroGuardado);
      
      // Mostrar mensaje de éxito con botones
      Alert.alert(
        '🎉 ¡Registro Exitoso!',
        `Registro guardado en Google Sheets:\n\n` +
        `📦 ${formData.tipo}: ${formData.peso}kg\n` +
        `👤 Registrado por: ${formData.persona}\n` +
        `📅 Fecha: ${nuevoRegistro.fecha}\n` +
        `🆔 ID: ${registroGuardado.id}`,
        [
          {
            text: 'Ver Historial',
            onPress: () => {
              console.log('📋 Navegando al historial');
              navigation.navigate('Historial');
            }
          },
          {
            text: 'Registrar Otro',
            onPress: () => {
              console.log('🔄 Limpiando formulario para nuevo registro');
              clearForm();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error al guardar en Google Sheets:', error);
      
      // NUEVO: Manejo específico de errores de Google Sheets
      let mensajeError = 'No se pudo guardar el registro.';
      
      if (error.message.includes('No se pudo conectar')) {
        mensajeError = 'Error de conexión con Google Sheets. Verifica tu internet.';
      } else if (error.message.includes('API')) {
        mensajeError = 'Error en la API de Google Sheets. Intenta más tarde.';
      }
      
      Alert.alert(
        '❌ Error al Guardar',
        `${mensajeError}\n\nDetalles: ${error.message}`,
        [
          { text: 'Reintentar', onPress: () => handleSubmit() },
          { text: 'Cancelar' }
        ]
      );
    } finally {
      console.log('✅ Finalizando proceso');
      setLoading(false);
    }
  };

  // Función para limpiar el formulario con nueva fecha y hora
  const clearForm = () => {
    console.log('🧹 Ejecutando clearForm');
    setFormData({
      peso: '',
      tipo: '',
      fecha: getCurrentDateTime(), // Nueva fecha y hora al limpiar
      persona: '',
    });
    setErrors({});
    console.log('✅ Formulario limpiado con nueva fecha y hora:', getCurrentDateTime());
  };

  // Función para actualizar manualmente la fecha y hora
  const updateDateTime = () => {
    const newDateTime = getCurrentDateTime();
    handleInputChange('fecha', newDateTime);
    console.log('🕒 Fecha y hora actualizada:', newDateTime);
  };

  // NUEVA FUNCIÓN: Probar conexión con Google Sheets
  const probarConexion = async () => {
    console.log('🔍 Probando conexión con Google Sheets...');
    setLoading(true);
    
    try {
      const conexionExitosa = await GoogleSheetsService.probarConexion();
      
      if (conexionExitosa) {
        Alert.alert(
          '✅ Conexión Exitosa',
          'La conexión con Google Sheets está funcionando correctamente.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Error de Conexión',
          'No se pudo conectar con Google Sheets. Verifica tu configuración.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error probando conexión:', error);
      Alert.alert(
        '❌ Error',
        `Error al probar la conexión: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.title}>🌱 Registro de Reciclaje</Text>
            <Text style={styles.subtitle}>
              Completa los datos para registrar un nuevo material reciclado
            </Text>
            {/* NUEVO: Indicador de conexión */}
            <View style={styles.connectionIndicator}>
              <Text style={styles.connectionText}>
                📊 Guardado en Google Sheets
              </Text>
              <TouchableOpacity onPress={probarConexion} style={styles.testConnectionButton}>
                <Text style={styles.testConnectionText}>🔍 Probar conexión</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <CustomInput
              label="Peso (kg)"
              icon="⚖️"
              value={formData.peso}
              onChangeText={(value) => handleInputChange('peso', value)}
              placeholder="Ej: 2.5"
              keyboardType="numeric"
              error={errors.peso}
            />

            <CustomPicker
              label="Tipo de Reciclaje"
              icon="♻️"
              selectedValue={formData.tipo}
              onValueChange={(value) => handleInputChange('tipo', value)}
              items={tiposReciclajeOptions}
              placeholder="Seleccionar tipo de material"
              error={errors.tipo}
            />

            {/* Campo de fecha y hora mejorado */}
            <View style={styles.dateInputContainer}>
              <CustomInput
                label="Fecha y Hora de Registro"
                icon="📅"
                value={formData.fecha}
                onChangeText={(value) => handleInputChange('fecha', value)}
                placeholder="DD/MM/YYYY - HH:mm"
                editable={false}
              />
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={updateDateTime}
              >
                <Text style={styles.updateButtonText}>🔄 Actualizar</Text>
              </TouchableOpacity>
            </View>

            <CustomPicker
              label="Persona que Registra"
              icon="👤"
              selectedValue={formData.persona}
              onValueChange={(value) => handleInputChange('persona', value)}
              items={personasOptions}
              placeholder="Seleccionar persona"
              error={errors.persona}
            />
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Ver Historial"
              onPress={() => navigation.navigate('Historial')}
              variant="outline"
              icon="📋"
              style={styles.button}
            />
            
            <CustomButton
              title={loading ? "Guardando en Google Sheets..." : "💾 Registrar en Google Sheets"}
              onPress={handleSubmit}
              disabled={loading}
              variant="success"
              icon={loading ? "⏳" : "📊"}
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
    marginBottom: 12,
  },
  // NUEVOS: Estilos para indicador de conexión
  connectionIndicator: {
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  connectionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  testConnectionButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  testConnectionText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dateInputContainer: {
    position: 'relative',
  },
  updateButton: {
    position: 'absolute',
    right: 10,
    top: 45,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // NUEVOS: Estilos para sección de información
  infoSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});