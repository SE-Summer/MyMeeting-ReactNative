import * as React from 'react';
import {Component} from "react";
import {FlatList, RefreshControl, Text, View, StyleSheet} from "react-native";
import {meetingHistory, meetingsInf} from "../service/MeetingService";
import {ListItem} from "../components/ListItem";
import {config_key} from "../Constants";
import {MeetingVariable} from "../MeetingVariable";
import PagerView from "react-native-pager-view";
import moment from "moment";
import {clearDupRoom} from "../utils/Utils";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

const Empty = ({text}) => {
    return (
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
            <Text style={{color: '#aaaaaa'}}>-{text}-</Text>
        </View>
    )
}

export default class ReserveInfScreen extends Component {
    constructor() {
        super();
        this.state = {
            reserveData: [],
            historyData: [],
            count: 0,
            refreshing: false,
            refreshing1: false,
        }
    }

    async componentDidMount() {
        const {navigation} = this.props;
        navigation.addListener('focus', async () => {
            await this.fetch();
        })
        await this.fetch();
    }

    fetch = async () => {
        await this.fetchReserve();
        await this.fetchHistory();
    }

    fetchReserve = async () => {
        await this.setState({
            refreshing: true,
        })

        const reserveResponse = await meetingsInf();

        if (reserveResponse == null || reserveResponse.status !== 200) {
            toast.show('获取预约信息失败', {type: 'warning', duration: 1300, placement: 'top'})
            return;
        }

        const reserveData = reserveResponse.data.rooms.filter((room) => moment().isSameOrBefore(room.end_time))

        this.setState({
            reserveData: reserveData,
            refreshing: false,
        })
    }

    fetchHistory = async () => {
        await this.setState({
            refreshing1: true,
        })

        const historyResponse = await meetingHistory();

        if (historyResponse == null || historyResponse.status !== 200) {
            toast.show('获取历史记录失败', {type: 'warning', duration: 1300, placement: 'top'})
            return;
        }

        const historyData = clearDupRoom(historyResponse.data.history);

        this.setState({
            historyData: historyData,
            refreshing1: false,
        })
    }

    goMeeting = (room) => {
        const params = {
            roomInf: room,
            cameraStatus: config_key.camera,
            microphoneStatus: config_key.microphone,
        };
        MeetingVariable.room = room;
        MeetingVariable.myName = config_key.username;
        this.props.navigation.navigate('Meeting', params);
    }

    renderItem = ({item, index}) => {
        return (
            <ListItem date={new Date()} item={item} index={index} pressEvent={this.goMeeting}/>
        )
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <PagerView style={{flex: 1}} initialPage={0} onPageScroll={this.onPageScroll}>
                    <View key='1' style={{flex: 1}}>
                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={['#05783d','#069b49', '#41c266']}
                            style={style.titleContainer}
                        >
                            <View style={{flex: 1}}/>
                            <View style={{flex: 1}}>
                                <Text style={style.title}>预约信息</Text>
                            </View>
                            <View style={{flex: 1, alignItems: 'flex-end'}}>
                                <Ionicons name={'caret-forward'} color={'white'} size={18}/>
                            </View>
                        </LinearGradient>
                        <FlatList
                            style={style.flatlist}
                            data={this.state.reserveData}
                            keyExtractor={(item) => item.id}
                            renderItem={this.renderItem}
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.fetchReserve} colors={[
                                    '#05783d','#069b49', '#06b45f', '#87e0a5', '#9be3b1aa',
                                ]}/>
                            }
                            ListEmptyComponent={<Empty text={'没有预约会议'}/>}
                        />
                    </View>
                    <View key='2'>
                        <LinearGradient
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            colors={['#41c266', '#84e49f', '#b1f3c4']}
                            style={style.titleContainer}>
                            <View style={{flex: 1, alignItems: 'flex-start'}}>
                                <Ionicons name={'caret-back'} color={'white'} size={18}/>
                            </View>
                            <View style={{flex: 1}}>
                                <Text style={style.title}>历史会议</Text>
                            </View>
                            <View style={{flex: 1}}/>
                        </LinearGradient>
                        <FlatList
                            style={style.flatlist}
                            data={this.state.historyData}
                            keyExtractor={(item, index) => index}
                            renderItem={this.renderItem}
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshing} onRefresh={this.fetchHistory} colors={[
                                    '#05783d','#069b49', '#06b45f', '#87e0a5', '#9be3b1aa',
                                ]}/>
                            }
                            ListEmptyComponent={<Empty text={'没有历史记录'}/>}
                        />
                    </View>
                </PagerView>
            </View>
        );
    }
}

const style = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: '#06b45f',
        padding: 10,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    flatlist: {
        marginTop: 5,
    }
})
