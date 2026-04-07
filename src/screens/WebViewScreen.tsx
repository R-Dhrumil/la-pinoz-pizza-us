import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

type WebViewScreenRouteProp = RouteProp<AuthStackParamList, 'WebView'>;

const WebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<WebViewScreenRouteProp>();
  const { url, title } = route.params;

  return (
    <ScreenContainer useScrollView={false} containerStyle={styles.container} edges={['top']}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#3c7d48" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.placeholder} />
      </View>
      <WebView source={{ uri: url }} style={styles.webview} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3c7d48',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});

export default WebViewScreen;
