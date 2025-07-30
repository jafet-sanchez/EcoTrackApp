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

export default function RegistroReciclaje({ navigation }) {
  const [formData, setFormData] = useState({
    peso: '',
    tipo: '',
    fecha: getCurrentDateTime(), // Usar formato ISO para el formulario
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

  const handleSubmit = async () => {
    console.log('🚀 Iniciando handleSubmit');
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

    console.log('⏳ Iniciando proceso de guardado');
    setLoading(true);
    
    try {
      // Crear registro con fecha y hora actual al momento de guardar
      const registro = {
        id: Date.now().toString(),
        ...formData,
        peso: parseFloat(formData.peso),
        fecha: getCurrentDateTime(), // Actualizar con fecha y hora al momento de guardar
      };

      // Simular llamada a API
      console.log('💾 Simulando guardado...');
      console.log('📊 Registro completo:', registro);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('🎉 Guardado exitoso, mostrando alerta');
      
      // Mostrar mensaje de éxito con botones
      Alert.alert(
        '🎉 ¡Registro Exitoso!',
        `Registro guardado correctamente:\n\n${formData.tipo}: ${formData.peso}kg\nRegistrado por: ${formData.persona}\nFecha: ${registro.fecha}`,
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
      console.log('❌ Error al guardar:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo guardar el registro. Intenta nuevamente.',
        [{ text: 'OK' }]
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
              title={loading ? "Guardando..." : "Registrar Reciclaje"}
              onPress={handleSubmit}
              disabled={loading}
              variant="success"
              icon={loading ? "⏳" : "💾"}
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
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});