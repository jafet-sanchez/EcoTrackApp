import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

export default function CustomPicker({
  label,
  selectedValue,
  onValueChange,
  items,
  placeholder = "Seleccionar...",
  error,
  style,
  icon,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === selectedValue);

  const handleSelect = (value) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          {icon && <Text style={styles.labelIcon}>{icon}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.picker,
          error ? styles.pickerError : null,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.pickerContent}>
          {selectedItem?.icon && (
            <Text style={styles.selectedIcon}>{selectedItem.icon}</Text>
          )}
          <Text style={[
            styles.pickerText,
            selectedValue ? styles.pickerTextSelected : styles.pickerTextPlaceholder
          ]}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
        </View>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || 'Seleccionar opción'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedValue === item.value ? styles.modalItemSelected : null
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <View style={styles.modalItemContent}>
                    {item.icon && (
                      <Text style={styles.modalItemIcon}>{item.icon}</Text>
                    )}
                    <Text style={[
                      styles.modalItemText,
                      selectedValue === item.value ? styles.modalItemTextSelected : null
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  {selectedValue === item.value && (
                    <Text style={styles.checkIcon}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  pickerText: {
    fontSize: 16,
  },
  pickerTextSelected: {
    color: '#111827',
  },
  pickerTextPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorContainer: {
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: '#F0FDF4',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalItemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
  },
  modalItemTextSelected: {
    color: '#16a34a',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 16,
    color: '#16a34a',
    fontWeight: 'bold',
  },
});