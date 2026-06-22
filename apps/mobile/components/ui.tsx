import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radius } from "../lib/theme";

export function Logo() {
  return (
    <View style={styles.logoRow}>
      <View style={styles.logoMark}>
        <Ionicons name="play" size={16} color="#fff" />
      </View>
      <Text style={styles.logoText}>
        Day<Text style={{ color: colors.brand }}>Pay</Text>
      </Text>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, tone = "brand" }: { label: string; tone?: "brand" | "green" }) {
  const bg = tone === "green" ? colors.greenBg : colors.chipBg;
  const fg = tone === "green" ? colors.green : colors.brandDark;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function IconBadge({ name, tone = "#E6FBF7", color = colors.brand }: { name: keyof typeof Ionicons.glyphMap; tone?: string; color?: string }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: tone }]}>
      <Ionicons name={name} size={18} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 20, fontWeight: "800", color: colors.text, letterSpacing: 0.3 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: "700" },
  iconBadge: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
