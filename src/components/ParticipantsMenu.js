import * as React from 'react';
import {FlatList, Text, View, StyleSheet} from "react-native";
import {MeetingVariable} from "../MeetingVariable";
import {Avatar} from "react-native-elements";
import {config_key} from "../Constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const styles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row', flex: 1
    },
    icon: {
        marginLeft: 5,
    }
})

export const ParticipantsMenu = ({myCamStat, myMicStat}) => {
    const renderItem = ({item}) => {
        const peerInfo = item.getPeerInfo();
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <Avatar
                    rounded
                    size={50}
                    source={{
                        uri: peerInfo.avatar
                    }}
                />
                <Text style={{marginLeft: 30, marginRight: 10}}>{peerInfo.displayName}</Text>
                {
                    MeetingVariable.hostId === peerInfo.id &&
                    <FontAwesome5 name={'crown'} color={'gold'}/>
                }
                <View style={styles.iconContainer}>
                    <Ionicons name={'mic'} size={20} style={styles.icon} color={item.hasAudio() ? '#9be3b1' : '#aaaaaa'}/>
                    <Ionicons name={'videocam'} size={20}  style={styles.icon} color={item.hasVideo() ? '#9be3b1' : '#aaaaaa'}/>
                </View>
            </View>
        )
    }

    const Empty = () => {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text>-没有其他参会人员-</Text>
            </View>
        )
    }

    return (
        <View style={{flex: 2, backgroundColor: '#f1f3f5'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <Avatar
                    rounded
                    size={50}
                    source={{
                        uri: config_key.avatarUri
                    }}
                />
                <Text style={{marginLeft: 30, marginRight: 10}}>{MeetingVariable.myName}</Text>
                {
                    MeetingVariable.hostId === config_key.token &&
                    <FontAwesome5 name={'crown'} color={'gold'}/>
                }
                <View style={styles.iconContainer}>
                    <Ionicons name={'mic'} size={20} style={styles.icon} color={myMicStat ? '#9be3b1' : '#aaaaaa'}/>
                    <Ionicons name={'videocam'} size={20}  style={styles.icon} color={myCamStat ? '#9be3b1' : '#aaaaaa'}/>
                </View>
            </View>
            <View style={{alignItems: 'center', }}>
                <Text>参会人数：{MeetingVariable.mediaService.getPeerDetails().length + 1}</Text>
            </View>
            <FlatList
                data={MeetingVariable.mediaService.getPeerDetails()}
                renderItem={renderItem}
                ListEmptyComponent={<Empty/>}
                keyExtractor={(item, index) => {return index;}}
            />
        </View>
    )
}
