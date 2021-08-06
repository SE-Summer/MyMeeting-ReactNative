import AsyncStorage from '@react-native-async-storage/async-storage';

const getFromStorage = async (name) => {
    try {
        return await AsyncStorage.getItem(name);
    } catch(e) {
        // toast.show('Get storage error', {type: 'danger', duration: 1300, placement: 'top'})
    }
}

const setInStorage = async (name, value) => {
    try {
        await AsyncStorage.setItem(name, value);
    } catch (e) {
        // toast.show('Set storage error', {type: 'danger', duration: 1300, placement: 'top'})
    }
}

const removeFromStorage = async (name) => {
    try {
        await AsyncStorage.removeItem(name);
    } catch (e) {
        // toast.show('Remove storage error', {type: 'danger', duration: 1300, placement: 'top'})
    }
}

export {removeFromStorage, getFromStorage, setInStorage};

