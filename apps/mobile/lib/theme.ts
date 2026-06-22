export const colors = {
  brand: "#00A896",
  brandDark: "#028090",
  brandLight: "#02C39A",
  ink: "#111827",
  text: "#0F172A",
  muted: "#64748B",
  bg: "#F1F5F9",
  card: "#FFFFFF",
  border: "#E2E8F0",
  green: "#16A34A",
  greenBg: "#DCFCE7",
  danger: "#DC2626",
  chipBg: "#E6FBF7",
};

export const radius = { sm: 10, md: 14, lg: 20, xl: 28 };

export function aed(n: number): string {
  return "AED " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
