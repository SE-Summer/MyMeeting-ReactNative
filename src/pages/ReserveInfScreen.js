import * as React from 'react';
import {Component} from "react";
import {FlatList, RefreshControl, Text, ToastAndroid, View} from "react-native";
import {meetingsInf} from "../service/MeetingService";
import {ListItem} from "../components/ListItem";

const Empty = ({}) => {
    return (
        <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
            <Text style={{color: '#aaaaaa'}}>-没有预约会议-</Text>
        </View>
    )
}

export default class ReserveInfScreen extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            count: 0,
            refreshing: false,
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
        await this.setState({
            refreshing: true,
        })
        const response = await meetingsInf();

        if (response == null || response.status !== 200) {
            ToastAndroid.show('获取信息失败', 1000);
            return;
        }

        this.setState({
            data: response.data.rooms,
            refreshing: false,
        })
    }

    goMeeting = (room) => {
        const params = {
            token: room.token,
            topic: room.topic
        };
        this.props.navigation.navigate('Meeting', params);
    }

    renderItem = ({item, index}) => {
        return (
            <ListItem date={new Date()} item={item} index={index} pressEvent={this.goMeeting}/>
        )
    }

    render() {
        return (
            <View style={{flex: 1, paddingTop: 10}}>
                <FlatList
                    data={this.state.data}
                    keyExtractor={(item) => item.id}
                    renderItem={this.renderItem}
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.fetch} colors={[
                            '#05783d','#069b49', '#06b45f', '#87e0a5', '#9be3b1aa',
                        ]}/>
                    }
                    ListEmptyComponent={<Empty />}
                />
            </View>
        );
    }
}
