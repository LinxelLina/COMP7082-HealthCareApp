import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {scheduleOnRN} from "react-native-worklets";

type Habit = {
  id: string;
  goal: string;
  category: string;
  isComplete: boolean;
};

export default function SwipeRow({
  item,
  onDelete,
}: {
  item: Habit;
  onDelete: (id: string) => void;
}) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])   // ← only activate for horizontal movement
    .failOffsetY([-10, 10])     // ← fail the gesture if vertical scroll is detected first
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd(() => {
      if (translateX.value < -120) {
        scheduleOnRN(onDelete,item.id);
        translateX.value = 0;
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const titleStyle = item.isComplete ? styles.completedTitle : styles.title;

  return (
    <View style={styles.rowWrapper}>
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>Delete</Text>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.rowContent}>
            <View style={styles.categoryColumn}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
            <Text style={titleStyle}>{item.goal}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  deleteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#c62828",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
  },
  deleteText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dfe6e9",
    padding: 13,
  },
  rowContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColumn: {
    width: 100,
    marginRight: 10,
  },
  categoryPill: {
    backgroundColor: "#eef6ef",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryText: {
    color: "#2e7d32",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#2f3e46",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  completedTitle: {
    color: "#7c8c7d",
    fontSize: 16,
    fontWeight: "700",
    textDecorationLine: "line-through",
    flex: 1,
  },
});
