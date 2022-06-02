import * as React from 'react';
import {FlatList, Text, View, StyleSheet, Alert, TouchableOpacity} from "react-native";
import {MeetingVariable} from "../MeetingVariable";
import {Avatar} from "react-native-elements";
import {config_key} from "../Constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const participantsMenuStyles = StyleSheet.create({
    iconContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        flex: 2,
    },
    icon: {
        marginLeft: 5,
    },
    avatarContainer: {
        flex: 2,
    },
    nameContainer: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    hostIcon: {
        marginLeft: 8,
    }
})

export const ParticipantsMenu = ({myCamStat, myMicStat}) => {
    const renderItem = ({item}) => {
        const peerInfo = item.getPeerInfo();
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <View style={participantsMenuStyles.avatarContainer}>
                    <Avatar
                        rounded
                        size={50}
                        source={{
                            uri: peerInfo.avatar
                        }}
                    />
                </View>
                <View style={participantsMenuStyles.nameContainer}>
                    <Text numberOfLines={1}>{peerInfo.displayName}</Text>
                    {
                        MeetingVariable.hostId === peerInfo.id &&
                        <FontAwesome5 name={'crown'} color={'gold'} style={participantsMenuStyles.hostIcon}/>
                    }
                </View>
                <View style={participantsMenuStyles.iconContainer}>
                    <Ionicons name={'mic'} size={20} style={participantsMenuStyles.icon} color={item.hasAudio() ? '#9be3b1' : '#aaaaaa'}/>
                    <Ionicons name={'videocam'} size={20}  style={participantsMenuStyles.icon} color={item.hasVideo() ? '#9be3b1' : '#aaaaaa'}/>
                </View>
            </View>
        )
    }

    const Empty = () => {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 15}}>
                <Text>-没有其他参会人员-</Text>
            </View>
        )
    }

    return (
        <View style={{flex: 2, backgroundColor: '#f1f3f5'}}>
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <View style={participantsMenuStyles.avatarContainer}>
                    <Avatar
                        rounded
                        size={50}
                        source={{
                            uri: config_key.avatarUri
                        }}
                    />
                </View>
                <View style={participantsMenuStyles.nameContainer}>
                    <Text numberOfLines={1}>{MeetingVariable.myName}</Text>
                    {
                        MeetingVariable.hostId === config_key.userId &&
                        <FontAwesome5 name={'crown'} color={'gold'} style={participantsMenuStyles.hostIcon}/>
                    }
                </View>
                <View style={participantsMenuStyles.iconContainer}>
                    <Ionicons name={'mic'} size={20} style={participantsMenuStyles.icon} color={myMicStat ? '#9be3b1' : '#aaaaaa'}/>
                    <Ionicons name={'videocam'} size={20}  style={participantsMenuStyles.icon} color={myCamStat ? '#9be3b1' : '#aaaaaa'}/>
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

export const HostMenu = () => {
    const renderItem = ({item}) => {
        const peerInfo = item.getPeerInfo();
        return (
            <View style={{flexDirection: 'row', alignItems: 'center', padding: 20}}>
                <View style={participantsMenuStyles.avatarContainer}>
                    <Avatar
                        rounded
                        size={50}
                        source={{
                            uri: peerInfo.avatar
                        }}
                    />
                </View>
                <View style={participantsMenuStyles.nameContainer}>
                    <Text numberOfLines={1}>{peerInfo.displayName}</Text>
                </View>
                <View style={participantsMenuStyles.iconContainer}>
                    <Ionicons
                        name={'mic'}
                        size={20}
                        style={participantsMenuStyles.icon}
                        color={item.hasAudio() ? '#9be3b1' : '#aaaaaa'}
                        onPress={() => {
                            MeetingVariable.mediaService.mutePeer(peerInfo.id).then();
                        }}
                    />
                    <Ionicons
                        name={'close'}
                        size={20}
                        style={participantsMenuStyles.icon}
                        color={'red'}
                        onPress={() => {
                            Alert.alert(
                                '是否要踢出成员' + peerInfo.displayName,
                                null,
                                [
                                    {
                                        text: "确定",
                                        onPress: () => {
                                            MeetingVariable.mediaService.kickPeer(peerInfo.id).then();
                                        }
                                    },
                                    {
                                        text: '取消',
                                        onPress: () => {console.log('cancel pick peer')}
                                    }
                                ],
                                {
                                    cancelable: true,
                                }
                            )
                        }}
                    />
                </View>
            </View>
        )
    }

    const Empty = () => {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', marginTop: 10}}>
                <Text>-没有其他参会人员-</Text>
            </View>
        )
    }

    return (
        <View style={{flex: 2, backgroundColor: '#f1f3f5'}}>
            {
                MeetingVariable.mediaService.getPeerDetails().length !== 0 &&
                <View style={{alignItems: 'center'}}>
                    <TouchableOpacity
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 7,
                            backgroundColor: '#ff585e',
                            borderRadius: 5,
                            margin: 10,
                        }}
                        onPress={() => {
                            MeetingVariable.mediaService.mutePeer(null).then(
                                toast.show('已全体静音', {type: 'normal', duration: 1000, placement: 'top'})
                            )
                        }}
                    >
                        <Text style={{color: 'white'}}>全体静音</Text>
                    </TouchableOpacity>
                </View>
            }
            <FlatList
                data={MeetingVariable.mediaService.getPeerDetails()}
                renderItem={renderItem}
                ListEmptyComponent={<Empty/>}
                keyExtractor={(item, index) => {return index;}}
            />
        </View>
    )
}
