import * as React from 'react';
import {Component} from "react";
import {Button, FlatList, Text, ToastAndroid, View} from "react-native";
import {join, meetingsInf} from "../service/MeetingService";
import {ListItem} from "../components/ListItem";

export default class ReserveInfScreen extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
            count: 0,
        }
    }

    async componentDidMount() {
        await this.fetch();
    }

    fetch = async () => {
        const response = await meetingsInf();

        if (response == null || response.status !== 200) {
            ToastAndroid.show('获取信息失败', 1000);
            return;
        }

        this.setState({
            data: response.data.rooms,
        })
    }

    goMeeting = () => {
       this.props.navigation.navigate('Meeting');
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
                />
            </View>
        );
    }
}
