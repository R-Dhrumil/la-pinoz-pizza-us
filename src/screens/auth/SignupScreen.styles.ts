import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    backgroundColor: '#3c7d48',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  heroBrandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    height: 52,
  },
  inputError: {
      borderColor: '#ef4444',
      borderWidth: 1.5,
      backgroundColor: '#FFF5F5',
  },
  errorText: {
      color: '#ef4444',
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1b0d0e',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 4,
  },
  mainButton: {
    backgroundColor: '#3c7d48',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3c7d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  linkText: {
    color: '#4b5563',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  loginLinkContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  loginLinkText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLinkHighlight: {
    color: '#3c7d48',
    fontWeight: '700',
  },
});
