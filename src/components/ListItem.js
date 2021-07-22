import * as React from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from "react-native";
import moment from "moment";

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 5,
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        elevation: 3,
    },
    topicStyle: {
        fontSize: 16,
        color: 'white'
    },
    topicContainer: {
        backgroundColor: '#05ae8b90',
        alignItems: 'center',
        borderRadius: 20,
        padding: 2,
    },
    startTimeContainer: {

    },
    endTimeContainer: {

    }
})

export const ListItem = ({item, pressEvent}) => {
    return (
        <TouchableOpacity style={styles.itemContainer}>
            <View>
                <View style={styles.topicContainer}>
                    <Text style={styles.topicStyle}>{item.topic}</Text>
                </View>
                <View>
                    <Text>开始：{moment(item.start_time).format('YY-MM-DD HH:mm')}</Text>
                </View>
                <View>
                    <Text>结束：{moment(item.end_time).format('YY-MM-DD HH:mm')}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
