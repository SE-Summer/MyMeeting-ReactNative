import { NativeModules, Platform } from 'react-native';
const getPath = Platform.OS === 'android' && NativeModules.RNAndroidURIPathModule
    ? NativeModules.RNAndroidURIPathModule.getPath
    : (uriString) => uriString;
export default getPath;
//# sourceMappingURL=index.js.map