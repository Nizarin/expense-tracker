"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const links = [
  { href: "/dashboard", label: "Overview",  icon: "⊞" },
  { href: "/income",    label: "Income",    icon: "↑" },
  { href: "/expenses",  label: "Expenses",  icon: "↓" },
  { href: "/savings",   label: "Savings",   icon: "◎" },
  { href: "/insights",  label: "Insights",  icon: "◈" },
  { href: "/settings",  label: "Settings",  icon: "⚙" },
];

export default function NavBar() {
  const pathname          = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "ME";

  return (
    <>
      {/* ── Main navbar ── */}
      <nav className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b border-white/[0.07] bg-[rgba(10,10,15,0.75)] px-6 backdrop-blur-[20px] sm:px-8">

        {/* Brand */}
        <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-violet-500 to-purple-600 text-[15px] shadow-[0_0_14px_rgba(107,79,255,.35)]">
            💰
          </div>
          <span
            className="text-[18px] tracking-tight text-white"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            MyExpense
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13.5px] transition-all duration-200
                  ${active
                    ? "bg-violet-500/[0.18] font-medium text-white after:absolute after:bottom-[-1px] after:left-1/2 after:h-[2px] after:w-5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:content-['']"
                    : "font-normal text-white/40 hover:bg-white/[0.05] hover:text-white/80"
                  }`}
              >
                <span className="text-[13px] opacity-70">{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-2">

          {/* User pill — hidden on small mobile */}
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1 pl-1.5 pr-3 sm:flex">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-400 text-[11px] font-semibold text-white">
              {initials}
            </div>
            <span className="hidden text-[12.5px] font-medium text-white/65 lg:block">
              {session?.user?.name?.split(" ")[0] ?? "User"}
            </span>
          </div>

          {/* Sign out — hidden on mobile */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="hidden items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[13px] font-medium text-red-400/70 transition-all hover:bg-red-500/[0.08] hover:text-red-400 sm:flex"
          >
            ⏻ Sign out
          </button>

          {/* Hamburger — visible on mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-[4.5px] rounded-lg p-1.5 transition hover:bg-white/[0.05] md:hidden"
            aria-label="Toggle menu"
          >
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-white/60 transition-transform duration-250
                ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-white/60 transition-opacity duration-250
                ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-[1.5px] w-5 rounded-full bg-white/60 transition-transform duration-250
                ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[60px] z-49 flex flex-col gap-1 border-b border-white/[0.07] bg-[rgba(10,10,15,0.97)] px-4 pb-5 pt-3 backdrop-blur-[24px] md:hidden animate-fade-up">

          {links.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] transition-all
                  ${active
                    ? "bg-violet-500/[0.15] font-medium text-white"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white"
                  }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-1 h-px bg-white/[0.07]" />

          {/* User info row */}
          <div className="flex items-center gap-3 px-3.5 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-emerald-400 text-[12px] font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-[13px] font-medium text-white/80">
                {session?.user?.name ?? "User"}
              </p>
              <p className="text-[11px] text-white/35">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[14px] text-red-400/70 transition hover:bg-red-500/[0.08] hover:text-red-400"
          >
            ⏻ Sign out
          </button>
        </div>
      )}
    </>
  );
}