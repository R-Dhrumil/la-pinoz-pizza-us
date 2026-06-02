import React, { useState, useRef } from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';

type AppWebViewRouteProp = RouteProp<AuthStackParamList, 'AppWebView'>;

const AppWebViewScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<AppWebViewRouteProp>();
    const { url, title } = route.params;

    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleGoBack = () => {
        navigation.goBack();
    };

    // JS snippet injected into the page to hide the website's headers, footers, and home navigation links.
    // This runs immediately and also on a brief delay to handle dynamic React elements.
    const hideWebLayoutJS = `
      (function() {
        // Bypass location prompt by setting storage values
        try {
          localStorage.setItem('user_location', 'App Mode');
          sessionStorage.setItem('location_dismissed', 'true');
        } catch (e) {
          console.error(e);
        }

        function applyStyles() {
          // Hide standard semantic header/nav and footer
          const nav = document.querySelector('nav');
          if (nav) nav.style.display = 'none';

          const footer = document.querySelector('footer');
          if (footer) footer.style.display = 'none';

          // Find and hide the location selection modal
          const headings = document.querySelectorAll('h2');
          headings.forEach(h2 => {
            if (h2.textContent && h2.textContent.includes('Find Your Nearest Store')) {
              let parent = h2.parentElement;
              while (parent) {
                if (parent.classList.contains('fixed')) {
                  parent.style.display = 'none';
                  break;
                }
                parent = parent.parentElement;
              }
            }
          });

          // Hide back-to-home links to prevent user navigating away
          const links = document.querySelectorAll('a');
          links.forEach(link => {
            const text = link.textContent || '';
            const href = link.getAttribute('href') || '';
            if (text.includes('Back to Home') || href === '/' || href.includes('privacy') === false && href.includes('terms') === false) {
              // Only hide root-level or generic home links, let them keep privacy/terms links if necessary
              if (href === '/' || text.includes('Back to Home')) {
                link.style.display = 'none';
                const parent = link.parentElement;
                if (parent && parent.children.length === 1) {
                  parent.style.display = 'none';
                }
              }
            }
          });

          // Adjust layout paddings to look clean & native
          const main = document.querySelector('main');
          if (main) {
            main.style.paddingTop = '0px';
            main.style.marginTop = '0px';
          }

          const pageContainer = document.querySelector('.bg-gray-50');
          if (pageContainer) {
            pageContainer.style.paddingTop = '12px';
            pageContainer.style.paddingBottom = '24px';
            pageContainer.className = pageContainer.className.replace('py-12', 'py-3');
          }
        }

        applyStyles();
        setTimeout(applyStyles, 100);
        setTimeout(applyStyles, 500);
        setTimeout(applyStyles, 1500);
      })();
      true;
    `;

    return (
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
            <FocusAwareStatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                </View>
                <View style={{ width: 32 }} />
            </View>

            {/* WebView */}
            <View style={{ flex: 1 }}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: url }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    mixedContentMode="always"
                    startInLoadingState={true}
                    injectedJavaScript={hideWebLayoutJS}
                    onLoadStart={() => setIsLoading(true)}
                    onLoadEnd={() => setIsLoading(false)}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#3c7d48" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}
                    originWhitelist={['*']}
                    setSupportMultipleWindows={false}
                    allowsInlineMediaPlayback={true}
                    cacheEnabled={true}
                    scalesPageToFit={true}
                />
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backBtn: {
        padding: 4,
        width: 32,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
});

export default AppWebViewScreen;
