import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { clearTokens, getToken, setTokens } from "./api";
import { DEMO_MODE } from "./config";

interface Session {
  ready: boolean;
  signedIn: boolean;
  signIn: (access: string, refresh: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session>({
  ready: false,
  signedIn: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) {
      setReady(true);
      return;
    }
    getToken().then((t) => {
      setSignedIn(!!t);
      setReady(true);
    });
  }, []);

  const value = useMemo<Session>(
    () => ({
      ready,
      signedIn,
      signIn: async (access, refresh) => {
        await setTokens(access, refresh);
        setSignedIn(true);
      },
      signOut: async () => {
        await clearTokens();
        setSignedIn(false);
      },
    }),
    [ready, signedIn],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export const useSession = () => useContext(SessionContext);
