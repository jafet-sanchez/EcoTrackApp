import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CustomButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  style,
  textStyle,
  icon 
}) {
  // Lógica para determinar estilos basada en props
  const getButtonStyle = () => {
    let baseStyle = [styles.button];
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    } else {
      switch (variant) {
        case 'primary':
          baseStyle.push(styles.primary);
          break;
        case 'secondary':
          baseStyle.push(styles.secondary);
          break;
        case 'success':
          baseStyle.push(styles.success);
          break;
        case 'danger':
          baseStyle.push(styles.danger);
          break;
        case 'outline':
          baseStyle.push(styles.outline);
          break;
        default:
          baseStyle.push(styles.primary);
      }
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    let baseTextStyle = [styles.text];
    
    if (variant === 'outline') {
      baseTextStyle.push(styles.textOutline);
    }
    
    if (textStyle) {
      baseTextStyle.push(textStyle);
    }
    
    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>
        {icon && `${icon} `}{title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  primary: {
    backgroundColor: '#16a34a',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  success: {
    backgroundColor: '#059669',
  },
  danger: {
    backgroundColor: '#DC2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  disabled: {
    backgroundColor: '#9CA3AF',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textOutline: {
    color: '#16a34a',
  },
});