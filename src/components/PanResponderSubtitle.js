import React, {useRef, useState} from "react";
import { Animated, View, StyleSheet, PanResponder, Text } from "react-native";
import {rgbaColor} from "react-native-reanimated/src/reanimated2/Colors";

export const PanResponderSubtitle = ({maxHeight, maxWidth}) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [opacity, setOpacity] = useState(0);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setOpacity(0.2);
            },
            onPanResponderMove: Animated.event(
                    [
                        null,
                        { dx: pan.x, dy: pan.y }
                    ],
                {useNativeDriver: false}
                )
            ,
            onPanResponderRelease: () => {
                setOpacity(0)
                Animated.spring(
                    pan, // Auto-multiplexed
                    { toValue: { x: 0, y: 0 }, useNativeDriver: false } // Back to zero
                ).start();
            }
        })
    ).current;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                alignSelf: 'center',
                bottom: 20,
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
                zIndex: 20,
            }}
            {...panResponder.panHandlers}
        >
            <View style={[styles.box, {backgroundColor: rgbaColor(255, 255, 255, opacity), maxWidth: maxWidth * 0.7}]} >
                <Text style={styles.text}>这里是字幕</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    box: {
        alignSelf: 'flex-start',
        borderRadius: 10,
        padding: 5,
    },
    text: {
        color: 'white'
    }
});
