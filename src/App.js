import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import {createStackNavigator} from "@react-navigation/stack";
import Meeting from "./pages/Meeting";
import MeetingScreen from "./pages/MeetingScreen";
import HomeScreen from "./pages/HomeScreen";
import UserScreen from "./pages/UserScreen";
import HistoryScreen from "./pages/HistoryScreen";

const Stack  = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home" headerMode="none">
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="CreateMeeting" component={Meeting} />
                    <Stack.Screen name="User" component={UserScreen} />
                    <Stack.Screen name="History" component={HistoryScreen} />
                    <Stack.Screen name="Meeting" component={MeetingScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
