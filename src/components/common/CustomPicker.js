import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomPicker({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seleccionar...",
  error,
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View className="mb-4" style={style}>
      {label && (
        <Text className="text-gray-700 text-base font-medium mb-2">
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        className={`border rounded-lg px-4 py-3 flex-row justify-between items-center bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        onPress={() => setModalVisible(true)}
      >
        <Text className={`text-base ${selectedValue ? 'text-gray-900' : 'text-gray-400'}`}>
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6B7280" />
      </TouchableOpacity>

      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl max-h-80">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                {label || 'Seleccionar opción'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-4 py-4 border-b border-gray-100"
                  onPress={() => handleSelect(item.value)}
                >
                  <Text className={`text-base ${
                    selectedValue === item.value ? 'text-primary-600 font-medium' : 'text-gray-900'
                  }`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}