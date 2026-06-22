import type { LoanSummary } from "@daypay/contracts";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Pill } from "../../components/ui";
import { fetchLoans } from "../../lib/data";
import { aed, colors } from "../../lib/theme";

export default function UsagesScreen() {
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      fetchLoans().then((l) => {
        if (!active) return;
        setLoans(l);
        setLoading(false);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Loans</Text>

        {loading && <ActivityIndicator color={colors.brand} />}
        {!loading && loans.length === 0 && <Text style={styles.empty}>No loans yet.</Text>}

        {loans.map((loan) => {
          const total = loan.paymentsMade + loan.paymentsRemaining || loan.termMonths;
          const progress = total > 0 ? loan.paymentsMade / total : 0;
          return (
            <Card key={loan.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.product}>{loan.productName}</Text>
                <Pill label={loan.status} tone={loan.status === "active" ? "green" : "brand"} />
              </View>
              <Text style={styles.loanNo}>{loan.loanNumber}</Text>

              <View style={styles.amounts}>
                <View>
                  <Text style={styles.k}>Outstanding</Text>
                  <Text style={styles.v}>{aed(loan.outstandingBalance)}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.k}>Monthly</Text>
                  <Text style={styles.v}>{aed(loan.monthlyPayment)}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <View style={styles.row}>
                <Text style={styles.k}>
                  Payment {loan.paymentsMade} of {loan.termMonths}
                </Text>
                <Text style={styles.k}>{loan.apr}% APR</Text>
              </View>

              {loan.nextPaymentDate && (
                <View style={styles.due}>
                  <Ionicons name="calendar-outline" size={14} color={colors.muted} />
                  <Text style={styles.k}>Next due {loan.nextPaymentDate}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 16 },
  empty: { color: colors.muted },
  card: { gap: 10, marginBottom: 14 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  product: { fontSize: 17, fontWeight: "800", color: colors.text },
  loanNo: { color: colors.muted, fontSize: 12, marginTop: -4 },
  amounts: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  k: { color: colors.muted, fontSize: 13 },
  v: { color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: colors.border, overflow: "hidden", marginTop: 4 },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: colors.brand },
  due: { flexDirection: "row", alignItems: "center", gap: 6 },
});
