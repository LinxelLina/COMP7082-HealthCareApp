import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import Animated from 'react-native-reanimated';

 type Habit = {
      id: string;
      goal: string;
    };

export default function SwipeRow({
  item,
  onDelete,
}: {
  item: Habit;
  onDelete: (id: string) => void;
}){
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value < -120) {
        runOnJS(onDelete)(item.id);
        translateX.value = 0;
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={{ backgroundColor: "white" }}>
      {/* Red background */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "red",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingRight: 20,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Delete
        </Text>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            {
              padding: 16,
              backgroundColor: "#f9f9f9",
            },
            animatedStyle,
          ]}
        >
          <Text>{item.goal}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}