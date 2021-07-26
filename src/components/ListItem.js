import * as React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import moment from "moment";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {join} from "../service/MeetingService";

const colors = [
    '#05783d','#069b49', '#06b45f', '#87e0a5', '#9be3b1aa',
]

const calColorIndex = index => {
    const turn = Math.floor(index / 4);
    if (turn % 2 === 0) {
        return index % 4;
    } else {
        return 4 - index % 4;
    }
}

export const ListItem = ({date, item, index, pressEvent}) => {
    const theColor = colors[calColorIndex(index)];
    let icon, iconColor, onPress, shareColor;
    if (moment(date).isBefore(item.end_time, 'minute') && moment(date).isAfter(item.start_time, 'minute')) {
        icon = 'door-open';
        iconColor = theColor;
        onPress = async () => {
            const response = await join(item.id, item.password);
            if (response != null && response.status === 200) {
                pressEvent(response.data.room);
            }
        };
    } else {
        icon = 'door-closed';
        iconColor = '#aaaaaaaa';
        onPress = () => {};
    }

    if (moment(date).isBefore(item.end_time, 'minute')) {
        shareColor = theColor;
    } else {
        shareColor = '#aaaaaaaa';
    }

    return (
        <View style={styles.itemContainer}>
            <View style={[styles.indexContainer, {backgroundColor: theColor}]}>
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
                <TouchableOpacity onPress={onPress}>
                    <FontAwesome5 name={icon} size={20} color={iconColor} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <FontAwesome5 name={'share-alt'} size={20} color={shareColor} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

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
        justifyContent: 'space-around',
        margin: 5,
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
