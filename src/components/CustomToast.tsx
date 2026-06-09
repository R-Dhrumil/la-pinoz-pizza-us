import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const toastConfig = {
  success: ({ text1, text2, hide }: any) => (
    <View style={[styles.toastContainer, styles.borderSuccess]}>
      <View style={[styles.iconWrapper, styles.bgSuccess]}>
        <CheckCircle size={20} color="#3c7d48" />
      </View>
      <View style={styles.textWrapper}>
        {text1 ? <Text style={styles.titleText}>{text1}</Text> : null}
        {text2 ? <Text style={styles.descText}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeBtn} activeOpacity={0.7}>
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  ),
  error: ({ text1, text2, hide }: any) => (
    <View style={[styles.toastContainer, styles.borderError]}>
      <View style={[styles.iconWrapper, styles.bgError]}>
        <AlertCircle size={20} color="#ef4444" />
      </View>
      <View style={styles.textWrapper}>
        {text1 ? <Text style={styles.titleText}>{text1}</Text> : null}
        {text2 ? <Text style={styles.descText}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeBtn} activeOpacity={0.7}>
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  ),
  info: ({ text1, text2, hide }: any) => (
    <View style={[styles.toastContainer, styles.borderInfo]}>
      <View style={[styles.iconWrapper, styles.bgInfo]}>
        <Info size={20} color="#2563eb" />
      </View>
      <View style={styles.textWrapper}>
        {text1 ? <Text style={styles.titleText}>{text1}</Text> : null}
        {text2 ? <Text style={styles.descText}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeBtn} activeOpacity={0.7}>
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  ),
  warning: ({ text1, text2, hide }: any) => (
    <View style={[styles.toastContainer, styles.borderWarning]}>
      <View style={[styles.iconWrapper, styles.bgWarning]}>
        <AlertTriangle size={20} color="#d97706" />
      </View>
      <View style={styles.textWrapper}>
        {text1 ? <Text style={styles.titleText}>{text1}</Text> : null}
        {text2 ? <Text style={styles.descText}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeBtn} activeOpacity={0.7}>
        <X size={16} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: 'row',
    width: width * 0.92,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  borderSuccess: {
    borderColor: '#e2f0e5',
  },
  borderError: {
    borderColor: '#fee2e2',
  },
  borderInfo: {
    borderColor: '#dbeafe',
  },
  borderWarning: {
    borderColor: '#fef3c7',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bgSuccess: {
    backgroundColor: '#f0fdf4',
  },
  bgError: {
    backgroundColor: '#fef2f2',
  },
  bgInfo: {
    backgroundColor: '#eff6ff',
  },
  bgWarning: {
    backgroundColor: '#fffbeb',
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 4,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  descText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
