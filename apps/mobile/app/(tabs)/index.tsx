import type { LoanSummary, ProfileResponse } from "@daypay/contracts";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, IconBadge, Logo, Pill } from "../../components/ui";
import { fetchLoans, fetchProfile } from "../../lib/data";
import { aed, colors, radius } from "../../lib/theme";

function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86400000));
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([fetchProfile(), fetchLoans()]).then(([p, l]) => {
        if (!active) return;
        setProfile(p);
        setLoans(l);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  if (loading || !profile) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

  const loan = loans.find((l) => l.status === "active") ?? loans[0];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo />
          <Ionicons name="help-circle-outline" size={26} color={colors.muted} />
        </View>

        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>{profile.firstName}</Text>

        {loan ? (
          <LinearGradient colors={[colors.brandLight, colors.brandDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.heroProduct}>{loan.productName}</Text>
            </View>
            <Text style={styles.heroLabel}>Next Payment</Text>
            <Text style={styles.heroAmount}>{aed(loan.nextPaymentAmount ?? loan.monthlyPayment)}</Text>
            <Text style={styles.heroMeta}>
              Payment {loan.paymentsMade + 1} of {loan.termMonths}
            </Text>
            <View style={styles.heroRow}>
              <View style={styles.heroDue}>
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.heroDueText}>Due: {loan.nextPaymentDate ?? "—"}</Text>
              </View>
              {daysUntil(loan.nextPaymentDate) != null && (
                <View style={styles.heroDays}>
                  <Text style={styles.heroDaysText}>In {daysUntil(loan.nextPaymentDate)} days</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <Card style={{ marginBottom: 16 }}>
            <Text style={styles.noLoan}>No active loans yet. Tap Services to apply.</Text>
          </Card>
        )}

        <Card style={styles.statsCard}>
          <StatRow icon="wallet-outline" tone="#DCFCE7" color={colors.green} label="Total Outstanding" value={aed(profile.totalOutstanding)} />
          <View style={styles.divider} />
          <StatRow icon="trending-up-outline" tone="#E0F2FE" color="#0284C7" label="Available Credit" value={aed(profile.availableCredit)} valueColor={colors.brand} />
          {profile.lastTransaction && (
            <>
              <View style={styles.divider} />
              <StatRow icon="time-outline" tone="#EEF2FF" color="#6366F1" label="Last Transaction" value={`${profile.lastTransaction.label} ${aed(profile.lastTransaction.amount)}`} />
            </>
          )}
        </Card>

        {loans.length > 0 && (
          <>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            </View>
            {loans
              .filter((l) => l.status === "active" && l.nextPaymentDate)
              .map((l) => (
                <Card key={l.id} style={styles.upRow}>
                  <IconBadge name="calendar-outline" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upTitle} numberOfLines={1}>
                      {l.productName}
                    </Text>
                    <Text style={styles.upAmount}>{aed(l.nextPaymentAmount ?? l.monthlyPayment)}</Text>
                  </View>
                  <Pill label={`In ${daysUntil(l.nextPaymentDate) ?? 0} days`} />
                </Card>
              ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ icon, tone, color, label, value, valueColor }: { icon: keyof typeof Ionicons.glyphMap; tone: string; color: string; label: string; value: string; valueColor?: string }) {
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
  center: { alignItems: "center", justifyContent: "center" },
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
  heroRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroDue: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroDueText: { color: "#fff", fontSize: 13 },
  heroDays: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  heroDaysText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  noLoan: { color: colors.muted, textAlign: "center", paddingVertical: 8 },
  statsCard: { paddingVertical: 6 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  statLabel: { color: colors.muted, fontSize: 13 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  upRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  upTitle: { color: colors.text, fontWeight: "600" },
  upAmount: { color: colors.muted, marginTop: 2 },
});
