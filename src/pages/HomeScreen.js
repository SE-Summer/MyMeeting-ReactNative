import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import {Avatar, Card} from "react-native-elements";
import { config } from "../utils/Constants";

export default function HomeScreen({ navigation }) {
    console.log(navigation)
    return (
        <View>
            <View
                style={styles.rowContainer}
            >
                <Avatar
                    rounded
                    size={70}
                    source={{
                        uri: config.unKnownUri
                    }}
                    onPress={() => {
                        navigation.navigate('Meeting');
                    }}
                />
                <Text style={styles.text}>用户名</Text>
            </View>
            <View style={styles.cardContainer}>
                <Card containerStyle={styles.card}>
                    <Text>创建会议</Text>
                </Card>
                <Card containerStyle={styles.card}>
                    <Text>加入会议</Text>
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rowContainer: {
        margin: 15,
        flexDirection: "row"
    },
    cardContainer: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    text: {
        marginLeft: 15,
        textAlignVertical: "center"
    },
    card: {
        alignItems: "center",
    }
});
