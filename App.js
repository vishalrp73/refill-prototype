import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';

import Login from './pages/login';
import Dashboard from './pages/dashboard';
import Refill from './pages/refill';

import { LogBox } from 'react-native';
import { AppProvider } from './store/context';

const Stack = createStackNavigator();

const App = () => {

  LogBox.ignoreLogs(['Warning: ...']);
  LogBox.ignoreAllLogs();

  return (
    <AppProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
            <Stack.Screen name = 'Login' component = { Login }
              options = {{headerShown: false}} />
            <Stack.Screen name = 'Dashboard' component = { Dashboard }
              options = {{headerShown: false}}  />
            <Stack.Screen name = 'Refill' component = { Refill }
              options = {{headerShown: false}}  />
        </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </AppProvider>
    
  )
}

export default App;