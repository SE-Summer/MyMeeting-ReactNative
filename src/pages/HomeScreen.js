import * as React from 'react';
import {Text, View, StyleSheet, Image} from 'react-native';
import { Component } from "react";
import {RoundButton} from "../components/MyButton";
import LinearGradient from "react-native-linear-gradient";
import MaskedView from '@react-native-community/masked-view';

const Title = () => {
    return (
        <MaskedView
            style={{ width: 300, height: 300}}
            maskElement={
                <View
                    style={{
                        backgroundColor: 'transparent',
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Text
                        style={{
                            fontSize: 80,
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        Start
                    </Text>
                    <Text
                        style={{
                            fontSize: 60,
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        Meeting
                    </Text>
                </View>
            }
        >
            <Image source={require('../assets/earth.png')} style={{width: 300, height: 300}}/>
        </MaskedView>
    )
}

export default class HomeScreen extends Component{
    navigateToCreateMeeting = () => {
        this.props.navigation.navigate('CreateMeeting');
    }

    navigateToMeeting = () => {
        this.props.navigation.navigate('Meeting');
    }

    render() {
        return (
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 1}}
                    colors={['#bce9d5', '#047957']}
                    style={{flex: 1, justifyContent: "flex-end"}}
                >
                    <View style={styles.titleContainer}>
                        <Title />
                    </View>
                    <View style={styles.buttonContainer}>
                        <RoundButton
                            iconText={"add-outline"}
                            iconSize={35}
                            pressEvent={this.navigateToCreateMeeting}
                            theStyle={{backgroundColor: "#069b49"}}
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
                            pressEvent={this.navigateToCreateMeeting}
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
