export const config = {
    unKnownUri: 'https://www.imoments.com.cn/resource/img/web/UNavatar.jpg',
    baseURL: 'http://192.168.0.101:4446',
    qGreen: '#44CE55',
    usernameIndex: 'user_name',
    userIdIndex: 'user_id',
    nicknameIndex: 'nick_name',
    cameraIndex: 'camera',
    microphoneIndex: 'microphone',
    emailIndex: 'email',
    tokenIndex: 'token',
}

export const utils = {
    buttonOutline: [require('../assets/myButton_Outlined.png'), require('../assets/myButton_Outline_error.png')],
}

export const config_key = {
    avatarUri: config.unKnownUri,
    email: null,
    username: null,
    userId: 0,
    nickname: null,
    camera: true,
    microphone: false,
}
