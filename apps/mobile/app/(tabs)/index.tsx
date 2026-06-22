import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, IconBadge, Logo, Pill } from "../../components/ui";
import { activeLoans, upcomingPayments, user } from "../../lib/data";
import { aed, colors, radius } from "../../lib/theme";

export default function HomeScreen() {
  const loan = activeLoans[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo />
          <Ionicons name="help-circle-outline" size={26} color={colors.muted} />
        </View>

        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>{user.firstName}</Text>

        {loan && (
          <LinearGradient
            colors={[colors.brandLight, colors.brandDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroTop}>
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.heroProduct}>{loan.productName}</Text>
            </View>
            <Text style={styles.heroLabel}>Next Payment</Text>
            <Text style={styles.heroAmount}>{aed(loan.nextPaymentAmount)}</Text>
            <Text style={styles.heroMeta}>
              Payment {loan.paymentNo} of {loan.paymentsTotal}
            </Text>
            <View style={styles.heroRow}>
              <View style={styles.heroDue}>
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.heroDueText}>Due: {loan.dueDateLabel}</Text>
              </View>
              <View style={styles.heroDays}>
                <Text style={styles.heroDaysText}>In {loan.dueInDays} days</Text>
              </View>
            </View>
            <Pressable style={styles.payBtn}>
              <Text style={styles.payBtnText}>Pay Now</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.text} />
            </Pressable>
          </LinearGradient>
        )}

        <Card style={styles.statsCard}>
          <StatRow icon="wallet-outline" tone="#DCFCE7" color={colors.green} label="Total Outstanding" value={aed(user.totalOutstanding)} />
          <View style={styles.divider} />
          <StatRow icon="trending-up-outline" tone="#E0F2FE" color="#0284C7" label="Available Credit" value={aed(user.availableCredit)} valueColor={colors.brand} />
          <View style={styles.divider} />
          <StatRow icon="time-outline" tone="#EEF2FF" color="#6366F1" label="Last Transaction" value={`${user.lastTransactionLabel} ${aed(user.lastTransactionAmount)}`} />
        </Card>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {upcomingPayments.map((p) => (
          <Card key={p.id} style={styles.upRow}>
            <IconBadge name="calendar-outline" />
            <View style={{ flex: 1 }}>
              <Text style={styles.upTitle} numberOfLines={1}>
                {p.productName}
              </Text>
              <Text style={styles.upAmount}>{aed(p.amount)}</Text>
            </View>
            <Pill label={`In ${p.inDays} days`} />
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({
  icon,
  tone,
  color,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: string;
  color: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statRow}>
      <IconBadge name={icon} tone={tone} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32, gap: 4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  greeting: { fontSize: 16, color: colors.muted },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 12 },
  hero: { borderRadius: radius.lg, padding: 20, marginBottom: 16 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  heroProduct: { color: "#fff", fontWeight: "700", fontSize: 15 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroAmount: { color: "#fff", fontSize: 40, fontWeight: "800", marginVertical: 2 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 14 },
  heroRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  heroDue: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroDueText: { color: "#fff", fontSize: 13 },
  heroDays: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  heroDaysText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  payBtn: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "center",
    paddingHorizontal: 32,
  },
  payBtnText: { color: colors.text, fontWeight: "700", fontSize: 15 },
  statsCard: { gap: 0, paddingVertical: 6 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  viewAll: { color: colors.brand, fontWeight: "600" },
  upRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  upTitle: { color: colors.text, fontWeight: "600" },
  upAmount: { color: colors.muted, marginTop: 2 },
});
