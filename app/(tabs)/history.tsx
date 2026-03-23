import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function AttendanceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherName, setTeacherName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useState(new Animated.Value(-width))[0];

  const loadData = async () => {
    try {
      const name = await AsyncStorage.getItem("teacher_name");
      setTeacherName(name || "Teacher");

      // I-check gid ang IP address sang imo PC/Server
      const res = await axios.get("http://192.168.71.118:5000/api/attendance-history");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Error loading history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleDrawer = (open: boolean) => {
    setDrawerOpen(open);
    Animated.timing(drawerAnim, {
      toValue: open ? 0 : -width,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Logout", 
        style: "destructive", 
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/login");
        } 
      }
    ]);
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.studentName}>{item.full_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Present' ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Present' ? '#059669' : '#DC2626' }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.subject_name} ({item.section})</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.date} | {item.time}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* SIDEBAR */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={() => toggleDrawer(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={styles.profile}>
          <Ionicons name="person-circle-outline" size={70} color="white" />
          <Text style={styles.admin}>Teacher Panel</Text>
          <Text style={styles.guest}>{teacherName}</Text>
        </View>

        <TouchableOpacity style={styles.menuItem} onPress={() => { toggleDrawer(false); router.push("/dashboard"); }}>
          <Ionicons name="grid-outline" size={20} color="white" />
          <Text style={styles.menuText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => toggleDrawer(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.headerTitle}>Attendance History</Text>
          <Text style={styles.subTitle}>View all records</Text>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.mainContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#0F1E3A" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderHistoryItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No history records yet.</Text>
            }
          />
        )}
      </View>

      {/* --- UPDATED BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/dashboard")}>
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/attendance")}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="time" size={24} color="#2563EB" />
          <Text style={[styles.navLabel, { color: "#2563EB" }]}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={[styles.navLabel, { color: "#EF4444" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#AEB8D0" },
  header: { backgroundColor: "#0F1E3A", paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "white", fontSize: 19, fontWeight: "bold" },
  subTitle: { color: "#B0B8C9", fontSize: 11 },
  mainContent: { flex: 1, padding: 15 },
  historyCard: { backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  studentName: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "bold" },
  cardDetails: { borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 8 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  detailText: { fontSize: 13, color: "#64748B", marginLeft: 6 },
  emptyText: { textAlign: "center", marginTop: 50, color: "#475569", fontSize: 15 },
  drawer: { position: "absolute", width: width * 0.75, height: "100%", backgroundColor: "#0F1E3A", zIndex: 2000, paddingTop: 60, paddingHorizontal: 20 },
  overlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1500 },
  profile: { alignItems: "center", marginBottom: 35 },
  admin: { color: "white", fontSize: 18, fontWeight: 'bold' },
  guest: { color: "#9CA3AF", marginTop: 5 },
  menuItem: { flexDirection: "row", paddingVertical: 16, alignItems: 'center' },
  menuText: { color: "white", marginLeft: 15, fontSize: 16 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', height: 75, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingBottom: 10, elevation: 25 },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 60 },
  activeIndicator: { position: 'absolute', top: -12, width: 25, height: 4, backgroundColor: '#2563EB', borderRadius: 2 },
  navLabel: { fontSize: 11, marginTop: 4, color: '#9CA3AF', fontWeight: '600' }
});