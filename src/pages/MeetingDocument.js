import * as React from 'react';
import {Component} from "react";
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Animated,
    Keyboard
} from "react-native";
import {MeetingVariable} from "../MeetingVariable";
import {TextButton} from "../components/MyButton";
import {windowHeight} from "../utils/Utils";
import Clipboard from '@react-native-clipboard/clipboard';

export default class MeetingDocument extends Component {
    constructor(props) {
        super(props);
        this.viewHeight = new Animated.Value(0);
        this.textInput = React.createRef();
        this.state = {
            showSubtitleContents: false,
            notes: MeetingVariable.notes,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                return (
                    <TextButton
                        text={'导出'}
                        pressEvent={() => {
                            const string = '会议笔记：\n' + this.state.notes +
                                '\n' + '字幕内容（仅作为参考）：\n' + MeetingVariable.speechRecognition.exportMeme();
                            Clipboard.setString(string);
                            toast.show('已复制到剪贴板', {type: 'success', duration: 1000, placement: 'top'})
                        }}
                    />
                )
            }
        })
        Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
    }

    componentWillUnmount() {
        Keyboard.removeAllListeners('keyboardDidShow')
    }

    keyboardWillShow = () => {
        if (this.state.showSubtitleContents) {
            this.hideContents();
        }
    }

    showContents = () => {
        this.setState({
            showSubtitleContents: true,
        })
        Animated.timing(this.viewHeight,
            {
                toValue: windowHeight * 0.4,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideContents = () => {
        this.setState({
            showSubtitleContents: false,
        })
        Animated.timing(this.viewHeight,
            {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    textChange = value => {
        MeetingVariable.notes = value;
        this.setState({
            notes: value,
        })
    }

    render () {
        return (
            <View style={{flex: 1, padding: 5}}>
                <View style={{flex: 1}}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>我的笔记</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={this.textInput}
                            style={{color: 'black'}}
                            multiline
                            value={this.state.notes}
                            onChangeText={this.textChange}
                        />
                    </View>
                </View>
                <View style={{marginTop: 5}}>
                    <TouchableOpacity
                        style={styles.titleContainer}
                        onPress={() => {
                            if (this.state.showSubtitleContents) {
                                this.hideContents();
                            } else {
                                this.showContents();
                            }
                        }}
                    >
                        <Text style={styles.title}>字幕</Text>
                    </TouchableOpacity>
                    <Animated.View style={[styles.animatedView, {height: this.viewHeight}]}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{color: '#f56066'}}>该内容仅作为参考</Text>
                        </View>
                        <ScrollView
                            style={styles.scrollView}
                        >
                            <Text>{MeetingVariable.speechRecognition.exportMeme()}</Text>
                        </ScrollView>
                    </Animated.View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 5,
        backgroundColor: '#91e1bc',
        flexDirection: 'row'
    },
    title: {
        color: '#f6f6f6',
        fontSize: 15
    },
    scrollView: {
        flex: 1,
        margin: 5,
    },
    animatedView: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 5,
    },
    inputContainer:{
        borderRadius: 10,
        backgroundColor: 'white',
        flex: 1,
        marginTop: 5,
    }
})
