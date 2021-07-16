import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import {CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreateMeetingScreen from "./pages/CreateMeetingScreen";
import MeetingScreen from "./pages/MeetingScreen";
import HomeScreen from "./pages/HomeScreen";
import UserScreen from "./pages/UserScreen";
import HistoryScreen from "./pages/HistoryScreen";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {config} from "./utils/Constants";

const Tab = createBottomTabNavigator();

function TabScreen() {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused}) => {
                    if (route.name === 'Home') {
                        return focused ? <Ionicons name="time" color={config.qGreen} size={30}/> :
                            <Ionicons name={"time-outline"} size={25}/>;
                    } else if (route.name === 'User') {
                        return focused ? <Ionicons name="person" color={config.qGreen} size={30}/> :
                            <Ionicons name={"person-outline"} size={25}/>;
                    }
                },
            })}
            tabBarOptions={{
                activeTintColor: config.qGreen,
                inactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen name={"Home"} component={HomeScreen}/>
            <Tab.Screen name={"User"} component={UserScreen}/>
        </Tab.Navigator>
    )
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={"Tab"}>
                    <Stack.Screen name={"Tab"} component={TabScreen} options={{title: "Meeting", headerTitleAlign: "center"}}/>
                    <Stack.Screen name={"History"} component={HistoryScreen} options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}/>
                    <Stack.Screen name={"CreateMeeting"} component={CreateMeetingScreen} options={{
                        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
                    }}/>
                    <Stack.Screen name={"Meeting"} component={MeetingScreen} options={{
                        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                        title: "JoinMeeting"
                    }}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
