// When EXPO_PUBLIC_API_URL is set the app talks to the real backend (with
// OTP login). When it is empty the app runs in DEMO mode with local data so
// it is fully usable in Expo Go without a server.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const DEMO_MODE = API_URL.length === 0;
