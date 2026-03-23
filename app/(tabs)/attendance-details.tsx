import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import io from "socket.io-client";

const socket = io("http://192.168.71.118:5000", {
  transports: ["websocket"],
  reconnection: true,
});

const { width } = Dimensions.get("window");

type Student = {
  id: number;
  full_name: string;
  student_id: string;
  status: string;
  time_in?: string;
};

export default function AttendanceDetails() {
  const { subject } = useLocalSearchParams();
  const subjectName = String(subject || "");

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const name = await AsyncStorage.getItem("teacher_name");
      setTeacherName(name || "Unknown Teacher");
    };
    loadUser();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await axios.get(
        "http://192.168.71.118:5000/api/realtime-attendance",
        { params: { subject: subjectName } }
      );
      setStudents(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load students:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();

    socket.on("attendance_update", () => {
      loadStudents(); 
    });

    socket.on("attendance_not_found", () => {
      Alert.alert("Notice", "Fingerprint not recognized.");
    });

    socket.on("stop_scanning", () => {
      setScanning(false);
    });

    return () => {
      socket.off("attendance_update");
      socket.off("attendance_not_found");
      socket.off("stop_scanning");
    };
  }, [subjectName]);

  const startScan = () => {
    if (scanning) return;
    setScanning(true);
    socket.emit("start_attendance", { subject: subjectName });
  };

  const stopScan = () => {
    socket.emit("stop_attendance");
    setScanning(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const setManualStatus = async (studentId: number, status: string) => {
    try {
      await axios.post("http://192.168.71.118:5000/api/manual-status", {
        student_id: studentId,
        status,
        subject: subjectName,
      });
      loadStudents();
    } catch (error) {
      Alert.alert("Error", "Failed to update status.");
    }
  };

  const renderItem = ({ item, index }: { item: Student; index: number }) => (
    <View style={styles.row}>
      <Text style={styles.no}>{index + 1}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.full_name}</Text>
        <Text style={styles.sid}>ID: {item.student_id}</Text>
        {item.time_in && (
           <Text style={styles.time}>{item.time_in}</Text>
        )}
      </View>
      <View style={styles.statusGroup}>
        <TouchableOpacity 
            style={[styles.statusBtn, item.status === "Present" && styles.present]}
            onPress={() => setManualStatus(item.id, "Present")}>
          <Text style={[styles.statusLabel, item.status === "Present" && {color: "#166534"}]}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.statusBtn, item.status === "Late" && styles.late]}
            onPress={() => setManualStatus(item.id, "Late")}>
          <Text style={[styles.statusLabel, item.status === "Late" && {color: "#92400E"}]}>Late</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.statusBtn, item.status === "Absent" && styles.absent]}
            onPress={() => setManualStatus(item.id, "Absent")}>
          <Text style={[styles.statusLabel, item.status === "Absent" && {color: "#991B1B"}]}>Absent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color="#2563EB" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Sidebar Menu */}
      {menuOpen && (
        <View style={styles.overlay}>
          <View style={styles.drawer}>
            <View style={styles.profile}>
              <Ionicons name="person-circle-outline" size={70} color="white" />
              <Text style={styles.admin}>Teacher Panel</Text>
              <Text style={styles.guest}>{teacherName}</Text>
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuOpen(false); router.push("/dashboard"); }}>
              <Ionicons name="grid-outline" size={20} color="white" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.closeArea} onPress={() => setMenuOpen(false)} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Sheet</Text>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View>
                <Text style={styles.subject}>{subjectName}</Text>
                <Text style={styles.teacherSub}>Instructor: {teacherName}</Text>
            </View>
            {scanning && <ActivityIndicator size="small" color="#10B981" />}
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.scanBtn, scanning && { backgroundColor: "#10B981" }, { flex: 1.5 }]}
              onPress={startScan}
              disabled={scanning}
            >
              <Ionicons name={scanning ? "radio-outline" : "finger-print"} size={18} color="white" style={{marginRight: 8}} />
              <Text style={styles.scanText}>
                {scanning ? "SYSTEM ACTIVE" : "START ATTENDANCE"}
              </Text>
            </TouchableOpacity>

            {scanning && (
              <TouchableOpacity
                style={[styles.scanBtn, { backgroundColor: "#EF4444", flex: 0.6, marginLeft: 10 }]}
                onPress={stopScan}
              >
                <Text style={styles.scanText}>STOP</Text>
              </TouchableOpacity>
            )}
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.thNo}>No.</Text>
          <Text style={styles.thName}>Student Name</Text>
          <Text style={styles.thStatus}>Controls</Text>
        </View>

        <FlatList
          data={students}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* --- PROFESSIONAL BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/dashboard")}>
          <Ionicons name="grid-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
          <Text style={[styles.navLabel, { color: "#2563EB" }]}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/history")}>
          <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>History</Text>
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
  container: { flex: 1, backgroundColor: "#BFC8DD" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    backgroundColor: "#0F1E3A" 
  },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: -40 }, // Adjusted for center feel
  card: { backgroundColor: "white", margin: 15, borderRadius: 15, padding: 15, elevation: 5, flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  subject: { fontSize: 20, fontWeight: "bold", color: "#1F2937" },
  teacherSub: { color: "#6B7280", fontSize: 13, marginTop: 2 },
  actionContainer: { flexDirection: 'row', marginBottom: 20 },
  scanBtn: { backgroundColor: "#2563EB", padding: 14, borderRadius: 10, alignItems: "center", justifyContent: 'center', flexDirection: 'row' },
  scanText: { color: "white", fontWeight: "bold", fontSize: 12 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1.5, borderColor: "#E5E7EB", paddingBottom: 10, marginBottom: 5 },
  thNo: { width: 35, fontWeight: "bold", color: "#4B5563" },
  thName: { flex: 1, fontWeight: "bold", color: "#4B5563" },
  thStatus: { width: 90, fontWeight: "bold", textAlign: "center", color: "#4B5563" },
  row: { flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderColor: "#F3F4F6", alignItems: "center" },
  no: { width: 35, color: "#9CA3AF", fontWeight: '500' },
  name: { fontWeight: "600", fontSize: 14, color: "#111827" },
  sid: { fontSize: 10, color: "#9CA3AF" },
  time: { fontSize: 10, color: "#3B82F6", fontWeight: '600', marginTop: 2 },
  statusGroup: { width: 90 },
  statusBtn: { backgroundColor: "#F9FAFB", paddingVertical: 5, borderRadius: 6, marginVertical: 2, alignItems: "center", borderWidth: 1, borderColor: "#F3F4F6" },
  statusLabel: { fontSize: 9, fontWeight: "bold", color: "#6B7280" },
  present: { backgroundColor: "#DCFCE7", borderColor: "#22C55E" },
  late: { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" },
  absent: { backgroundColor: "#FEE2E2", borderColor: "#EF4444" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { position: "absolute", width: "100%", height: "100%", flexDirection: "row", zIndex: 1000, backgroundColor: "rgba(0,0,0,0.5)" },
  drawer: { width: width * 0.75, backgroundColor: "#0F1E3A", paddingTop: 50, paddingHorizontal: 20 },
  profile: { alignItems: "center", marginBottom: 30 },
  admin: { color: "white", fontSize: 18, fontWeight: "bold" },
  guest: { color: "#9CA3AF", marginTop: 5 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: "#1E293B" },
  menuText: { color: "white", marginLeft: 15, fontSize: 16 },
  closeArea: { flex: 1 },

  // Bottom Nav Styles
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