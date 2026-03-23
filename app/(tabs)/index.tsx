import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const name = await AsyncStorage.getItem("teacher_name");
      if (name) {
        router.replace("/dashboard");
      }
    };
    checkLogin();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Sidebar/Drawer */}
      {menuOpen && (
        <View style={styles.overlay}>
          <View style={styles.drawer}>
            <View style={styles.profile}>
              <Ionicons name="person-circle-outline" size={70} color="white" />
              <Text style={styles.admin}>Admin Panel</Text>
              <Text style={styles.guest}>Guest Mode</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => setMenuOpen(false)}>
              <Ionicons name="grid-outline" size={20} color="white" />
              <Text style={styles.menuText}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/login")}
            >
              <Ionicons name="log-in-outline" size={20} color="white" />
              <Text style={styles.menuText}>Login</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeArea}
            onPress={() => setMenuOpen(false)}
          />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance System</Text>
        </View>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Welcome, Guest!</Text>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/login")}>
          <View style={styles.cardIconBox}>
             <Ionicons name="calendar" size={24} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Attendance</Text>
            <Text style={styles.cardSubtitle}>Record student attendance</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/login")}>
          <View style={styles.cardIconBox}>
             <Ionicons name="people" size={24} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Students List</Text>
            <Text style={styles.cardSubtitle}>View all students</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push("/login")}>
          <View style={styles.cardIconBox}>
             <Ionicons name="time" size={24} color="#1D4ED8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Attendance History</Text>
            <Text style={styles.cardSubtitle}>View attendance records</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      {/* --- PROFESSIONAL BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeIndicator} />
          <Ionicons name="grid" size={24} color="#2563EB" />
          <Text style={[styles.navLabel, { color: "#2563EB" }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/login")}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/login")}>
          <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/login")}>
          <Ionicons name="log-in-outline" size={24} color="#10B981" />
          <Text style={[styles.navLabel, { color: "#10B981" }]}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#AEB8D0" },
  
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    backgroundColor: "#0F1E3A",
    elevation: 4
  },

  headerLeft: { flexDirection: "row", alignItems: "center" },

  headerTitle: { 
    color: "white", 
    fontSize: 19, 
    fontWeight: "bold", 
    marginLeft: 15 
  },

  content: { padding: 20, paddingBottom: 100 },

  welcome: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 25,
    color: "#0F1E3A"
  },

  card: { 
    backgroundColor: "white", 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 15, 
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center'
  },

  cardIconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#EFF6FF",
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },

  cardTitle: { fontSize: 17, fontWeight: "600", color: "#1F2937" },
  cardSubtitle: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  overlay: { 
    position: "absolute", 
    width: "100%", 
    height: "100%", 
    flexDirection: "row", 
    zIndex: 1000, 
    backgroundColor: "rgba(0,0,0,0.4)" 
  },

  drawer: { 
    width: width * 0.75, 
    backgroundColor: "#0F1E3A", 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    height: "100%" 
  },

  profile: { alignItems: "center", marginBottom: 35 },
  admin: { color: "white", fontSize: 18, fontWeight: "bold" },
  guest: { color: "#94A3B8", marginTop: 4 },

  menuItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)"
  },

  menuText: { color: "white", fontSize: 16, marginLeft: 15, fontWeight: "500" },
  closeArea: { flex: 1 },

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