import {Text, TextInput, TouchableOpacity, View} from "react-native";
import * as React from "react";
import {Component} from "react";
import {Divider} from "react-native-elements";
import {SwitchItem} from "../components/Item";
import {TextButton} from "../components/MyButton";
import {config_key} from "../Constants";
import {join, reserveJoin} from "../service/MeetingService";
import * as Progress from 'react-native-progress';
import {MeetingVariable} from "../MeetingVariable";
import {MyAlert} from "../components/MyAlert";

export default class JoinMeetingScreen extends Component{
    constructor(props) {
        super(props);
        this.meetingIdTextInput = React.createRef();
        this.meetingPasswordInput = React.createRef();
        this.joinNameInput = React.createRef();
        this.state = {
            id: null,
            password: null,
            cameraStatus: config_key.camera,
            microphoneStatus: config_key.microphone,
            loading: 'normal',
            joinName: config_key.username,
            selected: 'immediate',
            modalVisible: false,
        }
    }

    componentDidMount() {
        const {route, navigation} = this.props;
        navigation.addListener('focus', () => {
            this.setState({
                loading: 'normal',
            })
        })
        navigation.setOptions({
            title: route.params.quickJoin ? '快速参会' : null,
            headerRight: () => {
                if (this.state.loading === 'waiting') {
                    return (
                        <Progress.CircleSnail spinDuration={4000} duration={800} color={['#9be3b1', '#06b45f', '#05783d']} style={{marginRight: 7}}/>
                    )
                }

                return (
                    <TextButton text={'完成'} pressEvent={
                        () => {
                            const {id, password, selected} = this.state;

                            this.meetingIdTextInput.current.blur();
                            this.meetingIdTextInput.current.clear();
                            this.meetingPasswordInput.current.blur();
                            this.meetingPasswordInput.current.clear();

                            if (selected === 'immediate')
                                this.joinNameInput.current.blur();

                            if (id == null || id.length === 0 || password == null || password.length === 0) {
                                toast.show('格式有误', {type: 'warning', duration: 1300, placement: 'top'})
                                return;
                            }

                            this.setState({
                                loading: 'waiting',
                            }, async () => {
                                try {
                                    if (selected === 'immediate')
                                        await this.joinM();
                                    else
                                        await this.reserveM();
                                } catch (e) {
                                    console.warn(e);
                                }
                            })
                        }}
                    />
                )
            },
        })
    }

    joinM = async () => {
        const response = await join(parseInt(this.state.id), this.state.password);
        if (response == null) {
            toast.show('入会失败', {type: 'danger', duration: 1300, placement: 'top'})
            this.setState({
                loading: 'normal',
            })
            return;
        }

        switch (response.status) {
            case 200: {
                const room = response.data.room;
                const params = {
                    roomInf: room,
                    cameraStatus: this.state.cameraStatus,
                    microphoneStatus: this.state.microphoneStatus,
                }
                MeetingVariable.room = room;
                MeetingVariable.myName = this.state.joinName;
                this.props.navigation.navigate('Meeting', params);
                return;
            }
            case 401: {
                this.setState({
                    loading: 'normal',
                }, () => {
                    toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'})
                })
                return;
            }
            default: {
                this.setState({
                    loading: 'normal',
                }, () => {
                    toast.show('入会失败', {type: 'danger', duration: 1300, placement: 'top'})
                })
            }
        }
    }

    reserveM = async () => {
        const response = await reserveJoin(parseInt(this.state.id), this.state.password, config_key.token);
        if (response == null) {
            toast.show('预约失败', {type: 'danger', duration: 1300, placement: 'top'})
            this.setState({
                loading: false,
            })
            return;
        }

        switch (response.status) {
            case 200: {
                this.setState({
                    loading: false,
                    modalVisible: true,
                })
                return;
            }
            case 401: {
                toast.show(response.data.error, {type: 'danger', duration: 1300, placement: 'top'})
                this.setState({
                    loading: false,
                })
                return;
            }
            default: {
                toast.show('预约失败', {type: 'danger', duration: 1300, placement: 'top'})
                this.setState({
                    loading: false,
                })
            }
        }
    }

    cameraSwitch = (value) => {
        this.setState({
            cameraStatus: value,
        })
    }

    microphoneSwitch = (value) => {
        this.setState({
            microphoneStatus: value,
        })
    }

    meetingIdChange = (value) => {
        this.setState({
            id: value,
        })
    }

    passwordChange = (value) => {
        this.setState({
            password: value,
        })
    }

    joinNameChange = (value) => {
        this.setState({
            joinName: value,
        })
    }

    render() {
        return (
            <View style={{ flex: 1}}>
                <MyAlert
                    title={'预约成功'}
                    okButton={
                        <TextButton
                            text={'确定'}
                            pressEvent={() => {
                                this.props.navigation.pop();
                            }}
                            containerStyle={{backgroundColor: 'green', borderRadius: 5}}
                            fontStyle={{fontSize: 14, color: 'white'}}
                        />
                    }
                    visible={this.state.modalVisible}
                    setVisible={(value) => {this.setState({modalVisible: value})}}
                    backEvent={() => {
                        this.props.navigation.pop();
                    }}
                />
                {
                    config_key.token &&
                        <SelectBar selected={this.state.selected} setSelected={(value) => {this.setState({
                            selected: value,
                        })}}/>
                }
                <View style={{borderRadius: 10, marginTop: 10, marginRight: 10, marginLeft: 10, backgroundColor: "white"}}>
                    <TextInput
                        ref={this.meetingIdTextInput}
                        value={this.state.id}
                        style={{fontSize:17, color: 'black'}}
                        placeholder={"会议号"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={12}
                        onChangeText={this.meetingIdChange}
                    />
                    <Divider />
                    <TextInput
                        ref={this.meetingPasswordInput}
                        value={this.state.password}
                        style={{fontSize: 17, color: 'black'}}
                        placeholder={"会议密码(8位数字)"}
                        textAlign={"center"}
                        numberOfLines={1}
                        keyboardType={"numeric"}
                        maxLength={8}
                        secureTextEntry={true}
                        onChangeText={this.passwordChange}
                    />
                </View>
                {
                    this.state.selected === 'immediate' &&
                    <View style={{marginTop: 40, marginRight: 10, marginLeft: 10, }}>
                        <Text style={{fontSize: 13, color: '#999999', marginLeft: 10}}>入会名称</Text>
                        <TextInput
                            ref={this.joinNameInput}
                            value={this.state.joinName}
                            style={{borderRadius: 10, backgroundColor: "white", fontSize: 17, color: 'black'}}
                            textAlign={'center'}
                            numberOfLines={1}
                            onChangeText={this.joinNameChange}
                        />
                    </View>
                }
                {
                    this.state.selected === 'immediate' &&
                    <View style={{marginTop: 40, marginLeft: 10, marginRight: 10, borderRadius: 10, backgroundColor: "white"}}>
                        <SwitchItem text={"摄像头"} status={this.state.cameraStatus} switchEvent={this.cameraSwitch}/>
                        <Divider style={{marginLeft: 20, marginRight: 20,}}/>
                        <SwitchItem text={"麦克风"} status={this.state.microphoneStatus} switchEvent={this.microphoneSwitch}/>
                    </View>
                }
            </View>
        );
    }

}

const SelectBar = ({selected, setSelected}) => {
    return (
        <View style={{flexDirection: 'row', marginTop: 25, marginBottom: 15, marginLeft: 40, marginRight: 40}}>
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: 5,
                    borderBottomLeftRadius: 7,
                    borderTopLeftRadius: 7,
                    borderWidth: 1,
                    borderColor: '#04b35f',
                    backgroundColor: selected === 'immediate' ? '#04b35f' : null,
                }}
                onPress={() => {
                    setSelected('immediate');
                }}
            >
                <Text style={{fontSize: 15, color: selected === 'immediate' ? 'white' : '#04b35f'}}>立即入会</Text>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={1}
                style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: 5,
                    borderBottomRightRadius: 7,
                    borderTopRightRadius: 7,
                    borderBottomWidth: 1,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderColor: '#04b35f',
                    backgroundColor: selected === 'reserve' ? '#04b35f' : null,
                }}
                onPress={() => {
                    setSelected('reserve');
                }}
            >
                <Text style={{fontSize: 15, color: selected === 'reserve' ? 'white' : '#04b35f'}}>预约参会</Text>
            </TouchableOpacity>
        </View>
    )
}
