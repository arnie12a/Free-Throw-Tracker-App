import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './app/screens/Login';
import Signup from './app/screens/Signup';
import Home from './app/screens/Home';
import FTSummary from './app/screens/FTSummary';
import AddData from './app/screens/AddData';
import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './FirebaseConfig';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

function InsideLayout() {
  return (
    <Tab.Navigator>
      <Tab.Screen name='Add FT Data' component={AddData}/>
      <Tab.Screen name='See FT Statistics' component={FTSummary}/>
    </Tab.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log(user);
      setUser(user);
    })
  }, [])
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        {user ? (
          <>
            <Stack.Screen name='Inside' component={InsideLayout} options={{headerShown: false}}/>
            
          </>
          
        ) : (
          <>
            <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
            <Stack.Screen name='Signup' component={Signup} options={{headerShown: false}}/>
          </>
        )}
        

      </Stack.Navigator>
    </NavigationContainer>
  );
}

