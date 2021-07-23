import {TouchableOpacity, View, StyleSheet, Text, TouchableHighlight, Dimensions, Modal} from "react-native";
import * as React from "react";
import {Component, useState} from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {config, config_key} from "../utils/Constants";
import {IconWithLabel} from "../components/IconWithLabel";
import Window from "../components/Window";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const smallWindowWidth = windowWidth / 3;
const smallWindowHeight = smallWindowWidth * 4 / 3;

const screenStyle = StyleSheet.create({
    header: {
        backgroundColor: '#202020',
        flexDirection: 'row',
    },
    footer: {
        backgroundColor: '#202020',
        flexDirection: 'row',
        alignSelf: 'flex-end',
    }
})

export default class Meeting extends Component
{
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        const roomInf = this.props.route.params;
        return (
            <View style={{ flex: 1, backgroundColor: '#111111', flexDirection: 'column'}}>
                <Header style={screenStyle.header} roomInf={roomInf}/>
                <View style={{flex: 1,}}>
                    <Window style={{flex: 1, justifyContent:'flex-end', alignItems: 'flex-end'}}
                            children={
                                <Window style={{width: smallWindowWidth, height: smallWindowHeight, margin: 10}}/>
                            }
                    />
                </View>
                <Footer style={screenStyle.footer} />
            </View>
        );
    }
}

const Footer = ({style}) => {
    const footerStyle = StyleSheet.create({
        wholeContainer: {
            flex: 1,
            flexDirection: 'row',
            padding: 10,
            justifyContent: 'space-around',
        }
    })

    const [microphone, setMicrophone] = useState(config_key.microphone);
    const [camera, setCamera] = useState(config_key.camera);
    const [settingsVisible, setSettingsVisible] = useState(false);

    return (
        <View style={style}>
            <View style={footerStyle.wholeContainer}>
                <IconWithLabel text={microphone ? '开启静音' : '解除静音'} iconName={microphone ? 'mic' : 'mic-outline'} pressEvent={() => {
                    setMicrophone(!microphone);
                }}/>
                <IconWithLabel text={camera ? '关闭视频' : '开启视频'} iconName={camera ? 'videocam' : 'videocam-outline'} pressEvent={() => {
                    setCamera(!camera)
                }}/>
                <IconWithLabel text={'参会人员'} iconName={'people'}/>
                <IconWithLabel text={'通用设置'} iconName={settingsVisible ? 'settings':'settings-outline'} pressEvent={() => {
                    setSettingsVisible(true);
                }}/>
                <Modal
                    transparent={true}
                    visible={settingsVisible}
                >
                    <View>
                        <Text style={{color: 'white'}}>视图</Text>
                        <TouchableOpacity onPress={()=>{setSettingsVisible(false)}}/>
                    </View>
                </Modal>
            </View>
        </View>
    )
}

const Header = ({style, roomInf}) => {
    const headerStyle = StyleSheet.create({
        wholeContainer: {
            flex: 1,
            flexDirection: 'row',
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 15,
            paddingBottom: 15,
        },
        headerIconContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        titleContainer: {
            flex: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 18,
            color: config.qGreen,
        },
        exitButton: {
            flex: 1,
            backgroundColor: '#e00000',
            borderRadius: 10,
            padding: 3,
            alignItems: 'center',
            justifyContent: 'center',
        },
        exitText: {
            color: 'white',
        }
    })

    return (
        <View style={style}>
            <View style={headerStyle.wholeContainer}>
                <TouchableOpacity style={headerStyle.headerIconContainer}>
                    <Ionicons name={'information-circle-outline'} size={20} color={'#cccccc'}/>
                </TouchableOpacity>
                <View style={headerStyle.titleContainer}>
                    <Text style={headerStyle.title}>MyMeeting</Text>
                </View>
                <TouchableHighlight style={headerStyle.exitButton}>
                    <Text style={headerStyle.exitText}>离开</Text>
                </TouchableHighlight>
            </View>
        </View>
    )
}
