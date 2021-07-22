import React, {Component} from 'react';
import {Animated, Dimensions, View,} from 'react-native';
import {MaskedMyMeeting} from "../components/MaskedText";
import {config, config_key} from "../utils/Constants";
import {getFromStorage} from "../utils/StorageUtils";
import {autoLogin} from "../service/UserService";

const windowHeight = Dimensions.get('window').height;

class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fadeAnim: new Animated.Value(0),
        };
    }

    autoLoginAndReadStorage = async () => {
        const response = await autoLogin();

        console.log(response)

        config_key.email= await getFromStorage(config.emailIndex);

        if (response == null || response.status !== 200) {
            return false;
        }

        config_key.username = await getFromStorage(config.usernameIndex);

        config_key.userId = await getFromStorage(config.userIdIndex);

        config_key.nickname = await getFromStorage(config.nicknameIndex);


        const camera = await getFromStorage(config.cameraIndex);
        config_key.camera = camera === 'true';

        const microphone = await getFromStorage(config.microphoneIndex);
        config_key.microphone = microphone === 'true';

        return true;
    }

    async componentDidMount() {
        const autoStatus = await this.autoLoginAndReadStorage();
        const {animateEnd} = this.props;
        Animated.timing(this.state.fadeAnim,
            {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            }
        ).start(() => {
            if (animateEnd) {
                animateEnd(autoStatus)
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
    _animateEnd = (autoStatus) =>{
        if (autoStatus)
            this.props.navigation.navigate('Tab');
        else
            this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <Splash animateEnd={this._animateEnd}/>
        );
    }
}
