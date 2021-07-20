import React, {Component} from 'react';
import {
    View,
    Animated,
} from 'react-native';
import {MaskedMyMeeting} from "../components/MaskedText";
import {config, config_key} from "../utils/Constants";
import {getFromStorage} from "../utils/StorageUtils";
import { Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;

class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fadeAnim: new Animated.Value(0),
        };
    }

    readStorage = async () => {
        const username = await getFromStorage(config.usernameIndex);
        config_key.username = username? username: config_key.username;

        const userId = await getFromStorage(config.userIdIndex);
        config_key.userId = userId? userId: config_key.userId;

        const nickname = await getFromStorage(config.nicknameIndex);
        config_key.nickname = nickname ? nickname : config_key.nickname;

        const camera = await getFromStorage(config.cameraIndex);
        config_key.camera = camera === 'true';

        const microphone = await getFromStorage(config.microphoneIndex);
        config_key.microphone = microphone === 'true';
    }

    async componentDidMount() {
        await this.readStorage();
        const {animateEnd} = this.props;
        Animated.timing(this.state.fadeAnim,
            {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }
        ).start(() => {
            if (animateEnd) {
                animateEnd()
            }
        });
    }

    render() {
        return (
            <View style={{flex:1}}>
                <View style={{height: windowHeight * 0.11}}/>
                <Animated.View style={{height: windowHeight * 0.31, justifyContent: "center", alignItems: "center" ,opacity: this.state.fadeAnim}}>
                    <MaskedMyMeeting />
                </Animated.View>
                <View style={{height: windowHeight * 0.58}}/>
            </View>
        );
    }
}

export default class SplashScreen extends Component {
    _animateEnd = ()=>{
        this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <Splash animateEnd={this._animateEnd}/>
        );
    }
}
