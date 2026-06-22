import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProducts, Product } from "../../lib/data";
import { colors, radius } from "../../lib/theme";

export default function ServicesScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Loan Products</Text>

        {products.map((p) => (
          <View key={p.id} style={styles.card}>
            <LinearGradient colors={[colors.brandLight, colors.brandDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
              <View style={styles.fromPill}>
                <Text style={styles.fromText}>From {p.minApr.toFixed(2)}%</Text>
              </View>
            </LinearGradient>

            <View style={styles.body}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.tagline}>{p.tagline}</Text>

              <View style={styles.features}>
                {p.features.map((f) => (
                  <View key={f} style={styles.feature}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>

              <Pressable style={styles.applyBtn} onPress={() => router.push(`/product/${p.code}`)}>
                <Text style={styles.applyText}>Apply Now</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: "hidden", marginBottom: 18, shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  banner: { height: 120, padding: 14, alignItems: "flex-end" },
  fromPill: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  fromText: { color: colors.brandDark, fontWeight: "800", fontSize: 13 },
  body: { padding: 16 },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  tagline: { color: colors.muted, marginTop: 4, marginBottom: 14 },
  features: { gap: 10, marginBottom: 16 },
  feature: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { color: colors.text, fontSize: 15 },
  applyBtn: { backgroundColor: colors.ink, borderRadius: 999, paddingVertical: 15, alignItems: "center" },
  applyText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
