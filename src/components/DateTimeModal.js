import {Modal, Text, View} from "react-native";
import DatePicker from "react-native-date-picker";
import {TextButton} from "./MyButton";
import * as React from "react";

export const DateTimeModal = ({ visible, date, mode, dateChange, onOk, text }) => {
    return (
        <Modal
            animationType="fade"
            visible={visible}
            transparent={true}
            onRequestClose={onOk}
        >
            <View style={{flex: 1}}/>
            <View style={{justifyContent: "center", alignItems:"center", flex: 1, backgroundColor: "#FFFFFF", margin: 20, borderRadius: 10,borderWidth: 1, borderColor: "green"}}>
                <Text>选择{text}</Text>
                <DatePicker
                    date={date}
                    onDateChange={dateChange}
                    mode={mode}
                    androidVariant="nativeAndroid"
                />
                <View style={{alignItems: 'center'}}>
                    <TextButton text={"确定"} pressEvent={onOk}/>
                </View>
            </View>
            <View style={{flex: 1}}/>
        </Modal>
    );
}
