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
  getIconByType,
  reconstruirGrupoDesdeParams,
  buscarRegistrosPorIds,
  validarParametrosNavegacion
} from '../utils/helpers';

export default function SalidaReciclaje({ route, navigation }) {
  // Obtener parámetros serializables y reconstruir datos
  const routeParams = route.params || {};
  
  // Validar parámetros de navegación
  const validacion = validarParametrosNavegacion(routeParams);
  if (!validacion.esValido) {
    console.error('❌ Parámetros de navegación inválidos:', validacion.errores);
  }
  
  // Reconstruir datos desde parámetros serializables
  let registro = null;
  let grupo = null;
  let registrosParaProcesar = [];
  let esGrupo = false;
  
  if (routeParams.esGrupo) {
    // Es un grupo - reconstruir desde IDs
    esGrupo = true;
    grupo = reconstruirGrupoDesdeParams(routeParams);
    registrosParaProcesar = grupo.registrosActivos;
    console.log('👥 GRUPO RECONSTRUIDO:', grupo);
    console.log('📋 Registros activos a procesar:', registrosParaProcesar);
  } else if (routeParams.registroId) {
    // Es un registro individual - buscar por ID
    const registrosEncontrados = buscarRegistrosPorIds([routeParams.registroId]);
    registro = registrosEncontrados[0];
    console.log('📋 REGISTRO INDIVIDUAL encontrado:', registro);
  } else if (routeParams.registro) {
    // Compatibilidad: si viene el registro completo (método anterior)
    registro = routeParams.registro;
    console.log('📋 REGISTRO INDIVIDUAL (método anterior):', registro);
  }
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    fechaSalida: getCurrentDateTime(),
    personaAutoriza: '',
    observaciones: '',
  });

  // Actualizar fecha/hora cada minuto
  useEffect(() => {
    const actualizarFecha = () => {
      setFormData(prev => ({
        ...prev,
        fechaSalida: getCurrentDateTime()
      }));
    };

    // Actualizar inmediatamente al montar
    actualizarFecha();

    // Actualizar cada minuto (60000 ms)
    const intervalo = setInterval(actualizarFecha, 60000);

    // Limpiar intervalo al desmontar
    return () => clearInterval(intervalo);
  }, []); // Solo se ejecuta al montar/desmontar
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('📤 SalidaReciclaje montado');
    
    // Validar datos según el tipo (grupo o registro individual)
    if (esGrupo) {
      console.log('👥 Procesando GRUPO:', grupo);
      console.log('📋 Registros a procesar:', registrosParaProcesar);
      
      if (!grupo || !registrosParaProcesar || registrosParaProcesar.length === 0) {
        Alert.alert(
          'Error',
          'No se encontraron datos del grupo o registros para procesar',
          [
            { 
              text: 'Volver al Historial', 
              onPress: () => navigation.navigate('Historial') 
            }
          ]
        );
        return;
      }

      // Verificar que todos los registros estén activos
      const registrosInactivos = registrosParaProcesar.filter(r => r.estado !== 'Activo');
      if (registrosInactivos.length > 0) {
        Alert.alert(
          'Registros no disponibles',
          `Algunos registros del grupo ya no están activos. Solo se procesarán los registros disponibles.`,
          [{ text: 'Continuar' }]
        );
      }
    } else {
      console.log('📋 Procesando REGISTRO INDIVIDUAL:', registro);
      
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
    }
  }, [esGrupo, grupo, registrosParaProcesar, registro, navigation]);

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
      // Procesar según el tipo
      if (esGrupo) {
        console.log('🚀 Procesando salida del GRUPO:', grupo.tipo);
        console.log('📦 Registros a procesar:', registrosParaProcesar.length);
        
        // Simular procesamiento de salida del grupo
        console.log('💾 Simulando actualización de estados del grupo...');
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Filtrar solo registros activos para procesar
        const registrosActivos = registrosParaProcesar.filter(r => r.estado === 'Activo');
        const pesoTotal = registrosActivos.reduce((sum, r) => sum + r.peso, 0);
        
        // Datos completos de la salida del grupo
        const salidaCompleta = {
          tipo: 'grupo',
          grupoTipo: grupo.tipo,
          cantidadRegistros: registrosActivos.length,
          pesoTotal: pesoTotal,
          registrosIds: registrosActivos.map(r => r.id),
          fechaSalida: formData.fechaSalida,
          personaAutoriza: formData.personaAutoriza,
          observaciones: formData.observaciones,
          estadoAnterior: 'Activo',
          estadoNuevo: 'Despachado'
        };
        
        console.log('✅ Salida de grupo procesada exitosamente:', salidaCompleta);
        
        // Mostrar confirmación detallada del grupo
        Alert.alert(
          '🎉 ¡Salida de Grupo Procesada!',
          `Grupo de materiales despachado exitosamente:\n\n` +
          `📦 ${grupo.tipo}: ${pesoTotal}kg\n` +
          `📊 ${registrosActivos.length} registros procesados\n` +
          `📅 Autorizado: ${formData.fechaSalida}\n` +
          `👤 Por: ${formData.personaAutoriza}` +
          (formData.observaciones ? `\n📝 Observaciones: ${formData.observaciones}` : ''),
          [
            {
              text: 'Ver Historial',
              onPress: () => {
                console.log('📋 Navegando al historial después de salida exitosa del grupo');
                navigation.navigate('Historial');
              }
            }
          ]
        );
        
      } else {
        console.log('🚀 Procesando salida del REGISTRO:', registro.id);
        
        // Simular procesamiento de salida del registro individual
        console.log('💾 Simulando actualización de estado...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Datos completos de la salida individual
        const salidaCompleta = {
          tipo: 'individual',
          registroId: registro.id,
          tipoMaterial: registro.tipo,
          peso: registro.peso,
          fechaRegistro: registro.fecha,
          personaRegistro: registro.persona,
          fechaSalida: formData.fechaSalida,
          personaAutoriza: formData.personaAutoriza,
          observaciones: formData.observaciones,
          estadoAnterior: 'Activo',
          estadoNuevo: 'Despachado'
        };
        
        console.log('✅ Salida individual procesada exitosamente:', salidaCompleta);
        
        // Mostrar confirmación detallada del registro individual
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
      }
      
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

  // Validar datos según el tipo
  if (esGrupo && (!grupo || !registrosParaProcesar)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>
            No se encontraron datos del grupo
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

  if (!esGrupo && !registro) {
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

  // Preparar datos para mostrar según el tipo
  let displayData;
  if (esGrupo) {
    const registrosActivos = registrosParaProcesar.filter(r => r.estado === 'Activo');
    const pesoTotal = registrosActivos.reduce((sum, r) => sum + r.peso, 0);
    displayData = {
      tipo: grupo.tipo,
      peso: pesoTotal,
      cantidadRegistros: registrosActivos.length,
      registros: registrosActivos,
      esGrupo: true
    };
  } else {
    displayData = {
      ...registro,
      esGrupo: false
    };
  }

  const tipoColor = getColorByType(displayData.tipo);
  const tipoIcon = getIconByType(displayData.tipo);

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
            <Text style={styles.title}>
              📤 Salida de {displayData.esGrupo ? 'Grupo' : 'Material'}
            </Text>
            <Text style={styles.subtitle}>
              {displayData.esGrupo 
                ? 'Completar información para despacho de grupo'
                : 'Completar información para despacho'
              }
            </Text>
          </View>

          {/* Información del registro/grupo */}
          <View style={styles.registroInfo}>
            <Text style={styles.sectionTitle}>
              📋 Información {displayData.esGrupo ? 'del Grupo' : 'del Registro'}
            </Text>
            
            <View style={styles.registroCard}>
              <View style={styles.registroHeader}>
                <View style={styles.tipoContainer}>
                  <View style={[styles.tipoIcon, { backgroundColor: tipoColor + '20' }]}>
                    <Text style={styles.tipoIconText}>{tipoIcon}</Text>
                  </View>
                  <View style={styles.tipoInfo}>
                    <Text style={[styles.tipoText, { color: tipoColor }]}>
                      {displayData.tipo}
                    </Text>
                    <Text style={styles.pesoText}>{displayData.peso}kg</Text>
                    {displayData.esGrupo && (
                      <Text style={styles.cantidadText}>
                        {displayData.cantidadRegistros} registros
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.estadoBadge}>
                  <Text style={styles.estadoText}>
                    {displayData.esGrupo ? 'Grupo' : 'Activo'}
                  </Text>
                </View>
              </View>
              
              {/* Detalles según el tipo */}
              {displayData.esGrupo ? (
                <View style={styles.registroDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📦 Tipo de Material:</Text>
                    <Text style={styles.detailValue}>{displayData.tipo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>⚖️ Peso Total:</Text>
                    <Text style={styles.detailValue}>{displayData.peso}kg</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📊 Cantidad:</Text>
                    <Text style={styles.detailValue}>
                      {displayData.cantidadRegistros} registros
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.registroDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📅 Registrado:</Text>
                    <Text style={styles.detailValue}>
                      {formatDateTime(displayData.fecha)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>👤 Por:</Text>
                    <Text style={styles.detailValue}>{displayData.persona}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Lista de registros del grupo */}
            {displayData.esGrupo && (
              <View style={styles.registrosLista}>
                <Text style={styles.registrosListaTitle}>
                  📋 Registros a procesar ({displayData.cantidadRegistros})
                </Text>
                {displayData.registros.map((reg, index) => (
                  <View key={reg.id} style={styles.registroItem}>
                    <View style={styles.registroItemInfo}>
                      <Text style={styles.registroItemPeso}>{reg.peso}kg</Text>
                      <Text style={styles.registroItemFecha}>
                        {formatDateTime(reg.fecha)}
                      </Text>
                      <Text style={styles.registroItemPersona}>{reg.persona}</Text>
                    </View>
                    <View style={styles.registroItemEstado}>
                      <Text style={styles.registroItemEstadoText}>{reg.estado}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
              placeholder={displayData.esGrupo 
                ? "Comentarios adicionales sobre la salida del grupo..."
                : "Comentarios adicionales sobre la salida..."
              }
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
    marginBottom: 16,
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
  // Estilo para mostrar cantidad de registros
  cantidadText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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
  
  // Estilos para lista de registros del grupo
  registrosLista: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  registrosListaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  registroItemInfo: {
    flex: 1,
  },
  registroItemPeso: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  registroItemFecha: {
    fontSize: 12,
    color: '#6B7280',
  },
  registroItemPersona: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  registroItemEstado: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 12,
  },
  registroItemEstadoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
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