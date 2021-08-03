import * as React from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Animated} from "react-native";
import moment from "moment";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {join} from "../service/MeetingService";
import Share from 'react-native-share';
import {useRef, useState} from "react";

const colors = [
    '#05783d','#069b49', '#06b45f', '#87e0a8', '#b7e7bf',
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
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [labelWidth, setLabelWidth] = useState(0);
    const radius = useRef(new Animated.Value(0)).current;
    const overlayWidth = useRef(new Animated.Value(0)).current;

    const theColor = colors[calColorIndex(index)];
    let icon, iconColor, onPress, accessible;
    if (moment(date).isSameOrBefore(item.end_time, 'minute') && moment(date).isSameOrAfter(item.start_time, 'minute')) {
        icon = 'door-open';
        accessible = true;
        iconColor = theColor;
        onPress = async () => {
            const response = await join(item.id, item.password);
            if (response != null && response.status === 200) {
                pressEvent(response.data.room);
            }
        };
    } else {
        accessible = false;
        icon = 'door-closed';
        iconColor = '#aaaaaaaa';
        onPress = () => {};
    }

    let sharable, shareColor;
    if (moment(date).isBefore(item.end_time, 'minute')) {
        shareColor = theColor;
        sharable = true;
    } else {
        shareColor = '#aaaaaaaa';
        sharable = false;
    }

    const shareMeeting = () => {
        const meetingTime = moment(item.start_time).format('MM-DD HH:mm') + ' ~ ' +moment(item.end_time).format('MM-DD HH:mm');
        const meetingTopic = item.topic;
        const meetingId = item.id;
        const meetingPassword = item.password;
        const mainContent = '主题：' + meetingTopic + '\n'
            + '时间：' + meetingTime + '\n'
            + '会议号：' + meetingId + '\n'
            + '密码：'  + meetingPassword;

        const shareOptions = {
            title: '邀请入会',
            message: 'MyMeeting参会邀请\n' + mainContent,
        };

        Share.open(shareOptions)
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                err && console.log(err);
            });
    }

    const getWidthHeight = event => {
        let {width,height} = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
    }

    const getLabelWidth = event => {
        let {width} = event.nativeEvent.layout;
        overlayWidth.setValue(width);
        setLabelWidth(width);
    }

    const slideRight = () => {
        if (sharable) {
            Animated.parallel([
                Animated.timing(overlayWidth, {
                    toValue: containerWidth,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(radius, {
                    toValue: 10,
                    duration: 500,
                    useNativeDriver: false,
                })
            ]).start(() => {
                onPress();
                setTimeout(() => {
                    overlayWidth.setValue(labelWidth);
                    radius.setValue(0);
                }, 500);
            });
        }

    }

    return (
        <View style={styles.itemContainer} onLayout={getWidthHeight}>
            <Animated.View style={[styles.overLay, {width: overlayWidth, backgroundColor: theColor, height: containerHeight, left: 0, borderTopRightRadius: radius, borderBottomRightRadius: radius}]}>
                <Text style={styles.indexFont}>{index + 1}</Text>
            </Animated.View>
            <View style={{flex: 0.5}} onLayout={getLabelWidth}/>
            <View style={styles.contentContainer}>
                <View style={styles.titleContainer}>
                    <View style={styles.topicContainer}>
                        <Text style={styles.topicStyle}>{item.topic}</Text>
                    </View>
                </View>
                <View style={styles.timeContainer}>
                    <Text style={styles.timeFont}>时间: {moment(item.start_time).format('MM-DD HH:mm')} ~ {moment(item.end_time).format('MM-DD HH:mm')}</Text>
                </View>
                <View style={styles.idContainer}>
                    <View style={styles.idInnerContainer}>
                        <Text style={styles.idFont}>会议号: </Text>
                        <Text style={styles.idFont}>{item.id}</Text>
                    </View>
                    <View style={styles.idInnerContainer}>
                        <View style={{flex: 1}}>
                            <Text style={styles.idFont}>密码: {passwordVisible ? item.password : '--'}</Text>
                        </View>
                        <FontAwesome5 name={passwordVisible ? 'eye' : 'eye-slash'} color={'#aaaaaa'} onPress={() => {
                            setPasswordVisible(!passwordVisible);
                        }}/>
                    </View>
                </View>
            </View>
            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={slideRight}>
                    <FontAwesome5 name={icon} size={20} color={iconColor} />
                </TouchableOpacity>
                {
                    sharable &&
                    <TouchableOpacity onPress={() => {
                        shareMeeting();
                    }}>
                        <FontAwesome5 name={'share-alt'} size={20} color={shareColor}/>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overLay: {
        position: 'absolute',
        top: 0,
        zIndex: 2,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
    },
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    idFont: {
        fontSize: 12,
        color: 'black',
    }
})
