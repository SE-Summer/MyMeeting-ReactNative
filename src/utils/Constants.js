export const config = {
    unKnownUri: 'https://www.imoments.com.cn/resource/img/web/UNavatar.jpg',
    // baseURL: 'http://se-summer.cn:4446',
    baseURL: 'http://192.168.0.106:4446',
    qGreen: '#44CE55',
    usernameIndex: 'user_name',
    userIdIndex: 'user_id',
    nicknameIndex: 'nick_name',
    cameraIndex: 'camera',
    microphoneIndex: 'microphone',
    emailIndex: 'email',
    tokenIndex: 'token',
    mediaHeight: 800,
    mediaWidth: 600,
}

export const smallUtils = {
    buttonOutline: [require('../../assets/image/myButton_Outlined.png'), require('../../assets/image/myButton_Outline_error.png')],
}

export const config_key = {
    avatarUri: config.unKnownUri,
    token: null,
    email: null,
    username: null,
    userId: 0,
    nickname: null,
    camera: true,
    microphone: false,
}
