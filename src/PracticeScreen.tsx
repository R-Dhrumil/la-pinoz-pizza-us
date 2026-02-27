// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ImageBackground,
//   Modal,
//   TextInput,
//   Pressable,
//   StatusBar,
// } from "react-native";

// import MaterialIcons from "react-native-vector-icons/MaterialIcons";

// export default function WeeklyTaskDashboard() {
//   const [sheetVisible, setSheetVisible] = useState(true);

//   return (
//     <View style={styles.container}>
//       <FocusAwareStatusBar barStyle="light-content" backgroundColor={BG} />

//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <View style={styles.headerLeft}>
//             <Image
//               source={{
//                 uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAa5J3UEk-rDAGTCLvMLZczK_yMpFBcWKioZNmuU9envJ-6IMpPaHhpAtb1P41jUger5-PJYk57-GKEWnULufXKX-VN73GgIA_cfKXbjUlEFlBZ1jnukKPlFJybCEFd6wZljy1zLOgHgkf9Z1p2SKlh0pjIVAsPz9TQvX2xNpd2HDPqSsT6NNdTYOLNOf6es8gMdElxL_0MLff_1gEWzWxlBdLGGYrego29SSfwBFnuXhnxe--UiZY01yzGRqJaXfyhZJ4zi2BgUJE",
//               }}
//               style={styles.avatar}
//             />

//             <View>
//               <Text style={styles.smallLabel}>CURRENT WEEK</Text>
//               <Text style={styles.weekTitle}>Week 42</Text>
//             </View>
//           </View>

//           <TouchableOpacity style={styles.iconButton}>
//             <MaterialIcons name="notifications" size={22} color="#cbd5e1" />
//           </TouchableOpacity>
//         </View>

//         {/* WEEK DATE + PROGRESS */}
//         <View style={styles.section}>
//           <Text style={styles.bigTitle}>Oct 23 - Oct 30</Text>

//           <View style={styles.card}>
//             <View style={styles.rowBetween}>
//               <View>
//                 <Text style={styles.muted}>Weekly Completion</Text>
//                 <Text style={styles.primaryBig}>45%</Text>
//               </View>
//               <Text style={styles.mutedSmall}>12 tasks remaining</Text>
//             </View>

//             <View style={styles.progressTrack}>
//               <View style={[styles.progressFill, { width: "45%" }]} />
//             </View>
//           </View>
//         </View>

//         {/* FOCUS CAROUSEL */}
//         <View style={styles.section}>
//           <View style={styles.rowBetween}>
//             <Text style={styles.sectionTitle}>This Week's Focus</Text>
//             <Text style={styles.primaryText}>View all</Text>
//           </View>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
//             {/* Card 1 */}
//             <ImageBackground
//               source={{
//                 uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG5g8Ivwm0NxWumFigZtCgJrEJyshlRzk1u0-WKxqP9NSfiml4QjQadLKORgWQXMuHqBe-eviIBRPl6U4cTvLAh_Sa8_8dLAnxnlFcJnZYMMzcUPhN6kQLwWdslauJeiWhk1k7a80UFKj4kZqO-y710HtmJYer_Q5UnzgNkPTAmANWHgOiFUhQ0LWG6qrn65yiv0etPAkFcNCjwtZEKNsK37wMTXdUOfFKhdynOTA6atHBE816QyHbV8AYo7Hja3hgeZ0rUBvH1iM",
//               }}
//               style={styles.focusCard}
//               imageStyle={{ borderRadius: 16 }}
//             >
//               <View style={styles.focusOverlay} />

//               <View style={styles.focusBottom}>
//                 <View>
//                   <Text style={styles.badge}>Hobby</Text>
//                   <Text style={styles.focusTitle}>Learn Guitar</Text>
//                 </View>

//                 <View style={styles.arrowCircle}>
//                   <MaterialIcons name="arrow-forward" size={18} color="white" />
//                 </View>
//               </View>
//             </ImageBackground>

//             {/* Card 2 */}
//             <ImageBackground
//               source={{
//                 uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuANfEWaAuynHHTnOkrIVRbfMbPEjKCjR-P3ChKhPIkVgryCl4YgqFm9ZnAdsoIqqj3NOTcpkloKvr5HHU8L4p75C4QbnErGMGSFlZeDmCVQROLny1l3ULhR0lwwbWTWs1K1UKVQGa4_EedN5605_PLUbqDLO3G6W6NVLsBULUPXTjsqWNLGglQ5wOBWjKfpcQXp1gRNOvi9gCsZm6nK6hO9Iki7jQ0w143Ax2DpcSkgy8q-FeTHsXIQDdeIlF6WyK6tP9dNnETd6Y8",
//               }}
//               style={[styles.focusCard, { marginLeft: 14 }]}
//               imageStyle={{ borderRadius: 16 }}
//             >
//               <View style={styles.focusOverlay} />

//               <View style={styles.focusBottom}>
//                 <View>
//                   <Text style={[styles.badge, { backgroundColor: "#a855f7" }]}>Work</Text>
//                   <Text style={styles.focusTitle}>Q3 Report</Text>
//                 </View>

//                 <View style={styles.arrowCircle}>
//                   <MaterialIcons name="arrow-forward" size={18} color="white" />
//                 </View>
//               </View>
//             </ImageBackground>

//             {/* Add New */}
//             <TouchableOpacity style={styles.addFocus}>
//               <MaterialIcons name="add" size={22} color="#94a3b8" />
//             </TouchableOpacity>
//           </ScrollView>
//         </View>

//         {/* DAILY AGENDA */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Daily Agenda</Text>

//           {/* Monday Expanded */}
//           <View style={styles.dayCardActive}>
//             <View style={styles.dayHeader}>
//               <View style={{ flexDirection: "row", alignItems: "center" }}>
//                 <View style={styles.dayBoxActive}>
//                   <Text style={styles.daySmall}>MON</Text>
//                   <Text style={styles.dayBig}>23</Text>
//                 </View>

//                 <View style={{ marginLeft: 12 }}>
//                   <Text style={styles.dayTitle}>Today</Text>
//                   <Text style={styles.primaryTextSmall}>3 tasks pending</Text>
//                 </View>
//               </View>

//               <MaterialIcons name="expand-less" size={24} color={PRIMARY} />
//             </View>

//             <View style={{ padding: 10 }}>
//               {/* Task 1 */}
//               <View style={styles.taskRow}>
//                 <View style={styles.checkboxDone}>
//                   <MaterialIcons name="check" size={16} color="white" />
//                 </View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.taskDone}>Practice Chords</Text>
//                   <Text style={styles.taskMeta}>10:00 AM • Hobby</Text>
//                 </View>
//               </View>

//               {/* Task 2 */}
//               <View style={styles.taskRow}>
//                 <View style={styles.checkbox} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.taskText}>Read Music Theory</Text>
//                   <Text style={styles.taskMeta}>2:00 PM • Hobby</Text>
//                 </View>
//               </View>

//               {/* Task 3 */}
//               <View style={styles.taskRow}>
//                 <View style={styles.checkbox} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.taskText}>Send Invoice to Client</Text>
//                   <Text style={styles.taskMeta}>4:30 PM • Work</Text>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* Tuesday Collapsed */}
//           <View style={styles.dayCard}>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <View style={styles.dayBox}>
//                 <Text style={styles.daySmallGray}>TUE</Text>
//                 <Text style={styles.dayBigGray}>24</Text>
//               </View>

//               <View style={{ marginLeft: 12 }}>
//                 <Text style={styles.dayTitle}>Tomorrow</Text>
//                 <Text style={styles.taskMeta}>0/3 Tasks done</Text>
//               </View>
//             </View>

//             <MaterialIcons name="expand-more" size={24} color="#64748b" />
//           </View>

//           {/* Wednesday Empty */}
//           <View style={[styles.dayCard, { opacity: 0.7 }]}>
//             <View style={{ flexDirection: "row", alignItems: "center" }}>
//               <View style={styles.dayBox}>
//                 <Text style={styles.daySmallGray}>WED</Text>
//                 <Text style={styles.dayBigGray}>25</Text>
//               </View>

//               <View style={{ marginLeft: 12 }}>
//                 <Text style={styles.dayTitle}>Wednesday</Text>
//                 <Text style={styles.taskMeta}>No tasks yet</Text>
//               </View>
//             </View>

//             <MaterialIcons name="add-circle" size={24} color="#64748b" />
//           </View>
//         </View>

//         <View style={{ height: 140 }} />
//       </ScrollView>

//       {/* FAB */}
//       <TouchableOpacity style={styles.fab} onPress={() => setSheetVisible(true)}>
//         <MaterialIcons name="add" size={34} color="white" />
//       </TouchableOpacity>

//       {/* Bottom Sheet Modal */}
//       <Modal visible={sheetVisible} transparent animationType="fade">
//         <Pressable style={styles.backdrop} onPress={() => setSheetVisible(false)} />

//         <View style={styles.sheet}>
//           <View style={styles.handle} />
//           <Text style={styles.sheetTitle}>New Weekly Task</Text>

//           <Text style={styles.inputLabel}>GOAL NAME</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g. Learn Guitar"
//             placeholderTextColor="#94a3b8"
//           />

//           <View style={{ flexDirection: "row", gap: 12 }}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.inputLabel}>CATEGORY</Text>
//               <View style={styles.selectFake}>
//                 <Text style={{ color: "white" }}>Personal</Text>
//               </View>
//             </View>

//             <View style={{ flex: 1 }}>
//               <Text style={styles.inputLabel}>TARGET</Text>
//               <View style={styles.selectFake}>
//                 <Text style={{ color: "white" }}>This Week</Text>
//               </View>
//             </View>
//           </View>

//           <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
//             <TouchableOpacity style={styles.cancelBtn} onPress={() => setSheetVisible(false)}>
//               <Text style={{ color: "#94a3b8", fontWeight: "600" }}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.saveBtn}>
//               <Text style={{ color: "white", fontWeight: "800" }}>Save Task</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const PRIMARY = "#135bec";
// const BG = "#101622";
// const SURFACE = "#1c2533";

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: BG,
//   },
//   scrollContent: {
//     paddingBottom: 100,
//   },

//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 28,
//     paddingBottom: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatar: {
//     width: 42,
//     height: 42,
//     borderRadius: 999,
//     borderWidth: 2,
//     borderColor: "rgba(19,91,236,0.25)",
//     marginRight: 12,
//   },
//   smallLabel: {
//     fontSize: 11,
//     letterSpacing: 1,
//     fontWeight: "700",
//     color: "#94a3b8",
//   },
//   weekTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "white",
//   },
//   iconButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 999,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   section: {
//     paddingHorizontal: 20,
//     marginBottom: 26,
//   },
//   bigTitle: {
//     fontSize: 30,
//     fontWeight: "900",
//     color: "white",
//     marginBottom: 14,
//   },
//   card: {
//     backgroundColor: SURFACE,
//     borderRadius: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//   },
//   rowBetween: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//     marginBottom: 10,
//   },
//   muted: {
//     color: "#94a3b8",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   mutedSmall: {
//     color: "#64748b",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   primaryBig: {
//     color: PRIMARY,
//     fontSize: 26,
//     fontWeight: "900",
//     marginTop: 6,
//   },
//   progressTrack: {
//     height: 8,
//     backgroundColor: "#0b1220",
//     borderRadius: 999,
//     overflow: "hidden",
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: PRIMARY,
//     borderRadius: 999,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "white",
//   },
//   primaryText: {
//     color: PRIMARY,
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   primaryTextSmall: {
//     color: PRIMARY,
//     fontSize: 12,
//     fontWeight: "700",
//     marginTop: 2,
//   },

//   focusCard: {
//     width: 250,
//     height: 128,
//     borderRadius: 16,
//     overflow: "hidden",
//   },
//   focusOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.35)",
//   },
//   focusBottom: {
//     position: "absolute",
//     bottom: 12,
//     left: 12,
//     right: 12,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//   },
//   badge: {
//     alignSelf: "flex-start",
//     backgroundColor: PRIMARY,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 6,
//     fontSize: 10,
//     fontWeight: "800",
//     color: "white",
//     marginBottom: 6,
//   },
//   focusTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "white",
//   },
//   arrowCircle: {
//     width: 34,
//     height: 34,
//     borderRadius: 999,
//     backgroundColor: "rgba(255,255,255,0.18)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   addFocus: {
//     width: 64,
//     height: 128,
//     borderRadius: 16,
//     borderWidth: 2,
//     borderStyle: "dashed",
//     borderColor: "rgba(255,255,255,0.15)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 14,
//   },

//   dayCardActive: {
//     backgroundColor: SURFACE,
//     borderRadius: 16,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "rgba(19,91,236,0.35)",
//     marginTop: 12,
//   },
//   dayHeader: {
//     padding: 14,
//     backgroundColor: "rgba(19,91,236,0.12)",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   dayBoxActive: {
//     width: 44,
//     height: 44,
//     borderRadius: 10,
//     backgroundColor: PRIMARY,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   daySmall: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "white",
//   },
//   dayBig: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: "white",
//   },
//   dayCard: {
//     backgroundColor: SURFACE,
//     borderRadius: 16,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 12,
//   },
//   dayBox: {
//     width: 44,
//     height: 44,
//     borderRadius: 10,
//     backgroundColor: "#0b1220",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   daySmallGray: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: "#94a3b8",
//   },
//   dayBigGray: {
//     fontSize: 16,
//     fontWeight: "900",
//     color: "#94a3b8",
//   },
//   dayTitle: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: "white",
//   },

//   taskRow: {
//     flexDirection: "row",
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//     borderRadius: 12,
//   },
//   checkbox: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: "#475569",
//     marginTop: 2,
//     marginRight: 12,
//   },
//   checkboxDone: {
//     width: 20,
//     height: 20,
//     borderRadius: 6,
//     backgroundColor: PRIMARY,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 2,
//     marginRight: 12,
//   },
//   taskText: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#e2e8f0",
//   },
//   taskDone: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#94a3b8",
//     textDecorationLine: "line-through",
//   },
//   taskMeta: {
//     fontSize: 12,
//     color: "#94a3b8",
//     marginTop: 2,
//   },

//   fab: {
//     position: "absolute",
//     bottom: 26,
//     alignSelf: "center",
//     width: 66,
//     height: 66,
//     borderRadius: 999,
//     backgroundColor: PRIMARY,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 8,
//   },

//   backdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.55)",
//   },
//   sheet: {
//     backgroundColor: "#1E1E1E",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 18,
//     paddingBottom: 26,
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     borderTopWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//   },
//   handle: {
//     width: 46,
//     height: 5,
//     borderRadius: 999,
//     backgroundColor: "#334155",
//     alignSelf: "center",
//     marginBottom: 14,
//   },
//   sheetTitle: {
//     fontSize: 18,
//     fontWeight: "900",
//     color: "white",
//     marginBottom: 14,
//   },
//   inputLabel: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#94a3b8",
//     marginBottom: 6,
//     marginTop: 10,
//     letterSpacing: 1,
//   },
//   input: {
//     backgroundColor: "rgba(0,0,0,0.35)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.08)",
//     borderRadius: 12,
//     padding: 12,
//     color: "white",
//   },
//   selectFake: {
//     backgroundColor: "rgba(0,0,0,0.35)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.08)",
//     borderRadius: 12,
//     padding: 12,
//   },
//   cancelBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     alignItems: "center",
//   },
//   saveBtn: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 12,
//     backgroundColor: PRIMARY,
//     alignItems: "center",
//   },
// });
import React, { useState } from 'react';
import FocusAwareStatusBar from './components/FocusAwareStatusBar';
import { View, Text, Button, Alert } from 'react-native';
import { requestLocationPermission } from './utils/requestLocation';
import getCurrentLocation from './services/getCurrentLocation'

export default function LocationScreen() {
  const [location, setLocation] = useState<any>(null);

  const handleGetLocation = async () => {
    const allowed = await requestLocationPermission();

    if (!allowed) {
      Alert.alert('Permission denied', 'Please allow location to continue.');
      return;
    }

    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Location fetch failed');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Use My Location" onPress={handleGetLocation} />

      {location && (
        <Text style={{ marginTop: 20 }}>
          Lat: {location.latitude}
          {'\n'}
          Lng: {location.longitude}
        </Text>
      )}
    </View>
  );
}
