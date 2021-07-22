import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import {CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import CreateMeetingScreen from "./pages/CreateMeetingScreen";
import JoinMeetingScreen from "./pages/JoinMeetingScreen";
import {TextButton} from "./components/MyButton";
import ReServeMeetingScreen from "./pages/ReServeMeetingScreen";
import LoginScreen from "./pages/Login";
import SplashScreen from "./pages/SplashScreen";
import RegisterScreen from "./pages/RegisterScreen";
import MeetingPage from "./pages/Meeting";
import MeetingSettingScreen from "./pages/MeetingSetting";
import UserSettingScreen from "./pages/UserSetting";
import TabScreen from "./pages/TabRouter";
import EmailCheck, {ValidatePage} from "./pages/EmailCheck";
import EditProfileScreen from "./pages/EditProfile";
import NormalSettings from "./pages/NormalSettings";

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
                    <Stack.Screen name={"Meeting"} component={MeetingPage} options={{
                        headerShown: false,
                    }}/>
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
                        headerTitleAlign: "center",
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
                        headerBackTitle: 'User',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }}/>
                    <Stack.Screen name={"UserSetting"} component={UserSettingScreen} options={{
                        title: '个人信息',
                        headerTitleAlign: 'center',
                        headerBackTitle: 'User',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }} />
                    <Stack.Screen name={"NormalSetting"} component={NormalSettings} options={{
                        title: '通用',
                        headerTitleAlign: 'center',
                        headerBackTitle: 'User',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
                    }} />
                    <Stack.Screen name={"EditProfile"} component={EditProfileScreen} options={{
                        headerTitleAlign: 'center',
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                    }}/>
                    <Stack.Screen name={"Login"} component={LoginScreen} options={{
                        headerShown: false,
                        cardStyleInterpolator: forFade,
                        gesturesEnabled: false,
                    }}/>
                    <Stack.Screen name={"EmailCheck"} component={EmailCheck} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                        headerTitle: null,
                    })} />
                    <Stack.Screen name={"Validate"} component={ValidatePage} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
                        headerTitle: null,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.pop()}}/>
                            )
                        },
                    })} />
                    <Stack.Screen name={"Register"} component={RegisterScreen} options={({navigation}) => ({
                        cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
                        headerLeft: () => {
                            return (
                                <TextButton text={"取消"} pressEvent={() => {navigation.navigate('EmailCheck')}}/>
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
