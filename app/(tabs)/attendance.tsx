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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

const { width } = Dimensions.get("window");

type Subject = {
  subject_name: string;
  section: string;
};

export default function Attendance() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const id = await AsyncStorage.getItem("teacher_id");
    const name = await AsyncStorage.getItem("teacher_name");

    setTeacherName(name || "Instructor");

    if (id) loadSubjects(id);
    else setLoading(false);
  };

  const loadSubjects = async (teacher_id: string) => {
    try {
      const res = await axios.get(
        `http://192.168.71.118:5000/api/teacher-subject/${teacher_id}`
      );
      const data = res.data;
      if (Array.isArray(data)) {
        setSubjects(data);
      } else if (data) {
        setSubjects([data]);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.log("LOAD SUBJECT ERROR", err);
      setSubjects([]);
    }
    setLoading(false);
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

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0F1E3A" />
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* DRAWER / SIDEBAR */}
      {drawerOpen && (
        <>
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: drawerAnim }] }
            ]}
          >
            <View style={styles.profile}>
              <Ionicons name="person-circle-outline" size={70} color="white" />
              <Text style={styles.admin}>Teacher Panel</Text>
              <Text style={styles.guest}>{teacherName}</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeDrawer();
                router.push("/dashboard");
              }}
            >
              <Ionicons name="grid-outline" size={20} color="white" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await AsyncStorage.clear();
                router.replace("/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        </>
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer}>
          <Ionicons name="menu" size={28} color="white" />
        </TouchableOpacity>

        <View style={{ marginLeft: 15 }}>
          <Text style={styles.title}>Subjects</Text>
          <Text style={styles.sub}>Select a class to start</Text>
        </View>
      </View>

      {/* SUBJECT LIST */}
      <ScrollView contentContainerStyle={styles.content}>
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/attendance-details",
                  params: {
                    subject: subject.subject_name,
                    section: subject.section
                  }
                })
              }
            >
              <View style={styles.cardIcon}>
                 <Ionicons name="book" size={24} color="#1D4ED8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subjectName}>{subject.subject_name}</Text>
                <Text style={styles.sectionInfo}>Section: {subject.section}</Text>
                <Text style={styles.instructorInfo}>Instructor: {teacherName}</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={28} color="#2563EB" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={50} color="#9CA3AF" />
            <Text style={styles.emptyText}>No subjects assigned yet.</Text>
          </View>
        )}
      </ScrollView>

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

        <TouchableOpacity style={styles.navItem} onPress={async () => { await AsyncStorage.clear(); router.replace("/login"); }}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={[styles.navLabel, { color: "#EF4444" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#AEB8D0" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: "#0F1E3A",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4
  },

  title: { color: "white", fontSize: 20, fontWeight: "bold" },
  sub: { color: "#94A3B8", fontSize: 12 },

  content: { padding: 20, paddingBottom: 100 },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardIcon: {
    width: 50,
    height: 50,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },

  subjectName: { fontSize: 18, fontWeight: "bold", color: "#1F2937" },
  sectionInfo: { fontSize: 14, color: "#4B5563", marginTop: 2 },
  instructorInfo: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#6B7280', marginTop: 10 },

  // Drawer
  drawer: {
    position: "absolute",
    width: width * 0.75,
    height: "100%",
    backgroundColor: "#0F1E3A",
    zIndex: 999,
    paddingTop: 60,
    paddingHorizontal: 20
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 998
  },
  profile: { alignItems: "center", marginBottom: 35 },
  admin: { color: "white", fontSize: 18, fontWeight: "bold" },
  guest: { color: "#94A3B8", marginTop: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  menuText: { color: "white", marginLeft: 15, fontSize: 16 },

  // Bottom Nav
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