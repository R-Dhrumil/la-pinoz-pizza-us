import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    Platform,
    PermissionsAndroid,
    KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from 'react-native-webview';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAddress } from '../context/AddressContext';
import { ChevronLeft, MapPin, Navigation, Home, Briefcase, Map } from 'lucide-react-native';

const AddNewAddressScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<RouteProp<AuthStackParamList, 'AddNewAddress'>>();
    const { addAddress, updateAddress } = useAddress();
    const webViewRef = useRef<WebView>(null);

    const editAddress = route.params?.editAddress;
    const isEditMode = !!editAddress;

    // Form State
    const [fullName, setFullName] = useState(editAddress?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(editAddress?.phoneNumber || '');
    const [houseNo, setHouseNo] = useState(editAddress?.addressLine1 || '');
    const [street, setStreet] = useState(editAddress?.addressLine2 || '');
    const [landmark, setLandmark] = useState(editAddress?.landmark || '');
    const [city, setCity] = useState(editAddress?.city || '');
    const [state, setState] = useState(editAddress?.state || '');
    const [pincode, setPincode] = useState(editAddress?.zipCode || '');
    const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>(editAddress?.type || 'Home');
    
    // Map State
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapRegion, setMapRegion] = useState({ lat: 39.8283, lng: -98.5795, zoom: 4 }); // Default USA (Geographic Center)

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "We need access to your location to show it on the map.",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    getCurrentLocation();
                } else {
                    console.log("Location permission denied");
                }
            } catch (err) {
                console.warn(err);
            }
        } else {
            getCurrentLocation();
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({ lat: latitude, lng: longitude });
                setMapRegion({ lat: latitude, lng: longitude, zoom: 15 });
                
                // Update map via injected JS
                if (webViewRef.current) {
                    webViewRef.current.postMessage(JSON.stringify({ type: 'UPDATE_LOCATION', lat: latitude, lng: longitude }));
                }
            },
            (error) => {
                console.log(error.code, error.message);
                Alert.alert("Error", "Failed to get current location.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const handleSaveAddress = async () => {
        if (!fullName || !phoneNumber || !houseNo || !street || !city || !state || !pincode) {
            Alert.alert("Error", "Please fill in all required fields.");
            return;
        }

        try {
            const addressData = {
                fullName,
                phoneNumber,
                addressLine1: houseNo,
                addressLine2: street,
                landmark: landmark || null,
                city,
                state,
                zipCode: pincode,
                isDefault: editAddress?.isDefault || false,
                type: addressType,
                coordinates: currentLocation || undefined,
                isDeliverable: true
            };

            if (isEditMode && editAddress?.id) {
                await updateAddress(editAddress.id, addressData);
            } else {
                await addAddress(addressData);
            }
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error", `Failed to ${isEditMode ? 'update' : 'save'} address. Please try again.`);
        }
    };

    // HTML content for WebView (Leaflet Map)
    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
                .center-marker {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -100%); /* Adjust to pin tip */
                    z-index: 1000;
                    pointer-events: none; /* Let clicks pass through */
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <!-- Simple SVG Pin centered -->
            <div class="center-marker">
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="#7f1d1d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3" fill="white"></circle>
                </svg>
            </div>
            <script>
                var map = L.map('map', { zoomControl: false }).setView([${mapRegion.lat}, ${mapRegion.lng}], ${mapRegion.zoom});
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                // Listen for messages from React Native
                document.addEventListener('message', function(event) {
                    handleMessage(event);
                });
                window.addEventListener('message', function(event) {
                    handleMessage(event);
                });

                function handleMessage(event) {
                    try {
                        var data = JSON.parse(event.data);
                        if (data.type === 'UPDATE_LOCATION') {
                            map.setView([data.lat, data.lng], 15);
                        }
                    } catch (e) {
                        // error parsing
                    }
                }
                
                // Send center coordinates to RN on move end
                map.on('moveend', function() {
                    var center = map.getCenter();
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'MAP_MOVED',
                        lat: center.lat,
                        lng: center.lng
                    }));
                });
            </script>
        </body>
        </html>
    `;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditMode ? 'Edit Address' : 'Add New Address'}</Text>
            </View>

            <View style={styles.mapContainer}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: mapHtml }}
                    style={styles.webView}
                    onMessage={(event) => {
                        try {
                            const data = JSON.parse(event.nativeEvent.data);
                            if (data.type === 'MAP_MOVED') {
                                setCurrentLocation({ lat: data.lat, lng: data.lng });
                            }
                        } catch (e) {}
                    }}
                />
                <TouchableOpacity style={styles.locationButton} onPress={requestLocationPermission}>
                    <Navigation size={20} color="#3c7d48" />
                    <Text style={styles.locationButtonText}>Use Current Location</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.formContainer}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="John Doe"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1234567890"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Address Details</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>House / Flat No. *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 101, A-Block"
                            value={houseNo}
                            onChangeText={setHouseNo}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Apartment / Road / Area *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Phoenix Towers, MG Road"
                            value={street}
                            onChangeText={setStreet}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Landmark</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Near City Mall"
                            value={landmark}
                            onChangeText={setLandmark}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Vadodara"
                                value={city}
                                onChangeText={setCity}
                            />

                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>State *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Gujarat"
                                value={state}
                                onChangeText={setState}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Pincode *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="390001"
                            keyboardType="number-pad"
                            value={pincode}
                            onChangeText={setPincode}
                            maxLength={6}
                        />
                    </View>

                    <Text style={styles.label}>Save As</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity 
                            style={[styles.typeButton, addressType === 'Home' && styles.activeTypeButton]}
                            onPress={() => setAddressType('Home')}
                        >
                            <Home size={18} color={addressType === 'Home' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, addressType === 'Home' && styles.activeTypeText]}>Home</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.typeButton, addressType === 'Work' && styles.activeTypeButton]}
                            onPress={() => setAddressType('Work')}
                        >
                            <Briefcase size={18} color={addressType === 'Work' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, addressType === 'Work' && styles.activeTypeText]}>Work</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.typeButton, addressType === 'Other' && styles.activeTypeButton]}
                            onPress={() => setAddressType('Other')}
                        >
                            <MapPin size={18} color={addressType === 'Other' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, addressType === 'Other' && styles.activeTypeText]}>Other</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                        <Text style={styles.saveButtonText}>{isEditMode ? 'Update Address' : 'Save Address'}</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        marginRight: 8,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    mapContainer: {
        height: 250, // Approx 30-35% of screen
        width: '100%',
        position: 'relative',
    },
    webView: {
        flex: 1,
    },
    locationButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        gap: 8,
    },
    locationButtonText: {
        color: '#3c7d48',
        fontWeight: '600',
        fontSize: 13,
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#4b5563',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#f9fafb',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 8,
        backgroundColor: '#fff',
    },
    activeTypeButton: {
        backgroundColor: '#3c7d48',
        borderColor: '#3c7d48',
    },
    typeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTypeText: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#064e3b',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        marginBottom: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddNewAddressScreen;