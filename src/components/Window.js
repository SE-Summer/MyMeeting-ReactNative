import * as React from 'react';
import {Component} from "react";
import {View} from "react-native";

export default class Window extends Component {
    render() {
        const {style} = this.props;
        return (
            <View style={[style,{borderColor:'#aaaaaa', borderWidth: 1}]} >
                {this.props.children}
            </View>
        );
    }
}
