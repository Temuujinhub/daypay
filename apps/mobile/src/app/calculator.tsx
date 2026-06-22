import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { calculateLoan } from "@daypay/contracts";

const TERMS = [6, 9, 12, 18, 24, 36];
const BRAND = "#00A896";

export default function CalculatorScreen() {
  const [amount, setAmount] = useState(16000);
  const [term, setTerm] = useState(12);
  const apr = 18;

  const result = calculateLoan({ amount, termMonths: term, apr });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Loan calculator" }} />
      <Text style={styles.heading}>DayPay</Text>
      <Text style={styles.sub}>
        Same calculateLoan() as the API &amp; web — from @daypay/contracts.
      </Text>

      <Text style={styles.label}>Amount: AED {amount.toLocaleString()}</Text>
      <View style={styles.row}>
        <Stepper label="-1000" onPress={() => setAmount((a) => Math.max(1000, a - 1000))} />
        <Stepper label="+1000" onPress={() => setAmount((a) => Math.min(150000, a + 1000))} />
      </View>

      <Text style={styles.label}>Term (months)</Text>
      <View style={styles.row}>
        {TERMS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTerm(t)}
            style={[styles.chip, term === t && styles.chipActive]}
          >
            <Text style={[styles.chipText, term === t && styles.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Stat label="Monthly" value={result.monthlyPayment} />
        <Stat label="Total interest" value={result.totalInterest} />
        <Stat label="Total payable" value={result.totalPayable} />
      </View>
    </View>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.stepper}>
      <Text style={styles.stepperText}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        AED {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, backgroundColor: "#fff" },
  heading: { fontSize: 32, fontWeight: "700", color: BRAND },
  sub: { color: "#64748b", marginBottom: 8 },
  label: { fontWeight: "600", marginTop: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#f1f5f9" },
  chipActive: { backgroundColor: BRAND },
  chipText: { color: "#334155", fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  stepper: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: "#f1f5f9" },
  stepperText: { fontWeight: "700", color: "#334155" },
  card: { marginTop: 16, gap: 10 },
  stat: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
  },
  statLabel: { color: "#64748b" },
  statValue: { fontWeight: "700", color: "#0f172a" },
});
