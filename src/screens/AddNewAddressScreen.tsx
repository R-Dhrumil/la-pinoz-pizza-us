import React, { useState, useEffect, useRef } from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
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
    StatusBar
} from "react-native";
import { ScreenContainer } from '../components/ScreenContainer';
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

    // USA States List
    const US_STATES = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    // Auto-format phone number to US format (XXX) XXX-XXXX
    const formatPhoneNumber = (text: string) => {
        const digits = text.replace(/\D/g, '');
        if (digits.length <= 3) {
            return digits;
        } else if (digits.length <= 6) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
    };

    // Form State
    const [fullName, setFullName] = useState(editAddress?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(
        editAddress?.phoneNumber ? formatPhoneNumber(editAddress.phoneNumber) : ''
    );
    const [addressLine1, setAddressLine1] = useState(editAddress?.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(editAddress?.addressLine2 || '');
    const [landmark, setLandmark] = useState(editAddress?.landmark || '');
    const [city, setCity] = useState(editAddress?.city || '');
    const [state, setState] = useState(editAddress?.state || '');
    const [zipcode, setZipcode] = useState(editAddress?.zipCode || '');
    const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(editAddress?.label || 'Home');
    
    // Validation State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    // Map State
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [mapRegion, setMapRegion] = useState({ lat: 39.8283, lng: -98.5795, zoom: 4 }); // Default USA (Geographic Center)

    // Form input format handlers
    const handlePhoneChange = (text: string) => {
        setPhoneNumber(formatPhoneNumber(text));
    };

    const handleStateChange = (text: string) => {
        const cleaned = text.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
        setState(cleaned);
    };

    const handleZipChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 5);
        setZipcode(cleaned);
    };

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    // Reactive validation logic
    const getValidationErrors = () => {
        const newErrors: { [key: string]: string } = {};

        // Full Name Validation
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Full Name must be at least 2 characters';
        } else if (fullName.trim().length > 50) {
            newErrors.fullName = 'Full Name must be less than 50 characters';
        } else if (!nameRegex.test(fullName.trim())) {
            newErrors.fullName = 'Please enter a valid name (letters and spaces only)';
        }

        // Phone Validation (USA Format - 10 digits)
        const digits = phoneNumber.replace(/\D/g, '');
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required';
        } else if (digits.length !== 10) {
            newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
        }

        // Address Line 1
        if (!addressLine1.trim()) {
            newErrors.addressLine1 = 'Address Line 1 is required';
        } else if (addressLine1.trim().length < 3) {
            newErrors.addressLine1 = 'Address Line 1 must be at least 3 characters';
        }

        // City
        const cityRegex = /^[a-zA-Z\s\-'.]+$/;
        if (!city.trim()) {
            newErrors.city = 'City is required';
        } else if (!cityRegex.test(city.trim())) {
            newErrors.city = 'Please enter a valid city name';
        }

        // State (US 2-letter abbreviation)
        const stateUpper = state.trim().toUpperCase();
        if (!state.trim()) {
            newErrors.state = 'State is required';
        } else if (stateUpper.length !== 2) {
            newErrors.state = 'State must be a 2-letter abbreviation';
        } else if (!US_STATES.includes(stateUpper)) {
            newErrors.state = 'Please enter a valid 2-letter US State code (e.g. CA, NY)';
        }

        // Zip Code (US Zip Code - 5 digits)
        const zipRegex = /^\d{5}$/;
        if (!zipcode.trim()) {
            newErrors.zipcode = 'Zip Code is required';
        } else if (!zipRegex.test(zipcode.trim())) {
            newErrors.zipcode = 'Please enter a valid 5-digit Zip Code';
        }

        return newErrors;
    };

    useEffect(() => {
        setErrors(getValidationErrors());
    }, [fullName, phoneNumber, addressLine1, city, state, zipcode]);

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
        const formErrors = getValidationErrors();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setTouched({
                fullName: true,
                phoneNumber: true,
                addressLine1: true,
                
                city: true,
                state: true,
                zipcode: true
            });
            Alert.alert("Validation Error", "Please correct the errors in the form before saving.");
            return;
        }

        try {
            const addressData = {
                fullName,
                phoneNumber: phoneNumber.replace(/\D/g, ''),
                addressLine1,
                addressLine2: addressLine2 || null,
                landmark: landmark || null,
                city,
                state: state.toUpperCase(),
                zipCode: zipcode,
                isDefault: editAddress?.isDefault || false,
                label: label,
                coordinates: currentLocation || undefined,
                isDeliverable: true,
                
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
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
            <FocusAwareStatusBar barStyle="light-content" backgroundColor="#3c7d48" />
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

            <View style={styles.formContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>
                    
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={[styles.input, touched.fullName && errors.fullName && styles.inputError]}
                            placeholder="John Doe"
                            placeholderTextColor="#808080"
                            value={fullName}
                            onChangeText={setFullName}
                            onBlur={() => handleBlur('fullName')}
                        />
                        {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                    </View>
                    
                    {/* Phone Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number *</Text>
                        <TextInput
                            style={[styles.input, touched.phoneNumber && errors.phoneNumber && styles.inputError]}
                            placeholder="(555) 000-0000"
                            placeholderTextColor="#808080"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={handlePhoneChange}
                            onBlur={() => handleBlur('phoneNumber')}
                            maxLength={14}
                        />
                        {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>

                    <Text style={styles.sectionTitle}>Address Details</Text>
                    
                    {/* Address Line 1 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address Line 1 *</Text>
                        <TextInput
                            style={[styles.input, touched.addressLine1 && errors.addressLine1 && styles.inputError]}
                            placeholder="e.g. 123 Main St"
                            placeholderTextColor="#808080"
                            value={addressLine1}
                            onChangeText={setAddressLine1}
                            onBlur={() => handleBlur('addressLine1')}
                        />
                        {touched.addressLine1 && errors.addressLine1 && <Text style={styles.errorText}>{errors.addressLine1}</Text>}
                    </View>

                    {/* Address Line 2 */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address Line 2 (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Apt 4B, Suite 100"
                            placeholderTextColor="#808080"
                            value={addressLine2}
                            onChangeText={setAddressLine2}
                        />
                    </View>

                    {/* Landmark */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Landmark</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Near City Mall"
                            placeholderTextColor="#808080"
                            value={landmark}
                            onChangeText={setLandmark}
                        />
                    </View>

                    {/* City & State */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City *</Text>
                            <TextInput
                                style={[styles.input, touched.city && errors.city && styles.inputError]}
                                placeholder="e.g. Los Angeles"
                                placeholderTextColor="#808080"
                                value={city}
                                onChangeText={setCity}
                                onBlur={() => handleBlur('city')}
                            />
                            {touched.city && errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>State *</Text>
                            <TextInput
                                style={[styles.input, touched.state && errors.state && styles.inputError]}
                                placeholder="e.g. CA"
                                placeholderTextColor="#808080"
                                value={state}
                                onChangeText={handleStateChange}
                                onBlur={() => handleBlur('state')}
                                autoCapitalize="characters"
                                maxLength={2}
                            />
                            {touched.state && errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
                        </View>
                    </View>

                    {/* Zip Code */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Zip Code *</Text>
                        <TextInput
                            style={[styles.input, touched.zipcode && errors.zipcode && styles.inputError]}
                            placeholder="e.g. 90210"
                            placeholderTextColor="#808080"
                            keyboardType="number-pad"
                            value={zipcode}
                            onChangeText={handleZipChange}
                            onBlur={() => handleBlur('zipcode')}
                            maxLength={5}
                        />
                        {touched.zipcode && errors.zipcode && <Text style={styles.errorText}>{errors.zipcode}</Text>}
                    </View>

                    <Text style={styles.label}>Save As</Text>
                    <View style={styles.typeContainer}>
                        <TouchableOpacity 
                            style={[styles.typeButton, label === 'Home' && styles.activeTypeButton]}
                            onPress={() => setLabel('Home')}
                        >
                            <Home size={18} color={label === 'Home' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, label === 'Home' && styles.activeTypeText]}>Home</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.typeButton, label === 'Work' && styles.activeTypeButton]}
                            onPress={() => setLabel('Work')}
                        >
                            <Briefcase size={18} color={label === 'Work' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, label === 'Work' && styles.activeTypeText]}>Work</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.typeButton, label === 'Other' && styles.activeTypeButton]}
                            onPress={() => setLabel('Other')}
                        >
                            <MapPin size={18} color={label === 'Other' ? '#fff' : '#6b7280'} />
                            <Text style={[styles.typeText, label === 'Other' && styles.activeTypeText]}>Other</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                        <Text style={styles.saveButtonText}>{isEditMode ? 'Update Address' : 'Save Address'}</Text>
                    </TouchableOpacity>

                </ScrollView>
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
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
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