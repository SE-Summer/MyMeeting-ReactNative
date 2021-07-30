import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import { SafeAreaView } from 'react-native-safe-area-context';
import {Component} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config} from "../Constants";
import HomeScreen from "./HomeScreen";
import UserScreen from "./UserScreen";
import * as React from "react";
import ReserveInfScreen from "./ReserveInfScreen";
import RNExitApp from 'react-native-exit-app';

const Tab = createBottomTabNavigator();

export default class TabScreen extends Component{
    constructor() {
        super();
        this.state = {
            backTimes: 0,
        }
    }

    backAction = () => {
        if (this.state.backTimes === 1) {
            RNExitApp.exitApp();
        } else {
            toast.show('再按一次退出MyMeeting', {type: 'normal', duration: 1300, placement: 'top'});
            this.setState({
                backTimes: 1,
            })
        }
        return true;
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.addListener('beforeRemove', e => {
            if (e.data.action.type === 'GO_BACK') {
                e.preventDefault();
                this.backAction();
            }
        })
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <Tab.Navigator
                    screenOptions={({route}) => ({
                        tabBarIcon: ({focused}) => {
                            if (route.name === '会议') {
                                return focused ? <Ionicons name="time" color={config.qGreen} size={30}/> :
                                    <Ionicons name={"time-outline"} size={25}/>;
                            } else if (route.name === '用户') {
                                return focused ? <Ionicons name="person" color={config.qGreen} size={30}/> :
                                    <Ionicons name={"person-outline"} size={25}/>;
                            } else if (route.name === '主页') {
                                return focused ? <Ionicons name="home" color={config.qGreen} size={30}/> :
                                    <Ionicons name={"home-outline"} size={25}/>;
                            }
                        },
                    })}
                    tabBarOptions={{
                        activeTintColor: config.qGreen,
                        inactiveTintColor: 'gray',
                    }}
                >
                    <Tab.Screen name={"主页"} component={HomeScreen}/>
                    <Tab.Screen name={"会议"} component={ReserveInfScreen}/>
                    <Tab.Screen name={"用户"} component={UserScreen}/>
                </Tab.Navigator>
            </SafeAreaView>

        )
    }
}
