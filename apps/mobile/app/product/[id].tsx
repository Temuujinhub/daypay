import { calculateLoan } from "@daypay/contracts";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../../components/ui";
import { applyForLoan, getProduct } from "../../lib/data";
import { aed, colors, radius } from "../../lib/theme";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = getProduct(String(id));

  const [amount, setAmount] = useState(
    product ? Math.round((product.minAmount + product.maxAmount) / 2 / 1000) * 1000 : 50000,
  );
  const [term, setTerm] = useState(product?.terms[1] ?? 12);
  const [submitting, setSubmitting] = useState(false);

  if (!product) {
    return (
      <View style={styles.safe}>
        <Text style={{ padding: 20 }}>Product not found.</Text>
      </View>
    );
  }

  const result = calculateLoan({ amount, termMonths: term, apr: product.minApr });

  async function apply() {
    setSubmitting(true);
    try {
      const res = await applyForLoan({ productCode: product!.code, amount, termMonths: term });
      if (!res) {
        Alert.alert("Demo mode", "Connect a backend (EXPO_PUBLIC_API_URL) to submit a real application.");
        return;
      }
      if (res.status === "rejected") {
        Alert.alert("Not approved", res.eligibility?.reasons.join("\n") || "You are not eligible.");
      } else {
        Alert.alert("Approved!", `Your ${product!.name} for ${aed(amount)} was approved.`, [
          { text: "View my loans", onPress: () => router.replace("/(tabs)/usages") },
        ]);
      }
    } catch (e) {
      Alert.alert("Error", e instanceof Error ? e.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ headerTitle: product.name }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.brand} />
          <Text style={styles.noteText}>All lenders are regulated by the UAE Central Bank</Text>
        </Card>

        <Card style={{ marginTop: 14 }}>
          <View style={styles.calcHead}>
            <View style={styles.calcIcon}>
              <Ionicons name="calculator-outline" size={18} color={colors.brand} />
            </View>
            <Text style={styles.calcTitle}>Loan Calculator</Text>
          </View>

          <Text style={styles.label}>Loan Amount</Text>
          <Text style={styles.amount}>{aed(amount)}</Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={product.minAmount}
            maximumValue={product.maxAmount}
            step={1000}
            value={amount}
            onValueChange={(v) => setAmount(Math.round(v))}
            minimumTrackTintColor={colors.brand}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.brand}
          />
          <View style={styles.rangeRow}>
            <Text style={styles.range}>{aed(product.minAmount)}</Text>
            <Text style={styles.range}>{aed(product.maxAmount)}</Text>
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Select Term</Text>
          <View style={styles.terms}>
            {product.terms.map((t) => (
              <Pressable key={t} onPress={() => setTerm(t)} style={[styles.term, term === t && styles.termActive]}>
                <Text style={[styles.termNum, term === t && styles.termNumActive]}>{t}</Text>
                <Text style={[styles.termUnit, term === t && styles.termNumActive]}>months</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Estimated Monthly Payment</Text>
            <Text style={styles.resultAmount}>{aed(result.monthlyPayment)}</Text>
            <Text style={styles.resultMeta}>
              Total: {aed(result.totalPayable)} · Interest: {aed(result.totalInterest)}
            </Text>
          </View>
        </Card>

        <Pressable style={[styles.applyBtn, submitting && { opacity: 0.6 }]} disabled={submitting} onPress={apply}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.applyText}>Apply Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  note: { flexDirection: "row", alignItems: "center", gap: 10 },
  noteText: { color: colors.text, flex: 1 },
  calcHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  calcIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.chipBg, alignItems: "center", justifyContent: "center" },
  calcTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  label: { color: colors.muted, fontSize: 13 },
  amount: { color: colors.brand, fontSize: 24, fontWeight: "800", marginTop: 2 },
  rangeRow: { flexDirection: "row", justifyContent: "space-between" },
  range: { color: colors.muted, fontSize: 12 },
  terms: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  term: { width: "22%", minWidth: 70, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: "center" },
  termActive: { borderColor: colors.brand, backgroundColor: colors.chipBg },
  termNum: { fontSize: 16, fontWeight: "800", color: colors.text },
  termUnit: { fontSize: 11, color: colors.muted, marginTop: 2 },
  termNumActive: { color: colors.brandDark },
  resultBox: { backgroundColor: colors.chipBg, borderRadius: radius.md, padding: 16, marginTop: 18, alignItems: "center" },
  resultLabel: { color: colors.brandDark, fontSize: 13 },
  resultAmount: { color: colors.brandDark, fontSize: 30, fontWeight: "800", marginVertical: 4 },
  resultMeta: { color: colors.brandDark, fontSize: 12 },
  applyBtn: { backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18 },
  applyText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
