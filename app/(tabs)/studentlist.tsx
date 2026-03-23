import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function StudentList() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    fetchStudents();
    loadUser();
  }, []);

  const loadUser = async () => {
    const name = await AsyncStorage.getItem("teacher_name");
    setTeacherName(name || "");
  };

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -width,
      duration: 250,
      useNativeDriver: true
    }).start(() => setDrawerOpen(false));
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://192.168.71.118:5000/api/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    } catch {
      setStudents([]);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const filtered = students.filter(s =>
    s.student_id.toString().includes(search) || 
    s.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#AEB8D0' }}>
        <ActivityIndicator size="large" color="#0F1E3A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* DRAWER / SIDEBAR */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}>
        <View style={styles.profile}>
          <Ionicons name="person-circle-outline" size={70} color="white" />
          <Text style={styles.admin}>Teacher Panel</Text>
          <Text style={styles.guest}>{teacherName}</Text>
        </View>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => { closeDrawer(); router.push("/dashboard"); }}
        >
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
        <TouchableOpacity style={styles.hamburgerBtn} onPress={openDrawer}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Student List</Text>
          <Text style={styles.subTitle}>Dashboard / Student List</Text>
        </View>
      </View>

      {/* MAIN CONTENT CARD */}
      <View style={styles.card}>
        <TextInput
          placeholder="Search Student Name or ID..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#7F8C8D"
        />

        <View style={styles.tableHeader}>
          <Text style={styles.th1}>#</Text>
          <Text style={styles.th2}>Student Info</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {filtered.length > 0 ? (
            filtered.map((s, i) => (
              <View key={s.id || i} style={styles.row}>
                <Text style={styles.number}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.full_name}</Text>
                  <Text style={styles.small}>Student ID: {s.student_id}</Text>
                  <Text style={styles.small}>
                    {s.course} | {s.year_level} | {s.section}
                  </Text>
                  <Text style={[styles.status, { color: s.status === 'Active' ? '#27AE60' : '#E67E22' }]}>
                    Status: {s.status}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#7F8C8D' }}>No students found.</Text>
          )}
        </ScrollView>
      </View>

      {/* --- PROFESSIONAL BOTTOM NAVIGATION --- */}
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
          <Ionicons name="people" size={24} color="#2563EB" />
          <Text style={[styles.navLabel, { color: "#2563EB" }]}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#AEB8D0" },

  header: {
    backgroundColor: "#0F1E3A",
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5
  },

  hamburgerBtn: { marginRight: 15 },
  headerTitle: { color: "white", fontSize: 19, fontWeight: "bold" },
  subTitle: { color: "#B0B8C9", fontSize: 11 },

  card: {
    backgroundColor: "white",
    margin: 15,
    borderRadius: 15,
    padding: 15,
    flex: 1,
    marginBottom: 90, // Space para sa bottom nav
    elevation: 3
  },

  search: {
    backgroundColor: "#F1F4F9",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#D1D9E6"
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#16223B",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5
  },

  th1: { width: 40, color: "white", fontWeight: "bold", textAlign: 'center' },
  th2: { flex: 1, color: "white", fontWeight: "bold", marginLeft: 10 },

  row: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EDF2F7"
  },

  number: { width: 40, fontWeight: "bold", fontSize: 14, color: "#4A5568", textAlign: 'center' },
  name: { fontWeight: "bold", fontSize: 15, color: "#2D3748" },
  small: { fontSize: 12, color: "#718096", marginTop: 2 },
  status: { fontSize: 12, fontWeight: "bold", marginTop: 4 },

  drawer: {
    position: "absolute",
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#0F1E3A",
    zIndex: 2000,
    paddingTop: 60,
    paddingHorizontal: 20
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1500
  },

  profile: { alignItems: "center", marginBottom: 35 },
  admin: { color: "white", fontSize: 18, fontWeight: 'bold' },
  guest: { color: "#9CA3AF", marginTop: 5 },

  menuItem: { flexDirection: "row", paddingVertical: 16, alignItems: 'center' },
  menuText: { color: "white", marginLeft: 15, fontSize: 16 },

  // --- BOTTOM NAV STYLES ---
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 75,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 10,
    elevation: 25
  },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 60 },
  activeIndicator: { 
    position: 'absolute', 
    top: -12, 
    width: 25, 
    height: 4, 
    backgroundColor: '#2563EB', 
    borderRadius: 2 
  },
  navLabel: { fontSize: 11, marginTop: 4, color: '#9CA3AF', fontWeight: '600' }
});