import MaskedView from "@react-native-community/masked-view";
import {Text, View} from "react-native";
import * as React from "react";
import LinearGradient from "react-native-linear-gradient";

export const MaskedMyMeeting = () => {
    return (
        <MaskedView
            style={{ width: 270, height: 200, flexDirection: "row"}}
            maskElement={
                <View
                    style={{
                        backgroundColor: 'transparent',
                        flex: 1,
                        justifyContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 60,
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        My
                    </Text>
                    <Text
                        style={{
                            fontSize: 60,
                            color: 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        Meeting
                    </Text>
                </View>
            }
        >
            <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 0.5, y: 0.9}}
                colors={['#43ea80', '#05783d']}
                style={{width: 300, height: 300}}
            />
        </MaskedView>
    )
}
