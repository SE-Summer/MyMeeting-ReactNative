import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import {CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CreateMeetingScreen from "./pages/CreateMeetingScreen";
import JoinMeetingScreen from "./pages/JoinMeetingScreen";
import HomeScreen from "./pages/HomeScreen";
import UserScreen from "./pages/UserScreen";
import HistoryScreen from "./pages/HistoryScreen";
import Ionicons from 'react-native-vector-icons/Ionicons';
import {config} from "./utils/Constants";
import {TextButton} from "./components/MyButton";
import ReServeMeetingScreen from "./pages/ReServeMeetingScreen";
import LoginScreen from "./pages/Login";
import SplashScreen from "./pages/SplashScreen";
import RegisterScreen from "./pages/RegisterScreen";
import MeetingPage from "./pages/Meeting";
import MeetingSettingScreen from "./pages/MeetingSetting";
import UserSettingScreen from "./pages/UserSetting";

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

const forFade = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

const Stack = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={'Splash'}>
                    <Stack.Screen name={"Tab"} component={TabScreen} options={{
                        headerShown: false,
                    }}/>
                    <Stack.Screen name={"History"} component={HistoryScreen} options={{
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    }}/>
                    <Stack.Screen name={"Meeting"} component={MeetingPage} />
                    <Stack.Screen name={"CreateMeeting"} component={CreateMeetingScreen} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                        headerTitleAlign: "center",
                        title: "创建",
                    })}
                    />
                    <Stack.Screen name={"JoinMeeting"} component={JoinMeetingScreen} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
                        title: null,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                    })}/>
                    <Stack.Screen name={"ReServeMeeting"} component={ReServeMeetingScreen} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                        headerTitleAlign: "center",
                        title: "预约",
                    })}/>
                    <Stack.Screen name={"MeetingSetting"} component={MeetingSettingScreen} options={{
                        title: '会议设置',
                        headerTitleAlign: 'center',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}/>
                    <Stack.Screen name={"UserSetting"} component={UserSettingScreen} options={{
                        title: '个人信息',
                        headerTitleAlign: 'center',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }} />
                    <Stack.Screen name={"Login"} component={LoginScreen} options={{
                        headerShown: false,
                        cardStyleInterpolator: forFade,
                        gesturesEnabled: false,
                    }}/>
                    <Stack.Screen name={"Register"} component={RegisterScreen} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                        headerRight: () => {
                            return (
                                <TextButton text={"完成"} pressEvent={() => {}} />
                            )
                        },
                        title: "注册",
                        headerTitleAlign: 'center',
                        headerTintColor: 'green',
                    })}/>
                    <Stack.Screen name={"Splash"} component={SplashScreen} options={{
                        headerShown: false,
                        cardStyleInterpolator: forFade,
                    }}/>
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
