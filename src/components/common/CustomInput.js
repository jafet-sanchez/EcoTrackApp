import React from 'react';
import { View, Text, TextInput } from 'react-native';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  error,
  style,
  ...props
}) {
  return (
    <View className="mb-4" style={style}>
      {label && (
        <Text className="text-gray-700 text-base font-medium mb-2">
          {label}
        </Text>
      )}
      <TextInput
        className={`border border-gray-300 rounded-lg px-4 py-3 text-base bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}