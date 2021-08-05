import * as React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import moment from "moment";
import {FileJobStatus, FileJobType} from "../utils/Types";
import * as Progress from 'react-native-progress';
import FileViewer from 'react-native-file-viewer';

const bubbleStyle = StyleSheet.create({
    myBubble: {
        backgroundColor: '#24b23b',
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 20,
    },
    otherBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 20,
    },
    timeFont: {
        fontSize: 10,
        color: '#aaaaaa',
        marginTop: 2,
        marginLeft: 10,
        marginRight: 10,
    }
})

export const ChatBubble = ({text, myInf = false, time, maxWidth}) => {
    return (
        <View style={{alignSelf: 'flex-start', maxWidth: maxWidth}}>
            <View style={myInf ? bubbleStyle.myBubble : bubbleStyle.otherBubble}>
                <Text style={myInf ? {color: 'white'} : {color: 'black'}}>{text}</Text>
            </View>
            <Text style={[bubbleStyle.timeFont, myInf ? {alignSelf: 'flex-end'} : null]}>{moment(time).format('HH:mm:ss')}</Text>
        </View>
    )
}

export const FileBubble = ({file, maxWidth, downloadFile}) => {
    const openFile = (item) => {
        FileViewer.open(item.filePath)
            .then(() => {
                console.log('success')
            }).catch(() => {
                console.log('error')
        })
    }

    const display = (file) => {
        if (file.fileType.indexOf('image') !== -1) {
            return (
                <Image source={{uri: file.filePath}}/>
            )
        }
    }

    const pressEvent = () => {
        if (file.fromMyself) {
            openFile(file);
        } else {
            switch (file.fileJobStatus) {
                case FileJobStatus.unDownloaded: case FileJobStatus.failed: downloadFile(file); break;
                case FileJobStatus.progressing: toast.show('正在下载中', {type: 'normal', duration: 1000, placement: 'top'}); break;
                case FileJobStatus.completed: openFile(file); break;
            }
        }
    }

    return (
        <View style={{alignSelf: 'flex-start', maxWidth: maxWidth}}>
            <View style={file.fromMyself ? bubbleStyle.myBubble : bubbleStyle.otherBubble}>
                <TouchableOpacity onPress={pressEvent} style={{flex: 1}}>
                    <View>
                        <Text>{file.fileJobType === FileJobType.download ? '下载' : '上传'}</Text>
                    </View>
                    <Progress.Bar progress={file.bytesSent ? file.bytesSent / file.totalBytes : 0} color={'green'}/>
                </TouchableOpacity>
            </View>
            <Text style={[bubbleStyle.timeFont, file.fromMyself ? {alignSelf: 'flex-end'} : null]}>{moment(file.timestamp).format('HH:mm:ss')}</Text>
        </View>
    )
}

