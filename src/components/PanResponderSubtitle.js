import React, {useRef} from "react";
import { Animated, View, StyleSheet, PanResponder, Text } from "react-native";

export const PanResponderSubtitle = ({maxWidth, text}) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {},
            onPanResponderMove: Animated.event(
                    [
                        null,
                        { dx: pan.x, dy: pan.y }
                    ],
                {useNativeDriver: false}
                )
            ,
            onPanResponderRelease: () => {
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
            <View style={[styles.box, {maxWidth: maxWidth}]} >
                <Text style={styles.text}>{text}</Text>
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
