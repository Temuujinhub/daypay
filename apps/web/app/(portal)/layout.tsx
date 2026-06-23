"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api, clearSession, getToken, Role } from "../../lib/api";
import { Sidebar } from "../../components/Sidebar";
import { Spinner } from "../../components/ui";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api
      .session()
      .then((s) => {
        if (s.role === "user") {
          // Borrowers use the mobile app, not this portal.
          clearSession();
          router.replace("/login?denied=1");
          return;
        }
        setRole(s.role);

        // Keep lenders inside the lender area and admins inside the admin area.
        const inLender = pathname.startsWith("/lender");
        if (s.role === "lender_admin" && !inLender && pathname !== "/calculator") {
          router.replace("/lender");
          return;
        }
        if ((s.role === "super_admin" || s.role === "mlro") && inLender) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        clearSession();
        router.replace("/login?expired=1");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (checking || !role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Authenticating…" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
