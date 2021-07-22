import * as React from 'react';
import {Component} from "react";
import {ToastAndroid, View} from "react-native";
import {meetingsInf} from "../service/MeetingService";

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

        console.log(response.data);
        this.setState({
            data: response.data,
        })
    }

    render() {
        return (
            <View>

            </View>
        );
    }
}
