import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
      barStyle="light-content" backgroundColor="transparent" translucent={true}/>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to La Pino'z!</Text>
        <Text style={styles.subtitle}>You have successfully logged in.</Text>
        
        <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
            })}
        >
            <LogOut size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#3c7d48',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default HomeScreen;
