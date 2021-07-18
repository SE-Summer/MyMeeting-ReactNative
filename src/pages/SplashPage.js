import React, {Component} from 'react';
import {
    View,
    Animated,
} from 'react-native';
import {MaskedMyMeeting} from "../components/MaskedText";

class Splash extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fadeAnim: new Animated.Value(0),
        };
    }

    componentDidMount() {
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
                <Animated.View style={{flex:2, justifyContent: "center", alignItems: "center" ,opacity: this.state.fadeAnim}}>
                    <MaskedMyMeeting />
                </Animated.View>
                <View style={{flex: 1.86}}/>
            </View>
        );
    }
}

export default class SplashPage extends Component {
    _animateEnd = ()=>{
        this.props.navigation.navigate('Login');
    }

    render() {
        return (
            <Splash animateEnd={this._animateEnd}/>
        );
    }
}
