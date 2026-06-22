import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "../components/ui";
import { api } from "../lib/api";
import { useSession } from "../lib/session";
import { colors, radius } from "../lib/theme";

export default function LoginScreen() {
  const { signIn } = useSession();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("+9715");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      const res = await api.register(phone);
      if (res.devCode) setHint(`Dev OTP: ${res.devCode}`);
      setStep("otp");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError("");
    setLoading(true);
    try {
      const tokens = await api.verifyOtp(phone, code);
      await signIn(tokens.accessToken, tokens.refreshToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Logo />
        <Text style={styles.title}>
          {step === "phone" ? "Sign in to DayPay" : "Enter the code"}
        </Text>
        <Text style={styles.sub}>
          {step === "phone"
            ? "We'll send a one-time code to your UAE number."
            : `Sent to ${phone}`}
        </Text>

        {step === "phone" ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+9715XXXXXXXX"
            autoFocus
          />
        ) : (
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            placeholder="6-digit code"
            maxLength={6}
            autoFocus
          />
        )}

        {!!hint && <Text style={styles.hint}>{hint}</Text>}
        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.btn, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={step === "phone" ? sendOtp : verify}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{step === "phone" ? "Send code" : "Verify"}</Text>
          )}
        </Pressable>

        {step === "otp" && (
          <Pressable onPress={() => setStep("phone")}>
            <Text style={styles.back}>Change number</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  content: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 24 },
  sub: { color: colors.muted, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 16,
    fontSize: 18,
    color: colors.text,
  },
  hint: { color: colors.brandDark },
  error: { color: colors.danger },
  btn: { backgroundColor: colors.brand, borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  back: { color: colors.muted, textAlign: "center", marginTop: 8 },
});
