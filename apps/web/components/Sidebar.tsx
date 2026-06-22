"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, Role } from "../lib/api";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "▤" },
  { href: "/applications", label: "Applications", icon: "▦" },
  { href: "/loans", label: "Loans", icon: "▥" },
  { href: "/users", label: "Users", icon: "◍" },
  { href: "/kyc", label: "KYC Queue", icon: "✓" },
  { href: "/reports", label: "Sandbox Report", icon: "▣" },
];

const LENDER_NAV: NavItem[] = [
  { href: "/lender", label: "Decision Queue", icon: "▦" },
  { href: "/lender/portfolio", label: "Portfolio", icon: "▥" },
];

const TOOLS_NAV: NavItem[] = [{ href: "/calculator", label: "Calculator", icon: "∑" }];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLender = role === "lender_admin";
  const nav = isLender ? LENDER_NAV : ADMIN_NAV;

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5">
        <span className="text-xl font-extrabold tracking-tight text-brand">DayPay</span>
        <span className="rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand">
          {isLender ? "Lender" : "Admin"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Tools
        </p>
        {TOOLS_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <span aria-hidden>⎋</span> Sign out
        </button>
        <p className="px-3 pt-2 text-[10px] text-slate-400">DFSA ITL Sandbox · v1.0</p>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span aria-hidden className="w-4 text-center">
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}
