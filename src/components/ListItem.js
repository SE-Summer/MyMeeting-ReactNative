import * as React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import moment from "moment";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {join} from "../service/MeetingService";
import {rgbaColor} from "react-native-reanimated/src/reanimated2/Colors";

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 7.5,
        marginBottom: 7.5,
        elevation: 3,
        flexDirection: 'row'
    },
    contentContainer: {
        flex: 5,
        marginTop: 5,
        marginBottom: 5,
    },
    titleContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indexContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
    },
    indexFont: {
        color: 'white',
        fontSize: 17,
        fontWeight: 'bold'
    },
    topicContainer: {
        alignItems: 'center',
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        paddingTop:2,
        paddingBottom: 2,
    },
    topicStyle: {
        fontSize: 17,
        color: 'black'
    },
    timeContainer: {
        margin: 3,
        borderRadius: 5,
    },
    timeFont: {
        fontSize: 13,
        color: '#888888'
    },
    iconContainer:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
    },
    iconTouch: {
        borderWidth: 2,
        borderRadius: 20,
        padding: 6,
    },
    idContainer: {
        margin: 3,
        flexDirection: 'row'
    },
    idInnerContainer: {
        flex: 1,
    },
    idFont: {
        fontSize: 12,
        color: 'black',
    }
})

export const ListItem = ({date, item, index, pressEvent}) => {
    let icon, iconColor, onPress;
    if (moment(date).isBefore(moment(item.end_time), 'minute') && moment(date).isAfter(moment(item.start_time), 'minute')) {
        icon = 'door-open';
        iconColor = '#06ae7a';
        onPress = async () => {
            const response = await join(item.id, item.password);
            if (response != null && response.status === 200) {
                pressEvent();
            }
        };
    } else {
        icon = 'door-closed';
        iconColor = '#aaaaaa';
        onPress = () => {};
    }

    return (
        <View style={styles.itemContainer}>
            <View style={[styles.indexContainer, {backgroundColor: rgbaColor(4,122, 88)}]}>
                <Text style={styles.indexFont}>{index + 1}</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                    <View style={styles.topicContainer}>
                        <Text style={styles.topicStyle}>{item.topic}</Text>
                    </View>
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeFont}>时间：{moment(item.start_time).format('MM-DD HH:mm')} ~ {moment(item.end_time).format('MM-DD HH:mm')}</Text>
                </View>
                <View style={styles.idContainer}>
                    <Text style={styles.idFont}>会议号：</Text>
                    <View style={styles.idInnerContainer}>
                        <Text style={styles.idFont}>{item.id}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={onPress} style={[styles.iconTouch, {borderColor: iconColor}]}>
                    <FontAwesome5 name={icon} size={20} color={iconColor} />
                </TouchableOpacity>
            </View>
        </View>
    )
}
