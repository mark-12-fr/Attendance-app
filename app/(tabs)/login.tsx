import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen(){

const [teacherId,setTeacherId] = useState("");
const [password,setPassword] = useState("");
const [showPassword,setShowPassword] = useState(false);

useEffect(()=>{

const checkLogin = async ()=>{
const name = await AsyncStorage.getItem("teacher_name");

if(name){
router.replace("/dashboard");
}
};

checkLogin();

},[]);


const handleLogin = async ()=>{

if(!teacherId.trim() || !password.trim()){
Alert.alert("Error","Enter Teacher ID and Password");
return;
}

try{

const res = await axios.post(
"http://192.168.71.118:5000/api/mobile-login",
{
teacher_id: teacherId.trim(),
password: password.trim()
}
);

if(res.data.status === "success"){

/// VERY IMPORTANT — CLEAR OLD SESSION
await AsyncStorage.clear();

/// SAVE NEW USER
await AsyncStorage.setItem("teacher_id", res.data.teacher_id.toString());
await AsyncStorage.setItem("teacher_name", res.data.teacher_name);


console.log("LOGIN USER:", res.data.teacher_name);

router.replace("/dashboard");

}else{
Alert.alert("Login Failed", res.data.message);
}

}catch(error){

Alert.alert("Server Error","Cannot connect to Flask");

}

};

return(

<SafeAreaView style={styles.container}>

<View style={styles.card}>

<Text style={styles.title}>Teacher Login</Text>

<View style={styles.inputContainer}>
<Ionicons name="person-outline" size={20} color="#6B7280"/>
<TextInput
placeholder="Teacher ID"
style={styles.input}
value={teacherId}
onChangeText={setTeacherId}
/>
</View>

<View style={styles.inputContainer}>
<Ionicons name="lock-closed-outline" size={20} color="#6B7280"/>

<TextInput
placeholder="Password"
secureTextEntry={!showPassword}
style={styles.input}
value={password}
onChangeText={setPassword}
/>

<TouchableOpacity onPress={()=>setShowPassword(!showPassword)}>
<Ionicons
name={showPassword ? "eye-off-outline":"eye-outline"}
size={20}
color="#6B7280"
/>
</TouchableOpacity>

</View>

<TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
<Text style={styles.loginText}>Login</Text>
</TouchableOpacity>

</View>

</SafeAreaView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#AEB8D0"
},

card:{
width:"85%",
backgroundColor:"white",
padding:25,
borderRadius:12,
elevation:5
},

title:{
fontSize:24,
fontWeight:"700",
textAlign:"center",
marginBottom:25
},

inputContainer:{
flexDirection:"row",
alignItems:"center",
borderWidth:1,
borderColor:"#E5E7EB",
borderRadius:10,
paddingHorizontal:10,
marginBottom:15
},

input:{
flex:1,
padding:10
},

loginBtn:{
backgroundColor:"#1D4ED8",
padding:14,
borderRadius:10,
alignItems:"center",
marginTop:10
},

loginText:{
color:"white",
fontWeight:"600",
fontSize:16
}

});