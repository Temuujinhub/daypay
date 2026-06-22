import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../components/ui";
import { user } from "../../lib/data";
import { colors, radius } from "../../lib/theme";

const ROWS: { icon: keyof typeof Ionicons.glyphMap; label: string; danger?: boolean }[] = [
  { icon: "lock-closed-outline", label: "Login Info" },
  { icon: "person-outline", label: "Personal Details" },
  { icon: "card-outline", label: "Payment Method" },
  { icon: "log-out-outline", label: "Logout", danger: true },
];

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Account</Text>

        <Card style={styles.profile}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.kycVerified && (
            <View style={styles.kyc}>
              <Ionicons name="checkmark-circle" size={16} color={colors.green} />
              <Text style={styles.kycText}>KYC Verified</Text>
            </View>
          )}
        </Card>

        <Text style={styles.section}>ACCOUNT</Text>
        <Card style={styles.list}>
          {ROWS.map((r, i) => (
            <View key={r.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Ionicons name={r.icon} size={20} color={r.danger ? colors.danger : colors.text} />
                <Text style={[styles.rowLabel, r.danger && { color: colors.danger }]}>{r.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 16 },
  profile: { alignItems: "center", paddingVertical: 22, gap: 4 },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  email: { color: colors.muted },
  kyc: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.greenBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginTop: 6 },
  kycText: { color: colors.green, fontWeight: "700", fontSize: 13 },
  section: { color: colors.muted, fontSize: 12, fontWeight: "700", marginTop: 22, marginBottom: 8, marginLeft: 4 },
  list: { paddingVertical: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 14 },
  rowLabel: { flex: 1, fontSize: 16, color: colors.text, fontWeight: "500" },
  divider: { height: 1, backgroundColor: colors.border },
});
