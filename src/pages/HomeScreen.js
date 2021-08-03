import * as React from 'react';
import {Text, View, StyleSheet} from 'react-native';
import { Component } from "react";
import {RoundButton} from "../components/MyButton";
import LinearGradient from "react-native-linear-gradient";

export default class HomeScreen extends Component{
    navigateToCreateMeeting = () => {
        this.props.navigation.navigate('CreateMeeting');
    }

    navigateToMeeting = () => {
        this.props.navigation.navigate('JoinMeeting', {'quickJoin': false});
    }

    navigateToReserveMeeting = () => {
        this.props.navigation.navigate('ReServeMeeting');
    }

    render() {
        return (
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    colors={['#bcf9d5', '#047a58']}
                    style={{flex: 1, justifyContent: "flex-end"}}
                >
                    <View style={styles.titleContainer}>
                        <Text
                            style={{
                                fontSize: 72,
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            Start
                        </Text>
                        <Text
                            style={{
                                fontSize: 60,
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        >
                            Meeting
                        </Text>
                    </View>
                    <View style={{height: 100}}/>
                    <View style={styles.buttonContainer}>
                        <RoundButton
                            iconText={"add"}
                            iconSize={76}
                            pressEvent={this.navigateToCreateMeeting}
                            theStyle={{backgroundColor: "#069b49"}}
                            iconStyle={{paddingLeft: 5}}
                            title={"创建"}
                        />
                        <RoundButton
                            iconText={"arrow-forward-outline"}
                            pressEvent={this.navigateToMeeting}
                            theStyle={{backgroundColor: "#06b45f"}}
                            title={"加入"}
                        />
                        <RoundButton
                            iconText={"calendar"}
                            pressEvent={this.navigateToReserveMeeting}
                            theStyle={{backgroundColor: "#85e1ab"}}
                            title={"预约"}
                        />
                    </View>
                </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: "white",
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 50,
        borderRadius: 10,
        padding: 20,
        justifyContent: "space-around"
    },
    titleContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    infText: {
        textAlign: "center",
        fontSize: 17,
    },
});
