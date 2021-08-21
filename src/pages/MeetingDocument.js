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
    SafeAreaView
} from "react-native";
import {MeetingVariable} from "../MeetingVariable";
import {TextButton} from "../components/MyButton";

export default class MeetingDocument extends Component {
    constructor(props) {
        super(props);
        this.viewHeight = new Animated.Value(0);
        this.textInput = React.createRef();
        this.state = {
            showSubtitleContents: false,
            notes: MeetingVariable.notes,
            pageHeight: 0,
            titleHeight: 0,
            inputHeight: 0,
        }
    }

    componentDidMount() {
        const {navigation} = this.props;
        navigation.setOptions({
            headerRight: () => {
                return (
                    <TextButton
                        text={'导出'}
                        pressEvent={() => {}}
                    />
                )
            }
        })
    }

    showContents = () => {
        this.setState({
            showSubtitleContents: true,
            viewHeight: 350,
        })
        Animated.timing(this.viewHeight,
            {
                toValue: 350,
                duration: 200,
                useNativeDriver: false,
            }
        ).start();
    }

    hideContents = () => {
        this.setState({
            showSubtitleContents: false,
            viewHeight: 0,
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
        const {inputHeight, pageHeight, titleHeight} = this.state;
        let fillHeight = pageHeight - 2 * titleHeight - inputHeight - 30;
        fillHeight = fillHeight > 0 ? fillHeight : 0;
        return (
            <SafeAreaView style={{flex: 1}} onLayout={ event => {
                const {height} = event.nativeEvent.layout;
                this.setState({
                    pageHeight: height,
                })
            }}>
                <ScrollView style={{flex: 1, padding: 8}}>
                    <View>
                        <TouchableOpacity
                            style={styles.titleContainer}
                            onPress={() => {
                                if (this.state.showSubtitleContents) {
                                    this.hideContents();
                                } else {
                                    this.showContents();
                                }
                            }}
                            onLayout={ event => {
                                const {height} = event.nativeEvent.layout;
                                this.setState({
                                    titleHeight: height,
                                })
                            }}
                        >
                            <Text style={styles.title}>字幕</Text>
                        </TouchableOpacity>
                        <Animated.View style={[styles.animatedView, {height: this.viewHeight }]}>
                            <View style={{alignItems: 'center'}}>
                                <Text style={{color: '#f56066'}}>该内容仅作为参考</Text>
                            </View>
                            <ScrollView style={styles.scrollView}>
                                <Text>{MeetingVariable.speechRecognition.exportMeme()}</Text>
                            </ScrollView>
                        </Animated.View>
                    </View>
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
                                onLayout={ event => {
                                    const {height} = event.nativeEvent.layout;
                                    this.setState({
                                        inputHeight: height,
                                    })
                                }}
                            />
                            <Animated.View style={{height: fillHeight}}>
                                <TouchableOpacity
                                    style={{flex: 1}}
                                    onPress={() => {
                                        this.textInput.current.focus();
                                    }}
                                />
                            </Animated.View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
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
