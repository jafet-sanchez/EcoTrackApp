import axios from 'axios';
import { GOOGLE_SHEETS_API_KEY, GOOGLE_SHEETS_ID } from '@env';

// Configuración base
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEET_ID = GOOGLE_SHEETS_ID;
const API_KEY = GOOGLE_SHEETS_API_KEY;

// Nombres de las hojas
const REGISTROS_SHEET = 'Registros_Reciclaje';
const SALIDAS_SHEET = 'Salidas_Despachos';

/**
 * Servicio para interactuar con Google Sheets
 */
class GoogleSheetsService {
  
  // Leer todos los registros de reciclaje
  async obtenerRegistros() {
    try {
      console.log('📊 Obteniendo registros de Google Sheets...');
      
      const response = await axios.get(
        `${BASE_URL}/${SHEET_ID}/values/${REGISTROS_SHEET}!A:F?key=${API_KEY}`
      );
      
      const rows = response.data.values || [];
      
      // Saltar la primera fila (headers)
      const dataRows = rows.slice(1);
      
      // Convertir filas a objetos
      const registros = dataRows.map(row => ({
        id: parseInt(row[0]) || 0,
        tipo: row[1] || '',
        peso: parseFloat(row[2]) || 0,
        fecha: row[3] || '',
        persona: row[4] || '',
        estado: row[5] || 'Activo'
      }));
      
      console.log('✅ Registros obtenidos:', registros.length);
      return registros;
      
    } catch (error) {
      console.error('❌ Error obteniendo registros:', error);
      throw new Error('No se pudieron obtener los registros');
    }
  }

  // Crear nuevo registro de reciclaje
  async crearRegistro(nuevoRegistro) {
    try {
      console.log('📝 Creando nuevo registro:', nuevoRegistro);
      
      // Obtener próximo ID
      const registrosActuales = await this.obtenerRegistros();
      const proximoId = registrosActuales.length > 0 
        ? Math.max(...registrosActuales.map(r => r.id)) + 1 
        : 1;
      
      // Preparar datos para Google Sheets
      const fila = [
        proximoId,
        nuevoRegistro.tipo,
        nuevoRegistro.peso,
        nuevoRegistro.fecha,
        nuevoRegistro.persona,
        'Activo'
      ];
      
      const response = await axios.post(
        `${BASE_URL}/${SHEET_ID}/values/${REGISTROS_SHEET}!A:F:append?valueInputOption=RAW&key=${API_KEY}`,
        {
          values: [fila]
        }
      );
      
      console.log('✅ Registro creado exitosamente con ID:', proximoId);
      return { ...nuevoRegistro, id: proximoId, estado: 'Activo' };
      
    } catch (error) {
      console.error('❌ Error creando registro:', error);
      throw new Error('No se pudo crear el registro');
    }
  }

  // Actualizar estado de registro (para despachos)
  async actualizarEstadoRegistro(registroId, nuevoEstado) {
    try {
      console.log(`🔄 Actualizando estado del registro ${registroId} a ${nuevoEstado}`);
      
      // Obtener todos los registros para encontrar la fila
      const registros = await this.obtenerRegistros();
      const indiceRegistro = registros.findIndex(r => r.id === registroId);
      
      if (indiceRegistro === -1) {
        throw new Error(`Registro con ID ${registroId} no encontrado`);
      }
      
      // La fila en Google Sheets (sumamos 2: 1 por header + 1 por índice base 1)
      const filaEnSheet = indiceRegistro + 2;
      
      const response = await axios.put(
        `${BASE_URL}/${SHEET_ID}/values/${REGISTROS_SHEET}!F${filaEnSheet}?valueInputOption=RAW&key=${API_KEY}`,
        {
          values: [[nuevoEstado]]
        }
      );
      
      console.log('✅ Estado actualizado exitosamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      throw new Error('No se pudo actualizar el estado del registro');
    }
  }

  // Crear registro de salida/despacho
  async crearSalida(datosSalida) {
    try {
      console.log('📦 Creando registro de salida:', datosSalida);
      
      // Obtener próximo ID de salida
      const response = await axios.get(
        `${BASE_URL}/${SHEET_ID}/values/${SALIDAS_SHEET}!A:G?key=${API_KEY}`
      );
      
      const rows = response.data.values || [];
      const dataRows = rows.slice(1); // Saltar headers
      const proximoIdSalida = dataRows.length > 0 
        ? Math.max(...dataRows.map(row => parseInt(row[0]) || 0)) + 1 
        : 1;
      
      // Preparar datos para la hoja de salidas
      const filaSalida = [
        proximoIdSalida,
        datosSalida.registroId,
        datosSalida.tipo,
        datosSalida.peso,
        datosSalida.fechaDespacho,
        datosSalida.personaAutoriza,
        datosSalida.observaciones || ''
      ];
      
      // Crear registro en hoja de salidas
      await axios.post(
        `${BASE_URL}/${SHEET_ID}/values/${SALIDAS_SHEET}!A:G:append?valueInputOption=RAW&key=${API_KEY}`,
        {
          values: [filaSalida]
        }
      );
      
      console.log('✅ Salida creada exitosamente con ID:', proximoIdSalida);
      return { ...datosSalida, idSalida: proximoIdSalida };
      
    } catch (error) {
      console.error('❌ Error creando salida:', error);
      throw new Error('No se pudo crear el registro de salida');
    }
  }

  // Procesar despacho completo (actualizar registro + crear salida)
  async procesarDespacho(registrosIds, datosDespacho) {
    try {
      console.log('🚀 Procesando despacho completo...');
      const resultados = [];
      
      for (const registroId of registrosIds) {
        // 1. Actualizar estado del registro a "Despachado"
        await this.actualizarEstadoRegistro(registroId, 'Despachado');
        
        // 2. Crear registro de salida
        const salidaData = {
          registroId: registroId,
          tipo: datosDespacho.tipo,
          peso: datosDespacho.peso,
          fechaDespacho: datosDespacho.fechaSalida,
          personaAutoriza: datosDespacho.personaAutoriza,
          observaciones: datosDespacho.observaciones
        };
        
        const salida = await this.crearSalida(salidaData);
        resultados.push(salida);
      }
      
      console.log('✅ Despacho procesado exitosamente');
      return resultados;
      
    } catch (error) {
      console.error('❌ Error procesando despacho:', error);
      throw error;
    }
  }

  // Obtener historial de salidas
  async obtenerSalidas() {
    try {
      console.log('📊 Obteniendo historial de salidas...');
      
      const response = await axios.get(
        `${BASE_URL}/${SHEET_ID}/values/${SALIDAS_SHEET}!A:G?key=${API_KEY}`
      );
      
      const rows = response.data.values || [];
      const dataRows = rows.slice(1);
      
      const salidas = dataRows.map(row => ({
        idSalida: parseInt(row[0]) || 0,
        registroId: parseInt(row[1]) || 0,
        tipo: row[2] || '',
        peso: parseFloat(row[3]) || 0,
        fechaDespacho: row[4] || '',
        personaAutoriza: row[5] || '',
        observaciones: row[6] || ''
      }));
      
      console.log('✅ Salidas obtenidas:', salidas.length);
      return salidas;
      
    } catch (error) {
      console.error('❌ Error obteniendo salidas:', error);
      throw new Error('No se pudieron obtener las salidas');
    }
  }

  // Verificar conectividad
  async probarConexion() {
    try {
      console.log('🔍 Probando conexión con Google Sheets...');
      
      const response = await axios.get(
        `${BASE_URL}/${SHEET_ID}?key=${API_KEY}`
      );
      
      console.log('✅ Conexión exitosa con:', response.data.properties.title);
      return true;
      
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export default new GoogleSheetsService();