import * as React from 'react';
import {Component} from "react";
import {Button, FlatList, Text, ToastAndroid, View} from "react-native";
import {meetingsInf} from "../service/MeetingService";
import {ListItem} from "../components/ListItem";

export default class ReserveInfScreen extends Component {
    constructor() {
        super();
        this.state = {
            data: [],
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

    renderItem = ({item}) => {
        return (
            <ListItem item={item} pressEvent={() => {}}/>
        )
    }

    render() {
        return (
            <View style={{flex: 1,}}>
                <FlatList
                    data={this.state.data}
                    keyExtractor={(item) => item.id}
                    renderItem={this.renderItem}

                />
            </View>
        );
    }
}
