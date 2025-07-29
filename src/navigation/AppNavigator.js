import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import RegistroReciclaje from '../screens/RegistroReciclaje';
import HistorialReciclaje from '../screens/HistorialReciclaje';
import SalidaReciclaje from '../screens/SalidaReciclaje';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Registro"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#16a34a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Registro" 
          component={RegistroReciclaje}
          options={{ title: '🌱 Registro de Reciclaje' }}
        />
        <Stack.Screen 
          name="Historial" 
          component={HistorialReciclaje}
          options={{ title: '📋 Historial de Reciclaje' }}
        />
        <Stack.Screen 
          name="Salida" 
          component={SalidaReciclaje}
          options={{ title: '📤 Salida de Reciclaje' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}