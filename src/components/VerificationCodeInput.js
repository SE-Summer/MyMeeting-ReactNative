import React, {Component} from 'react'
import {StyleSheet, Text, TextInput, View} from "react-native";
import PropTypes from 'prop-types';

export default class VerificationCodeInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFocused: true,
            isFocusedIndex: 0,
            textString: ''
        }
    }

    static defaultProps = {
        inputSize: 6
    };

    static propTypes = {
        inputSize: PropTypes.number,
        title: PropTypes.object,
        check: PropTypes.func,
    };

    /**
     *   初始化 text
     * @param callback
     * @returns {Array}
     */
    renderText(callback) {
        let inputs = [];
        for (let i = 0; i < this.props.inputSize; i++) {
            inputs.push(
                <Text style={[styles.text,
                    this.state.textString.length === i ? styles.focusText : null]}>
                    {this.state.textString[i]}
                </Text>
            )
        }

        return inputs
    }

    render() {
        return (
            <View style={[styles.viewBox]}>
                {this.props.title}
                <View>
                    {/**text*/}
                    <View style={[styles.textBox, {flexDirection: 'row', justifyContent: 'center',}]}>
                        {this.renderText()}
                    </View>

                    {/**input*/}
                    <TextInput
                        style={styles.intextInputStyle}
                        onChangeText={(text) => {
                            this.setState({
                                textString: text,
                            }, () => {
                                if (text != null && text.length === 6)
                                    this.props.check(text);
                            });
                        }}
                        underlineColorAndroid="transparent"
                        maxLength={this.props.inputSize}
                        autoFocus={true}
                        keyboardType={"visible-password"}
                        selectionColor="transparent"

                    />
                </View>
            </View>
        )
    }


}

const styles = StyleSheet.create({
    viewBox: {
        alignItems: 'center',
        justifyContent: 'center',
        // flex: 1,
    },
    textBox: {
        position: 'absolute',
        left: 20,
        right: 36,
    },
    text: {
        height: 40,
        width: 40,
        lineHeight: 40,
        borderWidth: 2,
        borderColor: '#b9b9b9',
        color: 'green',
        fontSize: 25,
        marginLeft: 16,
        textAlign: 'center'
    },
    focusText: {
        borderColor: 'white',
    },
    inputItem: {
        lineHeight: 20,
        width: 80,
        textAlign: 'center',
        height: 40,
    },
    intextInputStyle: {
        width: 400,
        height: 40,
        fontSize: 25,
        color: 'transparent',
    },
});
