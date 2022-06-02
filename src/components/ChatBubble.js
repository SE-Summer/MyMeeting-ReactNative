import * as React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import moment from "moment";
import {FileJobStatus} from "../utils/Types";
import * as Progress from 'react-native-progress';
import FileViewer from 'react-native-file-viewer';
import {myFileType} from "../Constants";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import {judgeFileType, windowWidth} from "../utils/Utils";
import Ionicons from "react-native-vector-icons/Ionicons";

const bubbleStyle = StyleSheet.create({
    myBubble: {
        backgroundColor: '#76db6b',
        alignSelf: 'flex-end',
        padding: 10,
        borderRadius: 10,
    },
    otherBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 10,
        borderRadius: 10,
    },
    timeFont: {
        fontSize: 10,
        color: '#aaaaaa',
        marginTop: 2,
    },
    myFileBubble: {
        backgroundColor: '#76db6b',
        alignSelf: 'flex-end',
        padding: 5,
        borderRadius: 10,
    },
    otherFileBubble: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        padding: 5,
        borderRadius: 10,
    },
    fileContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
    },
    filename: {
        marginRight: 20,
    },
    imageFile: {
        width: windowWidth / 3,
        height: windowWidth / 4,
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
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
    if (file.myType == null) {
        file.myType = judgeFileType(file.fileType, file.filename);
    }

    const openFile = (item) => {
        FileViewer.open(item.filePath)
            .then(() => {
                console.log('open file success')
            }).catch(() => {
                console.log('open file error')
        })
    }

    const NormalFile = ({filename, fileJobStatus, iconColor, iconName}) => {
        return (
            <View style={bubbleStyle.fileContainer}>
                <Text style={bubbleStyle.filename} numberOfLines={1}>{filename}</Text>
                <FontAwesome5 name={iconName} size={30} color={iconColor}/>
                {
                    fileJobStatus === FileJobStatus.completed &&
                    <Ionicons name={'checkmark-circle-outline'} style={{marginLeft: 5}} color={'#3dc163'} size={14}/>
                }
            </View>
        )
    }

    const Display = ({item}) => {
        switch (item.myType) {
            case myFileType.pdf: return (
                    <NormalFile
                        filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                        iconName={item.myType} iconColor={'#e46767'}
                    />
                )
            case myFileType.excel: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'#3dc163'}
                />
            )
            case myFileType.word: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'#00a8f3'}
                />
            )
            case myFileType.ppt: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'#e46767'}
                />
            )
            case myFileType.text: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'black'}
                />
            )
            case myFileType.zip: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'#af6236'}
                />
            )
            case myFileType.mp4: return (
                <NormalFile
                    filename={item.filename} fileJobStatus={item.fileJobStatus} fromMyself={item.fromMyself}
                    iconName={item.myType} iconColor={'#ff9851'}
                />
            )
            case myFileType.image:
                if (!item.fromMyself && (item.fileJobStatus === FileJobStatus.failed || item.fileJobStatus === FileJobStatus.unDownloaded)) {
                    return (
                        <View>
                            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf:'center'}}>
                                <Text>点击查看图片</Text>
                                <FontAwesome5 name={'file-image'} color={'#555555'} style={{margin: 5}} size={30}/>
                            </View>
                            <Text style={{color: item.fromMyself ? 'white' : 'black', margin:5}}>{item.filename}</Text>
                        </View>
                    )
                } else {
                    return (
                        <View>
                            <Image source={{uri: `file:///${item.filePath}`}} style={bubbleStyle.imageFile} />
                        </View>
                    )
                }
            default: return (
                <View style={bubbleStyle.fileContainer}>
                    <Text style={bubbleStyle.filename} numberOfLines={1}>{item.filename}</Text>
                    <FontAwesome5 name={'question-circle'} size={30}/>
                    {
                        item.fileJobStatus === FileJobStatus.completed &&
                        <Ionicons name={'checkmark-circle-outline'} style={{marginLeft: 10}} color={'#3dc163'} size={14}/>
                    }
                </View>
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
            <View style={file.fromMyself ? bubbleStyle.myFileBubble : bubbleStyle.otherBubble}>
                <TouchableOpacity onPress={pressEvent}>
                    <View style={{alignItems: 'center'}}>
                        <Display item={file}/>
                        {
                            file.fileJobStatus === FileJobStatus.progressing &&
                                <Progress.Bar
                                    progress={file.bytesSent / file.totalBytes}
                                    color={file.fromMyself ? 'white' : '#3dc163'}
                                    style={{marginTop: 3}}
                                />
                        }
                    </View>
                </TouchableOpacity>
            </View>
             <Text style={[bubbleStyle.timeFont, file.fromMyself ? {alignSelf: 'flex-end'} : null]}>{moment(file.timestamp).format('HH:mm:ss')}</Text>
        </View>
    )
}

