import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  startOfWeekMonday,
  addWeeks,
  formatWeekRange,
} from "@/utils/week";

/* ---------- UI helpers ---------- */
function Button({
  label,
  onPress,
  borderColor,
  textColor,
}: {
  label: string;
  onPress: () => void;
  borderColor: string;
  textColor: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontWeight: "700", color: textColor }}>{label}</Text>
    </Pressable>
  );
}

function Section({
  title,
  children,
  borderColor,
  textColor,
}: {
  title: string;
  children: React.ReactNode;
  borderColor: string;
  textColor: string;
}) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8, color: textColor }}>
        {title}
      </Text>
      <View
        style={{
          borderRadius: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  left,
  right,
  subLeft,
  isLast,
  borderColor,
  textColor,
  muted,
}: {
  left: string;
  right: string;
  subLeft?: string;
  isLast?: boolean;
  borderColor: string;
  textColor: string;
  muted: string;
}) {
  return (
    <View
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: borderColor,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: textColor }}>
          {left}
        </Text>
        {subLeft && (
          <Text style={{ marginTop: 2, fontSize: 13, color: muted }}>
            {subLeft}
          </Text>
        )}
      </View>

      <Text style={{ fontSize: 16, fontWeight: "800", color: textColor }}>
        {right}
      </Text>
    </View>
  );
}

/* ---------- screen ---------- */
export default function SummaryScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const theme = Colors[scheme ?? "light"];

  const textColor = theme.text;
  const muted = `${theme.text}AA`;
  const border = theme.icon;
  const background = theme.background;

  const [anchor, setAnchor] = useState(new Date());
  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);

  const habitSummary = [
    { name: "Gym", count: 3, goal: 4 },
    { name: "Physio", count: 5, goal: 5 },
    { name: "Walk 8k steps", count: 6, goal: 7 },
  ];

  const actionSummary = [
    { name: "Study", count: 4, total: "6h 20m" },
    { name: "Protein logged", count: 7, total: "875g" },
    { name: "Water", count: 6, total: "14.0L" },
  ];

  return (
    <ScrollView style={{ backgroundColor: background }}     contentContainerStyle={{
      paddingHorizontal: 16,
      paddingTop: insets.top + 16,    
      paddingBottom: insets.bottom + 24,
    }}
    >
      <Text style={{ fontSize: 26, fontWeight: "900", color: textColor }}>
        Weekly Summary
      </Text>

      <Text style={{ marginTop: 6, fontSize: 14, color: muted }}>
        {formatWeekRange(weekStart)} (Mon–Sun)
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
        <Button label="← Prev" onPress={() => setAnchor(addWeeks(anchor, -1))} borderColor={border} textColor={textColor} />
        <Button label="This Week" onPress={() => setAnchor(new Date())} borderColor={border} textColor={textColor} />
        <Button label="Next →" onPress={() => setAnchor(addWeeks(anchor, 1))} borderColor={border} textColor={textColor} />
      </View>

      <Section title="Habits" borderColor={border} textColor={textColor}>
        {habitSummary.map((h, i) => (
          <Row
            key={h.name}
            left={h.name}
            right={`${h.count}/${h.goal}`}
            subLeft={`${Math.round((h.count / h.goal) * 100)}% of goal`}
            isLast={i === habitSummary.length - 1}
            borderColor={border}
            textColor={textColor}
            muted={muted}
          />
        ))}
      </Section>

      <Section title="Actions" borderColor={border} textColor={textColor}>
        {actionSummary.map((a, i) => (
          <Row
            key={a.name}
            left={a.name}
            right={`${a.count}`}
            subLeft={a.total}
            isLast={i === actionSummary.length - 1}
            borderColor={border}
            textColor={textColor}
            muted={muted}
          />
        ))}
      </Section>
    </ScrollView>
  );
}
