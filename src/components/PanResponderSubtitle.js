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
        <View style={{position: 'absolute', alignSelf: 'center', zIndex: 11, width: 200, height: 300, top: 0, left: 0}}>
            <Animated.View
                style={{
                    transform: [{ translateX: pan.x }, { translateY: pan.y }]
                }}
                {...panResponder.panHandlers}
            >
                <View style={[styles.box, {backgroundColor: rgbaColor(255, 255, 255, opacity), maxWidth: maxWidth * 0.7}]} >
                    <Text style={styles.text}>这里是字幕</Text>
                </View>
            </Animated.View>
        </View>
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
